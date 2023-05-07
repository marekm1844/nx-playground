import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TypeOrmCandle } from "../typeorm/entities/candle.entity";
import { ICandleRepository } from "../../domain/repositories/candle-repository.interface";

export class  TypeOrmCandleRepository implements ICandleRepository {
  constructor(@InjectRepository(TypeOrmCandle) private candleRepository: Repository<TypeOrmCandle>) {}

  async save(candle: TypeOrmCandle): Promise<TypeOrmCandle> {
    return await this.candleRepository.save(candle);
  }

  async getCandlesByWaveId(waveId: string): Promise<TypeOrmCandle[]> {
    return await this.candleRepository.find({ where: { id: waveId } });
  }
}