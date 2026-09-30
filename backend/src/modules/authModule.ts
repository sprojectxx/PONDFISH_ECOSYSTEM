import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../prismaClient';
import { DomainError } from '../middleware/errorHandler';
import { getJwtSecret } from '../utils/jwtConfig';

interface OtpRecord {
  otp: string;
  expiresAt: Date;
  attempts: number;
}

// In-memory OTP storage for dev/testing (Mobile -> { otp, expiresAt, attempts })
const otpStore = new Map<string, OtpRecord>();

export class AuthModule {
  static async sendOTP(mobileNumber: string) {
    if (!/^\+?[1-9]\d{9,14}$/.test(mobileNumber)) {
      throw new DomainError('ERR_INVALID_MOBILE', 'Invalid mobile number format.', 400);
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const smsAdapter = process.env.SMS_ADAPTER;

    if (isProduction && (!smsAdapter || smsAdapter.trim() === '' || smsAdapter.toLowerCase() === 'mock')) {
      throw new DomainError(
        'ERR_SMS_CONFIG',
        'CRITICAL: SMS service adapter is unconfigured or set to mock in production environment.',
        500
      );
    }

    let otp: string;
    if (isProduction || (smsAdapter && smsAdapter !== 'mock')) {
      otp = crypto.randomInt(100000, 1000000).toString();
    } else {
      otp = '123456';
    }

    const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes expiry
    otpStore.set(mobileNumber, { otp, expiresAt, attempts: 0 });

    const message = isProduction || (smsAdapter && smsAdapter !== 'mock')
      ? 'OTP sent successfully'
      : 'OTP sent successfully (Dev default: 123456)';

    return { mobileNumber, message, expiresAt };
  }

  static async verifyOTP(mobileNumber: string, otp: string) {
    const isProduction = process.env.NODE_ENV === 'production';

    // In production, fixed dev fallback 123456 must NEVER be accepted
    if (isProduction && otp === '123456') {
      throw new DomainError('ERR_AUTH_MOCK_OTP_DISABLED', 'Development mock OTP is disabled in production environment.', 400);
    }

    const record = otpStore.get(mobileNumber);

    if (!record) {
      throw new DomainError('ERR_AUTH_OTP_EXPIRED', 'OTP expired or not requested.', 400);
    }

    if (new Date() > record.expiresAt) {
      otpStore.delete(mobileNumber);
      throw new DomainError('ERR_AUTH_OTP_EXPIRED', 'OTP has expired.', 400);
    }

    if (record.attempts >= 3) {
      otpStore.delete(mobileNumber);
      throw new DomainError('ERR_AUTH_OTP_MAX_ATTEMPTS', 'Maximum verification attempts exceeded. Please request a new OTP.', 400);
    }

    if (record.otp !== otp) {
      record.attempts += 1;
      if (record.attempts >= 3) {
        otpStore.delete(mobileNumber);
        throw new DomainError('ERR_AUTH_OTP_MAX_ATTEMPTS', 'Maximum verification attempts exceeded. Please request a new OTP.', 400);
      }
      throw new DomainError('ERR_INVALID_OTP', 'Incorrect OTP entered.', 400);
    }

    // Single-use: delete immediately upon successful verification
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

  static async workerLogin(mobileNumber: string, password: string) {
    if (!mobileNumber || !password) {
      throw new DomainError('ERR_INVALID_INPUT', 'Mobile number and password are required.', 400);
    }

    const worker = await prisma.worker.findUnique({ where: { mobileNumber } });
    if (!worker || !worker.active) {
      throw new DomainError('ERR_UNAUTHORIZED', 'Invalid credentials or inactive account.', 401);
    }

    const validPassword = await bcrypt.compare(password, worker.passwordHash);
    if (!validPassword) {
      throw new DomainError('ERR_UNAUTHORIZED', 'Invalid mobile number or password.', 401);
    }

    const token = jwt.sign(
      { id: worker.id, role: 'WORKER', mobileNumber: worker.mobileNumber },
      getJwtSecret(),
      { expiresIn: '12h' }
    );

    return { token, worker: { id: worker.id, name: worker.name, mobileNumber: worker.mobileNumber } };
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
