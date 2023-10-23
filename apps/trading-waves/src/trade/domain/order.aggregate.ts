import { AggregateRoot } from '@nestjs/cqrs';
import { IOrderProps, OrderStatus } from './models/order.interface';
import { OrderCreatedEvent } from './events/order-created.event';
import { v4 as uuidv4 } from 'uuid';

export class Order extends AggregateRoot {
  private _props: IOrderProps;

  constructor(props: IOrderProps) {
    super();
    //this.autoCommit = true;
    // Validate order creation
    if (props.status !== OrderStatus.OPEN && props.status !== OrderStatus.FILLED) {
      throw new Error('Order status must be OPEN when creating');
    }

    this._props = {
      ...props,
      id: props.id || uuidv4(),
      clientOrderId: props.clientOrderId || uuidv4(),
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
      executedQuantity: props.executedQuantity || 0,
    };
    this.apply(new OrderCreatedEvent(this._props));
  }

  get props(): IOrderProps {
    return this._props;
  }
  //applyEvents() {
  //  this.events.forEach(event => this.apply(event));
  //}

  ///commit() {
  ///  this.getUncommittedEvents().forEach(event => this.apply(event));
  ///  this.commit();
  ///}
}
