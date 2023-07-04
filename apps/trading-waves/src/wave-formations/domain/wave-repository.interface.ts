import { LastWaveCompletedDTO } from '../dto/last-wave-completed.dto';

export interface ILastWaveCompletedRepository {
  getLastWavesCompleted(symbol: string, interval: string, lastN: number): Promise<LastWaveCompletedDTO[]>;
}
