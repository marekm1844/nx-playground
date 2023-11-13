import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import Binance from 'binance-api-node';
import { CommandBus } from '@nestjs/cqrs';
import { IOrderProps } from '../domain/models/order.interface';
import { mapBinanceResponseToOrderProps } from './binance.utils';
import { UpdateOrderCommand } from '../app/commands/update-order.command';

@Injectable()
export class BinanceWebsocketService implements OnModuleInit {
  private readonly binanceWsClient;

  constructor(@Inject('BINANCE_API_KEY') apiKey: string, @Inject('BINANCE_API_SECRET') secretKey: string, private commandBus: CommandBus) {
    this.binanceWsClient = Binance({
      apiKey: apiKey,
      apiSecret: secretKey,
      httpBase: 'https://testnet.binance.vision',
    });
  }

  onModuleInit() {
    Logger.log(`[BinanceWebsocketService] Listening for ticker updates`);
    //    this.binanceWsClient.ws.user(event => {
    //Logger.debug(`[BinanceWebsocketService] Event received: [${JSON.stringify(event, null, 2)}]`);
    //});
    ////this.binanceWsClient.ws.candles('ETHBTC', '1m', candle => {
    //Logger.log(`[BinanceWebsocketService] Candle update received: [${JSON.stringify(candle, null, 2)}]`);
    //});
  }

  listenForOrderUpates(symbol: string, orderId: string) {
    Logger.log(`[BinanceWebsocketService] Listening for order updates for order: [${orderId}]`);

    this.binanceWsClient.ws.candles('ETHBTC', '1m', candle => {
      Logger.log(`[BinanceWebsocketService] Candle update received: [${JSON.stringify(candle, null, 2)}]`);
    });

    this.binanceWsClient.ws.user(event => {
      Logger.debug(`[BinanceWebsocketService] Event received: [${JSON.stringify(event, null, 2)}]`);
      if (event.orderId === orderId && event.symbol === symbol) {
        Logger.debug(`[BinanceWebsocketService] Order update received: [${JSON.stringify(event, null, 2)}]`);
        const orderDetails: IOrderProps = mapBinanceResponseToOrderProps(event);
        // this.commandBus.execute(new UpdateOrderCommand(orderDetails));

        // Check if the order status is "FILLED"
        /**
          if (event.orderStatus === 'FILLED' || event.orderStatus === 'CANCELED') {
            Logger.log(`[BinanceWebsocketService] Order is FILLED, closing WebSocket connection.`);
            user();
          }
        */
      }
    });
  }
}
