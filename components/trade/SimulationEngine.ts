export interface Candle {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

export type Volatility = 'Low' | 'Medium' | 'High';

const VOLATILITY_MULTIPLIER = {
    Low: 0.001,
    Medium: 0.003,
    High: 0.006,
};

export class SimulationEngine {
    private currentTrend: number = 1;
    private trendDuration: number = 0;
    private lastClose: number = 100.00;
    
    constructor(initialPrice: number = 100.00) {
        this.lastClose = initialPrice;
    }

    public generateHistoricalData(count: number, intervalMs: number, endTimeMs: number, volatility: Volatility = 'Medium'): Candle[] {
        const candles: Candle[] = [];
        let time = endTimeMs - (count * intervalMs);
        
        for (let i = 0; i < count; i++) {
            const candle = this.generateNextCandle(time, volatility);
            candles.push(candle);
            time += intervalMs;
        }
        
        return candles;
    }

    public generateNextCandle(timestampMs: number, volatilityLevel: Volatility = 'Medium'): Candle {
        // Adjust trend occasionally
        if (this.trendDuration <= 0) {
            // New trend direction: -1 (bearish), 1 (bullish), 0 (sideways)
            const rand = Math.random();
            if (rand < 0.33) this.currentTrend = -1;
            else if (rand < 0.66) this.currentTrend = 1;
            else this.currentTrend = 0;
            
            // Trend lasts for 5 to 20 candles
            this.trendDuration = Math.floor(Math.random() * 15) + 5;
        }
        
        this.trendDuration--;

        const baseVolatility = VOLATILITY_MULTIPLIER[volatilityLevel];
        
        // Direction is biased by the current trend
        let direction = (Math.random() - 0.5) * 2; // -1 to 1
        direction += this.currentTrend * 0.5; // Bias
        
        const open = this.lastClose;
        
        // Occasional large movement (volatility spike)
        const isSpike = Math.random() > 0.95;
        const spikeMultiplier = isSpike ? (2 + Math.random() * 3) : 1;
        
        const movement = open * baseVolatility * (0.2 + Math.random()) * direction * spikeMultiplier;
        const close = open + movement;
        
        const high = Math.max(open, close) + Math.abs(movement) * Math.random() * 0.5;
        const low = Math.min(open, close) - Math.abs(movement) * Math.random() * 0.5;

        this.lastClose = close;

        // return time in seconds for lightweight-charts
        return {
            time: Math.floor(timestampMs / 1000),
            open,
            high,
            low,
            close
        };
    }
    
    // Live candle generation for active forming candle
    public generateLiveTick(currentCandle: Candle, volatilityLevel: Volatility = 'Medium'): Candle {
        const baseVolatility = VOLATILITY_MULTIPLIER[volatilityLevel];
        
        let direction = (Math.random() - 0.5) * 2;
        direction += this.currentTrend * 0.2; // slight bias during live ticks
        
        const movement = currentCandle.open * (baseVolatility / 10) * direction; // smaller movements for ticks
        let newClose = currentCandle.close + movement;
        
        return {
            ...currentCandle,
            close: newClose,
            high: Math.max(currentCandle.high, newClose),
            low: Math.min(currentCandle.low, newClose)
        };
    }
}
