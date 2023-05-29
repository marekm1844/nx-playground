export class WaveEventDTO {
    constructor(
        public readonly startdatetime: Date,
        public readonly price: number,
        public readonly symbol: string,
        public readonly interval: string,
        
    ) { }
}