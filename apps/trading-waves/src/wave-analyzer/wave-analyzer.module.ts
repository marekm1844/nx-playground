import { Module } from "@nestjs/common";
import { WaveAnalyzer } from "./domain/analysis/wave-analyzer";
import { BinanceCandleDataProvider } from "./infrastructure/binance-candle-data.provider";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Candle } from "./domain/models/candle.entity";
import { WaveAnalyzerController } from "./api/wave-analyzer.controller";
import { CANDLE_DATA_PROVIDER } from "./infrastructure/icandle-data-provider.interface";

@Module({
    imports: [TypeOrmModule.forRoot({
        type: 'sqlite',
        database: 'candles.sqlite3',
        entities: [Candle],
        synchronize: true,
      }),],
    providers: [WaveAnalyzer, BinanceCandleDataProvider,
        { provide: CANDLE_DATA_PROVIDER , useClass: BinanceCandleDataProvider}, ],
    controllers: [WaveAnalyzerController]
})
export class WaveAnalyzerModule {}