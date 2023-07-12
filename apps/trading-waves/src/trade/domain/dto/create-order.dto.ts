import { OrderSide, OrderType, TimeInForce } from '../models/order.interface';

export class CreateOrderDto {
  constructor(readonly symbol: string, readonly side: OrderSide, readonly type: OrderType, readonly quantity: number, readonly price: number, readonly timeInForce: TimeInForce) {}
}
