import { prisma } from '../prismaClient';

export class SystemModule {
  static async getSetting(key: string) {
    const setting = await prisma.setting.findUnique({ where: { key } });
    return setting ? JSON.parse(setting.value) : null;
  }

  static async updateSetting(key: string, value: any) {
    return await prisma.setting.upsert({
      where: { key },
      update: { value: JSON.stringify(value) },
      create: { key, value: JSON.stringify(value) },
    });
  }
}
