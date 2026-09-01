import { Candle } from './SimulationEngine';

interface MarketStatsProps {
    currentCandle?: Candle;
    volatilityPct: string;
}

export default function MarketStats({ currentCandle, volatilityPct }: MarketStatsProps) {
    if (!currentCandle) return null;

    const priceChange = currentCandle.close - currentCandle.open;
    const isPositive = priceChange >= 0;
    const changePct = (priceChange / currentCandle.open) * 100;

    const formatPrice = (p: number) => p.toFixed(2);

    return (
        <div className="flex flex-wrap items-center space-x-6 p-3 bg-[#1B140C] border-t border-[#3A2818] text-sm overflow-x-auto">
            <div className="flex flex-col">
                <span className="text-[#6E5C46] text-xs">O</span>
                <span className={isPositive ? 'text-[#FF5A1F]' : 'text-[#E5484D]'}>{formatPrice(currentCandle.open)}</span>
            </div>
            <div className="flex flex-col">
                <span className="text-[#6E5C46] text-xs">H</span>
                <span className={isPositive ? 'text-[#FF5A1F]' : 'text-[#E5484D]'}>{formatPrice(currentCandle.high)}</span>
            </div>
            <div className="flex flex-col">
                <span className="text-[#6E5C46] text-xs">L</span>
                <span className={isPositive ? 'text-[#FF5A1F]' : 'text-[#E5484D]'}>{formatPrice(currentCandle.low)}</span>
            </div>
            <div className="flex flex-col">
                <span className="text-[#6E5C46] text-xs">C</span>
                <span className={isPositive ? 'text-[#FF5A1F]' : 'text-[#E5484D]'}>{formatPrice(currentCandle.close)}</span>
            </div>

            <div className="h-8 w-px bg-[#3A2818]"></div>

            <div className="flex flex-col">
                <span className="text-[#6E5C46] text-xs">Change</span>
                <span className={isPositive ? 'text-[#FF5A1F]' : 'text-[#E5484D]'}>
                    {isPositive ? '+' : ''}{formatPrice(priceChange)} ({changePct.toFixed(2)}%)
                </span>
            </div>

            <div className="h-8 w-px bg-[#3A2818]"></div>

            <div className="flex flex-col">
                <span className="text-[#6E5C46] text-xs">Vol Index</span>
                <span className="text-[#9C8A73]">{volatilityPct}</span>
            </div>
        </div>
    );
}
