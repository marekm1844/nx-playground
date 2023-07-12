import { Injectable, Inject } from '@nestjs/common';
import Binance from 'binance-api-node';
import { IEventStore } from '../domain/repositories/event-store.interface';
import { OrderCreatedEvent } from '../domain/events/order-created.event';
import { IOrderEvent } from '../domain/events/order-events.interface';
import { OrderSide, OrderStatus, OrderType, TimeInForce } from '../domain/models/order.interface';
import { OrderEventDto } from '../domain/dto/order-event.dto';
import { CreateOrderDto } from '../domain/dto/create-order.dto';
import { CancelOrderDto } from '../domain/dto/cancel-order.dto';

@Injectable()
export class BinanceApiService {
  private readonly binanceClient;

  constructor(@Inject('BINANCE_API_KEY') apiKey: string, @Inject('BINANCE_SECRET_KEY') secretKey: string, private eventStore: IEventStore) {
    this.binanceClient = Binance({
      apiKey: apiKey,
      apiSecret: secretKey,
    });
  }

  async createOrder(orderDetails: CreateOrderDto): Promise<IOrderEvent> {
    const orderResponse = await this.binanceClient.order({
      symbol: orderDetails.symbol,
      side: orderDetails.side,
      quantity: orderDetails.quantity,
      price: orderDetails.price,
      type: orderDetails.type,
    });

    const orderCreatedEvent = new OrderCreatedEvent(this.mapBinanceResponseToOrderEventDto(orderResponse));

    return this.eventStore.save(orderCreatedEvent);
  }

  async cancelOrder(data: CancelOrderDto): Promise<any> {
    return this.binanceClient.cancelOrder({ symbol: data.symbol, orderId: data.orderId });
  }

  private mapBinanceResponseToOrderEventDto(response: any): OrderEventDto {
    const orderEventDto = new OrderEventDto();
    orderEventDto.orderId = response.orderId.toString(); // convert orderId to string

    let orderSide: OrderSide;
    if (response.side === 'BUY') {
      orderSide = OrderSide.BUY;
    } else if (response.side === 'SELL') {
      orderSide = OrderSide.SELL;
    }

    let orderType: OrderType;
    // map all possible binance types to your OrderType
    switch (response.type) {
      case 'LIMIT':
        orderType = OrderType.LIMIT;
        break;
      case 'MARKET':
        orderType = OrderType.MARKET;
        break;
      case 'STOP':
        orderType = OrderType.STOP;
        break;
      case 'STOP_LOSS_MARKET':
        orderType = OrderType.STOP_LOSS_MARKET;
        break;
      case 'STOP_LOSS_LIMIT':
        orderType = OrderType.STOP_LOSS_LIMIT;
        break;
      case 'TAKE_PROFIT_MARKET':
        orderType = OrderType.TAKE_PROFIT_MARKET;
        break;
      case 'TAKE_PROFIT_LIMIT':
        orderType = OrderType.TAKE_PROFIT_LIMIT;
        break;
      case 'LIMIT_MAKER':
        orderType = OrderType.LIMIT_MAKER;
        break;
      default:
        orderType = OrderType.LIMIT; // or some default type
    }

    let orderStatus: OrderStatus;
    // Map Binance statuses to your OrderStatus
    switch (response.status) {
      case 'NEW':
        orderStatus = OrderStatus.OPEN;
        break;
      case 'FILLED':
        orderStatus = OrderStatus.FILLED;
        break;
      case 'PARTIALLY_FILLED':
        orderStatus = OrderStatus.PARTIALLY_FILLED;
        break;
      case 'CANCELED':
        orderStatus = OrderStatus.CANCELED;
        break;
      case 'PENDING_CANCEL':
        orderStatus = OrderStatus.PENDING_CANCEL;
        break;
      case 'REJECTED':
        orderStatus = OrderStatus.REJECTED;
        break;
      case 'EXPIRED':
        orderStatus = OrderStatus.EXPIRED;
        break;
      case 'EXPIRED_IN_MATCH':
        orderStatus = OrderStatus.EXPIRED_IN_MATCH;
        break;
      default:
        orderStatus = OrderStatus.OPEN; // or some default status
    }

    let timeInForce: TimeInForce;
    switch (response.timeInForce) {
      case 'GTC':
        timeInForce = TimeInForce.GTC;
        break;
      case 'IOC':
        timeInForce = TimeInForce.IOC;
        break;
      case 'FOK':
        timeInForce = TimeInForce.FOK;
        break;
      default:
        timeInForce = TimeInForce.GTC; // or some default value
    }

    orderEventDto.eventData = {
      id: response.clientOrderId, // Assuming clientOrderId is your IOrderProps.id
      symbol: response.symbol,
      orderSide: orderSide,
      orderType: orderType,
      status: orderStatus,
      quantity: parseFloat(response.origQty),
      executedQuantity: parseFloat(response.executedQty),
      price: parseFloat(response.price),
      createdAt: new Date(response.transactTime),
      updatedAt: new Date(), // if binance doesn't provide update time
      timeInForce: timeInForce,
      // fill stopPrice and icebergQuantity as needed
    };

    return orderEventDto;
  }
}
