import { CommandHandler, EventPublisher } from '@nestjs/cqrs';
import { FillOrderCommand } from '../commands/fill-order.command';
import { BinanceApiService } from '../../infrastructure/binance-api.service';
import { Inject } from '@nestjs/common';
import { IEventStore } from '../../domain/repositories/event-store.interface';
import { OrderNotFoundError } from '../../domain/errors/order.errors';
import { OrderFillFailError } from '../../domain/errors/trade.errors';

@CommandHandler(FillOrderCommand)
export class FillOrderHandler {
  constructor(private readonly binanceapiService: BinanceApiService, private readonly publisher: EventPublisher, @Inject('IEventStore') private readonly eventStore: IEventStore) {}

  async execute(command: FillOrderCommand) {
    //Load order from event store
    const order = await this.eventStore.getEventsForOrder(command.fillOrderDto.orderId);
    if (!order) {
      throw new OrderNotFoundError();
    }
    //fill order
    try {
      order.updateOrderFilled(command.fillOrderDto.filledQuantity, command.fillOrderDto.filledPrice, command.fillOrderDto.orderStatus);
      await this.eventStore.save(order);
      const orderFilledEvent = this.publisher.mergeObjectContext(order);
      orderFilledEvent.commit();
      console.log(
        `[FillOrderHandler] command: [Order ${command.fillOrderDto.orderId} filled] with [${command.fillOrderDto.filledQuantity}] at [${command.fillOrderDto.filledPrice}]`,
      );
    } catch (error) {
      throw new OrderFillFailError(error.message);
    }
  }
}
