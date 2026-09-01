import { Settings, BarChart2, Activity } from 'lucide-react';

interface ChartToolbarProps {
    timeframe: string;
    setTimeframe: (t: string) => void;
}

export default function ChartToolbar({ timeframe, setTimeframe }: ChartToolbarProps) {
    const timeframes = ['5s', '15s', '30s', '1m', '5m'];

    return (
        <div className="flex items-center justify-between p-4 bg-[#1B140C] border-b border-[#3A2818]">
            <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                    <Activity className="text-[#FF5A1F] w-6 h-6" />
                    <span className="font-bold text-xl text-[#F3E6D6]">Bit90 Trader</span>
                    <span className="bg-[#FF5A1F]/20 text-[#FF5A1F] text-xs px-2 py-0.5 rounded uppercase font-semibold">Demo</span>
                </div>
                
                <div className="h-6 w-px bg-[#3A2818] hidden sm:block"></div>
                
                <div className="items-center space-x-2 hidden sm:flex">
                    <span className="text-[#F3E6D6] font-medium">DEMO / USD</span>
                </div>

                <div className="h-6 w-px bg-[#3A2818] hidden sm:block"></div>

                <div className="flex space-x-1 bg-[#120D08] p-1 rounded-md overflow-x-auto">
                    {timeframes.map(tf => (
                        <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${timeframe === tf ? 'bg-[#3A2818] text-[#F3E6D6]' : 'text-[#9C8A73] hover:text-[#F3E6D6]'}`}
                        >
                            {tf}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <button className="text-[#9C8A73] hover:text-[#F3E6D6]">
                    <BarChart2 className="w-5 h-5" />
                </button>
                <button className="text-[#9C8A73] hover:text-[#F3E6D6]">
                    <Settings className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
