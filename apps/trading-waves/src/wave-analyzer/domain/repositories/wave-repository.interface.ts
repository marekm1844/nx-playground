import { IWave } from '../models/wave-entity.interface';

export interface IWaveRepository {
  save(wave: IWave): Promise<IWave>;
  getWaves(): Promise<IWave[]>;
}
