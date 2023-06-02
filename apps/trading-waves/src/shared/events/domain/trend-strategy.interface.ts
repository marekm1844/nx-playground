import { IDomainEvent } from "../domain-event.interface";
import { WaveEventDTO } from "../../../wave-analyzer/dto/wave-event.dto";

export interface ITrendPublisherStrategy {
    publishEvent(event: IDomainEvent<WaveEventDTO>): Promise<void>;
}
