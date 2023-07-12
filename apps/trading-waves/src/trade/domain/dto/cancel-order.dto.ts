export class CancelOrderDto {
  constructor(readonly symbol: string, readonly orderId: string) {}
}
