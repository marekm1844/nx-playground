import { WaveType } from "./wave-type.enum";
import { IWaveType } from "./wave-type.interface";

export class UptrendWaveType implements IWaveType {
    readonly type = WaveType.Uptrend;
  }