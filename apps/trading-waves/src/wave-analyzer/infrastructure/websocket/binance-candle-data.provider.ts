import { Inject, Injectable, Logger } from '@nestjs/common';
import { ICandleDataProvider } from '../icandle-data-provider.interface';
import {} from '../typeorm/entities/candle.entity';
import { ICandleFactory } from '../../domain/factories/candle.factory';
import { ICandle } from '../../../shared/models/candle-entity.interface';
import { IWebSocketConnectionPool } from '../../../shared/events/infarstructure/websocket-connection-pool.interface';
import { WebSocketNotFoundError } from './websocket-notfound.error';
import { EventEmitter } from 'events';
import { interval as rxinterval, Subject, takeUntil } from 'rxjs';
import WebSocket from 'ws';

@Injectable()
export class BinanceCandleDataProvider implements ICandleDataProvider {
  private wasCloseIntentional: boolean;
  private messageQueue: string[] = [];
  private emitter = new EventEmitter();
  private heartBeatIntervals: { [key: string]: Subject<void> } = {};
  private isAlive: { [key: string]: boolean } = {}; // track connection's "alive" status

  constructor(private readonly candleFactory: ICandleFactory, @Inject('IWebSocketConnectionPool') private readonly connectionPool: IWebSocketConnectionPool) {
    this.wasCloseIntentional = false;
    Logger.debug(`[constructor] wasCloseIntentional set to: ${this.wasCloseIntentional}`);
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

    ws.on('open', () => {
      // setup ping on connection open
      this.isAlive[`${symbol}@${interval}`] = true;
      this.setupHeartbeat(symbol, interval, ws);
    });

    ws.on('pong', () => {
      // handle pong received
      this.isAlive[`${symbol}@${interval}`] = true;
      Logger.debug(`[pong] ${symbol}@${interval} is alive: ${this.isAlive[`${symbol}@${interval}`]}`);
    });

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
      Logger.error('WebSocket error:', error);
      this.reconnect(symbol, interval).catch(err => {
        Logger.error(err);
      });
    });

    ws.on('close', () => {
      // remove ping on connection close
      this.removeHeartbeat(symbol, interval);

      Logger.debug(`WebSocket closed. ${symbol}@${interval} was closed intentionally: ${this.wasCloseIntentional}`);
      if (!this.wasCloseIntentional) {
        Logger.debug('[close] entering reconnect');
        this.reconnect(symbol, interval).catch(err => {
          Logger.error(err);
        });
      }
    });
  }

  private removeHeartbeat(symbol: string, interval: string): void {
    const subject = this.heartBeatIntervals[`${symbol}@${interval}`];
    if (subject) {
      subject.next();
      subject.complete();
      delete this.heartBeatIntervals[`${symbol}@${interval}`];
    }
  }

  private setupHeartbeat(symbol: string, interval: string, ws: WebSocket): void {
    this.removeHeartbeat(symbol, interval); // Ensure to clear any existing interval

    const subject = new Subject<void>();
    this.heartBeatIntervals[`${symbol}@${interval}`] = subject;

    /**
     * Send ping every 60 minutes.
     */
    rxinterval(60 * 60 * 1000)
      .pipe(takeUntil(subject))
      .subscribe(() => {
        if (ws.readyState === ws.OPEN) {
          if (this.isAlive[`${symbol}@${interval}`]) {
            this.isAlive[`${symbol}@${interval}`] = false;
            ws.ping(null);
          } else {
            this.wasCloseIntentional = false;
            ws.terminate();
            this.isAlive[`${symbol}@${interval}`] = false;
            Logger.debug(`[setupHeartbeat] NOT ALIVE is alive: ${this.isAlive[`${symbol}@${interval}`]}`);
          }
        }
      });
  }

  private async reconnect(symbol: string, interval: string): Promise<void> {
    Logger.log('Reconnecting WebSocket...');
    this.wasCloseIntentional = false;
    Logger.debug(`[reconnect] wasCloseIntentional set to: ${this.wasCloseIntentional}; ${symbol}@${interval}`);
    this.close(symbol, interval, false);

    await new Promise(resolve => setTimeout(resolve, 5000));

    const wsOrError = await this.setupConnection(symbol, interval);

    if (wsOrError instanceof Error) {
      Logger.error(wsOrError.message);
    } else {
      Logger.log(`Successfully reconnected to ${symbol}@${interval}`);
    }
  }

  close(symbol: string, interval: string, manualClose: boolean): void {
    const wsOrError = this.connectionPool.get(symbol, interval);
    if (wsOrError instanceof Error) {
      Logger.error(`No active WebSocket connection found for symbol: ${symbol} and interval: ${interval}`);
      return;
    }
    this.wasCloseIntentional = manualClose;
    Logger.debug(`[close] wasCloseIntentional set to: ${this.wasCloseIntentional}, ${symbol}@${interval} `);
    this.removeHeartbeat(symbol, interval);
    this.connectionPool.disconnect(symbol, interval);
  }
}
