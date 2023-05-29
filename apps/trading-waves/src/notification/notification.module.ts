
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import TelegramBot from 'node-telegram-bot-api';
import { TelegramService } from './infrastructure/services/telegram.service';
import { BullModule } from '@nestjs/bullmq';
import IORedis from 'ioredis';
import { UptrendEventProcessor } from './infrastructure/bullmq/uptrend-event.processor';

@Module({
  imports: [ConfigModule,
    BullModule.forRootAsync({
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
            //INFO! IORedis must be use and not Redis because of the following error: ERR_SSL_WRONG_VERSION_NUMBER
            connection: new IORedis({
                host: configService.get<string>('REDIS_HOST'),
                port: configService.get<number>('REDIS_PORT'),
                username: configService.get<string>('REDIS_USER'),
                password: configService.get<string>('REDIS_PASSWORD'),
                maxRetriesPerRequest: null,
            })
        }),
    }
    ),
    BullModule.registerQueue({name: 'wave-analyzer-queue', defaultJobOptions: {
        removeOnComplete: true,
    } }),],
  providers: [
    {
      provide: 'TELEGRAM_BOT',
      useFactory: (configService: ConfigService) => {
        return new TelegramBot(configService.get<string>('TELEGRAM_BOT_TOKEN'), {polling: true});
      },
      inject: [ConfigService],
    },
    {
        provide: 'INotificationService',
        useClass: TelegramService,
    },
    TelegramService,
    UptrendEventProcessor
  ],
  exports: [TelegramService],
})
export class NotificationModule {}