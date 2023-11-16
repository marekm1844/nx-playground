import { Injectable, Inject, Logger } from '@nestjs/common';
import Binance from 'binance-api-node';
import { IOrderProps, OrderSide, OrderStatus, OrderType, TimeInForce } from '../domain/models/order.interface';
import { CreateOrderDto } from '../domain/dto/create-order.dto';
import { CancelOrderDto } from '../domain/dto/cancel-order.dto';
import { OrderCancelFailError, OrderCreationFailedError } from '../domain/errors/trade.errors';
import { BinanceOrderResponse, isBinanceOrderResponse } from './binance-response.interface';

@Injectable()
export class BinanceApiService {
  private readonly binanceClient;

  constructor(@Inject('BINANCE_API_KEY') apiKey: string, @Inject('BINANCE_SECRET_KEY') secretKey: string) {
    this.binanceClient = Binance({
      apiKey: apiKey,
      apiSecret: secretKey,
      httpBase: 'https://testnet.binance.vision',
    });
  }

  async createOrder(orderDetails: CreateOrderDto): Promise<IOrderProps> {
    Logger.debug(`[BinanceApiService] Creating order: [${JSON.stringify(orderDetails, null, 2)}]`);
    try {
      const orderResponse = await this.binanceClient.order({
        symbol: orderDetails.symbol,
        side: orderDetails.orderSide,
        quantity: orderDetails.quantity,
        price: orderDetails.price,
        type: orderDetails.orderType,
        timeInForce: orderDetails.timeInForce,
      });

      Logger.debug(`[BinanceApiService] Order created: [${JSON.stringify(orderResponse, null, 2)}]`);

      const orderCreatedResponse = this.mapBinanceResponseToOrderEventDto(orderResponse);

      return orderCreatedResponse;
    } catch (error) {
      Logger.error(`[BinanceApiService] Error creating order: [${JSON.stringify(error, null, 2)}]`);

      throw new OrderCreationFailedError(error.message);
    }
  }

  async cancelOrder(data: CancelOrderDto): Promise<IOrderProps> {
    try {
      const orderResponse = await this.binanceClient.cancelOrder({ symbol: data.symbol, orderId: data.orderId });
      if (isBinanceOrderResponse(orderResponse)) {
        return this.mapBinanceResponseToOrderEventDto(orderResponse);
      }
      throw new Error('Response is not a BinanceOrderResponse');
    } catch (error) {
      Logger.error(`[BinanceApiService] Error cancelling order: [${JSON.stringify(error, null, 2)}]`);

      throw new OrderCancelFailError(error.message);
    }
  }

  private mapBinanceResponseToOrderEventDto(response: BinanceOrderResponse): IOrderProps {
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
        orderStatus = OrderStatus.CANCELLED;
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

    const props: IOrderProps = {
      id: response.orderId.toString(),
      clientOrderId: response.clientOrderId,
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
      cummulativeQuoteQuantity: parseFloat(response.cummulativeQuoteQty),
      // fill stopPrice and icebergQuantity as needed
    };

    return props;
  }
}
