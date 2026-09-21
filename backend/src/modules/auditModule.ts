import { prisma } from '../prismaClient';
import { ActorType } from '@prisma/client';

export class AuditModule {
  static async log(actorType: ActorType, actorId: string, action: string, entityType: string, entityId: string, payload: any) {
    return await prisma.auditLog.create({
      data: {
        actorType,
        actorId,
        action,
        entityType,
        entityId,
        payload: JSON.stringify(payload),
      },
    });
  }

  static async getAuditLogs(take = 50) {
    return await prisma.auditLog.findMany({
      orderBy: { timestamp: 'desc' },
      take,
    });
  }
}
