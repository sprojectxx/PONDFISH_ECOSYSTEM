import bcrypt from 'bcryptjs';
import { prisma } from '../prismaClient';
import { DomainError } from '../middleware/errorHandler';

export class WorkerModule {
  static async getAllWorkers() {
    return await prisma.worker.findMany({
      select: { id: true, email: true, name: true, active: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createWorker(data: { email: string; password: string; name: string }) {
    const existing = await prisma.worker.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new DomainError('ERR_WORKER_EXISTS', 'Worker account email already exists.', 400);
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    return await prisma.worker.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        active: true,
      },
      select: { id: true, email: true, name: true, active: true },
    });
  }
}
