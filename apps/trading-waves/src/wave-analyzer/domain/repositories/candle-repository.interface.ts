
import { Candle } from '../models/candle.entity';

export interface ICandleRepository {
  save(candle: Candle): Promise<Candle>;
  getCandlesByWaveId(waveId: number): Promise<Candle[]>;
}