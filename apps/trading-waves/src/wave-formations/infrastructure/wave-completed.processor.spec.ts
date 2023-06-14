import { Test } from '@nestjs/testing';
import { WaveCompletedProcessor } from './wave-completed.processor';
import { WaveType } from '../../shared/models/wave-type.enum';
import { Job } from 'bullmq';
import { WaveCompletedEvent } from '../../wave-analyzer/domain/events/wave-completed.event';

describe('WaveCompletedProcessor', () => {
  let processor: WaveCompletedProcessor;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [WaveCompletedProcessor],
    }).compile();

    processor = moduleRef.get<WaveCompletedProcessor>(WaveCompletedProcessor);
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });
  it('should correctly populate waves', async () => {
    const jobData = {
      data: {
        type: WaveType.Uptrend,
        startDateTime: new Date(),
        endDateTime: new Date(),
        shadow: 123,
        corpse: 456,
        symbol: 'BTCUSDT',
        interval: '30m',
      },
    };

    const job = {
      data: jobData,
      id: '1',
      name: 'jobName',
      queue: {
        name: 'queueName',
        // other properties as needed
      },
      opts: {}, // options as per your requirements
      progress: jest.fn(),
      log: jest.fn(),
      moveToCompleted: jest.fn(),
      moveToFailed: jest.fn(),
      // any other methods or properties on the Job object that you need to use
    } as unknown as Job<WaveCompletedEvent>;
    await processor.process(job);
    expect(processor['waves'].get('BTCUSDT-30m').length).toBe(1);
  });

  it('should ensure first wave is Uptrend', async () => {
    const downtrendWaveData = {
      data: {
        type: WaveType.Downtrend,
        startDateTime: new Date(),
        endDateTime: new Date(),
        shadow: 123,
        corpse: 456,
        symbol: 'BTCUSDT',
        interval: '30m',
      },
    };

    const uptrendWaveData = {
      data: {
        type: WaveType.Uptrend,
        startDateTime: new Date(),
        endDateTime: new Date(),
        shadow: 123,
        corpse: 456,
        symbol: 'BTCUSDT',
        interval: '30m',
      },
    };

    const downtrendJob = {
      data: downtrendWaveData,
      id: '1',
      name: 'downtrendJobName',
      queue: { name: 'queueName' },
      opts: {},
      progress: jest.fn(),
      log: jest.fn(),
      moveToCompleted: jest.fn(),
      moveToFailed: jest.fn(),
    } as unknown as Job<WaveCompletedEvent>;

    const uptrendJob = {
      data: uptrendWaveData,
      id: '2',
      name: 'uptrendJobName',
      queue: { name: 'queueName' },
      opts: {},
      progress: jest.fn(),
      log: jest.fn(),
      moveToCompleted: jest.fn(),
      moveToFailed: jest.fn(),
    } as unknown as Job<WaveCompletedEvent>;

    // Process the downtrend wave first
    await processor.process(downtrendJob);

    // Process the uptrend wave next
    await processor.process(uptrendJob);

    // Expect first wave to be uptrend, because the Downtrend wave should be removed by ensureUptrendWaveIsFirst method
    expect(processor['waves'].get('BTCUSDT-30m')[0].type).toBe(WaveType.Uptrend);
  });

  it('should ensure max four waves', () => {
    // ... setup your waves
    // Call the method
    processor['ensureMaxFourWaves']('symbol-interval');
    // Expect only 4 waves
    expect(processor['waves'].get('symbol-interval').length).toBe(4);
  });

  it('should detect Dog Formation', async () => {
    // ... setup your waves
    // Call the method
    await processor['detectDogFormation']('symbol', 'interval');
    // Expect Dog Formation Detected to have been logged (using a jest spy)
  });
});
