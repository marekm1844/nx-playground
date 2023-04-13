import { Candle } from './candle.entity';

export class Wave {
  private candles: Candle[];

  constructor() {
    this.candles = [];
  }

  addCandle(candle: Candle): void {
    this.candles.push(candle);
  }

  isLatestUptrend(): boolean {
    if (this.candles.length < 2) {
      return false;
    }

    const lastIndex = this.candles.length - 1;
    return this.candles[lastIndex].maximumCorpse > this.candles[lastIndex - 1].maximumCorpse;
  }
}
