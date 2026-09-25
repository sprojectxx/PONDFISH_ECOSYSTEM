import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../prismaClient';
import { DomainError } from '../middleware/errorHandler';
import { getJwtSecret } from '../utils/jwtConfig';

// In-memory OTP storage for dev/testing (Mobile -> { otp, expiresAt })
const otpStore = new Map<string, { otp: string; expiresAt: Date }>();

export class AuthModule {
  static async sendOTP(mobileNumber: string) {
    if (!/^\+?[1-9]\d{9,14}$/.test(mobileNumber)) {
      throw new DomainError('ERR_INVALID_MOBILE', 'Invalid mobile number format.', 400);
    }

    const otp = '123456'; // Default 6-digit OTP for dev/testing
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes expiry
    otpStore.set(mobileNumber, { otp, expiresAt });

    return { mobileNumber, message: 'OTP sent successfully (Dev default: 123456)', expiresAt };
  }

  static async verifyOTP(mobileNumber: string, otp: string) {
    const record = otpStore.get(mobileNumber);
    if (!record) {
      throw new DomainError('ERR_AUTH_OTP_EXPIRED', 'OTP expired or not requested.', 400);
    }

    if (new Date() > record.expiresAt) {
      otpStore.delete(mobileNumber);
      throw new DomainError('ERR_AUTH_OTP_EXPIRED', 'OTP has expired.', 400);
    }

    if (record.otp !== otp) {
      throw new DomainError('ERR_INVALID_OTP', 'Incorrect OTP entered.', 400);
    }

    otpStore.delete(mobileNumber);

    let customer = await prisma.customer.findUnique({ where: { mobileNumber } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: { mobileNumber },
      });
    }

    const token = jwt.sign(
      { id: customer.id, role: 'CUSTOMER', mobileNumber: customer.mobileNumber },
      getJwtSecret(),
      { expiresIn: '30d' }
    );

    return { token, customer };
  }

  static async workerLogin(email: string, password: string) {
    const worker = await prisma.worker.findUnique({ where: { email } });
    if (!worker || !worker.active) {
      throw new DomainError('ERR_UNAUTHORIZED', 'Invalid credentials or inactive account.', 401);
    }

    const validPassword = await bcrypt.compare(password, worker.passwordHash);
    if (!validPassword) {
      throw new DomainError('ERR_UNAUTHORIZED', 'Invalid email or password.', 401);
    }

    const token = jwt.sign(
      { id: worker.id, role: 'WORKER', email: worker.email },
      getJwtSecret(),
      { expiresIn: '12h' }
    );

    return { token, worker: { id: worker.id, name: worker.name, email: worker.email } };
  }

  static async adminLogin(email: string, password: string) {
    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      throw new DomainError('ERR_UNAUTHORIZED', 'Invalid email or password.', 401);
    }

    const validPassword = await bcrypt.compare(password, admin.passwordHash);
    if (!validPassword) {
      throw new DomainError('ERR_UNAUTHORIZED', 'Invalid email or password.', 401);
    }

    const token = jwt.sign(
      { id: admin.id, role: 'ADMIN', email: admin.email },
      getJwtSecret(),
      { expiresIn: '8h' }
    );

    return { token, admin: { id: admin.id, name: admin.name, email: admin.email, isSuperAdmin: admin.isSuperAdmin } };
  }
}
