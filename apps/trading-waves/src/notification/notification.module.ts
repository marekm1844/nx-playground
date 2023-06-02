
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegramService } from './infrastructure/services/telegram.service';
import { UptrendEventProcessor } from './infrastructure/bullmq/uptrend-event.processor';
import { DowntrendEventProcessor } from './infrastructure/bullmq/downtrend-event.processor';
import { TelegramBotProvider } from './infrastructure/telegram-bot.provider';
import { QueueModule } from '../shared/events/infarstructure/redis-queue.module';
import { BullModule } from '@nestjs/bullmq';
import { DOWNTREND_QUEUE, UPTREND_QUEUE } from '../shared/events/infarstructure/redis-queue.constant';

@Module({
  imports: [ConfigModule,QueueModule, BullModule.registerQueue({ name: UPTREND_QUEUE }), BullModule.registerQueue({ name: DOWNTREND_QUEUE })],
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