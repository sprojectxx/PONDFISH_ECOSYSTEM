import { TransactionModule } from '../modules/transactionModule';
import { PaymentMethod } from '@prisma/client';
import { DomainError } from '../middleware/errorHandler';

describe('Store Checkout Validation & Unit Logic', () => {
  it('throws DomainError when items array is empty', async () => {
    await expect(
      TransactionModule.processStoreCheckout({
        customerId: 'cust-1',
        items: [],
        paymentMethod: PaymentMethod.CASH,
      })
    ).rejects.toThrow(DomainError);
  });
});
