import { ICommand } from '@nestjs/cqrs';
import { IOrderProps } from '../../domain/models/order.interface';

export class UpdateOrderCommand implements ICommand {
  constructor(public readonly updateOrderDto: IOrderProps) {}
}
