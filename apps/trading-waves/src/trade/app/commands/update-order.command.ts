import { ICommand } from '@nestjs/cqrs';
import { UpdateOrderDto } from '../../domain/dto/update-order.dto';

export class UpdateOrderCommand implements ICommand {
  constructor(public readonly updateOrderDto: UpdateOrderDto) {}
}
