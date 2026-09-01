import { TrendingUp, TrendingDown } from 'lucide-react';
import { TradeDirection, ActiveTrade } from './types';

interface SimulationPanelProps {
    balance: number;
    currentPrice: number;
    tradeAmount: number;
    setTradeAmount: (val: number) => void;
    tradeDuration: number;
    setTradeDuration: (val: number) => void;
    onPlaceTrade: (direction: TradeDirection) => void;
    activeTrades: ActiveTrade[];
}

export default function SimulationPanel({
    balance,
    currentPrice,
    tradeAmount,
    setTradeAmount,
    tradeDuration,
    setTradeDuration,
    onPlaceTrade,
    activeTrades
}: SimulationPanelProps) {
    return (
        <div className="w-full lg:w-80 bg-[#11141B] border-l border-[#2A2E39] p-4 flex flex-col h-full overflow-y-auto">
            <div className="mb-4 bg-[#1a1e28] rounded-lg p-3 border border-[#2A2E39]">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-gray-400 text-xs mb-1">Balance</p>
                        <p className="text-xl font-bold text-white">
                            ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-400 text-xs mb-1">Price</p>
                        <p className="text-lg font-bold text-blue-400">
                            ${currentPrice.toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-4 flex-1">
                {/* Trade Amount */}
                <div>
                    <label className="text-gray-400 text-xs font-medium mb-2 block">Amount ($)</label>
                    <div className="flex space-x-1">
                        {[10, 50, 100, 500, 1000].map((amount) => (
                            <button
                                key={amount}
                                onClick={() => setTradeAmount(amount)}
                                className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${tradeAmount === amount ? 'bg-blue-600 text-white' : 'bg-[#1a1e28] text-gray-400 hover:text-white'}`}
                            >
                                {amount}
                            </button>
                        ))}
                    </div>
                    <input
                        type="number"
                        value={tradeAmount}
                        onChange={(e) => setTradeAmount(Math.max(1, Number(e.target.value)))}
                        className="w-full mt-2 px-2 py-1.5 bg-[#1a1e28] border border-[#2A2E39] rounded text-white text-xs focus:outline-none focus:border-blue-500"
                        min="1"
                    />
                </div>

                {/* Trade Duration */}
                <div>
                    <label className="text-gray-400 text-xs font-medium mb-2 block">Time (seconds)</label>
                    <div className="flex space-x-1">
                        {[5, 10, 30, 60, 120].map((duration) => (
                            <button
                                key={duration}
                                onClick={() => setTradeDuration(duration)}
                                className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${tradeDuration === duration ? 'bg-blue-600 text-white' : 'bg-[#1a1e28] text-gray-400 hover:text-white'}`}
                            >
                                {duration}s
                            </button>
                        ))}
                    </div>
                    <input
                        type="number"
                        value={tradeDuration}
                        onChange={(e) => setTradeDuration(Math.max(1, Number(e.target.value)))}
                        className="w-full mt-2 px-2 py-1.5 bg-[#1a1e28] border border-[#2A2E39] rounded text-white text-xs focus:outline-none focus:border-blue-500"
                        min="1"
                    />
                </div>

                {/* Buy/Sell Buttons */}
                <div className="space-y-2">
                    <button
                        onClick={() => onPlaceTrade('buy')}
                        disabled={tradeAmount > balance}
                        className={`w-full py-3 rounded-lg font-bold text-base transition-all flex items-center justify-center space-x-2 ${
                            tradeAmount > balance
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                    >
                        <TrendingUp className="w-4 h-4" />
                        <span>BUY ↑</span>
                        <span className="text-xs opacity-80">+{tradeAmount * 0.9}</span>
                    </button>
                    <button
                        onClick={() => onPlaceTrade('sell')}
                        disabled={tradeAmount > balance}
                        className={`w-full py-3 rounded-lg font-bold text-base transition-all flex items-center justify-center space-x-2 ${
                            tradeAmount > balance
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                    >
                        <TrendingDown className="w-4 h-4" />
                        <span>SELL ↓</span>
                        <span className="text-xs opacity-80">+{tradeAmount * 0.9}</span>
                    </button>
                </div>

                {/* Active Trades */}
                {activeTrades.length > 0 && (
                    <div className="mt-3">
                        <label className="text-gray-400 text-xs font-medium mb-2 block">Active Trades</label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {activeTrades.map((trade) => {
                                const elapsed = Date.now() - trade.startTime;
                                const remaining = Math.max(0, trade.duration - elapsed);
                                const progress = Math.min(100, (elapsed / trade.duration) * 100);
                                
                                return (
                                    <div
                                        key={trade.id}
                                        className={`p-2 rounded border ${
                                            trade.result === 'win'
                                                ? 'bg-green-900/30 border-green-500'
                                                : trade.result === 'lose'
                                                ? 'bg-red-900/30 border-red-500'
                                                : 'bg-[#1a1e28] border-[#2A2E39]'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`text-xs font-semibold ${
                                                trade.direction === 'buy' ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                                {trade.direction === 'buy' ? 'BUY' : 'SELL'} ${trade.amount}
                                            </span>
                                            {trade.result ? (
                                                <span className={`text-xs font-bold ${
                                                    trade.result === 'win' ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                    {trade.result.toUpperCase()}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">
                                                    {Math.ceil(remaining / 1000)}s
                                                </span>
                                            )}
                                        </div>
                                        <div className="w-full bg-[#2A2E39] rounded-full h-1.5">
                                            <div
                                                className={`h-1.5 rounded-full transition-all ${
                                                    trade.result === 'win'
                                                        ? 'bg-green-500'
                                                        : trade.result === 'lose'
                                                        ? 'bg-red-500'
                                                        : 'bg-blue-500'
                                                }`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="text-[10px] text-gray-500 mt-1">
                                            Entry: ${trade.entryPrice.toFixed(2)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
