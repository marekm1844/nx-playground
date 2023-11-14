import { Order } from '../order.aggregate';

export class OrderSaveFailedEvent {
  constructor(readonly payload: Order) {}
}
