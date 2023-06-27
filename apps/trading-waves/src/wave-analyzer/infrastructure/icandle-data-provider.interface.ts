import { ICandle } from '../../shared/models/candle-entity.interface';
import { WebSocketNotFoundError } from './websocket/websocket-notfound.error';
export const CANDLE_DATA_PROVIDER = Symbol('ICandleDataProvider');

export interface ICandleDataProvider {
  /**
   * Gets the candles for the given trading symbol and time interval.
   * @param symbol The trading symbol for the candle.
   * @param interval The time interval for the candle (e.g. "1m" for a 1-minute candle).
   * @returns An async iterable of candles.
   * @throws WebSocketNotFoundError if the websocket connection could not be established.
   */
  candles(symbol: string, interval: string): AsyncIterableIterator<ICandle | WebSocketNotFoundError>;

  /**
   * Closes the specified candle for the given trading symbol and time interval.
   * @param symbol The trading symbol for the candle.
   * @param interval The time interval for the candle (e.g. "1m" for a 1-minute candle).
   * @param manualClose A boolean indicating whether the candle was closed manually (true) or automatically (false).
   */
  close(sympol: string, interval: string, manualClose: boolean): void;
}
