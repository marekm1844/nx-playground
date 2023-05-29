import { IDomainEvent } from "../../../shared/events/domain-event.interface";
import { WaveEventDTO } from "../../dto/wave-event.dto"

export class WaveUptrendEvent implements IDomainEvent<WaveEventDTO> {
    constructor(
        public readonly data: WaveEventDTO,
        public readonly occurredOn: Date = new Date()
    ) {}
}