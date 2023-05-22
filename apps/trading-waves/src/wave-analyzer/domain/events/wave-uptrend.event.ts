import { IDomainEvent } from "../../../shared/events/domain-event.interface";
import { WaveUptrendEventDTO } from "../../dto/wave-uptrend-event.dto"

export class WaveUptrendEvent implements IDomainEvent<WaveUptrendEventDTO> {
    constructor(
        public readonly data: WaveUptrendEventDTO,
        public readonly occurredOn: Date = new Date()
    ) {}
}