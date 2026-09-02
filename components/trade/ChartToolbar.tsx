import { Settings, BarChart2, Activity } from 'lucide-react';

interface ChartToolbarProps {
    timeframe: string;
    setTimeframe: (t: string) => void;
}

export default function ChartToolbar({ timeframe, setTimeframe }: ChartToolbarProps) {
    const timeframes = ['5s', '15s', '30s', '1m', '5m'];

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between p-3 sm:p-4 bg-[#FFFFFF] border-b border-[#E5E5E5] gap-3 sm:gap-0">
            <div className="flex items-center space-x-3 sm:space-x-6 w-full sm:w-auto">
                <div className="flex items-center space-x-2">
                    <Activity className="text-[#22D67A] w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="font-bold text-lg sm:text-xl text-[#1A1A1A]">Bit90 Trader</span>
                    <span className="bg-[#22D67A]/20 text-[#22D67A] text-xs px-2 py-0.5 rounded uppercase font-semibold">Demo</span>
                </div>
                
                <div className="h-6 w-px bg-[#E5E5E5] hidden sm:block"></div>
                
                <div className="items-center space-x-2 hidden sm:flex">
                    <span className="text-[#1A1A1A] font-medium">DEMO / USD</span>
                </div>

                <div className="h-6 w-px bg-[#E5E5E5] hidden sm:block"></div>

                <div className="flex space-x-1 bg-[#F9F9F9] p-1 rounded-md overflow-x-auto flex-1 sm:flex-none">
                    {timeframes.map(tf => (
                        <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${timeframe === tf ? 'bg-[#E5E5E5] text-[#1A1A1A]' : 'text-[#666666] hover:text-[#1A1A1A]'}`}
                        >
                            {tf}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center space-x-4 w-full sm:w-auto justify-end">
                <button className="text-[#666666] hover:text-[#1A1A1A]">
                    <BarChart2 className="w-5 h-5" />
                </button>
                <button className="text-[#666666] hover:text-[#1A1A1A]">
                    <Settings className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
