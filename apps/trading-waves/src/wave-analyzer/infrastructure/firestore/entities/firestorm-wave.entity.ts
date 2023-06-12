import { v4 as uuidv4 } from 'uuid';
import { ICandle } from '../../../../shared/models/candle-entity.interface';
import { IWave } from '../../../../shared/models/wave-entity.interface';
import { WaveType } from '../../../../shared/models/wave-type.enum';
import * as firabase from 'firebase-admin';
import { FirestoreCandle } from './firestore-candle.entity';

export class FirestoreWave implements IWave {
  id: string;
  type: WaveType = WaveType.Unknown;
  startDateTime: Date | null = null;
  endDateTime: Date | null = null;
  candles: ICandle[];
  createdAt: Date;
  updatedAt: Date;
  interval: string;
  symbol: string;
  shadow: number | null = null;
  corpse: number | null = null;

  constructor(init?: Partial<FirestoreWave>) {
    Object.assign(this, init);
  }

  initialize(type: WaveType, symbol: string, interval: string, candle?: ICandle): void {
    //format date as yyyymmddhhmmss
    this.id = Date.now().toString() + uuidv4();
    this.type = type;
    this.candles = candle ? [candle] : [];
    this.startDateTime = candle?.openTime || null;
    this.endDateTime = candle?.closeTime || null;
    this.createdAt = firabase.firestore.Timestamp.now().toDate();
    this.updatedAt = firabase.firestore.Timestamp.now().toDate();
    this.interval = interval;
    this.symbol = symbol;
  }

  addCandle(newCandle: ICandle): boolean {
    this.candles ??= [];

    if (this.isCandlePresent(newCandle)) {
      this.updateExistingCandle(newCandle);
    } else {
      this.addNewCandle(newCandle);
    }

    this.updateDateTimeRange();
    this.updateShadowAndCorpse(newCandle);

    return true;
  }

  private isCandlePresent(candle: ICandle): boolean {
    return this.candles.some(existingCandle => existingCandle.openTime.getTime() === candle.openTime.getTime());
  }

  private updateExistingCandle(newCandle: ICandle): void {
    this.candles = this.candles.map(candle => (candle.openTime === newCandle.openTime && this.shouldUpdateCandle(candle, newCandle) ? newCandle : candle));
  }

  private addNewCandle(newCandle: ICandle): void {
    this.candles.push(newCandle);
    this.candles.sort((a, b) => a.openTime.getTime() - b.openTime.getTime());
  }

  private updateDateTimeRange(): void {
    this.startDateTime = this.candles[0]?.openTime ?? null;
    this.endDateTime = this.candles[this.candles.length - 1]?.closeTime ?? null;
  }

  private updateShadowAndCorpse(newCandle: ICandle): void {
    if (WaveType.Uptrend === this.type) {
      this.shadow = this.shadow !== null ? Math.max(this.shadow, newCandle.high) : newCandle.high;
      this.corpse = this.corpse !== null ? Math.max(this.corpse, newCandle.close) : newCandle.close;
    } else if (WaveType.Downtrend === this.type) {
      this.shadow = this.shadow !== null ? Math.min(this.shadow, newCandle.low) : newCandle.low;
      this.corpse = this.corpse !== null ? Math.min(this.corpse, newCandle.close) : newCandle.close;
    }
  }

  private shouldUpdateCandle(existingCandle: ICandle, newCandle: ICandle): boolean {
    return existingCandle.open !== newCandle.open || existingCandle.high !== newCandle.high || existingCandle.low !== newCandle.low || existingCandle.close !== newCandle.close;
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

  getCandles(): ICandle[] {
    return this.candles;
  }

  getLastCandle(): ICandle {
    return this.candles[this.candles.length - 1];
  }

  getShadow(): number | null {
    return this.shadow;
  }

  getCorpse(): number | null {
    return this.corpse;
  }

  toFirestoreDocument(): Record<string, unknown> {
    const { id, candles, ...data } = this;
    const plainCandles = candles.map((candle: FirestoreCandle) => candle.toFirestoreDocument());
    return { ...data, candles: plainCandles };
  }

  static fromFirestoreDocument(doc: firabase.firestore.DocumentSnapshot<firabase.firestore.DocumentData>): FirestoreWave {
    const data = doc.data();
    return new FirestoreWave({
      id: doc.id,
      ...data,
      createdAt: (data.createdAt as firabase.firestore.Timestamp).toDate(),
      updatedAt: (data.updatedAt as firabase.firestore.Timestamp).toDate(),
    });
  }
}
