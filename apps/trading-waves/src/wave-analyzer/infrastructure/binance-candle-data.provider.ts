import { Injectable } from '@nestjs/common';
import WebSocket from 'ws';
import { ICandleDataProvider } from './icandle-data-provider.interface';
import { Candle } from '../domain/models/candle.entity';

@Injectable()
export class BinanceCandleDataProvider implements ICandleDataProvider {
  private readonly binanceWebSocketUrl: string;
  private ws: WebSocket | null;

  constructor() {
    this.binanceWebSocketUrl = 'wss://stream.binance.com:9443/ws';
    this.ws = null;
  }

  async *candles(symbol: string, interval: string): AsyncIterableIterator<Candle> {
    const stream = `${symbol.toLowerCase()}@kline_${interval}`;
    this.connectWebSocket(`${this.binanceWebSocketUrl}/${stream}`);
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const messageQueue: string[] = [];
    let resolve: ((value: Candle | PromiseLike<Candle>) => void) | null = null;

    this.ws.on('message', (message: string) => {
      
        const data = JSON.parse(message);
        const candleData = data.k;

        const candle = new Candle({
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
        messageQueue.push(message);
      }
    }
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.reconnect(symbol, interval);
    });

    this.ws.on('close', () => {
      console.log('WebSocket closed.');
      this.reconnect(symbol, interval);
    });

    while (true) {
      if (messageQueue.length > 0) {
        const message = messageQueue.shift();
        const data = JSON.parse(message);
        const candleData = data.k;

        const candle = new Candle({
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
        yield new Promise<Candle>((r) => {
          resolve = r;
        });
      }
    }
  }

  private connectWebSocket(url: string): void {
    this.ws = new WebSocket(url);
  }

  private reconnect(symbol: string, interval: string): void {
    console.log('Reconnecting WebSocket...');
    this.close();
    setTimeout(() => {
      this.connectWebSocket(`${this.binanceWebSocketUrl}/${symbol.toLowerCase()}@kline_${interval}`);
    }, 5000); // Reconnect after a delay of 5 seconds
  }


  close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
