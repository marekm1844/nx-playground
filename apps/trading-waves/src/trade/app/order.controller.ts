import { Controller, Post, Body } from '@nestjs/common';
import { CreateOrderDto } from '../domain/dto/create-order.dto';
import { CreateOrderCommand } from './commands/create-order.commands';
import { CommandBus } from '@nestjs/cqrs';
import { OrderSide, OrderType, TimeInForce } from '../domain/models/order.interface';

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
    //console.log(`[OrderController] Order created: [${JSON.stringify(createOrderDto, null, 2)}]`);
  }
}
