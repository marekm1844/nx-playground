import { WaveType } from '../../shared/models/wave-type.enum';

export class LastWaveCompletedDTO {
  constructor(public readonly startdatetime: Date, public readonly symbol: string, public readonly interval: string, public readonly type: WaveType) {}
}
