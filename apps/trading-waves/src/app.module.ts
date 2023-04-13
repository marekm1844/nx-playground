import { Module } from '@nestjs/common';

import { AppController } from './app/app.controller';
import { AppService } from './app/app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candle } from './domain/models/candle.entity';
import { BinanceCandleDataProvider } from './infrastructure/binance-candle-data.provider';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'candles.sqlite3',
      entities: [Candle],
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, BinanceCandleDataProvider],
})
export class AppModule {}
