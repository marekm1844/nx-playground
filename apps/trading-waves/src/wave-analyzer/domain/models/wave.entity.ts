import { Logger } from '@nestjs/common';
import { Candle } from './candle.entity';

export class Wave {
  private candles: Candle[] = [];

  addCandle(newCandle: Candle): boolean {
    if (this.isCandlePresent(newCandle)) {
      //Logger.log(`Candle already present: ${JSON.stringify(newCandle)}`);
      this.candles = this.candles.map((candle) =>
        candle.openTime === newCandle.openTime && this.shouldUpdateCandle(candle, newCandle)
          ? newCandle
          : candle
      );
      return false;
    } else if (newCandle.completed ) {
      this.candles.push(newCandle);
      return true;
    }
  }

  private isCandlePresent(candle: Candle): boolean {
    return this.candles.some((existingCandle) => existingCandle.openTime.getTime() === candle.openTime.getTime());
  }

  private shouldUpdateCandle(existingCandle: Candle, newCandle: Candle): boolean {
    return (
      existingCandle.open !== newCandle.open ||
      existingCandle.high !== newCandle.high ||
      existingCandle.low !== newCandle.low ||
      existingCandle.close !== newCandle.close
    );
  }


  getCandles(): Candle[] {
    return this.candles;
  }

}
