import { Candle } from './candle.entity';
import { WaveType } from '../analysis/wave-type.enum';

export class Wave {
  private candles: Candle[] = [];
  private type: WaveType = WaveType.Unknown;
  private startDateTime: Date | null = null;
  private endDateTime: Date | null = null;

  constructor(type: WaveType, candle: Candle) {
    this.type = type;
    this.candles.push(candle);
    this.startDateTime = candle.openTime;
    this.endDateTime = candle.openTime;
  }
  

  //Add candle in the wave if it is completed and not already present in the wave 
  //or if it is present but the candle data has changed 
  //and return true if the candle was added to the wave
  addCandle(newCandle: Candle): boolean {

    if (this.isCandlePresent(newCandle)) {
      //Logger.log(`Candle already present: ${JSON.stringify(newCandle)}`);
      this.candles = this.candles.map((candle) =>
        candle.openTime === newCandle.openTime && this.shouldUpdateCandle(candle, newCandle)
          ? newCandle
          : candle
      );
      return false;
    } else {

      // Sort candles by openTime
      this.candles.sort((a, b) => a.openTime.getTime() - b.openTime.getTime());

      // Update startDateTime and endDateTime of the wave
      this.startDateTime = this.candles[0]?.openTime || null;
      this.endDateTime = this.candles[this.candles.length - 1]?.closeTime || null;

      this.candles.push(newCandle);
      return true;
    }

  }

  setType(type: WaveType): void {
    this.type = type;
  }

  getType(): WaveType {
    return this.type;
  }

  getStartDateTime(): Date | null {
    return this.startDateTime;
  }

  getEndDateTime(): Date | null {
    return this.endDateTime;
  }

  getDuration(): number {
    if (this.startDateTime && this.endDateTime) {
      return this.endDateTime.getTime() - this.startDateTime.getTime();
    }
    return 0;
  }

  getNumberOfCandles(): number {
    return this.candles.length;
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
