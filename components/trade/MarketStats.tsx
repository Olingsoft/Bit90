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
        <div className="flex flex-wrap items-center space-x-6 p-3 bg-[#11141B] border-t border-[#2A2E39] text-sm overflow-x-auto">
            <div className="flex flex-col">
                <span className="text-gray-500 text-xs">O</span>
                <span className={isPositive ? 'text-green-500' : 'text-red-500'}>{formatPrice(currentCandle.open)}</span>
            </div>
            <div className="flex flex-col">
                <span className="text-gray-500 text-xs">H</span>
                <span className={isPositive ? 'text-green-500' : 'text-red-500'}>{formatPrice(currentCandle.high)}</span>
            </div>
            <div className="flex flex-col">
                <span className="text-gray-500 text-xs">L</span>
                <span className={isPositive ? 'text-green-500' : 'text-red-500'}>{formatPrice(currentCandle.low)}</span>
            </div>
            <div className="flex flex-col">
                <span className="text-gray-500 text-xs">C</span>
                <span className={isPositive ? 'text-green-500' : 'text-red-500'}>{formatPrice(currentCandle.close)}</span>
            </div>

            <div className="h-8 w-px bg-[#2A2E39]"></div>

            <div className="flex flex-col">
                <span className="text-gray-500 text-xs">Change</span>
                <span className={isPositive ? 'text-green-500' : 'text-red-500'}>
                    {isPositive ? '+' : ''}{formatPrice(priceChange)} ({changePct.toFixed(2)}%)
                </span>
            </div>

            <div className="h-8 w-px bg-[#2A2E39]"></div>

            <div className="flex flex-col">
                <span className="text-gray-500 text-xs">Vol Index</span>
                <span className="text-gray-300">{volatilityPct}</span>
            </div>
        </div>
    );
}
