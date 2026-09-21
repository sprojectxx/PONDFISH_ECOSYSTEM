import { prisma } from '../prismaClient';
import { DomainError } from '../middleware/errorHandler';

export class CategoryModule {
  static async getAllCategories() {
    return await prisma.category.findMany({
      where: { active: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  static async createCategory(data: { name: string; slug: string; displayOrder?: number }) {
    const existing = await prisma.category.findUnique({ where: { slug: data.slug } });
    if (existing) {
      throw new DomainError('ERR_CATEGORY_EXISTS', 'Category slug already exists.', 400);
    }
    return await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        displayOrder: data.displayOrder ?? 0,
      },
    });
  }
}
