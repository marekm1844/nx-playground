import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { SaveOrderToRepositoryCommand } from '../commands/save-order-to-repository.command';
import { IEventStore } from '../../domain/repositories/event-store.interface';
import { Inject, Logger } from '@nestjs/common';
import { OrderSaveFailedEvent } from '../../domain/events/order-save-failed.event';

@CommandHandler(SaveOrderToRepositoryCommand)
export class SaveOrderToRepositoryHandler implements ICommandHandler<SaveOrderToRepositoryCommand> {
  constructor(private readonly publisher: EventBus, @Inject('IEventStore') private readonly eventStore: IEventStore) {}

  async execute(command: SaveOrderToRepositoryCommand) {
    try {
      const order = command.order;
      await this.eventStore.save(order);
      //order.commit();
      Logger.debug(`[SaveOrderToRepositoryHandler] Order saved: [${JSON.stringify(order, null, 2)}]`);
    } catch (error) {
      Logger.error(`[SaveOrderToRepositoryHandler] error: ${error.message}`);
      this.publisher.publish(new OrderSaveFailedEvent(command.order));
    }
  }
}
