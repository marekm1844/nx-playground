import { Inject, Logger } from '@nestjs/common';
import { EventPublisher, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BinanceApiService } from '../../infrastructure/binance-api.service';
import { CreateOrderCommand } from '../commands/create-order.commands';
import { Order } from '../../domain/order.aggregate';
import { IEventStore } from '../../domain/repositories/event-store.interface';
import { OrderRepositoryError } from '../../domain/errors/order.errors';
import { catchError, from, map, mergeMap, of, retry, throwError } from 'rxjs';

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

    of(order)
      .pipe(
        mergeMap(o => from(this.eventStore.save(o)).pipe(map(() => o))),
        retry({ count: 5, delay: 2000 }),
        catchError(error => {
          Logger.error(`[CreateOrderHandler] Error saving order after 5 attemps: [${JSON.stringify(error, null, 2)}]`);
          return throwError(() => new OrderRepositoryError('Error saving order after few attemps'));
        }),
      )
      .subscribe({
        next: order => {
          order.commit();
          Logger.debug(`[CreateOrderHandler] Order created and saved: [${JSON.stringify(order.props.id, null, 2)}]`);
        },
        error: e => {
          Logger.error(`[CreateOrderHandler] Could not save the order: [${JSON.stringify(e, null, 2)}]`);
        },
      });

    //try {
    //await this.eventStore.save(order);
    //order.commit();
    //} catch (error) {
    //throw new OrderRepositoryError(error.message);
    //}

    //this.binanceWebsocketService.listenForOrderUpates(orderDetails.id);

    //console.log(`[CreateOrderHandler] Order created: [${JSON.stringify(command.createOrderDto, null, 2)}]`);
  }
}
