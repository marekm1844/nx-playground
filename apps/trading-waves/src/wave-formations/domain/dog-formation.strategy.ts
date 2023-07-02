import { IFormationStrategy } from './formation-strategy.interface';
import { WaveCompletedEventDTO } from '../dto/wave-completed-event.dto';
import { WaveType } from '../../shared/models/wave-type.enum';
import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';

@Injectable()
export class DogFormationStrategy implements IFormationStrategy {
  private waves: Map<string, WaveCompletedEventDTO[]> = new Map();

  isFormationDetected(wave: WaveCompletedEventDTO): boolean {
    const key = this.getTaskKey(wave.symbol, wave.interval);
    if (!this.waves.has(key)) {
      this.waves.set(key, []);
    }
    this.waves.get(key).push(wave);
    this.ensureUptrendWaveIsFirst(key);
    this.ensureMaxFourWaves(key);

    return this.isDogFormation(wave.symbol, wave.interval);
  }

  private getTaskKey(symbol: string, interval: string): string {
    return `${symbol}-${interval}`;
  }

  private ensureUptrendWaveIsFirst(key: string): void {
    while (this.waves.get(key).length > 0 && this.waves.get(key)[0].type !== WaveType.Uptrend) {
      this.waves.get(key).shift();
    }
  }

  private ensureMaxFourWaves(key: string): void {
    while (this.waves.get(key).length > 4) {
      this.waves.get(key).shift();
    }
  }

  private isDogFormation(symbol: string, interval: string): boolean {
    const key = this.getTaskKey(symbol, interval);
    const wavesForCurrentPair = this.waves.get(key);

    if (wavesForCurrentPair.length < 4) {
      return false;
    }

    const [wave1, wave2, wave3, wave4] = wavesForCurrentPair.slice(-4);

    if (
      wave1.type === WaveType.Uptrend &&
      wave2.type === WaveType.Downtrend &&
      wave3.type === WaveType.Uptrend &&
      wave4.type === WaveType.Downtrend &&
      (wave4.corpse >= wave2.corpse || wave4.shadow >= wave2.shadow)
    ) {
      Logger.log('Dog Formation Detected');
      Logger.debug(`wave1: ${JSON.stringify(wave1)}`);
      Logger.debug(`wave2: ${JSON.stringify(wave2)}`);
      Logger.debug(`wave3: ${JSON.stringify(wave3)}`);
      Logger.debug(`wave4: ${JSON.stringify(wave4)}`);

      return true;
    }

    return false;
  }
}
