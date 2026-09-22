import { TransactionModule } from '../modules/transactionModule';

describe('TransactionModule Financial Calculations', () => {
  it('calculates 2% gateway fee and 18% GST on fee correctly', () => {
    const result = TransactionModule.calculateFinancials({
      totalBillAmount: 1000,
      subCreditAvailable: 0,
    });

    expect(result.totalBillAmount).toBe(1000);
    expect(result.subCreditUsed).toBe(0);
    expect(result.extraAmountPayable).toBe(1000);
    expect(result.razorpayGatewayFee).toBe(20); // 2% of 1000 = 20
    expect(result.gstOnFee18).toBe(3.6); // 18% of 20 = 3.6
    expect(result.finalPaidAmount).toBe(1023.6);
  });

  it('handles subscription credit covering full amount', () => {
    const result = TransactionModule.calculateFinancials({
      totalBillAmount: 500,
      subCreditAvailable: 1000,
    });

    expect(result.subCreditUsed).toBe(500);
    expect(result.extraAmountPayable).toBe(0);
    expect(result.razorpayGatewayFee).toBe(0);
    expect(result.gstOnFee18).toBe(0);
    expect(result.finalPaidAmount).toBe(0);
  });
});
