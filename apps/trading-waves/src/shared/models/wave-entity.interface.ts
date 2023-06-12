import { ICandle } from './candle-entity.interface';
import { WaveType } from './wave-type.enum';

//export wave interface from wave class
export interface IWave {
  id: string;
  type: WaveType;
  candles: ICandle[];
  createdAt: Date;
  updatedAt: Date;
  startDateTime: Date | null;
  endDateTime: Date | null;
  interval: string;
  symbol: string;
  shadow: number;
  corpse: number;

  addCandle(newCandle: ICandle): boolean;
  setType(type: WaveType): void;
  getType(): WaveType;
  getStartDateTime(): Date | null;
  getEndDateTime(): Date | null;
  getDuration(): number;
  getNumberOfCandles(): number;
  getCandles(): ICandle[];
  getLastCandle(): ICandle;
}
