import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QueueModule } from '../shared/events/infarstructure/redis-queue.module';
import { BullModule } from '@nestjs/bullmq';
import { REDIS_CONNECTION, WAVE_COMPLETED } from '../shared/events/infarstructure/redis-queue.constant';
import { WaveCompletedProcessor } from './infrastructure/wave-completed.processor';
import { DogFormationStrategy } from './domain/dog-formation.strategy';
import { FirestoreLastWaveRepository } from './infrastructure/firebase/firestore-wave-query.repository';
import { FirestoreModule } from '../wave-analyzer/infrastructure/firestore/firestore.module';
import { GetLastWaveCompletedQuery } from './get-last-wave-completed.query';
import { SameTypeFormationStrategy } from './domain/same-type-formations-for-symbol.strategy';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    ConfigModule,
    QueueModule,
    FirestoreModule,
    NotificationModule,
    BullModule.registerQueueAsync({
      name: WAVE_COMPLETED,
      inject: [REDIS_CONNECTION],
      useFactory: async (redisConnection: unknown) => ({
        connection: redisConnection,
      }),
    }),
  ],
  providers: [
    WaveCompletedProcessor,
    DogFormationStrategy,
    GetLastWaveCompletedQuery,
    SameTypeFormationStrategy,
    {
      provide: 'ILastWaveCompletedRepository',
      useClass: FirestoreLastWaveRepository,
    },
  ],
  exports: [WaveCompletedProcessor],
})
export class WaveFormationsModule {}
