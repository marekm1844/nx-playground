export interface IDomainEvent<T = unknown> {
    data: T;
    occurredOn: Date;
    name: string;
  }