export interface BinanceOrderResponse {
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET' | 'STOP' | 'STOP_LOSS_MARKET' | 'STOP_LOSS_LIMIT' | 'TAKE_PROFIT_MARKET' | 'TAKE_PROFIT_LIMIT' | 'LIMIT_MAKER';
  status: 'NEW' | 'FILLED' | 'PARTIALLY_FILLED' | 'CANCELED' | 'PENDING_CANCEL' | 'REJECTED' | 'EXPIRED' | 'EXPIRED_IN_MATCH';
  timeInForce: 'GTC' | 'IOC' | 'FOK';
  orderId: number;
  clientOrderId: string;
  symbol: string;
  origQty: string;
  executedQty: string;
  price: string;
  transactTime: number;
  cummulativeQuoteQty: string;
  // other properties as needed
}

export function isBinanceOrderResponse(response: any): response is BinanceOrderResponse {
  const isString = (value: any): value is string => typeof value === 'string';
  const isNumber = (value: any): value is number => typeof value === 'number';

  const validSides = ['BUY', 'SELL'];
  const validTypes = ['LIMIT', 'MARKET', 'STOP', 'STOP_LOSS_MARKET', 'STOP_LOSS_LIMIT', 'TAKE_PROFIT_MARKET', 'TAKE_PROFIT_LIMIT', 'LIMIT_MAKER'];
  const validStatuses = ['NEW', 'FILLED', 'PARTIALLY_FILLED', 'CANCELED', 'PENDING_CANCEL', 'REJECTED', 'EXPIRED', 'EXPIRED_IN_MATCH'];
  const validTimeInForces = ['GTC', 'IOC', 'FOK'];

  return (
    isNumber(response.orderId) &&
    isString(response.clientOrderId) &&
    isString(response.symbol) &&
    validSides.includes(response.side) &&
    validTypes.includes(response.type) &&
    validStatuses.includes(response.status) &&
    validTimeInForces.includes(response.timeInForce) &&
    isString(response.origQty) &&
    isString(response.executedQty) &&
    isString(response.price) &&
    isNumber(response.transactTime) &&
    isString(response.cummulativeQuoteQty)
  );
  // Add more checks for other properties as needed
}
