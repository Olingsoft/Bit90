'use client'

import { useState, useEffect, useRef, useMemo } from "react";
import ChartToolbar from "@/components/trade/ChartToolbar";
import SimulationPanel from "@/components/trade/SimulationPanel";
import TradingChart from "@/components/trade/TradingChart";
import MarketStats from "@/components/trade/MarketStats";
import { SimulationEngine, Candle, Volatility } from "@/components/trade/SimulationEngine";
import { Menu, X } from "lucide-react";

export default function Trade() {
    const [timeframe, setTimeframe] = useState("1m");
    const [isSimulating, setIsSimulating] = useState(true);
    const [volatility, setVolatility] = useState<Volatility>('Medium');
    const [speed, setSpeed] = useState<'Slow' | 'Normal' | 'Fast'>('Normal');
    const [balance, setBalance] = useState(10000.00);
    const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

    const [historicalData, setHistoricalData] = useState<Candle[]>([]);
    const [currentCandle, setCurrentCandle] = useState<Candle | undefined>(undefined);

    const engineRef = useRef<SimulationEngine>(new SimulationEngine(100.00));
    const currentCandleRef = useRef<Candle | undefined>(undefined);
    
    // Sync ref
    useEffect(() => {
        currentCandleRef.current = currentCandle;
    }, [currentCandle]);
    
    // Derived values
    const intervalMs = useMemo(() => {
        switch (timeframe) {
            case '5s': return 5000;
            case '15s': return 15000;
            case '30s': return 30000;
            case '1m': return 60000;
            case '5m': return 300000;
            default: return 60000;
        }
    }, [timeframe]);

    const tickMs = useMemo(() => {
        switch (speed) {
            case 'Slow': return 1000;
            case 'Normal': return 500;
            case 'Fast': return 200;
            default: return 500;
        }
    }, [speed]);

    const generateInitialData = () => {
        engineRef.current = new SimulationEngine(100.00);
        const now = Date.now();
        const data = engineRef.current.generateHistoricalData(100, intervalMs, now, volatility);
        setHistoricalData(data);
        setCurrentCandle(data[data.length - 1]);
    };

    useEffect(() => {
        generateInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeframe]); // Regenerate if timeframe changes

    useEffect(() => {
        if (!isSimulating) return;

        const tickInterval = setInterval(() => {
            const candle = currentCandleRef.current;
            if (!candle) return;

            const now = Date.now();
            let lastCandleTime = candle.time * 1000;
            
            // Check if we need to close the candle
            if (now - lastCandleTime >= intervalMs) {
                // New candle
                const nextCandle = engineRef.current.generateNextCandle(now, volatility);
                setCurrentCandle(nextCandle);
            } else {
                // Live tick within current candle
                const updatedCandle = engineRef.current.generateLiveTick(candle, volatility);
                setCurrentCandle(updatedCandle);
            }
        }, tickMs);

        return () => clearInterval(tickInterval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSimulating, intervalMs, tickMs, volatility]);

    const handleReset = () => {
        setBalance(10000.00);
        generateInitialData();
    };

    return (
        <div className="h-screen w-full bg-[#0B0E14] text-[#ECEEF3] flex flex-col overflow-hidden font-sans">
            {/* Mobile Header Toggle */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-[#11141B] border-b border-[#2A2E39]">
                <div className="font-bold text-xl text-white">TradeSim</div>
                <button onClick={() => setIsMobilePanelOpen(!isMobilePanelOpen)}>
                    {isMobilePanelOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            <div className="hidden lg:block">
                <ChartToolbar timeframe={timeframe} setTimeframe={setTimeframe} />
            </div>

            <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="lg:hidden">
                        <ChartToolbar timeframe={timeframe} setTimeframe={setTimeframe} />
                    </div>
                    
                    <div className="flex-1 relative bg-[#0B0E14]">
                        {historicalData.length > 0 && (
                            <TradingChart key={timeframe} data={historicalData} currentTick={currentCandle} />
                        )}
                    </div>
                    
                    <MarketStats 
                        currentCandle={currentCandle} 
                        volatilityPct={volatility === 'Low' ? '0.1%' : volatility === 'Medium' ? '0.3%' : '0.6%'} 
                    />
                </div>

                {/* Desktop Panel */}
                <div className="hidden lg:block w-80 shrink-0">
                    <SimulationPanel
                        balance={balance}
                        currentPrice={currentCandle?.close || 100.00}
                        isSimulating={isSimulating}
                        setIsSimulating={setIsSimulating}
                        volatility={volatility}
                        setVolatility={setVolatility}
                        speed={speed}
                        setSpeed={setSpeed}
                        onReset={handleReset}
                    />
                </div>

                {/* Mobile Drawer */}
                {isMobilePanelOpen && (
                    <div className="absolute inset-0 z-50 bg-black/50 lg:hidden flex justify-end">
                        <div className="w-80 h-full bg-[#11141B] shadow-xl animate-in slide-in-from-right">
                            <div className="p-4 border-b border-[#2A2E39] flex justify-between items-center">
                                <span className="font-bold">Controls</span>
                                <button onClick={() => setIsMobilePanelOpen(false)}>
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="h-[calc(100%-65px)]">
                                <SimulationPanel
                                    balance={balance}
                                    currentPrice={currentCandle?.close || 100.00}
                                    isSimulating={isSimulating}
                                    setIsSimulating={setIsSimulating}
                                    volatility={volatility}
                                    setVolatility={setVolatility}
                                    speed={speed}
                                    setSpeed={setSpeed}
                                    onReset={handleReset}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}