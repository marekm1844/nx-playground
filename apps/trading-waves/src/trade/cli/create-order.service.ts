import { Command, CommandRunner } from 'nest-commander';
import { Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateOrderDto } from '../domain/dto/create-order.dto';
import { OrderSide, OrderType, TimeInForce } from '../domain/models/order.interface';

@Command({ name: 'create-order', arguments: '<symbol> <quantity> <price>' })
export class CreateOrderServiceCLI extends CommandRunner {
  constructor(private readonly commandBus: CommandBus) {
    super();
  }

  async run(passedParams: string[]): Promise<void> {
    const [symbol, quantity, price] = passedParams;
    const createOrderDto: CreateOrderDto = {
      symbol,
      orderSide: OrderSide.BUY,
      orderType: OrderType.LIMIT,
      quantity: Number(quantity),
      price: Number(price),
      timeInForce: TimeInForce.GTC,
    };
    // const command = new CreateOrderCommand(createOrderDto);
    // await this.commandBus.execute(command);
    Logger.debug(`[CreateOrderServiceCLI] Order created: [${JSON.stringify(createOrderDto, null, 2)}]`);
  }
}
