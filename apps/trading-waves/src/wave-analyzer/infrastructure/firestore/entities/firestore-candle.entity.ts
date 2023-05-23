import { v4 as uuidv4 } from 'uuid';
import { CandleColor, ICandle } from "../../../domain/models/candle-entity.interface";
import { Type, instanceToPlain } from "class-transformer";
import * as firabase from 'firebase-admin';



export class FirestoreCandle implements ICandle {
    id: string;

    @Type(() => Date)
    openTime: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;

    @Type(() => Date)
    closeTime: Date;
    quoteAssetVolume: number;
    numberOfTrades: number;
    takerBuyBaseAssetVolume: number;
    takerBuyQuoteAssetVolume: number;
    ignore: number;
    completed: boolean;
    wave: any;
    color: CandleColor;
    maximumCorpse: number;
    minimumCorpse: number;

    constructor(init?: Partial<FirestoreCandle>) {
        Object.assign(this, init);
    }

    initialize(data?: {
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
            this.id = uuidv4();
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

    toFirestoreDocument(): Record<string, unknown> {
        return instanceToPlain(this);
        
      }

    static fromFirestoreDocument(doc: firabase.firestore.DocumentSnapshot<firabase.firestore.DocumentData>): FirestoreCandle {
        const data = doc.data();
      return new FirestoreCandle({
        id: doc.id,
        ...data,
      });
    }

  }