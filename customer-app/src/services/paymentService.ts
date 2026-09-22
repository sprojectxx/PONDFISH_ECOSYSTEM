import RazorpayCheckout from 'react-native-razorpay';
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
  cancelled?: boolean;
}

export type PaymentState =
  | 'PAYMENT_REQUIRED'
  | 'PAYMENT_PROCESSING'
  | 'PAYMENT_VERIFICATION'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_CANCELLED';

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

  /**
   * Complete Native Razorpay Gateway Invocation & Verification Flow
   */
  static async launchNativeCheckout(params: {
    amount: number;
    token: string;
    bookingId?: string;
    customerMobile?: string;
    onStateChange?: (state: PaymentState, message?: string) => void;
  }): Promise<PaymentVerificationResult> {
    params.onStateChange?.('PAYMENT_PROCESSING', 'Creating Razorpay order via backend...');

    // Step 1: Create Order via Backend API
    const orderData = await this.createOrder(params.amount, params.token);

    params.onStateChange?.(
      'PAYMENT_PROCESSING',
      `Order created (${orderData.razorpayOrderId}). Launching Razorpay Native SDK...`
    );

    // Step 2: Construct Razorpay Checkout Options
    const options = {
      description: 'PondFish Fresh Order Payment',
      image: 'https://pondfish.com/logo.png',
      currency: orderData.currency || 'INR',
      key: orderData.keyId,
      amount: Math.round(orderData.amount * 100), // amount in paise
      name: 'PondFish Retail',
      order_id: orderData.razorpayOrderId,
      prefill: {
        contact: params.customerMobile || '',
      },
      theme: { color: '#0F4C81' },
    };

    // Step 3: Invoke Native Razorpay Checkout SDK
    let paymentResponse: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string };
    try {
      paymentResponse = await RazorpayCheckout.open(options);
    } catch (err: any) {
      const isCancellation =
        err && (err.code === 0 || (err.description && err.description.toLowerCase().includes('cancel')));
      if (isCancellation) {
        params.onStateChange?.('PAYMENT_CANCELLED', 'Payment cancelled by customer.');
        return { success: false, cancelled: true, error: 'Payment cancelled by customer.' };
      }
      const errMsg = err?.description || err?.message || 'Razorpay payment checkout failed.';
      params.onStateChange?.('PAYMENT_FAILED', errMsg);
      return { success: false, error: errMsg };
    }

    params.onStateChange?.('PAYMENT_VERIFICATION', 'Verifying payment signature with backend...');

    // Step 4: Submit Actual SDK Response Credentials to Backend Verification
    const verifyResult = await this.verifyPayment({
      razorpayOrderId: paymentResponse.razorpay_order_id || orderData.razorpayOrderId,
      razorpayPaymentId: paymentResponse.razorpay_payment_id,
      razorpaySignature: paymentResponse.razorpay_signature,
      amount: params.amount,
      bookingId: params.bookingId,
      token: params.token,
    });

    if (verifyResult.success) {
      params.onStateChange?.('PAYMENT_SUCCESS', 'Payment verified successfully!');
    } else {
      params.onStateChange?.('PAYMENT_FAILED', verifyResult.error || 'Signature verification failed.');
    }

    return verifyResult;
  }
}
