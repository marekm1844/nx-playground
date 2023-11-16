import { OrderSide } from '../models/order.interface';

export class ProfitLossEventDto {
  constructor(readonly symbol: string, readonly orderSide: OrderSide, readonly quantity: number, readonly price: number, readonly cummulativeQuoteQty: number) {}
}
