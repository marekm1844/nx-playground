import { IDomainEvent } from "../../../shared/events/domain-event.interface";
import { WaveEventDTO } from "../../dto/wave-uptrend-event.dto"

export class WaveDowntrendEvent implements IDomainEvent<WaveEventDTO> {
    constructor(
        public readonly data: WaveEventDTO,
        public readonly occurredOn: Date = new Date()
    ) {}
}