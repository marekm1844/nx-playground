import { Injectable, Logger } from '@nestjs/common';
import { ICommand, IEvent, IEventBus, Saga, ofType } from '@nestjs/cqrs';
import { Observable, delay, map, of } from 'rxjs';
import { OrderCreatedEvent } from '../../domain/events/order-created.event';
import { SaveOrderToRepositoryCommand } from '../commands/save-order-to-repository.command';
import { OrderSaveFailedEvent } from '../../domain/events/order-save-failed.event';

//@Injectable()
//export class OrderSaga {
//@Saga()
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

//}
