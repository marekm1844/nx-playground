import { ICommand } from '@nestjs/cqrs';
import { CancelOrderDto } from '../../domain/dto/cancel-order.dto';

export class CancelOrderCommand implements ICommand {
  constructor(public readonly cancelOrderDto: CancelOrderDto) {}
}
