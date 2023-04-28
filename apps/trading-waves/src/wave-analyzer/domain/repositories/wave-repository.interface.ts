import { Wave } from '../models/wave.entity';

export interface IWaveRepository {
  save(wave: Wave): Promise<Wave>;
  getWaves(): Promise<Wave[]>;
}
