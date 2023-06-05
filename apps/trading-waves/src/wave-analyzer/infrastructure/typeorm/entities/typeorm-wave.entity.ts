
import { IWave } from '../../../domain/models/wave-entity.interface';
import { WaveType } from '../../../domain/models/wave-type.enum';
import { PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, Entity } from 'typeorm';
import { TypeOrmCandle } from './candle.entity';

@Entity()
export class TypeOrmWave implements IWave {

  //add string guid as primary key for the wave
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  type: WaveType = WaveType.Unknown;

  @Column()
  startDateTime: Date | null = null;

  @Column()
  endDateTime: Date | null = null;;

  @OneToMany(() => TypeOrmCandle, (candle) => candle.wave, { cascade: true, eager: true })
  candles: TypeOrmCandle[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  interval: string;

  @Column()
  symbol: string;


  initialize(type: WaveType, symbol: string, interval: string, candle?: TypeOrmCandle) {
    this.type = type;
    this.interval = interval;
    this.symbol = symbol;
    if (candle) {
      this.addCandle(candle);
      this.startDateTime = candle.openTime;
      this.endDateTime = candle.openTime;
    }
  }

  //Add candle in the wave if it is completed and not already present in the wave 
  //or if it is present but the candle data has changed 
  //and return true if the candle was added to the wave
  addCandle(newCandle: TypeOrmCandle): boolean {
    if (!this.candles) {
      this.candles = [];
    }

    if (this.isCandlePresent(newCandle)) {
      //Logger.log(`Candle already present: ${JSON.stringify(newCandle)}`);
      this.candles = this.candles.map((candle) =>
        candle.openTime === newCandle.openTime && this.shouldUpdateCandle(candle, newCandle)
          ? newCandle
          : candle
      );
      return false;
    } else {

      // Sort candles by openTime
      this.candles.sort((a, b) => a.openTime.getTime() - b.openTime.getTime());

      // Update startDateTime and endDateTime of the wave
      this.startDateTime = this.candles[0]?.openTime || null;
      this.endDateTime = this.candles[this.candles.length - 1]?.closeTime || null;

      this.candles.push(newCandle);
      return true;
    }

  }

  setType(type: WaveType): void {
    this.type = type;
  }

  getType(): WaveType {
    return this.type;
  }

  getStartDateTime(): Date | null {
    return this.startDateTime;
  }

  getEndDateTime(): Date | null {
    return this.endDateTime;
  }

  getDuration(): number {
    if (this.startDateTime && this.endDateTime) {
      return this.endDateTime.getTime() - this.startDateTime.getTime();
    }
    return 0;
  }

  getNumberOfCandles(): number {
    return this.candles.length;
  }
  
  private isCandlePresent(candle: TypeOrmCandle): boolean {
    return this.candles.some((existingCandle) => existingCandle.openTime.getTime() === candle.openTime.getTime());
  }

  private shouldUpdateCandle(existingCandle: TypeOrmCandle, newCandle: TypeOrmCandle): boolean {
    return (
      existingCandle.open !== newCandle.open ||
      existingCandle.high !== newCandle.high ||
      existingCandle.low !== newCandle.low ||
      existingCandle.close !== newCandle.close
    );
  }


  getCandles(): TypeOrmCandle[] {
    return this.candles;
  }

  getLastCandle(): TypeOrmCandle {
    return this.candles[this.candles.length - 1];
  }

}
