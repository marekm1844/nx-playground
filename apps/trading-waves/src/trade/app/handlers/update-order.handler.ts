import { CommandHandler } from '@nestjs/cqrs';
import { UpdateOrderCommand } from '../commands/update-order.command';
import { Logger } from '@nestjs/common';

@CommandHandler(UpdateOrderCommand)
export class UpdateOrderHandler {
  execute(command: UpdateOrderCommand) {
    Logger.debug(`[UpdateOrderHandler] command: [${JSON.stringify(command, null, 2)}]`);
  }
}
