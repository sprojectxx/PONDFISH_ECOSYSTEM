import { getApiBaseUrl } from '../config/apiConfig';

export interface RazorpayOrderResponse {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  payment?: any;
  error?: string;
}

export class PaymentServiceAdapter {
  /**
   * Step 1: Create Razorpay Payment Gateway Order via Backend API
   */
  static async createOrder(amount: number, token: string): Promise<RazorpayOrderResponse> {
    const apiBase = getApiBaseUrl();
    const res = await fetch(`${apiBase}/customer/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error?.message || 'Failed to initialize Razorpay payment order.');
    }

    return data.data;
  }

  /**
   * Step 2: Submit Actual Gateway Credentials to Backend for Verification
   *
   * Enforces backend signature verification without client-side fake credentials.
   */
  static async verifyPayment(params: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    amount: number;
    bookingId?: string;
    transactionId?: string;
    token: string;
  }): Promise<PaymentVerificationResult> {
    const apiBase = getApiBaseUrl();
    const res = await fetch(`${apiBase}/customer/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${params.token}`,
      },
      body: JSON.stringify({
        razorpayOrderId: params.razorpayOrderId,
        razorpayPaymentId: params.razorpayPaymentId,
        razorpaySignature: params.razorpaySignature,
        amount: params.amount,
        bookingId: params.bookingId,
        transactionId: params.transactionId,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error?.message || 'Razorpay payment signature verification failed.',
      };
    }

    return {
      success: true,
      payment: data.data,
    };
  }
}
