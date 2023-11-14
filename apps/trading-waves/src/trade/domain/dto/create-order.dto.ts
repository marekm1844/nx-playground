import { OrderSide, OrderType, TimeInForce } from '../models/order.interface';

export class CreateOrderDto {
  constructor(
    readonly symbol: string,
    readonly orderSide: OrderSide,
    readonly orderType: OrderType,
    readonly quantity: number,
    readonly price: number,
    readonly timeInForce: TimeInForce,
  ) {}
}
