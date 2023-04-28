import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wave } from '../../domain/models/wave.entity';
import { IWaveRepository } from '../../domain/repositories/wave-repository.interface';

@Injectable()
export class WaveRepository implements IWaveRepository {
  constructor(
    @InjectRepository(Wave)
    private readonly waveRepository: Repository<Wave>,
  ) {}

  async save(wave: Wave): Promise<Wave> {
    const waveEntity = this.waveRepository.create(wave);
    return  await this.waveRepository.save(waveEntity);
  }

  async getWaves(): Promise<Wave[]> {
    return await this.waveRepository.find();

  }
}
