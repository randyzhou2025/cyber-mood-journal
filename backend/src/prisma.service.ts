import {
  INestApplication,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect()
  }

  /**
   * NestJS 生命周期：模块销毁时断开 Prisma
   */
  async onModuleDestroy() {
    await this.$disconnect()
  }

  /**
   * 可选：由 main.ts 调用，用于优雅关闭
   */
  enableShutdownHooks(app: INestApplication) {
    const shutdown = async () => {
      await app.close()
    }

    process.on('SIGTERM', shutdown)
    process.on('SIGINT', shutdown)
  }
}
