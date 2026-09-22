import RazorpayCheckout from 'react-native-razorpay';
import { PaymentServiceAdapter, PaymentState } from '../services/paymentService';

jest.mock('react-native-razorpay', () => ({
  open: jest.fn(),
}));

describe('PaymentServiceAdapter Unit Tests', () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates Razorpay payment order via backend API', async () => {
    const mockOrder = {
      razorpayOrderId: 'order_12345',
      amount: 500,
      currency: 'INR',
      keyId: 'rzp_test_key',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockOrder }),
    });

    const result = await PaymentServiceAdapter.createOrder(500, 'mock-jwt-token');

    expect(result).toEqual(mockOrder);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/customer/payments/create-order'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-jwt-token',
        }),
        body: JSON.stringify({ amount: 500 }),
      })
    );
  });

  it('submits actual payment gateway response for signature verification', async () => {
    const mockPaymentData = { id: 'pay-db-123', status: 'SUCCESS' };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockPaymentData }),
    });

    const result = await PaymentServiceAdapter.verifyPayment({
      razorpayOrderId: 'order_12345',
      razorpayPaymentId: 'pay_98765',
      razorpaySignature: 'sig_abc123',
      amount: 500,
      bookingId: 'bk-123',
      token: 'mock-jwt-token',
    });

    expect(result.success).toBe(true);
    expect(result.payment).toEqual(mockPaymentData);
  });

  it('handles payment signature verification errors correctly', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, error: { message: 'Invalid signature' } }),
    });

    const result = await PaymentServiceAdapter.verifyPayment({
      razorpayOrderId: 'order_12345',
      razorpayPaymentId: 'pay_invalid',
      razorpaySignature: 'sig_invalid',
      amount: 500,
      token: 'mock-jwt-token',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid signature');
  });

  describe('launchNativeCheckout', () => {
    const mockOrder = {
      razorpayOrderId: 'order_rzp_999',
      amount: 450,
      currency: 'INR',
      keyId: 'rzp_test_key_abc',
    };

    it('passes order ID to Razorpay Checkout, receives credentials, and verifies with backend', async () => {
      // 1. fetch create-order mock
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockOrder }),
      });

      // 2. RazorpayCheckout.open mock
      (RazorpayCheckout.open as jest.Mock).mockResolvedValueOnce({
        razorpay_payment_id: 'pay_real_111',
        razorpay_order_id: 'order_rzp_999',
        razorpay_signature: 'sig_real_222',
      });

      // 3. fetch verify mock
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: 'txn_123', status: 'COMPLETED' } }),
      });

      const stateChanges: Array<{ state: PaymentState; message?: string }> = [];
      const result = await PaymentServiceAdapter.launchNativeCheckout({
        amount: 450,
        token: 'token-abc',
        bookingId: 'bk-456',
        customerMobile: '9999999999',
        onStateChange: (state, message) => stateChanges.push({ state, message }),
      });

      // Verify create-order call
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/customer/payments/create-order'),
        expect.any(Object)
      );

      // Verify RazorpayCheckout.open called with correct options and order_id
      expect(RazorpayCheckout.open).toHaveBeenCalledWith(
        expect.objectContaining({
          key: 'rzp_test_key_abc',
          order_id: 'order_rzp_999',
          amount: 45000,
          currency: 'INR',
          prefill: { contact: '9999999999' },
        })
      );

      // Verify verifyPayment call with exact SDK parameters
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/customer/payments/verify'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            razorpayOrderId: 'order_rzp_999',
            razorpayPaymentId: 'pay_real_111',
            razorpaySignature: 'sig_real_222',
            amount: 450,
            bookingId: 'bk-456',
          }),
        })
      );

      expect(result.success).toBe(true);
      expect(stateChanges).toEqual([
        { state: 'PAYMENT_PROCESSING', message: 'Creating Razorpay order via backend...' },
        {
          state: 'PAYMENT_PROCESSING',
          message: 'Order created (order_rzp_999). Launching Razorpay Native SDK...',
        },
        { state: 'PAYMENT_VERIFICATION', message: 'Verifying payment signature with backend...' },
        { state: 'PAYMENT_SUCCESS', message: 'Payment verified successfully!' },
      ]);
    });

    it('handles customer cancellation without calling backend verification or marking payment successful', async () => {
      // 1. fetch create-order mock
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockOrder }),
      });

      // 2. RazorpayCheckout.open rejects with code 0 (cancel)
      (RazorpayCheckout.open as jest.Mock).mockRejectedValueOnce({
        code: 0,
        description: 'Payment Cancelled by user',
      });

      const stateChanges: Array<{ state: PaymentState; message?: string }> = [];
      const result = await PaymentServiceAdapter.launchNativeCheckout({
        amount: 450,
        token: 'token-abc',
        bookingId: 'bk-456',
        onStateChange: (state, message) => stateChanges.push({ state, message }),
      });

      expect(result.success).toBe(false);
      expect(result.cancelled).toBe(true);
      expect(result.error).toBe('Payment cancelled by customer.');

      // Verification endpoint must NOT be called
      expect(global.fetch).not.toHaveBeenCalledWith(
        expect.stringContaining('/customer/payments/verify'),
        expect.any(Object)
      );

      expect(stateChanges).toContainEqual({
        state: 'PAYMENT_CANCELLED',
        message: 'Payment cancelled by customer.',
      });
    });

    it('handles verification failure without marking payment successful', async () => {
      // 1. fetch create-order mock
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: mockOrder }),
      });

      // 2. RazorpayCheckout.open resolves
      (RazorpayCheckout.open as jest.Mock).mockResolvedValueOnce({
        razorpay_payment_id: 'pay_fake_123',
        razorpay_order_id: 'order_rzp_999',
        razorpay_signature: 'invalid_sig',
      });

      // 3. fetch verify fails
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: { message: 'Razorpay signature verification failed.' },
        }),
      });

      const stateChanges: Array<{ state: PaymentState; message?: string }> = [];
      const result = await PaymentServiceAdapter.launchNativeCheckout({
        amount: 450,
        token: 'token-abc',
        onStateChange: (state, message) => stateChanges.push({ state, message }),
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Razorpay signature verification failed.');
      expect(stateChanges).toContainEqual({
        state: 'PAYMENT_FAILED',
        message: 'Razorpay signature verification failed.',
      });
    });
  });
});
