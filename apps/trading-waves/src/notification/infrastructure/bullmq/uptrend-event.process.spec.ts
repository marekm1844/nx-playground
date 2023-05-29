import { Test, TestingModule } from '@nestjs/testing';
import { UptrendEventProcessor } from './uptrend-event.processor';
import { INotificationService } from "../../domain/notification-service.interface";
import { ConfigService } from "@nestjs/config";
import { Job } from 'bullmq';
import { WaveEventDTO } from "../../../wave-analyzer/dto/wave-event.dto";
import { NotificationType } from "../../domain/models/notification-type.enum";
import { WaveUptrendEvent } from "../../../wave-analyzer/domain/events/wave-uptrend.event";

describe('UptrendEventProcessor', () => {
  let processor: UptrendEventProcessor;
  let notificationService: jest.Mocked<INotificationService>;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UptrendEventProcessor,
        {
          provide: 'INotificationService',
          useValue: {
            sendNotification: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(123456), // Mock the TELEGRAM_CHAT_ID
          },
        },
      ],
    }).compile();

    processor = module.get<UptrendEventProcessor>(UptrendEventProcessor);
    notificationService = module.get('INotificationService');
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should process an uptrend event correctly', async () => {
    const waveEventDTO: WaveEventDTO = {
      startdatetime: new Date(),
      price: 100,
      symbol: 'TEST',
      interval: '1h',
    };

    const waveUptrendEvent: WaveUptrendEvent = {
      data: waveEventDTO,
      occurredOn: new Date(),
    };

    const testJob: Job<WaveUptrendEvent> = {
      data: waveUptrendEvent,
    } as Job<WaveUptrendEvent>;

    await processor.process(testJob);

    expect(notificationService.sendNotification).toHaveBeenCalledWith({
      id: expect.stringMatching(/^\d{10}-[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/), // Expect an ID that starts with digits (timestamp) followed by a UUID
      type: NotificationType.BUY,
      symbol: 'TEST',
      price: 100,
      source: 'WaveAnalyzer',
      createdAt: waveEventDTO.startdatetime,
      interval: '1h',
      chatId: 123456,
    });
  });
});
