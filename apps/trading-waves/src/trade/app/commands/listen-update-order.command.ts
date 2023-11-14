import { ICommand } from '@nestjs/cqrs';

export class ListenForOrderUpdatesCommand implements ICommand {
  constructor(public readonly symbol: string, public readonly orderId: string) {}
}
