import { Inject, Injectable } from '@nestjs/common';
import { EventPublisher, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BinanceApiService } from '../../infrastructure/binance-api.service';
import { CreateOrderCommand } from '../commands/create-order.commands';
import { Order } from '../../domain/order.aggregate';
import { IEventStore } from '../../domain/repositories/event-store.interface';
import { OrderRepositoryError } from '../../domain/errors/order.errors';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(
    private readonly binanceApiService: BinanceApiService, //  private readonly binanceWebsocketService: BinanceWebsocketService,
    private readonly publisher: EventPublisher,
    @Inject('IEventStore') private readonly eventStore: IEventStore,
  ) {}

  async execute(command: CreateOrderCommand) {
    const orderDetails = await this.binanceApiService.createOrder(command.createOrderDto);
    const order = this.publisher.mergeObjectContext(Order.createNew(orderDetails));

    try {
      await this.eventStore.save(order);
      order.commit();
    } catch (error) {
      throw new OrderRepositoryError(error.message);
    }

    //this.binanceWebsocketService.listenForOrderUpates(orderDetails.id);

    console.log(`[CreateOrderHandler] Order created: [${JSON.stringify(command.createOrderDto, null, 2)}]`);
  }
}
