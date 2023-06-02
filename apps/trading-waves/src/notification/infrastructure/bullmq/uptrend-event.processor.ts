import { Processor, WorkerHost } from "@nestjs/bullmq";
import { WaveUptrendEvent } from "../../../wave-analyzer/domain/events/wave-uptrend.event";
import { Job } from "bullmq";
import { Notification } from "../../domain/models/notification.entity";
import { INotificationService } from "../../domain/notification-service.interface";
import { NotificationType } from "../../domain/models/notification-type.enum";
import { Inject, Logger } from "@nestjs/common";
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from "@nestjs/config";
import { UPTREND_QUEUE } from "../../../shared/events/infarstructure/redis-queue.constant";

@Processor(UPTREND_QUEUE.toString()) // the queue name should match the queue that publishes the event
export class UptrendEventProcessor extends WorkerHost {

  constructor(
    @Inject('INotificationService') private readonly notificationService: INotificationService, 
    private readonly configService: ConfigService) {
    super();
  }



  async process(job: Job<WaveUptrendEvent>): Promise<void> {
    Logger.debug(job.asJSON());
    const event = job.data;
    const notification: Notification = {
      id: Math.floor(Date.now() / 1000).toString() +'-'+ uuidv4(),
      type: NotificationType.BUY,
      symbol: event.data.symbol,
      price: event.data.price,
      source: 'WaveAnalyzer',
      createdAt: event.occurredOn,
      interval: event.data.interval,
      chatId: this.configService.get<number>('TELEGRAM_CHAT_ID'),
    };

    await this.notificationService.sendNotification(notification);
    Logger.log(`Notification sent for Uptrend ${notification.symbol} at ${notification.createdAt}`);
  }

}