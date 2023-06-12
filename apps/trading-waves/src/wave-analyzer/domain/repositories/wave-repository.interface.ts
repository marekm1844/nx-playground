import { IWave } from '../../../shared/models/wave-entity.interface';

export interface IWaveRepository {
  save(wave: IWave): Promise<IWave>;
  getWaves(symbol: string, interval: string): Promise<IWave[]>;
}
