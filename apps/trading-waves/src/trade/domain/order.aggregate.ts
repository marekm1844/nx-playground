import { AggregateRoot } from '@nestjs/cqrs';
import { IOrderProps, OrderStatus } from './models/order.interface';
import { OrderCreatedEvent } from './events/order-created.event';
import { v4 as uuidv4 } from 'uuid';
import { OrderCancelledEvent } from './events/order-cancelled.event';
import { IOrderEvent } from './events/order-events.interface';
import { OrderFilledEvent } from './events/order-filled.event';

export class Order extends AggregateRoot {
  private _props: IOrderProps;

  private constructor(props: IOrderProps) {
    super();
    //this.autoCommit = true;
    if (!props.symbol) throw new Error('Order must have a symbol');
    if (!props.id) throw new Error('Order must have an id');
    this._props = {
      ...props,
      id: props.id || uuidv4(),
      clientOrderId: props.clientOrderId || uuidv4(),
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
      executedQuantity: props.executedQuantity || 0,
    };
  }

  get props(): IOrderProps {
    return this._props;
  }

  static createNew(props: IOrderProps): Order {
    if (props.status !== OrderStatus.OPEN && props.status !== OrderStatus.FILLED) {
      throw new Error('Order status must be OPEN when creating');
    }
    const order = new Order({
      ...props,
    });
    order.apply(new OrderCreatedEvent(order.props));
    if (order.props.status === OrderStatus.FILLED) {
      order.apply(new OrderFilledEvent(order.props));
    }
    return order;
  }

  static fromEvents(events: IOrderEvent[]): Order {
    const initialProps = events[0].payload as IOrderProps;
    const order = new Order(initialProps);
    events.forEach(event => order.apply(event));
    order.commit();
    return order;
  }

  cancelOrder(status: OrderStatus) {
    if (this._props.status !== OrderStatus.OPEN) throw new Error('Order status must be OPEN when cancelling');
    this._props.status = status;
    this._props.updatedAt = new Date();

    this.apply(new OrderCancelledEvent(this._props));
  }

  updateOrderFilled(quantity: number, price: number, status: OrderStatus) {
    //TODO: can add more cases for partially filled orders. Maybe we can track somewhere it the BUY order was completly SOLD before accepting new order.
    if (this._props.status !== OrderStatus.OPEN) throw new Error('Order status must be OPEN when updating filled');
    this._props.status = status;
    this._props.executedQuantity = quantity;
    this._props.price = price;
    this._props.updatedAt = new Date();

    this.apply(new OrderFilledEvent(this._props));
  }

  //applyEvents() {
  //  this.events.forEach(event => this.apply(event));
  //}

  ///commit() {
  ///  this.getUncommittedEvents().forEach(event => this.apply(event));
  ///  this.commit();
  ///}
}
