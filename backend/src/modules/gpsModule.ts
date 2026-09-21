import { prisma } from '../prismaClient';
import { JourneyStatus } from '@prisma/client';
import { DomainError } from '../middleware/errorHandler';

export class GPSModule {
  static async startJourney(truckNumber: string, driverName: string) {
    return await prisma.gPSJourney.create({
      data: {
        truckNumber,
        driverName,
        status: JourneyStatus.LIVE,
        publishedToCustomer: false,
        startedAt: new Date(),
      },
    });
  }

  static async publishJourneyToCustomer(journeyId: string, publish: boolean) {
    const journey = await prisma.gPSJourney.findUnique({ where: { id: journeyId } });
    if (!journey) {
      throw new DomainError('ERR_JOURNEY_NOT_FOUND', 'GPS Journey not found.', 404);
    }
    return await prisma.gPSJourney.update({
      where: { id: journeyId },
      data: { publishedToCustomer: publish },
    });
  }

  static async recordPosition(journeyId: string, latitude: number, longitude: number, speed?: number, heading?: number) {
    return await prisma.gPSPosition.create({
      data: {
        journeyId,
        latitude,
        longitude,
        speed: speed || null,
        heading: heading || null,
      },
    });
  }

  static async getLiveCustomerJourney() {
    const journey = await prisma.gPSJourney.findFirst({
      where: {
        status: JourneyStatus.LIVE,
        publishedToCustomer: true,
      },
      include: {
        positions: {
          orderBy: { recordedAt: 'desc' },
          take: 1,
        },
      },
    });
    return journey;
  }
}
