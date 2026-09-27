import { prisma } from '../prismaClient';

export class ReportingModule {
  static async getExecutiveAnalytics() {
    const transactions = await prisma.transaction.findMany({
      where: { status: 'COMPLETED' },
    });

    const totalRevenue = transactions.reduce((sum: number, t: any) => sum + t.finalPaidAmount, 0);
    const totalGSTCollected = transactions.reduce((sum: number, t: any) => sum + t.gstOnFee18, 0);

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

  static async getRecentPublicTransactions(limit = 10) {
    const take = Math.min(Math.max(1, limit), 50);
    const transactions = await prisma.transaction.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { createdAt: 'desc' },
      take,
      include: {
        customer: {
          select: { name: true },
        },
        transactionItems: {
          include: {
            fish: {
              select: { name: true },
            },
          },
        },
      },
    });

    return transactions.map((t: any) => ({
      transactionId: t.id,
      transactionNumber: t.transactionNumber,
      customerName: t.customer?.name || 'In-Store Customer',
      totalAmount: t.finalPaidAmount || t.totalBillAmount,
      paymentMethod: t.paymentMethod,
      timestamp: t.createdAt,
      items: (t.transactionItems || []).map((item: any) => ({
        fishName: item.fish?.name || 'Fresh Fish',
        quantityKg: item.quantityKg,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
      })),
    }));
  }
}
