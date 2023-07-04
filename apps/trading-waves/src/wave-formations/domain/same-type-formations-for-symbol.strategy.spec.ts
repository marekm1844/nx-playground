import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { GetLastWaveCompletedQuery } from '../get-last-wave-completed.query';
import { WaveCompletedEventDTO } from '../../wave-analyzer/dto/wave-completed-event.dto';
import { WaveType } from '../../shared/models/wave-type.enum';
import { SameTypeFormationStrategy } from './same-type-formations-for-symbol.strategy';
import { Logger } from '@nestjs/common';

describe('SameTypeFormationStrategy', () => {
  let getLastWaveCompletedQuery: DeepMocked<GetLastWaveCompletedQuery>;
  let sameTypeFormationStrategy: SameTypeFormationStrategy;

  beforeEach(() => {
    jest.spyOn(Logger, 'debug');
    jest.spyOn(Logger, 'log');
    getLastWaveCompletedQuery = createMock<GetLastWaveCompletedQuery>();
    sameTypeFormationStrategy = new SameTypeFormationStrategy(getLastWaveCompletedQuery);
  });

  it('should return false when no previous wave found', async () => {
    const wave: WaveCompletedEventDTO = createMock<WaveCompletedEventDTO>();

    getLastWaveCompletedQuery.execute.mockResolvedValueOnce(undefined);

    const result = await sameTypeFormationStrategy.isFormationDetected(wave);
    expect(result).toBe(false);
    expect(Logger.debug).toBeCalledWith('No previous wave found');
  });

  it('should return true when similar type formation detected within 1.5 hours', async () => {
    const wave: WaveCompletedEventDTO = createMock<WaveCompletedEventDTO>({
      type: WaveType.Uptrend,
      startdatetime: new Date(),
    });

    getLastWaveCompletedQuery.execute.mockResolvedValueOnce({
      ...wave,
      startdatetime: new Date(wave.startdatetime.getTime() - 60 * 60 * 1000), // 1 hour before
    });

    const result = await sameTypeFormationStrategy.isFormationDetected(wave);
    expect(result).toBe(true);
    expect(Logger.log).toBeCalledWith('Similar type formation detected');
  });

  it('should return false when similar type formation detected but not within 1.5 hours', async () => {
    const wave: WaveCompletedEventDTO = createMock<WaveCompletedEventDTO>({
      type: WaveType.Uptrend,
      startdatetime: new Date(),
    });

    getLastWaveCompletedQuery.execute.mockResolvedValueOnce({
      ...wave,
      startdatetime: new Date(wave.startdatetime.getTime() - 2 * 60 * 60 * 1000), // 2 hours before
    });

    const result = await sameTypeFormationStrategy.isFormationDetected(wave);
    expect(result).toBe(false);
  });

  // Add more test cases as necessary
});
