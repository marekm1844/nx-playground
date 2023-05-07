
import { Inject, NotImplementedException } from "@nestjs/common";
import { TypeOrmWave } from "../../infrastructure/typeorm/entities/typeorm-wave.entity";
import { IWave } from "../models/wave-entity.interface";
import { WaveType } from "../models/wave-type.enum";
import { ICandle } from "../models/candle-entity.interface";
import { TypeOrmCandle } from "../../infrastructure/typeorm/entities/candle.entity";

export type WaveImplementation = 'typeorm' | 'firestore';

export class IWaveFactory {
    constructor(@Inject('WAVE_IMPLEMENTATION_TYPE') private readonly implementation: WaveImplementation) {}

    //based on the implementation, return the correct wave
    //for example, if the implementation is 'firestore', return a FirestoreWave
    //if the implementation is 'typeorm', return a TypeOrmWave
    createWave(type: WaveType, candle?: ICandle): IWave {
      switch (this.implementation) {
        case 'typeorm':
            {
            const wave = new TypeOrmWave();
            wave.initialize(type, candle);
            return wave;
            }
        case 'firestore':
          throw new NotImplementedException()
        default:
          throw new Error('Invalid wave implementation specified');
      }
    }
  }