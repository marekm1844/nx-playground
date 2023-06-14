import { WaveType } from '../../shared/models/wave-type.enum';

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
}
