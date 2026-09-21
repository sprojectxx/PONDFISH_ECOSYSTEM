import { prisma } from '../prismaClient';

export class ReportingModule {
  static async getExecutiveAnalytics() {
    const transactions = await prisma.transaction.findMany({
      where: { status: 'COMPLETED' },
    });

    const totalRevenue = transactions.reduce((sum, t) => sum + t.finalPaidAmount, 0);
    const totalGSTCollected = transactions.reduce((sum, t) => sum + t.gstOnFee18, 0);

    const bookingStatusCounts = await prisma.booking.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const paymentMethodCounts = await prisma.transaction.groupBy({
      by: ['paymentMethod'],
      _count: { id: true },
    });

    return {
      totalRevenue,
      totalTransactions: transactions.length,
      totalGSTCollected,
      bookingStatusCounts,
      paymentMethodCounts,
    };
  }
}
