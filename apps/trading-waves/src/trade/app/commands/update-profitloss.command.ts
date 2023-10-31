import { ICommand } from '@nestjs/cqrs';
import { ProfitLossEventDto } from '../../domain/dto/profit-loss-event.dto';

export class UpdateProfitLossAfterOrderFilledCommand implements ICommand {
  constructor(public readonly orderDetails: ProfitLossEventDto) {}
}
