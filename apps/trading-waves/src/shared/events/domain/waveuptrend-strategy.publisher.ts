import { WaveUptrendEvent } from "../../../wave-analyzer/domain/events/wave-uptrend.event";
import { IQueueService } from "../queue-service.interface";
import { ITrendPublisherStrategy } from "./trend-strategy.interface";


export class WaveUptrendEventStrategy implements ITrendPublisherStrategy {
    constructor(private readonly queue: IQueueService) {}

    async publishEvent(event: WaveUptrendEvent): Promise<void> {
        await this.queue.add(event);
    }
}