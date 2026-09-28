import bcrypt from 'bcryptjs';
import { prisma } from '../prismaClient';
import { DomainError } from '../middleware/errorHandler';

export class WorkerModule {
  static async getAllWorkers() {
    const list = await prisma.worker.findMany({
      select: { id: true, mobileNumber: true, name: true, active: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((w) => ({
      id: w.id,
      name: w.name,
      mobileNumber: w.mobileNumber,
      role: 'WORKER',
      active: w.active,
      createdAt: w.createdAt,
    }));
  }

  static async createWorker(data: { mobileNumber?: string; password?: string; name?: string }) {
    const name = data.name?.trim();
    const password = data.password;
    const mobileNumber = data.mobileNumber?.trim();

    if (!name) {
      throw new DomainError('ERR_INVALID_INPUT', 'Worker name is required.', 400);
    }

    if (!password || password.trim().length === 0) {
      throw new DomainError('ERR_INVALID_INPUT', 'Password is required.', 400);
    }

    if (!mobileNumber) {
      throw new DomainError('ERR_INVALID_INPUT', 'Mobile number is required.', 400);
    }

    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(mobileNumber)) {
      throw new DomainError(
        'ERR_INVALID_MOBILE',
        'Invalid mobile number format. Please enter a valid 10 to 15 digit phone number.',
        400
      );
    }

    const existing = await prisma.worker.findUnique({ where: { mobileNumber } });
    if (existing) {
      throw new DomainError('ERR_WORKER_EXISTS', 'A worker account with this mobile number already exists.', 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    try {
      const worker = await prisma.worker.create({
        data: {
          mobileNumber,
          passwordHash,
          name,
          active: true,
        },
        select: { id: true, mobileNumber: true, name: true, active: true, createdAt: true },
      });

      return {
        id: worker.id,
        name: worker.name,
        mobileNumber: worker.mobileNumber,
        role: 'WORKER',
        active: worker.active,
        createdAt: worker.createdAt,
      };
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new DomainError('ERR_WORKER_EXISTS', 'A worker account with this mobile number already exists.', 409);
      }
      throw err;
    }
  }
}
