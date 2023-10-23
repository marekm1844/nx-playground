import { Inject, Injectable, Logger } from '@nestjs/common';
import Binance from 'binance-api-node';
import { CommandBus } from '@nestjs/cqrs';
import { IOrderProps } from '../domain/models/order.interface';
import { mapBinanceResponseToOrderProps } from './binance.utils';
import { UpdateOrderCommand } from '../app/commands/update-order.command';

@Injectable()
export class BinanceWebsocketService {
  private readonly binanceWsClient;

  constructor(@Inject('BINANCE_API_KEY') apiKey: string, @Inject('BINANCE_SECRET_KEY') secretKey: string, private commandBus: CommandBus) {
    this.binanceWsClient = Binance({
      apiKey: apiKey,
      apiSecret: secretKey,
    }).ws;
  }

  listenForOrderUpates(orderId: string) {
    this.binanceWsClient.userData(
      event => {
        if (event.eventType === 'executionReport' && event.orderId === orderId) {
          Logger.debug(`[BinanceWebsocketService] Order update received: [${JSON.stringify(event, null, 2)}]`);
          const orderDetails: IOrderProps = mapBinanceResponseToOrderProps(event);
          this.commandBus.execute(new UpdateOrderCommand(orderDetails));
        }
      },
      // Handle errors here
    );
  }
}
