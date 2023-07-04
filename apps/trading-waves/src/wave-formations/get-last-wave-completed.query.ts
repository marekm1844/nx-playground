import { Inject, Injectable } from '@nestjs/common';
import { ILastWaveCompletedRepository } from './domain/wave-repository.interface';
import { LastWaveCompletedDTO } from './dto/last-wave-completed.dto';

@Injectable()
export class GetLastWaveCompletedQuery {
  constructor(@Inject('ILastWaveCompletedRepository') private readonly waveRepository: ILastWaveCompletedRepository) {}

  async execute(symbol: string, interval: string): Promise<LastWaveCompletedDTO> {
    const waves = await this.waveRepository.getLastWavesCompleted(symbol, interval, 1);
    if (waves.length === 0) {
      throw new Error(`No last wave completed for symbol: ${symbol} and interval: ${interval}`);
    }
    return waves[0];
  }
}
