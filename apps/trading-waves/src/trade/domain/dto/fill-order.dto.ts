import { OrderStatus } from '../models/order.interface';

export class FillOrderDto {
  constructor(readonly symbol: string, readonly orderId: string, readonly orderStatus: OrderStatus, readonly filledQuantity: number, readonly filledPrice: number) {}
}
