import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FirestoreEventStore } from './infrastructure/firestore-repository/firestore-eventstore.repository';
import { OrderController } from './app/order.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateOrderHandler } from './app/handlers/create-order.handler';
import { BinanceApiService } from './infrastructure/binance-api.service';
import { FirestoreClient } from '../shared/repository/firestore.client';
import { CancelOrderHandler } from './app/handlers/cancel-order.handler';
import { SaveOrderToRepositoryHandler } from './app/handlers/save-order-to-repository.handler';

const CommandHandlers = [CreateOrderHandler, CancelOrderHandler, SaveOrderToRepositoryHandler];

@Module({
  imports: [CqrsModule],
  providers: [
    FirestoreClient,
    BinanceApiService,
    ...CommandHandlers,
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
      provide: 'FIREBASE_ORDER_COLLECTION',
      useFactory: (configService: ConfigService) => {
        return configService.get<string>('FIREBASE_ORDER_COLLECTION');
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
