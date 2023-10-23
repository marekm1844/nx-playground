export class TradeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TradeError';
  }
}

export class InvalidSymbolError extends TradeError {
  constructor(symbol: string) {
    super(`Invalid symbol: ${symbol}`);
    this.name = 'InvalidSymbolError';
  }
}

export class InsufficientFundsError extends TradeError {
  constructor() {
    super('Insufficient funds');
    this.name = 'InsufficientFundsError';
  }
}

export class OrderRejectedError extends TradeError {
  constructor(reason: string) {
    super(`Order rejected: ${reason}`);
    this.name = 'OrderRejectedError';
  }
}

export class OrderCreationFailedError extends TradeError {
  constructor(reason: string) {
    super(`Order creation failed: ${reason}`);
    this.name = 'OrderCreationFailedError';
  }
}
