// telegram-bot.provider.ts
import { Provider } from '@nestjs/common';
import TelegramBot from 'node-telegram-bot-api';
import { ConfigService } from '@nestjs/config';

export const TelegramBotProvider: Provider = {
  provide: 'TELEGRAM_BOT',
  useFactory: (configService: ConfigService) => {
    return new TelegramBot(configService.get<string>('TELEGRAM_BOT_TOKEN'), {polling: true});
  },
  inject: [ConfigService],
};
