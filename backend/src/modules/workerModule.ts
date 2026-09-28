import bcrypt from 'bcryptjs';
import { prisma } from '../prismaClient';
import { DomainError } from '../middleware/errorHandler';

export class WorkerModule {
  static async getAllWorkers() {
    const list = await prisma.worker.findMany({
      select: { id: true, email: true, name: true, active: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((w) => ({
      id: w.id,
      name: w.name,
      email: w.email,
      mobileNumber: w.email,
      role: 'WORKER',
      active: w.active,
      createdAt: w.createdAt,
    }));
  }

  static async createWorker(data: { email?: string; mobileNumber?: string; password?: string; name?: string }) {
    const name = data.name?.trim();
    const password = data.password;
    const identifier = (data.mobileNumber || data.email || '').trim();

    if (!name) {
      throw new DomainError('ERR_INVALID_INPUT', 'Worker name is required.', 400);
    }

    if (!password || password.trim().length === 0) {
      throw new DomainError('ERR_INVALID_INPUT', 'Password is required.', 400);
    }

    if (!identifier) {
      throw new DomainError('ERR_INVALID_INPUT', 'Mobile number or email is required.', 400);
    }

    // Validate mobile number format when mobileNumber is supplied
    if (data.mobileNumber !== undefined && data.mobileNumber !== null && data.mobileNumber.trim().length > 0) {
      const cleanMobile = data.mobileNumber.trim();
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      if (!phoneRegex.test(cleanMobile)) {
        throw new DomainError(
          'ERR_INVALID_MOBILE',
          'Invalid mobile number format. Please enter a valid 10 to 15 digit phone number.',
          400
        );
      }
    } else if (data.email !== undefined && data.email !== null && data.email.trim().length > 0) {
      const cleanEmail = data.email.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      if (!emailRegex.test(cleanEmail) && !phoneRegex.test(cleanEmail)) {
        throw new DomainError(
          'ERR_INVALID_IDENTIFIER',
          'Invalid format. Please enter a valid email address or 10 to 15 digit mobile number.',
          400
        );
      }
    }

    const existing = await prisma.worker.findUnique({ where: { email: identifier } });
    if (existing) {
      throw new DomainError('ERR_WORKER_EXISTS', 'A worker account with this mobile number or email already exists.', 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    try {
      const worker = await prisma.worker.create({
        data: {
          email: identifier,
          passwordHash,
          name,
          active: true,
        },
        select: { id: true, email: true, name: true, active: true, createdAt: true },
      });

      return {
        id: worker.id,
        name: worker.name,
        email: worker.email,
        mobileNumber: worker.email,
        role: 'WORKER',
        active: worker.active,
        createdAt: worker.createdAt,
      };
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new DomainError('ERR_WORKER_EXISTS', 'A worker account with this mobile number or email already exists.', 409);
      }
      throw err;
    }
  }
}
