import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';
import { Queue } from 'bullmq';
import {
  DOWNTREND_QUEUE,
  DOWNTREND_QUEUE_SERVICE,
  REDIS_CONNECTION,
  UPTREND_QUEUE,
  UPTREND_QUEUE_SERVICE,
  WAVE_COMPLETED,
  WAVE_COMPLETED_QUEUE_SERVICE,
} from './redis-queue.constant';
import { BullMqQueueService } from './bullmq-queue.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    BullMqQueueService,
    {
      provide: REDIS_CONNECTION,
      useFactory: (configService: ConfigService) => {
        const redisConnection = new IORedis({
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          username: configService.get<string>('REDIS_USER'),
          password: configService.get<string>('REDIS_PASSWORD'),
          maxRetriesPerRequest: null,
        });

        redisConnection.setMaxListeners(20);
        return redisConnection;
      },
      inject: [ConfigService],
    },
    {
      provide: UPTREND_QUEUE,
      useFactory: (redisConnection: IORedis) => {
        return new Queue(UPTREND_QUEUE, { connection: redisConnection });
      },
      inject: [REDIS_CONNECTION],
    },
    {
      provide: DOWNTREND_QUEUE,
      useFactory: (redisConnection: IORedis) => {
        return new Queue(DOWNTREND_QUEUE, { connection: redisConnection });
      },
      inject: [REDIS_CONNECTION],
    },
    {
      provide: UPTREND_QUEUE_SERVICE,
      useFactory: (uptrendQueue: Queue) => {
        return new BullMqQueueService(uptrendQueue);
      },
      inject: [UPTREND_QUEUE],
    },
    {
      provide: DOWNTREND_QUEUE_SERVICE,
      useFactory: (downtrendQueue: Queue) => {
        return new BullMqQueueService(downtrendQueue);
      },
      inject: [DOWNTREND_QUEUE],
    },
    {
      provide: WAVE_COMPLETED,
      useFactory: (redisConnection: IORedis) => {
        return new Queue(WAVE_COMPLETED, { connection: redisConnection });
      },
      inject: [REDIS_CONNECTION],
    },
    {
      provide: WAVE_COMPLETED_QUEUE_SERVICE,
      useFactory: (waveCompletedQueue: Queue) => {
        return new BullMqQueueService(waveCompletedQueue);
      },
      inject: [WAVE_COMPLETED],
    },
  ],
  exports: [REDIS_CONNECTION, UPTREND_QUEUE, DOWNTREND_QUEUE, UPTREND_QUEUE_SERVICE, DOWNTREND_QUEUE_SERVICE, WAVE_COMPLETED, WAVE_COMPLETED_QUEUE_SERVICE],
})
export class QueueModule {}
