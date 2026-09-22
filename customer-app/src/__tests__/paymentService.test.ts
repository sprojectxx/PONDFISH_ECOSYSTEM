import { PaymentServiceAdapter } from '../services/paymentService';

describe('PaymentServiceAdapter Unit Tests', () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn();
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
});
