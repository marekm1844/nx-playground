import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { ConfigService } from "@nestjs/config";
import { INotificationService } from "../../domain/notification-service.interface";
import { NotificationType } from "../../domain/models/notification-type.enum";
import { DowntrendEventProcessor } from './downtrend-event.processor';
import { WaveEventDTO } from "../../../wave-analyzer/dto/wave-event.dto";
import { WaveDowntrendEvent } from '../../../wave-analyzer/domain/events/wave-downtrend.event';

describe('DowntrendEventProcessor', () => {
  let processor: DowntrendEventProcessor;
  let notificationService: jest.Mocked<INotificationService>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DowntrendEventProcessor,
        {
          provide: 'INotificationService',
          useValue: {
            sendNotification: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(123456),
          },
        },
      ],
    }).compile();

    processor = module.get<DowntrendEventProcessor>(DowntrendEventProcessor);
    notificationService = module.get('INotificationService');
  });

  it('should process a downtrend event correctly', async () => {
    const waveEventDTO: WaveEventDTO = {
      startdatetime: new Date(),
      price: 100,
      symbol: 'TEST',
      interval: '1h',
    };
  
    const waveDowntrendEvent: WaveDowntrendEvent = {
      data: waveEventDTO,
      occurredOn: new Date(),
      name: 'WaveDowntrendEvent',
    };
  
    const testJob: Job<WaveDowntrendEvent> = {
      data: waveDowntrendEvent,
    } as Job<WaveDowntrendEvent>;
  
    await processor.process(testJob);
  
    expect(notificationService.sendNotification).toHaveBeenCalledWith({
      id: expect.stringMatching(/^\d{10}-[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/), // Expect an ID that starts with digits (timestamp) followed by a UUID
      type: NotificationType.SELL,
      symbol: 'TEST',
      price: 100,
      source: 'WaveAnalyzer',
      createdAt: waveEventDTO.startdatetime,
      interval: '1h',
      chatId: 123456,
    });
  });
  
});
