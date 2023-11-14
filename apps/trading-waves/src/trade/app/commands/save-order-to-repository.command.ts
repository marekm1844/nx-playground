import { Order } from '../../domain/order.aggregate';

export class SaveOrderToRepositoryCommand {
  constructor(readonly order: Order) {}
}
