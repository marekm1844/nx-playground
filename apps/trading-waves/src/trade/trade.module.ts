import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FirestoreEventStore } from './infrastructure/firestore-repository/firestore-eventstore.repository';

@Module({
  imports: [],
  providers: [
    {
      provide: 'BINANCE_API_KEY',
      useFactory: (configService: ConfigService) => {
        const env = configService.get<string>('NODE_ENV');
        if (env === 'production') {
          return configService.get<string>('BINANCE_API_KEY');
        } else {
          return configService.get<string>('BINANCE_TEST_API_KEY');
        }
      },
      inject: [ConfigService],
    },
    {
      provide: 'BINANCE_SECRET_KEY',
      useFactory: (configService: ConfigService) => {
        const env = configService.get<string>('NODE_ENV');
        if (env === 'production') {
          return configService.get<string>('BINANCE_SECRET_KEY');
        } else {
          return configService.get<string>('BINANCE_TEST_SECRET_KEY');
        }
      },
      inject: [ConfigService],
    },
    FirestoreEventStore,
  ],
  exports: [],
})
export class TradeModule {}
