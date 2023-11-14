import { Inject, Injectable, Logger } from '@nestjs/common';
import { WebsocketStream, Spot } from '@binance/connector-typescript';
import { isExecutionReportEvent } from './binance-connector.interface';
import { CommandBus } from '@nestjs/cqrs';
import { OrderStatus } from '../domain/models/order.interface';
import { CancelOrderCommand } from '../app/commands/cancel-order.command';
import { FillOrderCommand } from '../app/commands/fill-order.command';

@Injectable()
export class BinanceConnectorWebsocketService {
  private wsClient: WebsocketStream;
  private spotClient: Spot;
  private listenKey: string;
  //private callbacks: any;

  constructor(@Inject('BINANCE_API_KEY') apiKey: string, @Inject('BINANCE_SECRET_KEY') apiSecret: string, private commandBus: CommandBus) {
    this.spotClient = new Spot(apiKey, apiSecret, { baseURL: 'https://testnet.binance.vision' });
  }

  async listenForOrderUpates(symbol: string, orderId: string) {
    Logger.log(`[BinanceConnectorWebsocketService] Listening for order updates for order: [${orderId}]`);
    const key = await this.spotClient.createListenKey();

    const callbacks = {
      open: () => Logger.log(`[BinanceConnectorWebsocketService] Websocket connection opened`),
      close: () => Logger.log(`[BinanceConnectorWebsocketService] Websocket connection closed`),
      message: (data: any) => {
        const event = JSON.parse(data);
        Logger.log(`[BinanceConnectorWebsocketService] Websocket message received: ${data}`);
        if (isExecutionReportEvent(event)) {
          switch (event.X) {
            case 'PARTIALLY_FILLED':
              this.commandBus.execute(
                new FillOrderCommand({
                  symbol: event.s,
                  orderId: event.i,
                  filledQuantity: parseFloat(event.q),
                  filledPrice: parseFloat(event.p),
                  orderStatus: OrderStatus.PARTIALLY_FILLED,
                }),
              );
              Logger.debug(
                `[BinanceConnectorWebsocketService] (PARTIALLY_FILLED) Execution Report Details: [ Symbol: ${
                  event.s + ' QTY: ' + event.q + ' PRICE: ' + event.p + ' STATUS: ' + event.X
                }]`,
              );
              break;
            case 'FILLED':
              this.commandBus.execute(
                new FillOrderCommand({
                  symbol: event.s,
                  orderId: event.i,
                  filledQuantity: parseFloat(event.q),
                  filledPrice: parseFloat(event.p),
                  orderStatus: OrderStatus.FILLED,
                }),
              );
              Logger.debug(
                `[BinanceConnectorWebsocketService] (FILLED) Execution Report Details: [ Symbol: ${event.s + ' QTY: ' + event.q + ' PRICE: ' + event.p + ' STATUS: ' + event.X}]`,
              );
              break;
            case 'EXPIRED':
              this.commandBus.execute(
                new CancelOrderCommand({
                  symbol: event.s,
                  orderId: event.i,
                  orderStatus: OrderStatus.EXPIRED,
                }),
              );
              Logger.debug(`[BinanceConnectorWebsocketService] (EXPIRED) Execution Report Details: [ Symbol: ${event.s + ' STATUS: ' + event.X}]`);
              break;
            case 'REJECTED':
              this.commandBus.execute(
                new CancelOrderCommand({
                  symbol: event.s,
                  orderId: event.i,
                  orderStatus: OrderStatus.REJECTED,
                }),
              );
              Logger.debug(`[BinanceConnectorWebsocketService] (REJECTED) Execution Report Details: [ Symbol: ${event.s + ' STATUS: ' + event.X}]`);
          }
        }
      },
    };

    this.wsClient = new WebsocketStream({ callbacks, wsURL: 'wss://testnet.binance.vision' });
    this.wsClient.userData(key['listenKey']);
  }
}
