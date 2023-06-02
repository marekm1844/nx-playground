import { WaveDowntrendEvent } from "../../../wave-analyzer/domain/events/wave-downtrend.event";
import { ITrendPublisherStrategy } from "./trend-strategy.interface";
import { IQueueService } from "../queue-service.interface";

export class WaveDowntrendEventStrategy implements ITrendPublisherStrategy {
    constructor(private readonly queue: IQueueService) {}

    async publishEvent(event: WaveDowntrendEvent): Promise<void> {
        await this.queue.add(event);
    }
}