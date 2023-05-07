import { Module } from "@nestjs/common";
import { WaveAnalyzer } from "./domain/analysis/wave-analyzer";
import { BinanceCandleDataProvider } from "./infrastructure/binance-candle-data.provider";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Candle } from "./domain/models/candle.entity";
import { WaveAnalyzerController } from "./api/wave-analyzer.controller";
import { CANDLE_DATA_PROVIDER } from "./infrastructure/icandle-data-provider.interface";
import { TypeOrmWave } from "./infrastructure/typeorm/entities/typeorm-wave.entity";
import { WaveRepository } from "./infrastructure/repositories/wave.repository";
import { CandleRepository } from "./infrastructure/repositories/candle.repository";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { glob } from "glob";
import path from "path";
import { IWaveFactory } from "./domain/factories/wave.factory";

@Module({
    imports: [TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => {
          const entityFiles = glob.sync('src/**/*.entity.ts');
          const entities = await Promise.all(
            entityFiles.map((file) => import(path.resolve(__dirname, '..', file)))
          );
  
          return {
            type: 'sqlite',
            database: configService.get<string>('DATABASE_FILE'),
            entities: entities.map((entity) => entity.default),
            synchronize: true,
            logging: false,
            autoLoadEntities: true,
          };
        },
        inject: [ConfigService],
      }),
      TypeOrmModule.forFeature([Candle, TypeOrmWave])],
      providers: [WaveAnalyzer, BinanceCandleDataProvider,
        { provide: CANDLE_DATA_PROVIDER , useClass: BinanceCandleDataProvider},
        { 
            provide: 'IWavesRepository',
            useClass: WaveRepository,
        },
        {
            provide: 'ICandleRepository',
            useClass: CandleRepository,        
        },
        {
            provide: 'IWaveRepository',
            useClass: TypeOrmWave
        },
        {
            provide: 'IWave',
            useClass: TypeOrmWave,
        },
        IWaveFactory,
        {
          provide: 'WAVE_IMPLEMENTATION_TYPE',
          useValue: 'typeorm', // or 'firestore', depending on your configuration
        }, 
    ],
    controllers: [WaveAnalyzerController]
})
export class WaveAnalyzerModule {}