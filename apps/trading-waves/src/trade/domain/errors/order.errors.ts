class OrderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

class OrderInvalidEventTypeError extends OrderError {
  constructor() {
    super('Event type not compatible with order');
  }
}

class OrderInvalidError extends OrderError {
  constructor(reason: string) {
    super(`Invalid order: ${reason}`);
  }
}

class OrderNotFoundError extends OrderError {
  constructor(reason: string) {
    super(`Order not found: ${reason}`);
  }
}

class OrderRepositoryError extends OrderError {
  constructor(reason: string) {
    super(`Order repository error: ${reason}`);
  }
}

export { OrderError, OrderInvalidEventTypeError, OrderInvalidError, OrderNotFoundError, OrderRepositoryError };
