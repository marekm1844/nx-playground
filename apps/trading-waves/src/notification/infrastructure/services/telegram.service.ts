import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import * as TelegramBot from 'node-telegram-bot-api';
import { INotificationService } from '../../domain/notification-service.interface';
import { Notification } from '../../domain/models/notification.entity';

@Injectable()
export class TelegramService implements INotificationService, OnModuleDestroy {
  constructor(@Inject('TELEGRAM_BOT') private bot: TelegramBot) {}

  async sendNotification(notification: Notification): Promise<void> {
    const message = this.formatMessage(notification);
    await this.bot.sendMessage(notification.chatId, message);
  }

  async sendRawNotification(chatId: number, message: string): Promise<void> {
    await this.bot.sendMessage(chatId, message);
  }

  onModuleDestroy() {
    this.bot.stopPolling();
  }

  private formatMessage(notification: Notification): string {
    // You can format the notification message based on your requirements.
    const message =
      `Alert: ${notification.type}\n` +
      `Symbol: ${notification.symbol}\n` +
      `Price: ${notification.price}\n` +
      `Interval: ${notification.interval}\n` +
      `Created At: ${notification.createdAt}\n` +
      `Module: ${notification.source}`;

    return message;
  }
}
