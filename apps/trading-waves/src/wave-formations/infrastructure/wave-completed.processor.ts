import { Processor, WorkerHost } from '@nestjs/bullmq';
import { WAVE_COMPLETED } from '../../shared/events/infarstructure/redis-queue.constant';
import { Inject, Logger } from '@nestjs/common';
import { WaveCompletedEvent } from '../../wave-analyzer/domain/events/wave-completed.event';
import { Job } from 'bullmq';
import { WaveCompletedEventDTO } from '../dto/wave-completed-event.dto';
import { IFormationStrategy } from '../domain/formation-strategy.interface';
import { DogFormationStrategy } from '../domain/dog-formation.strategy';
import { SameTypeFormationStrategy } from '../domain/same-type-formations-for-symbol.strategy';
import { TelegramService } from '../../notification/infrastructure/services/telegram.service';
import { ConfigService } from '@nestjs/config';

@Processor(WAVE_COMPLETED)
export class WaveCompletedProcessor extends WorkerHost {
  private readonly strategies: IFormationStrategy[];

  constructor(
    @Inject(TelegramService) private readonly notificationService: TelegramService,
    private readonly configService: ConfigService,
    private readonly dogFormationStrategy: DogFormationStrategy,
    private readonly similarTypeFormationStrategy: SameTypeFormationStrategy,
  ) {
    super();
    this.strategies = [dogFormationStrategy, similarTypeFormationStrategy];
  }

  async process(job: Job<WaveCompletedEvent>) {
    console.log('WaveCompletedProcessor');

    const wave = WaveCompletedEventDTO.fromWaveCompletedEvent(job.data);
    const chatId = this.configService.get<number>('TELEGRAM_CHAT_ID');

    for (const strategy of this.strategies) {
      if (await strategy.isFormationDetected(wave)) {
        Logger.debug(`Formation detected: ${strategy.getFormationName()} for ${wave.symbol}\n` + `Signal: BUY\n` + `Price: ${wave.price}\n`);
        this.notificationService.sendRawNotification(
          chatId,
          `Formation detected: ${strategy.getFormationName()} for ${wave.symbol}\n` + `Signal: BUY\n` + `Price: ${wave.price}\n`,
        );
      }
    }
  }
}
