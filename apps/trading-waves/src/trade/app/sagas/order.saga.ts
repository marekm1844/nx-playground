import { ICommand, Saga, ofType } from '@nestjs/cqrs';
import { Observable, map } from 'rxjs';
import { OrderCreatedEvent } from '../../domain/events/order-created.event';
import { Injectable, Logger } from '@nestjs/common';
import { IOrderEvent } from '../../domain/events/order-events.interface';
import { OrderFilledEvent } from '../../domain/events/order-filled.event';
import { UpdateProfitLossAfterOrderFilledCommand } from '../commands/update-profitloss.command';
import { ListenForOrderUpdatesCommand } from '../commands/listen-update-order.command';
import { OrderStatus } from '../../domain/models/order.interface';

@Injectable()
export class OrderSaga {
  @Saga()
  profitLossTrackerSaga = (events$: Observable<IOrderEvent>): Observable<ICommand> => {
    Logger.debug(`[OrderSaga] profitLossTrackerSaga`);
    return events$.pipe(
      ofType(OrderFilledEvent),
      map((event: OrderFilledEvent) => {
        console.debug(`[OrderSaga] Order filled`);
        return new UpdateProfitLossAfterOrderFilledCommand({
          symbol: event.payload.symbol,
          orderSide: event.payload.orderSide,
          quantity: event.payload.executedQuantity,
          price: event.payload.price,
          cummulativeQuoteQty: event.payload.cummulativeQuoteQuantity,
        });
      }),
    );
  };
  @Saga()
  orderCreatedSaga = (events$: Observable<IOrderEvent>): Observable<ICommand> => {
    Logger.debug(`[OrderSaga] orderCreatedSaga`);
    return events$.pipe(
      ofType(OrderCreatedEvent),
      map((event: OrderCreatedEvent) => {
        console.debug(`[OrderSaga] Order created`);

        if (event.payload.status !== OrderStatus.FILLED) {
          return new ListenForOrderUpdatesCommand(event.payload.symbol, event.payload.id);
        }
      }),
    );
  };
  //newOrderCreated = (events$: Observable<any>): Observable<ICommand> => {
  //Logger.debug(`[OrderSaga] newOrderCreated`);
  //return events$.pipe(
  //ofType(OrderCreatedEvent),
  //map((event: OrderCreatedEvent) => {
  //console.debug(`[OrderSaga] Order created`);
  //return new SaveOrderToRepositoryCommand(event.payload);
  //}),
  //);
  //};
}
