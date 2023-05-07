import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmWave } from '../typeorm/entities/typeorm-wave.entity';
import { IWaveRepository } from '../../domain/repositories/wave-repository.interface';

@Injectable()
export class WaveRepository implements IWaveRepository {
  constructor(
    @InjectRepository(TypeOrmWave)
    private readonly waveRepository: Repository<TypeOrmWave>,
  ) {}

  async save(wave: TypeOrmWave): Promise<TypeOrmWave> {
    const waveEntity = this.waveRepository.create(wave);
    return  await this.waveRepository.save(waveEntity);
  }

  async getWaves(): Promise<TypeOrmWave[]> {
    return await this.waveRepository.find();

  }
}
