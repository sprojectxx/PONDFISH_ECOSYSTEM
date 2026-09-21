import { prisma } from '../prismaClient';
import { logger } from '../utils/logger';

export interface INotificationAdapter {
  sendSMS(mobileNumber: string, message: string): Promise<boolean>;
  sendPush(fcmToken: string, title: string, body: string): Promise<boolean>;
}

export class MockNotificationAdapter implements INotificationAdapter {
  async sendSMS(mobileNumber: string, message: string): Promise<boolean> {
    logger.info(`📱 [Mock SMS Adapter] Sent to ${mobileNumber}: "${message}"`);
    return true;
  }

  async sendPush(fcmToken: string, title: string, body: string): Promise<boolean> {
    logger.info(`🔔 [Mock Push Adapter] Token: ${fcmToken} | Title: ${title} | Body: ${body}`);
    return true;
  }
}

export class FCMNotificationAdapter implements INotificationAdapter {
  async sendSMS(mobileNumber: string, message: string): Promise<boolean> {
    logger.info(`📱 [SMS Adapter Placeholder] Sent to ${mobileNumber}: "${message}"`);
    return true;
  }

  async sendPush(fcmToken: string, title: string, body: string): Promise<boolean> {
    logger.info(`🔥 [FCM Push Notification] Sent to Token: ${fcmToken} | Title: ${title}`);
    return true;
  }
}

export class NotificationModule {
  private static adapter: INotificationAdapter = new MockNotificationAdapter();

  static setAdapter(adapter: INotificationAdapter) {
    this.adapter = adapter;
  }

  static async sendNotification(customerId: string, title: string, message: string, type = 'GENERAL') {
    const notification = await prisma.notification.create({
      data: {
        customerId,
        title,
        message,
        type,
        read: false,
      },
    });

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (customer?.mobileNumber) {
      await this.adapter.sendSMS(customer.mobileNumber, `${title}: ${message}`);
    }

    return notification;
  }
}
