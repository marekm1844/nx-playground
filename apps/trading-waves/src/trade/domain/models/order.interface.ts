export enum OrderSide {
  BUY = 'buy',
  SELL = 'sell',
}

export enum OrderType {
  LIMIT = 'limit',
  MARKET = 'market',
  STOP = 'stop',
  STOP_LOSS_LIMIT = 'stop_loss_limit',
  STOP_LOSS_MARKET = 'stop_loss_market',
  TAKE_PROFIT = 'take_profit',
  TAKE_PROFIT_LIMIT = 'take_profit_limit',
  TAKE_PROFIT_MARKET = 'take_profit_market',
  TRAILING_STOP_MARKET = 'trailing_stop_market',
  LIMIT_MAKER = 'limit_maker',
}

export enum OrderStatus {
  OPEN = 'open',
  FILLED = 'filled',
  PARTIALLY_FILLED = 'partially_filled',
  CANCELLED = 'cancelled',
  PENDING_CANCEL = 'pending_cancel',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  EXPIRED_IN_MATCH = 'expired_in_match',
}

/**
 * Time in force policies.
 * GTC (Good-Til-Canceled) orders are effective until they are executed or canceled.
 * IOC (Immediate or Cancel) orders fills all or part of an order immediately and cancels the remaining part of the order.
 * FOK (Fill or Kill) orders fills all in its entirety, otherwise, the entire order will be cancelled.
 */
export enum TimeInForce {
  GTC = 'GTC',
  IOC = 'IOC',
  FOK = 'FOK',
}

export interface IOrderProps {
  id: string;
  clientOrderId: string;
  symbol: string;
  orderSide: OrderSide;
  orderType: OrderType;
  status: OrderStatus;
  quantity: number;
  executedQuantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  timeInForce: TimeInForce;
  stopPrice?: number;
  icebergQuantity?: number;
  cummulativeQuoteQuantity?: number;
}
