import { Controller, Post, Body } from '@nestjs/common';
import { CreateOrderDto } from '../domain/dto/create-order.dto';
import { CreateOrderCommand } from './commands/create-order.commands';
import { CommandBus } from '@nestjs/cqrs';
import { OrderSide, OrderStatus, OrderType, TimeInForce } from '../domain/models/order.interface';
import { CancelOrderDto } from '../domain/dto/cancel-order.dto';
import { CancelOrderCommand } from './commands/cancel-order.command';

type CreateOrderRequest = Omit<CreateOrderDto, 'orderSide' | 'orderType' | 'timeInForce'>;

@Controller('orders')
export class OrderController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post()
  async create(@Body() createOrderRequest: CreateOrderRequest) {
    const createOrderDto: CreateOrderDto = {
      symbol: createOrderRequest.symbol,
      orderSide: OrderSide.BUY,
      orderType: OrderType.LIMIT,
      quantity: Number(createOrderRequest.quantity),
      price: Number(createOrderRequest.price),
      timeInForce: TimeInForce.GTC,
    };
    const command = new CreateOrderCommand(createOrderDto);
    const order = await this.commandBus.execute(command);
    return { message: 'Order created successfully', order };
  }

  @Post('sell')
  async sell(@Body() createOrderRequest: CreateOrderRequest) {
    const createOrderDto: CreateOrderDto = {
      symbol: createOrderRequest.symbol,
      orderSide: OrderSide.SELL,
      orderType: OrderType.LIMIT,
      quantity: Number(createOrderRequest.quantity),
      price: Number(createOrderRequest.price),
      timeInForce: TimeInForce.GTC,
    };
    const command = new CreateOrderCommand(createOrderDto);
    const order = await this.commandBus.execute(command);
    return { message: 'Order created successfully', order };
  }

  @Post('cancel')
  async cancel(@Body() cancelOrderRequest: { symbol: string; orderId: string }) {
    const cancelOrderDto: CancelOrderDto = {
      symbol: cancelOrderRequest.symbol,
      orderId: cancelOrderRequest.orderId,
      orderStatus: OrderStatus.CANCELLED,
    };
    await this.commandBus.execute(new CancelOrderCommand(cancelOrderDto));
    return { message: 'Order cancelled successfully' };
  }

  /**
    @Get(':id')
    async getOrder(@Param('id') orderid: string) {
      Logger.debug(`[OrderController] getOrder: [${JSON.stringify(orderid, null, 2)}]`);
      const fillOrderDto: FillOrderDto = {
        symbol: 'RUNEBUSD',
        orderId: orderid,
        orderStatus: OrderStatus.FILLED,
        filledQuantity: 0.1,
        filledPrice: 1000,
      };
      await this.commandBus.execute(new FillOrderCommand(fillOrderDto));
      return { message: 'Order filled' };
    }
  */
}
