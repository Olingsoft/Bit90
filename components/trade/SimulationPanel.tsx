import { Play, Pause, RotateCcw, TrendingUp, TrendingDown } from 'lucide-react';
import { Volatility } from './SimulationEngine';

type TradeDirection = 'call' | 'put';

interface ActiveTrade {
    id: string;
    entryPrice: number;
    amount: number;
    direction: TradeDirection;
    startTime: number;
    duration: number;
    result?: 'win' | 'lose' | 'pending';
}

interface SimulationPanelProps {
    balance: number;
    currentPrice: number;
    isSimulating: boolean;
    setIsSimulating: (val: boolean) => void;
    volatility: Volatility;
    setVolatility: (val: Volatility) => void;
    speed: 'Slow' | 'Normal' | 'Fast';
    setSpeed: (val: 'Slow' | 'Normal' | 'Fast') => void;
    onReset: () => void;
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
    isSimulating,
    setIsSimulating,
    volatility,
    setVolatility,
    speed,
    setSpeed,
    onReset,
    tradeAmount,
    setTradeAmount,
    tradeDuration,
    setTradeDuration,
    onPlaceTrade,
    activeTrades
}: SimulationPanelProps) {
    return (
        <div className="w-full lg:w-80 bg-[#11141B] border-l border-[#2A2E39] p-6 flex flex-col h-full overflow-y-auto">
            <div className="flex items-center space-x-2 mb-8">
                <div className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="font-semibold text-sm tracking-wider text-gray-300 uppercase">
                    {isSimulating ? 'Live Simulation' : 'Simulation Paused'}
                </span>
            </div>

            <div className="mb-8 bg-[#1a1e28] rounded-xl p-5 border border-[#2A2E39]">
                <p className="text-gray-400 text-sm mb-1">Virtual Balance</p>
                <p className="text-3xl font-bold text-white mb-4">
                    ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>

                <p className="text-gray-400 text-sm mb-1">Current Price</p>
                <p className="text-2xl font-bold text-blue-400">
                    ${currentPrice.toFixed(2)}
                </p>
            </div>

            <div className="space-y-5 flex-1">
                {/* Trade Amount */}
                <div>
                    <label className="text-gray-400 text-sm font-medium mb-3 block">Trade Amount ($)</label>
                    <div className="flex space-x-2">
                        {[10, 50, 100, 500, 1000].map((amount) => (
                            <button
                                key={amount}
                                onClick={() => setTradeAmount(amount)}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tradeAmount === amount ? 'bg-blue-600 text-white' : 'bg-[#1a1e28] text-gray-400 hover:text-white'}`}
                            >
                                {amount}
                            </button>
                        ))}
                    </div>
                    <input
                        type="number"
                        value={tradeAmount}
                        onChange={(e) => setTradeAmount(Math.max(1, Number(e.target.value)))}
                        className="w-full mt-2 px-3 py-2 bg-[#1a1e28] border border-[#2A2E39] rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                        min="1"
                    />
                </div>

                {/* Trade Duration */}
                <div>
                    <label className="text-gray-400 text-sm font-medium mb-3 block">Duration (seconds)</label>
                    <div className="flex space-x-2">
                        {[5, 10, 30, 60, 120].map((duration) => (
                            <button
                                key={duration}
                                onClick={() => setTradeDuration(duration)}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tradeDuration === duration ? 'bg-blue-600 text-white' : 'bg-[#1a1e28] text-gray-400 hover:text-white'}`}
                            >
                                {duration}s
                            </button>
                        ))}
                    </div>
                    <input
                        type="number"
                        value={tradeDuration}
                        onChange={(e) => setTradeDuration(Math.max(1, Number(e.target.value)))}
                        className="w-full mt-2 px-3 py-2 bg-[#1a1e28] border border-[#2A2E39] rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                        min="1"
                    />
                </div>

                {/* Call/Put Buttons */}
                <div className="space-y-2">
                    <button
                        onClick={() => onPlaceTrade('call')}
                        disabled={tradeAmount > balance || !isSimulating}
                        className={`w-full py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center space-x-2 ${
                            tradeAmount > balance || !isSimulating
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                    >
                        <TrendingUp className="w-5 h-5" />
                        <span>CALL ↑</span>
                        <span className="text-sm opacity-80">+{tradeAmount * 0.9}</span>
                    </button>
                    <button
                        onClick={() => onPlaceTrade('put')}
                        disabled={tradeAmount > balance || !isSimulating}
                        className={`w-full py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center space-x-2 ${
                            tradeAmount > balance || !isSimulating
                                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                    >
                        <TrendingDown className="w-5 h-5" />
                        <span>PUT ↓</span>
                        <span className="text-sm opacity-80">+{tradeAmount * 0.9}</span>
                    </button>
                </div>

                {/* Active Trades */}
                {activeTrades.length > 0 && (
                    <div className="mt-4">
                        <label className="text-gray-400 text-sm font-medium mb-3 block">Active Trades</label>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {activeTrades.map((trade) => {
                                const elapsed = Date.now() - trade.startTime;
                                const remaining = Math.max(0, trade.duration - elapsed);
                                const progress = Math.min(100, (elapsed / trade.duration) * 100);
                                
                                return (
                                    <div
                                        key={trade.id}
                                        className={`p-3 rounded-lg border ${
                                            trade.result === 'win'
                                                ? 'bg-green-900/30 border-green-500'
                                                : trade.result === 'lose'
                                                ? 'bg-red-900/30 border-red-500'
                                                : 'bg-[#1a1e28] border-[#2A2E39]'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            <span className={`text-sm font-semibold ${
                                                trade.direction === 'call' ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                                {trade.direction.toUpperCase()} ${trade.amount}
                                            </span>
                                            {trade.result ? (
                                                <span className={`text-sm font-bold ${
                                                    trade.result === 'win' ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                    {trade.result.toUpperCase()}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-gray-400">
                                                    {Math.ceil(remaining / 1000)}s
                                                </span>
                                            )}
                                        </div>
                                        <div className="w-full bg-[#2A2E39] rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full transition-all ${
                                                    trade.result === 'win'
                                                        ? 'bg-green-500'
                                                        : trade.result === 'lose'
                                                        ? 'bg-red-500'
                                                        : 'bg-blue-500'
                                                }`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            Entry: ${trade.entryPrice.toFixed(2)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="border-t border-[#2A2E39] pt-4">
                    <label className="text-gray-400 text-sm font-medium mb-3 block">Market Volatility</label>
                    <div className="flex space-x-2">
                        {['Low', 'Medium', 'High'].map((v) => (
                            <button
                                key={v}
                                onClick={() => setVolatility(v as Volatility)}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${volatility === v ? 'bg-blue-600 text-white' : 'bg-[#1a1e28] text-gray-400 hover:text-white'}`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-gray-400 text-sm font-medium mb-3 block">Simulation Speed</label>
                    <div className="flex space-x-2">
                        {['Slow', 'Normal', 'Fast'].map((s) => (
                            <button
                                key={s}
                                onClick={() => setSpeed(s as 'Slow' | 'Normal' | 'Fast')}
                                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${speed === s ? 'bg-blue-600 text-white' : 'bg-[#1a1e28] text-gray-400 hover:text-white'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-8 space-y-3">
                <button 
                    onClick={() => setIsSimulating(!isSimulating)}
                    className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-semibold transition-colors ${isSimulating ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-green-500 text-white hover:bg-green-600'}`}
                >
                    {isSimulating ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    <span>{isSimulating ? 'Pause Simulation' : 'Resume Simulation'}</span>
                </button>
                
                <button 
                    onClick={onReset}
                    className="w-full flex items-center justify-center space-x-2 py-3 bg-[#1a1e28] text-gray-300 rounded-lg hover:bg-[#2A2E39] font-medium transition-colors border border-[#2A2E39]"
                >
                    <RotateCcw className="w-5 h-5" />
                    <span>Reset Data</span>
                </button>
            </div>
            
            <div className="mt-8 pt-4 border-t border-[#2A2E39] text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                    Simulated Market — For Educational & UI Demonstration Purposes Only
                </p>
            </div>
        </div>
    );
}
