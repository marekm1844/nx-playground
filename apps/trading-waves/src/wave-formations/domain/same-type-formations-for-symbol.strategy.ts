import { WaveCompletedEventDTO } from '../../wave-analyzer/dto/wave-completed-event.dto';
import { Inject, Logger } from '@nestjs/common';
import { IFormationStrategy } from './formation-strategy.interface';
import { GetLastWaveCompletedQuery } from '../get-last-wave-completed.query';
import { WaveType } from '../../shared/models/wave-type.enum';

export class SameTypeFormationStrategy implements IFormationStrategy {
  constructor(@Inject(GetLastWaveCompletedQuery) private readonly getLastWaveCompletedQuery: GetLastWaveCompletedQuery) {}

  async isFormationDetected(wave: WaveCompletedEventDTO): Promise<boolean> {
    //Currenlty only for buy signals (uptrends)
    if (wave.type === WaveType.Downtrend) {
      return false;
    }

    const lastWaveFromRepo = await this.getLastWaveCompletedQuery.execute(wave.symbol, wave.interval);
    if (!lastWaveFromRepo) {
      Logger.debug('No previous wave found');
      return false;
    }

    const timeDifference = Math.abs(new Date(wave.startdatetime).getTime() - new Date(lastWaveFromRepo.startdatetime).getTime());
    /**
     * 1.5 hours
     */
    const timeDifferenceInHours = timeDifference / (1000 * 60 * 60);
    Logger.debug(
      `Time difference in hours: ${timeDifferenceInHours} for current wave startdatetime: ${wave.startdatetime} and last wave startdatetime: ${lastWaveFromRepo.startdatetime}`,
    );

    if (wave.type === lastWaveFromRepo.type && timeDifferenceInHours <= 1.5) {
      Logger.log('Similar type formation detected');

      // Log both waves as JSON
      Logger.debug(`current wave: ${JSON.stringify(wave)}`);
      Logger.debug(`last wave: ${JSON.stringify(lastWaveFromRepo)}`);
      return true;
    }

    return false;
  }

  getFormationName(): string {
    return 'Same Type Formation';
  }
}
