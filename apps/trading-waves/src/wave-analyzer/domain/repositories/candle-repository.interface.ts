import { ICandle } from "../models/candle-entity.interface";

export interface ICandleRepository {
  save(candle: ICandle): Promise<ICandle>;
  getCandlesByWaveId(waveId: string): Promise<ICandle[]>;
}