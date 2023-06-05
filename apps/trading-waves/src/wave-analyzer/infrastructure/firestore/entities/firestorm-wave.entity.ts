import { v4 as uuidv4 } from 'uuid';
import { ICandle } from '../../../domain/models/candle-entity.interface';
import { IWave } from '../../../domain/models/wave-entity.interface';
import { WaveType } from '../../../domain/models/wave-type.enum';
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

  constructor(init?: Partial<FirestoreWave>) {
    Object.assign(this, init);
  }

  initialize(
    type: WaveType,
    symbol: string,
    interval: string,
    candle?: ICandle,
  ): void {
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
    if (!this.candles) {
      this.candles = [];
    }

    if (this.isCandlePresent(newCandle)) {
      this.candles = this.candles.map((candle) =>
        candle.openTime.getTime() === newCandle.openTime.getTime() &&
        this.shouldUpdateCandle(candle, newCandle)
          ? newCandle
          : candle,
      );
      return false;
    } else {
      this.candles.push(newCandle);

      // Sort candles by openTime
      this.candles.sort((a, b) => a.openTime.getTime() - b.openTime.getTime());

      // Update startDateTime and endDateTime of the wave
      this.startDateTime = this.candles[0]?.openTime || null;
      this.endDateTime =
        this.candles[this.candles.length - 1]?.closeTime || null;
      this.updatedAt = firabase.firestore.Timestamp.now().toDate();

      return true;
    }
  }

  private isCandlePresent(candle: ICandle): boolean {
    return this.candles.some(
      (existingCandle) =>
        existingCandle.openTime.getTime() === candle.openTime.getTime(),
    );
  }

  private shouldUpdateCandle(
    existingCandle: ICandle,
    newCandle: ICandle,
  ): boolean {
    return (
      existingCandle.open !== newCandle.open ||
      existingCandle.high !== newCandle.high ||
      existingCandle.low !== newCandle.low ||
      existingCandle.close !== newCandle.close
    );
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

  toFirestoreDocument(): Record<string, unknown> {
    const { id, candles, ...data } = this;
    const plainCandles = candles.map((candle: FirestoreCandle) =>
      candle.toFirestoreDocument(),
    );
    return { ...data, candles: plainCandles };
  }

  static fromFirestoreDocument(
    doc: firabase.firestore.DocumentSnapshot<firabase.firestore.DocumentData>,
  ): FirestoreWave {
    const data = doc.data();
    return new FirestoreWave({
      id: doc.id,
      ...data,
      createdAt: (data.createdAt as firabase.firestore.Timestamp).toDate(),
      updatedAt: (data.updatedAt as firabase.firestore.Timestamp).toDate(),
    });
  }
}
