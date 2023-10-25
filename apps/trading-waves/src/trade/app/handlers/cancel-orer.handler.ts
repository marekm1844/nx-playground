import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { CancelOrderCommand } from '../commands/cancel-order.command';
import { Inject, Logger } from '@nestjs/common';
import { IEventStore } from '../../domain/repositories/event-store.interface';
import { BinanceApiService } from '../../infrastructure/binance-api.service';

@CommandHandler(CancelOrderCommand)
export class CancelOrderHandler implements ICommandHandler<CancelOrderCommand> {
  constructor(private readonly binanceApiService: BinanceApiService, private readonly publisher: EventPublisher, @Inject('IEventStore') private readonly eventStore: IEventStore) {}
  async execute(command: CancelOrderCommand) {
    //Load order from event store
    const order = await this.eventStore.getEventsForOrder(command.cancelOrderDto.orderId);

    if (!order) {
      throw new Error('Order not found');
    }
    Logger.log(`[CancelOrderHandler] oreder: [${JSON.stringify(order, null, 2)}]`);
    //cancel order
    try {
      await this.binanceApiService.cancelOrder(command.cancelOrderDto);
      order.cancelOrder();
      await this.eventStore.save(order);
      const orderCancelledEvent = this.publisher.mergeObjectContext(order);

      orderCancelledEvent.commit();
      console.log(`[CancelOrderHandler] command: [${JSON.stringify(command, null, 2)}]`);
    } catch (error) {
      throw new Error('Error cancelling order');
    }
  }
}
