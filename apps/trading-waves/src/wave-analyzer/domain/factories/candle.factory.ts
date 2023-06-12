import { Inject, Injectable } from '@nestjs/common';
import { ICandle } from '../../../shared/models/candle-entity.interface';
import { TypeOrmCandle } from '../../infrastructure/typeorm/entities/candle.entity';
import { FirestoreCandle } from '../../infrastructure/firestore/entities/firestore-candle.entity';

export type CandleImplementation = 'typeorm' | 'firestore';

@Injectable()
export class ICandleFactory {
  constructor(
    @Inject('CANDLE_IMPLEMENTATION_TYPE')
    private readonly implementation: CandleImplementation,
  ) {}

  createCandle(candleData: {
    openTime: number;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
    closeTime: number;
    quoteAssetVolume: string;
    numberOfTrades: number;
    takerBuyBaseAssetVolume: string;
    takerBuyQuoteAssetVolume: string;
    ignore: number;
    completed: boolean;
  }): ICandle {
    switch (this.implementation) {
      case 'typeorm': {
        const candle = new TypeOrmCandle();
        candle.initialize(candleData);
        return candle;
      }
      case 'firestore': {
        const candle = new FirestoreCandle();
        candle.initialize(candleData);
        return candle;
      }
      default:
        throw new Error('Invalid candle implementation specified');
    }
  }
}
