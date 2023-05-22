export interface IQueueService {
    add<T>(name: string, data: T): Promise<void>;
  }
  