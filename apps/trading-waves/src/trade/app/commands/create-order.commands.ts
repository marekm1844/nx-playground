import { CreateOrderDto } from '../../domain/dto/create-order.dto';
import { ICommand } from '@nestjs/cqrs';

export class CreateOrderCommand implements ICommand {
  constructor(public readonly createOrderDto: CreateOrderDto) {}
}
