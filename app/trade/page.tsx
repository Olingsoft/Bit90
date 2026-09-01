'use client'

import { useState, useEffect, useRef, useMemo } from "react";
import ChartToolbar from "@/components/trade/ChartToolbar";
import SimulationPanel from "@/components/trade/SimulationPanel";
import TradingChart from "@/components/trade/TradingChart";
import MarketStats from "@/components/trade/MarketStats";
import { SimulationEngine, Candle, Volatility } from "@/components/trade/SimulationEngine";
import { Menu, X, TrendingUp, TrendingDown } from 'lucide-react';

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

export default function Trade() {
    const [timeframe, setTimeframe] = useState("1m");
    const [isSimulating, setIsSimulating] = useState(true);
    const [volatility, setVolatility] = useState<Volatility>('Medium');
    const [balance, setBalance] = useState(10000.00);
    const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
    const [tradeAmount, setTradeAmount] = useState(100);
    const [tradeDuration, setTradeDuration] = useState(10);
    const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);

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
        return 200; // Always fast
    }, []);

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
    }, [isSimulating, intervalMs, tickMs]);

    const handleReset = () => {
        setBalance(10000.00);
        setActiveTrades([]);
        generateInitialData();
    };

    const placeTrade = (direction: TradeDirection) => {
        if (!currentCandle || tradeAmount > balance) return;

        const newTrade: ActiveTrade = {
            id: Date.now().toString(),
            entryPrice: currentCandle.close,
            amount: tradeAmount,
            direction,
            startTime: Date.now(),
            duration: tradeDuration * 1000,
            result: 'pending'
        };

        setBalance(prev => prev - tradeAmount);
        setActiveTrades(prev => [...prev, newTrade]);
    };

    // Check trade results
    useEffect(() => {
        if (activeTrades.length === 0 || !currentCandle) return;

        const now = Date.now();
        const updatedTrades = activeTrades.map(trade => {
            if (trade.result !== 'pending') return trade;

            const elapsed = now - trade.startTime;
            if (elapsed >= trade.duration) {
                const currentPrice = currentCandle.close;
                const isWin = trade.direction === 'call' 
                    ? currentPrice > trade.entryPrice 
                    : currentPrice < trade.entryPrice;
                
                return {
                    ...trade,
                    result: (isWin ? 'win' : 'lose') as 'win' | 'lose'
                };
            }
            return trade;
        });

        // Update balance for completed trades
        const completedTrades = updatedTrades.filter(t => t.result !== 'pending' && activeTrades.find(at => at.id === t.id)?.result === 'pending');
        if (completedTrades.length > 0) {
            const balanceChange = completedTrades.reduce((acc, trade) => {
                if (trade.result === 'win') {
                    return acc + (trade.amount * 0.9); // 90% payout
                }
                return acc; // Already deducted when placed
            }, 0);
            
            if (balanceChange > 0) {
                setBalance(prev => prev + balanceChange);
            }
        }

        // Remove completed trades after showing result
        const tradesToKeep = updatedTrades.filter(t => t.result === 'pending' || (now - t.startTime - t.duration) < 2000);
        setActiveTrades(tradesToKeep);
    }, [currentCandle, activeTrades]);

    return (
        <div className="h-screen w-full bg-[#0B0E14] text-[#ECEEF3] flex flex-col overflow-hidden font-sans">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-3 bg-[#11141B] border-b border-[#2A2E39]">
                <div className="font-bold text-lg text-white">TradeSim</div>
                <div className="flex items-center space-x-3">
                    <div className="text-right">
                        <p className="text-[10px] text-gray-400">Balance</p>
                        <p className="text-sm font-bold text-white">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <button onClick={() => setIsMobilePanelOpen(!isMobilePanelOpen)}>
                        {isMobilePanelOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <div className="hidden lg:block">
                <ChartToolbar timeframe={timeframe} setTimeframe={setTimeframe} />
            </div>

            <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
                    <div className="lg:hidden">
                        <ChartToolbar timeframe={timeframe} setTimeframe={setTimeframe} />
                    </div>
                    
                    <div className="flex-1 relative bg-[#0B0E14]">
                        {historicalData.length > 0 && (
                            <TradingChart 
                                key={timeframe} 
                                data={historicalData} 
                                currentTick={currentCandle}
                                activeTrades={activeTrades}
                            />
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
                        tradeAmount={tradeAmount}
                        setTradeAmount={setTradeAmount}
                        tradeDuration={tradeDuration}
                        setTradeDuration={setTradeDuration}
                        onPlaceTrade={placeTrade}
                        activeTrades={activeTrades}
                    />
                </div>

                {/* Mobile Bottom Bar */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#11141B] border-t border-[#2A2E39] z-40">
                    {/* Trade Controls */}
                    <div className="p-3 space-y-2">
                        <div className="flex space-x-2">
                            <div className="flex-1">
                                <label className="text-gray-400 text-[10px] mb-1 block">Amount</label>
                                <input
                                    type="number"
                                    value={tradeAmount}
                                    onChange={(e) => setTradeAmount(Math.max(1, Number(e.target.value)))}
                                    className="w-full px-2 py-1.5 bg-[#1a1e28] border border-[#2A2E39] rounded text-white text-xs focus:outline-none focus:border-blue-500"
                                    min="1"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-gray-400 text-[10px] mb-1 block">Time (s)</label>
                                <input
                                    type="number"
                                    value={tradeDuration}
                                    onChange={(e) => setTradeDuration(Math.max(1, Number(e.target.value)))}
                                    className="w-full px-2 py-1.5 bg-[#1a1e28] border border-[#2A2E39] rounded text-white text-xs focus:outline-none focus:border-blue-500"
                                    min="1"
                                />
                            </div>
                        </div>
                        
                        {/* Active Trades Mini */}
                        {activeTrades.length > 0 && (
                            <div className="flex space-x-2 overflow-x-auto pb-1">
                                {activeTrades.slice(0, 3).map((trade) => {
                                    const elapsed = Date.now() - trade.startTime;
                                    const remaining = Math.max(0, trade.duration - elapsed);
                                    return (
                                        <div
                                            key={trade.id}
                                            className={`flex-shrink-0 px-2 py-1 rounded text-[10px] border ${
                                                trade.result === 'win'
                                                    ? 'bg-green-900/30 border-green-500'
                                                    : trade.result === 'lose'
                                                    ? 'bg-red-900/30 border-red-500'
                                                    : 'bg-[#1a1e28] border-[#2A2E39]'
                                            }`}
                                        >
                                            <span className={`font-semibold ${
                                                trade.direction === 'call' ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                                {trade.direction === 'call' ? 'BUY' : 'SELL'} ${trade.amount}
                                            </span>
                                            <span className="text-gray-400 ml-1">
                                                {Math.ceil(remaining / 1000)}s
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    
                    {/* Buy/Sell Buttons */}
                    <div className="flex border-t border-[#2A2E39]">
                        <button
                            onClick={() => placeTrade('call')}
                            disabled={tradeAmount > balance}
                            className={`flex-1 py-3 font-bold text-sm transition-all flex items-center justify-center space-x-1 ${
                                tradeAmount > balance
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                        >
                            <TrendingUp className="w-4 h-4" />
                            <span>BUY ↑</span>
                            <span className="text-[10px] opacity-80">+{tradeAmount * 0.9}</span>
                        </button>
                        <button
                            onClick={() => placeTrade('put')}
                            disabled={tradeAmount > balance}
                            className={`flex-1 py-3 font-bold text-sm transition-all flex items-center justify-center space-x-1 ${
                                tradeAmount > balance
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                        >
                            <TrendingDown className="w-4 h-4" />
                            <span>SELL ↓</span>
                            <span className="text-[10px] opacity-80">+{tradeAmount * 0.9}</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Drawer for extended controls */}
                {isMobilePanelOpen && (
                    <div className="absolute inset-0 z-50 bg-black/50 lg:hidden flex justify-end">
                        <div className="w-80 h-full bg-[#11141B] shadow-xl animate-in slide-in-from-right">
                            <div className="p-4 border-b border-[#2A2E39] flex justify-between items-center">
                                <span className="font-bold">Trade Settings</span>
                                <button onClick={() => setIsMobilePanelOpen(false)}>
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="h-[calc(100%-65px)] overflow-y-auto">
                                <div className="p-4 space-y-4">
                                    <div>
                                        <label className="text-gray-400 text-xs font-medium mb-2 block">Quick Amounts</label>
                                        <div className="grid grid-cols-5 gap-1">
                                            {[10, 50, 100, 500, 1000].map((amount) => (
                                                <button
                                                    key={amount}
                                                    onClick={() => setTradeAmount(amount)}
                                                    className={`py-2 rounded text-xs font-medium transition-colors ${tradeAmount === amount ? 'bg-blue-600 text-white' : 'bg-[#1a1e28] text-gray-400 hover:text-white'}`}
                                                >
                                                    {amount}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-gray-400 text-xs font-medium mb-2 block">Quick Times</label>
                                        <div className="grid grid-cols-5 gap-1">
                                            {[5, 10, 30, 60, 120].map((duration) => (
                                                <button
                                                    key={duration}
                                                    onClick={() => setTradeDuration(duration)}
                                                    className={`py-2 rounded text-xs font-medium transition-colors ${tradeDuration === duration ? 'bg-blue-600 text-white' : 'bg-[#1a1e28] text-gray-400 hover:text-white'}`}
                                                >
                                                    {duration}s
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-gray-400 text-xs font-medium mb-2 block">All Active Trades</label>
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
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
                                                                trade.direction === 'call' ? 'text-green-400' : 'text-red-400'
                                                            }`}>
                                                                {trade.direction === 'call' ? 'BUY' : 'SELL'} ${trade.amount}
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
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}