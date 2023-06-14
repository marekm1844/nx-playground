import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QueueModule } from '../shared/events/infarstructure/redis-queue.module';
import { BullModule } from '@nestjs/bullmq';
import { REDIS_CONNECTION, WAVE_COMPLETED } from '../shared/events/infarstructure/redis-queue.constant';
import { WaveCompletedProcessor } from './infrastructure/wave-completed.processor';

@Module({
  imports: [
    ConfigModule,
    QueueModule,
    BullModule.registerQueueAsync({
      name: WAVE_COMPLETED,
      inject: [REDIS_CONNECTION],
      useFactory: async (redisConnection: unknown) => ({
        connection: redisConnection,
      }),
    }),
  ],
  providers: [WaveCompletedProcessor],
  exports: [WaveCompletedProcessor],
})
export class WaveFormationsModule {}
