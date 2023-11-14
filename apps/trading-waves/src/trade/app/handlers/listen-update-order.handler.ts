import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ListenForOrderUpdatesCommand } from '../commands/listen-update-order.command';
import { BinanceConnectorWebsocketService } from '../../infrastructure/binance-connector-websocket.service';

@CommandHandler(ListenForOrderUpdatesCommand)
export class ListenForOrderUpdatesHandler implements ICommandHandler<ListenForOrderUpdatesCommand> {
  constructor(private readonly binanceWebSocketService: BinanceConnectorWebsocketService) {}

  async execute(command: ListenForOrderUpdatesCommand) {
    this.binanceWebSocketService.listenForOrderUpates(command.symbol, command.orderId);
  }
}
