import { Play, Pause, RotateCcw } from 'lucide-react';
import { Volatility } from './SimulationEngine';

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
    onReset
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

            <div className="space-y-6 flex-1">
                <div>
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
