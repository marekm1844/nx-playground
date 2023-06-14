import { Inject, Injectable, Logger } from '@nestjs/common';
import { ICandleDataProvider } from '../icandle-data-provider.interface';
import {} from '../typeorm/entities/candle.entity';
import { ICandleFactory } from '../../domain/factories/candle.factory';
import { ICandle } from '../../../shared/models/candle-entity.interface';
import { IWebSocketConnectionPool } from '../../../shared/events/infarstructure/websocket-connection-pool.interface';
import { WebSocketNotFoundError } from './websocket-notfound.error';
import { EventEmitter } from 'events';

@Injectable()
export class BinanceCandleDataProvider implements ICandleDataProvider {
  private wasCloseIntentional: boolean;
  private messageQueue: string[] = [];
  private emitter = new EventEmitter();

  constructor(private readonly candleFactory: ICandleFactory, @Inject('IWebSocketConnectionPool') private readonly connectionPool: IWebSocketConnectionPool) {
    this.wasCloseIntentional = false;
  }

  async *candles(symbol: string, interval: string): AsyncIterableIterator<ICandle | WebSocketNotFoundError> {
    const connection = await this.setupConnection(symbol, interval);

    if (connection instanceof WebSocketNotFoundError) {
      yield connection;
      return;
    }

    while (true) {
      if (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        const data = JSON.parse(message);
        const candleData = data.k;

        const candle = this.candleFactory.createCandle({
          openTime: candleData.t,
          open: candleData.o,
          high: candleData.h,
          low: candleData.l,
          close: candleData.c,
          volume: candleData.v,
          closeTime: candleData.T,
          quoteAssetVolume: candleData.q,
          numberOfTrades: candleData.n,
          takerBuyBaseAssetVolume: candleData.V,
          takerBuyQuoteAssetVolume: candleData.Q,
          ignore: candleData.B,
          completed: candleData.x,
        });

        if (candle.completed) {
          yield candle;
        }
      } else {
        // Block until new messages are available.
        await new Promise(resolve => {
          this.emitter.once('message', resolve);
        });
      }
    }
  }

  private async setupConnection(symbol: string, interval: string): Promise<void | WebSocketNotFoundError> {
    const ws = await this.connectionPool.connect(symbol, interval);

    if (ws instanceof Error) {
      Logger.error(ws.message);
      return ws as WebSocketNotFoundError;
    }

    Logger.log(`Connected to WebSocket for symbol "${symbol}" and interval "${interval}"`);

    let resolve: ((value: ICandle | PromiseLike<ICandle>) => void) | null = null;

    ws.on('message', (message: string) => {
      const data = JSON.parse(message);
      const candleData = data.k;

      const candle = this.candleFactory.createCandle({
        openTime: candleData.t,
        open: candleData.o,
        high: candleData.h,
        low: candleData.l,
        close: candleData.c,
        volume: candleData.v,
        closeTime: candleData.T,
        quoteAssetVolume: candleData.q,
        numberOfTrades: candleData.n,
        takerBuyBaseAssetVolume: candleData.V,
        takerBuyQuoteAssetVolume: candleData.Q,
        ignore: candleData.B,
        completed: candleData.x,
      });

      if (candle.completed) {
        if (resolve) {
          resolve(candle);
          resolve = null;
        } else {
          this.messageQueue.push(message);
          // Emit an event to unblock the loop in `candles`.
          this.emitter.emit('message');
        }
      }
    });

    ws.on('error', error => {
      console.error('WebSocket error:', error);
      this.reconnect(symbol, interval).catch(err => {
        Logger.error(err);
      });
    });

    ws.on('close', () => {
      console.log('WebSocket closed.');
      if (!this.wasCloseIntentional) {
        this.reconnect(symbol, interval).catch(err => {
          Logger.error(err);
        });
      }
    });
  }

  private async reconnect(symbol: string, interval: string): Promise<void> {
    console.log('Reconnecting WebSocket...');
    this.wasCloseIntentional = false;
    this.close(symbol, interval);

    await new Promise(resolve => setTimeout(resolve, 5000));

    const wsOrError = await this.setupConnection(symbol, interval);

    if (wsOrError instanceof Error) {
      Logger.error(wsOrError.message);
    } else {
      Logger.log(`Successfully reconnected to ${symbol}@${interval}`);
    }
  }

  close(symbol: string, interval: string): void {
    const wsOrError = this.connectionPool.get(symbol, interval);
    if (wsOrError instanceof Error) {
      Logger.error(`No active WebSocket connection found for symbol: ${symbol} and interval: ${interval}`);
      return;
    }
    this.wasCloseIntentional = true;
    this.connectionPool.disconnect(symbol, interval);
  }
}
