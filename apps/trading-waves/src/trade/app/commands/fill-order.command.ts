import { ICommand } from '@nestjs/cqrs';
import { FillOrderDto } from '../../domain/dto/fill-order.dto';

export class FillOrderCommand implements ICommand {
  constructor(public readonly fillOrderDto: FillOrderDto) {}
}
