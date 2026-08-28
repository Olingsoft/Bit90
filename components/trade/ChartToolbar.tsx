import { Settings, BarChart2, Activity } from 'lucide-react';

interface ChartToolbarProps {
    timeframe: string;
    setTimeframe: (t: string) => void;
}

export default function ChartToolbar({ timeframe, setTimeframe }: ChartToolbarProps) {
    const timeframes = ['5s', '15s', '30s', '1m', '5m'];

    return (
        <div className="flex items-center justify-between p-4 bg-[#11141B] border-b border-[#2A2E39]">
            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                    <Activity className="text-blue-500 w-6 h-6" />
                    <span className="font-bold text-xl text-white">TradeSim</span>
                    <span className="bg-blue-600/20 text-blue-500 text-xs px-2 py-0.5 rounded uppercase font-semibold">Demo</span>
                </div>
                
                <div className="h-6 w-px bg-[#2A2E39] hidden sm:block"></div>
                
                <div className="items-center space-x-2 hidden sm:flex">
                    <span className="text-white font-medium">DEMO / USD</span>
                </div>

                <div className="h-6 w-px bg-[#2A2E39] hidden sm:block"></div>

                <div className="flex space-x-1 bg-[#0B0E14] p-1 rounded-md overflow-x-auto">
                    {timeframes.map(tf => (
                        <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${timeframe === tf ? 'bg-[#2A2E39] text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            {tf}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <button className="text-gray-400 hover:text-white">
                    <BarChart2 className="w-5 h-5" />
                </button>
                <button className="text-gray-400 hover:text-white">
                    <Settings className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
