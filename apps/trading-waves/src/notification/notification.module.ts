
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegramService } from './infrastructure/services/telegram.service';
import { UptrendEventProcessor } from './infrastructure/bullmq/uptrend-event.processor';
import { DowntrendEventProcessor } from './infrastructure/bullmq/downtrend-event.processor';
import { TelegramBotProvider } from './infrastructure/telegram-bot.provider';
import { QueueModule } from '../shared/events/infarstructure/redis-queue.module';
import { BullModule } from '@nestjs/bullmq';
import { DOWNTREND_QUEUE, REDIS_CONNECTION, UPTREND_QUEUE } from '../shared/events/infarstructure/redis-queue.constant';

@Module({
  imports: [ConfigModule,QueueModule,
    BullModule.registerQueueAsync({
      name: UPTREND_QUEUE,
      inject: [REDIS_CONNECTION],
      useFactory: async (redisConnection: unknown) => ({
        connection: redisConnection,
      }),
    }),
    BullModule.registerQueueAsync({
      name: DOWNTREND_QUEUE,
      inject: [REDIS_CONNECTION],
      useFactory: async (redisConnection: unknown) => ({
        connection: redisConnection,
      }),
    }),
  ],
  providers: [
    TelegramBotProvider,
    {
        provide: 'INotificationService',
        useClass: TelegramService,
    },
    TelegramService,
    UptrendEventProcessor,
    DowntrendEventProcessor
  ],
  exports: [TelegramService],
})
export class NotificationModule {}