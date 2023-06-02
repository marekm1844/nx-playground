import { Injectable } from "@nestjs/common";
import { IDomainEvent } from "./domain-event.interface";
import { IQueueService } from "./queue-service.interface";
import { WaveUptrendEvent } from "../../wave-analyzer/domain/events/wave-uptrend.event";

@Injectable()
export class EventPublisher<T extends IDomainEvent = IDomainEvent> {
  constructor( private readonly queue: IQueueService) {}

  async publish(event: T) {
    //if event is WaveUptrendEvent then do something
    if (event instanceof WaveUptrendEvent) {
      console.log('WaveUptrendEvent');

    await this.queue.add(event);
    }
    else {
      console.log('WaveDowntrendEvent');
      await this.queue.add(event);
    }

  }
}