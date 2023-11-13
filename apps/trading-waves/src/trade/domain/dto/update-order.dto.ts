import { OrderStatus } from '../models/order.interface';

export class UpdateOrderDto {
  constructor(readonly symbol: string, readonly orderId: string, readonly orderStatus: OrderStatus) {}
}
