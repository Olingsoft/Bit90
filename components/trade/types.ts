export type TradeDirection = 'buy' | 'sell';

export interface ActiveTrade {
    id: string;
    entryPrice: number;
    amount: number;
    direction: TradeDirection;
    startTime: number;
    duration: number;
    result?: 'win' | 'lose' | 'pending';
}
