import { Module } from '@nestjs/common';
import { BinanceCandleDataProvider } from './infrastructure/websocket/binance-candle-data.provider';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmCandle } from './infrastructure/typeorm/entities/candle.entity';
import { WaveAnalyzerController } from './api/wave-analyzer.controller';
import { CANDLE_DATA_PROVIDER } from './infrastructure/icandle-data-provider.interface';
import { TypeOrmWave } from './infrastructure/typeorm/entities/typeorm-wave.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { glob } from 'glob';
import path from 'path';
import { IWaveFactory } from './domain/factories/wave.factory';
import { ICandleFactory } from './domain/factories/candle.factory';
import { FirestoreCandle } from './infrastructure/firestore/entities/firestore-candle.entity';
import { FirestoreWaveRepository } from './infrastructure/firestore/repositories/firestore-wave.repository';
import { FirestoreCandleRepository } from './infrastructure/firestore/repositories/firestore-candle.repository';
import { FirestoreWave } from './infrastructure/firestore/entities/firestorm-wave.entity';
import { FirestoreModule } from './infrastructure/firestore/firestore.module';
import { BullmqModule } from './infrastructure/bullmq/bullmq.module';
import { BinanceConnectionPool } from './infrastructure/websocket/binance-connectionpool';
import { WaveAnalyzerFactory } from './domain/analysis/wave-analyzer.factory';
import { IWebSocketConnectionPool } from '../shared/events/infarstructure/websocket-connection-pool.interface';

@Module({
  imports: [
    FirestoreModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const entityFiles = glob.sync('src/**/*.entity.ts');
        const entities = await Promise.all(entityFiles.map(file => import(path.resolve(__dirname, '..', file))));

        return {
          type: 'sqlite',
          database: configService.get<string>('DATABASE_FILE'),
          entities: entities.map(entity => entity.default),
          synchronize: true,
          logging: false,
          autoLoadEntities: true,
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([TypeOrmCandle, TypeOrmWave]),
    BullmqModule,
  ],
  providers: [
    FirestoreModule,
    WaveAnalyzerFactory,
    BinanceCandleDataProvider,
    BinanceConnectionPool,
    {
      provide: 'ICandle',
      useClass: FirestoreCandle,
    },
    {
      provide: 'IWaveRepository',
      useClass: FirestoreWaveRepository,
    },
    {
      provide: 'ICandleRepository',
      useClass: FirestoreCandleRepository,
    },
    {
      provide: 'IWave',
      useClass: FirestoreWave,
    },
    IWaveFactory,
    {
      provide: 'WAVE_IMPLEMENTATION_TYPE',
      useValue: 'firestore', // or 'firestore', depending on your configuration
    },
    ICandleFactory,
    {
      provide: 'CANDLE_IMPLEMENTATION_TYPE',
      useValue: 'firestore', // or 'firestore', depending on your configuration
    },
    {
      provide: 'IWebSocketConnectionPool',
      useClass: BinanceConnectionPool,
    },
    {
      provide: CANDLE_DATA_PROVIDER,
      useFactory: (candleFactory: ICandleFactory, connectionPool: IWebSocketConnectionPool) => {
        return () => new BinanceCandleDataProvider(candleFactory, connectionPool);
      },
      inject: [ICandleFactory, BinanceConnectionPool],
    },
  ],
  controllers: [WaveAnalyzerController],
  exports: [CANDLE_DATA_PROVIDER],
})
export class WaveAnalyzerModule {}
