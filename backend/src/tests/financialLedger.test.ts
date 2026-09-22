import { TransactionModule } from '../modules/transactionModule';
import { PaymentMethod } from '@prisma/client';

describe('TransactionModule Financial Calculations', () => {
  it('A. 1000 Razorpay: calculates 2% gateway fee and 18% GST on fee correctly', () => {
    const result = TransactionModule.calculateFinancials({
      totalBillAmount: 1000,
      subCreditAvailable: 0,
      paymentMethod: PaymentMethod.RAZORPAY,
    });

    expect(result.totalBillAmount).toBe(1000);
    expect(result.subCreditUsed).toBe(0);
    expect(result.extraAmountPayable).toBe(1000);
    expect(result.razorpayGatewayFee).toBe(20.0); // 2% of 1000
    expect(result.gstOnFee18).toBe(3.6); // 18% of 20 = 3.6
    expect(result.finalPaidAmount).toBe(1023.6);
  });

  it('B. 1000 Cash: incurs NO gateway fee and NO GST', () => {
    const result = TransactionModule.calculateFinancials({
      totalBillAmount: 1000,
      subCreditAvailable: 0,
      paymentMethod: PaymentMethod.CASH,
    });

    expect(result.totalBillAmount).toBe(1000);
    expect(result.subCreditUsed).toBe(0);
    expect(result.extraAmountPayable).toBe(1000);
    expect(result.razorpayGatewayFee).toBe(0.0);
    expect(result.gstOnFee18).toBe(0.0);
    expect(result.finalPaidAmount).toBe(1000.0);
  });

  it('C. Full subscription credit: extra=0, fee=0, GST=0, final=0', () => {
    const result = TransactionModule.calculateFinancials({
      totalBillAmount: 500,
      subCreditAvailable: 1000,
      paymentMethod: PaymentMethod.RAZORPAY,
    });

    expect(result.totalBillAmount).toBe(500);
    expect(result.subCreditUsed).toBe(500);
    expect(result.extraAmountPayable).toBe(0);
    expect(result.razorpayGatewayFee).toBe(0);
    expect(result.gstOnFee18).toBe(0);
    expect(result.finalPaidAmount).toBe(0);
  });

  it('D. Partial subscription credit + Razorpay', () => {
    const result = TransactionModule.calculateFinancials({
      totalBillAmount: 1000,
      subCreditAvailable: 300,
      paymentMethod: PaymentMethod.RAZORPAY,
    });

    expect(result.totalBillAmount).toBe(1000);
    expect(result.subCreditUsed).toBe(300);
    expect(result.extraAmountPayable).toBe(700);
    expect(result.razorpayGatewayFee).toBe(14.0); // 2% of 700 = 14
    expect(result.gstOnFee18).toBe(2.52); // 18% of 14 = 2.52
    expect(result.finalPaidAmount).toBe(716.52); // 700 + 14 + 2.52
  });

  it('E. Partial subscription credit + Cash', () => {
    const result = TransactionModule.calculateFinancials({
      totalBillAmount: 1000,
      subCreditAvailable: 300,
      paymentMethod: PaymentMethod.CASH,
    });

    expect(result.totalBillAmount).toBe(1000);
    expect(result.subCreditUsed).toBe(300);
    expect(result.extraAmountPayable).toBe(700);
    expect(result.razorpayGatewayFee).toBe(0.0);
    expect(result.gstOnFee18).toBe(0.0);
    expect(result.finalPaidAmount).toBe(700.0);
  });

  it('F. Decimal values requiring exact monetary rounding', () => {
    const result = TransactionModule.calculateFinancials({
      totalBillAmount: 100.33,
      subCreditAvailable: 0,
      paymentMethod: PaymentMethod.RAZORPAY,
    });

    expect(result.totalBillAmount).toBe(100.33);
    expect(result.extraAmountPayable).toBe(100.33);
    expect(result.razorpayGatewayFee).toBe(2.01); // 100.33 * 0.02 = 2.0066 -> 2.01
    expect(result.gstOnFee18).toBe(0.36); // 2.01 * 0.18 = 0.3618 -> 0.36
    expect(result.finalPaidAmount).toBe(102.7); // 100.33 + 2.01 + 0.36 = 102.70
  });
});
