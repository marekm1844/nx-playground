import { WaveType } from '../../shared/models/wave-type.enum';
import { WaveCompletedEvent } from '../../wave-analyzer/domain/events/wave-completed.event';

export class WaveCompletedEventDTO {
  constructor(
    public readonly startdatetime: Date,
    public readonly price: number,
    public readonly symbol: string,
    public readonly interval: string,
    public readonly shadow: number | null,
    public readonly corpse: number | null,
    public readonly type: WaveType,
  ) {}

  static fromWaveCompletedEvent(waveCompletedEvent: WaveCompletedEvent): WaveCompletedEventDTO {
    return new WaveCompletedEventDTO(
      waveCompletedEvent.data.startdatetime,
      waveCompletedEvent.data.price,
      waveCompletedEvent.data.symbol,
      waveCompletedEvent.data.interval,
      waveCompletedEvent.data.shadow,
      waveCompletedEvent.data.corpse,
      waveCompletedEvent.data.type,
    );
  }
}
