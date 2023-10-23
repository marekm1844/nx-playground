import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FirestoreEventStore } from './infrastructure/firestore-repository/firestore-eventstore.repository';
import { OrderController } from './app/order.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateOrderHandler } from './app/handlers/create-order.handler';
import { BinanceApiService } from './infrastructure/binance-api.service';
import { FirestoreClient } from '../shared/repository/firestore.client';

@Module({
  imports: [CqrsModule],
  providers: [
    FirestoreClient,
    CreateOrderHandler,
    BinanceApiService,
    {
      provide: 'BINANCE_API_KEY',
      useFactory: (configService: ConfigService) => {
        return configService.get<string>('BINANCE_API_KEY');
      },
      inject: [ConfigService],
    },
    {
      provide: 'BINANCE_SECRET_KEY',
      useFactory: (configService: ConfigService) => {
        return configService.get<string>('BINANCE_SECRET_KEY');
      },
      inject: [ConfigService],
    },
    {
      provide: 'IEventStore',
      useClass: FirestoreEventStore,
    },
    FirestoreEventStore,
  ],
  controllers: [OrderController],
  exports: [],
})
export class TradeModule {}
