import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Wave } from './wave.entity';

export enum CandleColor {
  Green,
  Red,
}

@Entity()
export class Candle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: true})
  openTime: Date;

  @Column({ type: 'real' })
  open: number;

  @Column({ type: 'real' })
  high: number;

  @Column({ type: 'real' })
  low: number;

  @Column({ type: 'real' })
  close: number;

  @Column({ type: 'real' })
  volume: number;

  @Column()
  closeTime: Date;

  @Column({ type: 'real' })
  quoteAssetVolume: number;

  @Column()
  numberOfTrades: number;

  @Column({ type: 'real' })
  takerBuyBaseAssetVolume: number;

  @Column({ type: 'real' })
  takerBuyQuoteAssetVolume: number;

  @Column()
  ignore: number;

  @Column( {type:'boolean'})
  completed: boolean;

  @ManyToOne(() => Wave, (wave) => wave.candles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wave_id' }) 
  wave: Wave;

  @Column({ type: 'varchar', nullable: false })
  color: CandleColor;

  @Column()
  maximumCorpse: number;

  @Column()
  minimumCorpse: number;

  constructor(data?: {
    openTime: number;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
    closeTime: number;
    quoteAssetVolume: string;
    numberOfTrades: number;
    takerBuyBaseAssetVolume: string;
    takerBuyQuoteAssetVolume: string;
    ignore: number;
    completed: boolean;
  }) {
    if (data) {
      this.openTime = new Date(data.openTime);
      this.open = parseFloat(data.open);
      this.high = parseFloat(data.high);
      this.low = parseFloat(data.low);
      this.close = parseFloat(data.close);
      this.volume = parseFloat(data.volume);
      this.closeTime = new Date(data.closeTime);
      this.quoteAssetVolume = parseFloat(data.quoteAssetVolume);
      this.numberOfTrades = data.numberOfTrades;
      this.takerBuyBaseAssetVolume = parseFloat(data.takerBuyBaseAssetVolume);
      this.takerBuyQuoteAssetVolume = parseFloat(data.takerBuyQuoteAssetVolume);
      this.ignore = data.ignore;
      this.completed = data.completed;
      this.color = this.close > this.open ? CandleColor.Green : CandleColor.Red;
      this.maximumCorpse = this.close > this.open ? this.close : this.open;
      this.minimumCorpse = this.close > this.open ? this.open : this.close;
    }
  }
}
