import { WorkerModule } from '../modules/workerModule';
import { DomainError } from '../middleware/errorHandler';
import { prisma } from '../prismaClient';

jest.mock('../prismaClient', () => {
  return {
    prisma: {
      worker: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    },
  };
});

describe('WorkerModule.createWorker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a worker account successfully with a valid mobile number', async () => {
    (prisma.worker.findUnique as jest.Mock).mockResolvedValueOnce(null);
    (prisma.worker.create as jest.Mock).mockResolvedValueOnce({
      id: 'worker-uuid-1',
      mobileNumber: '9876543210',
      name: 'STEVANSON PAMISHETTY',
      active: true,
      createdAt: new Date('2026-09-28T10:00:00Z'),
    });

    const result = await WorkerModule.createWorker({
      name: 'STEVANSON PAMISHETTY',
      mobileNumber: '9876543210',
      password: 'SecurePassword123',
    });

    expect(prisma.worker.findUnique).toHaveBeenCalledWith({ where: { mobileNumber: '9876543210' } });
    expect(prisma.worker.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          mobileNumber: '9876543210',
          name: 'STEVANSON PAMISHETTY',
          active: true,
        }),
      })
    );
    expect(result.id).toBe('worker-uuid-1');
    expect(result.mobileNumber).toBe('9876543210');
  });

  it('rejects worker creation when invalid mobile number format is provided (e.g. email in mobile field)', async () => {
    await expect(
      WorkerModule.createWorker({
        name: 'STEVANSON PAMISHETTY',
        mobileNumber: 'worker@pondfish.com',
        password: 'SecurePassword123',
      })
    ).rejects.toThrow(DomainError);

    try {
      await WorkerModule.createWorker({
        name: 'STEVANSON PAMISHETTY',
        mobileNumber: 'worker@pondfish.com',
        password: 'SecurePassword123',
      });
    } catch (err: any) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBe('ERR_INVALID_MOBILE');
      expect(err.statusCode).toBe(400);
      expect(err.message).toContain('Invalid mobile number format');
    }
  });

  it('rejects worker creation when duplicate mobile number exists (409 Conflict)', async () => {
    (prisma.worker.findUnique as jest.Mock).mockResolvedValueOnce({
      id: 'existing-worker-id',
      mobileNumber: '9876543210',
      name: 'Existing Worker',
      active: true,
    });

    try {
      await WorkerModule.createWorker({
        name: 'STEVANSON PAMISHETTY',
        mobileNumber: '9876543210',
        password: 'SecurePassword123',
      });
    } catch (err: any) {
      expect(err).toBeInstanceOf(DomainError);
      expect(err.code).toBe('ERR_WORKER_EXISTS');
      expect(err.statusCode).toBe(409);
      expect(err.message).toContain('already exists');
    }
  });

  it('rejects worker creation when required fields are missing', async () => {
    await expect(
      WorkerModule.createWorker({
        name: '',
        mobileNumber: '9876543210',
        password: 'SecurePassword123',
      })
    ).rejects.toThrow(DomainError);

    await expect(
      WorkerModule.createWorker({
        name: 'STEVANSON PAMISHETTY',
        mobileNumber: '9876543210',
        password: '',
      })
    ).rejects.toThrow(DomainError);
  });
});
