import { OrderStatus } from '../models/order.interface';

export class CancelOrderDto {
  constructor(readonly symbol: string, readonly orderId: string, readonly orderStatus: OrderStatus) {}
}
