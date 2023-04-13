import { Candle } from './candle.entity';

export class Wave {
  private candles: Candle[];

  constructor() {
    this.candles = [];
  }

  addCandle(candle: Candle): void {
    this.candles.push(candle);
  }

  getCandles(): Candle[] {
    return this.candles;
  }

}
