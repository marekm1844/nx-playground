import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Candle } from "../../domain/models/candle.entity";
import { ICandleRepository } from "../../domain/repositories/candle-repository.interface";

export class  CandleRepository implements ICandleRepository {
  constructor(@InjectRepository(Candle) private candleRepository: Repository<Candle>) {}

  async save(candle: Candle): Promise<Candle> {
    return await this.candleRepository.save(candle);
  }

  async getCandlesByWaveId(waveId: number): Promise<Candle[]> {
    return await this.candleRepository.find({ where: { id: waveId } });
  }
}