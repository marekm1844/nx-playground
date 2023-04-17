import { WaveType } from "./wave-type.enum";
import { IWaveType } from "./wave-type.interface";

export class DowntrendWaveType  implements IWaveType {
    readonly type = WaveType.Downtrend;
  }
