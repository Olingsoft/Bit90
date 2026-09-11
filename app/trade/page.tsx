'use client'

import { useState, useEffect, useRef, useMemo } from "react";
import Header from "@/components/Header";
import ChartToolbar from "@/components/trade/ChartToolbar";
import SimulationPanel from "@/components/trade/SimulationPanel";
import TradingChart from "@/components/trade/TradingChart";
import MarketStats from "@/components/trade/MarketStats";
import { Candle } from "@/components/trade/SimulationEngine";
import { Menu, X, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { TradeDirection, ActiveTrade } from "@/components/trade/types";
import { getCandles, getMarketState, Candle as MarketCandle, MarketState } from "@/lib/marketApi";
import { useMarketSocket } from "@/hooks/useMarketSocket";

export default function Trade() {
    const [query, setQuery] = useState("");
    const [symbol, setSymbol] = useState("EURUSD");
    const [timeframe, setTimeframe] = useState("1m");
    const [balance, setBalance] = useState(10000.00);
    const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
    const [tradeAmount, setTradeAmount] = useState(100);
    const [tradeDuration, setTradeDuration] = useState(10);
    const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [historicalData, setHistoricalData] = useState<Candle[]>([]);
    const [currentCandle, setCurrentCandle] = useState<Candle | undefined>(undefined);
    const [currentPrice, setCurrentPrice] = useState<number>(0);
    const [marketState, setMarketState] = useState<MarketState | null>(null);

    const currentCandleRef = useRef<Candle | undefined>(undefined);
    const activeTradesRef = useRef<ActiveTrade[]>([]);
    
    // Sync refs
    useEffect(() => {
        currentCandleRef.current = currentCandle;
    }, [currentCandle]);
    
    useEffect(() => {
        activeTradesRef.current = activeTrades;
    }, [activeTrades]);

    // Load historical candles from API
    useEffect(() => {
        const loadCandles = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await getCandles(symbol, timeframe, 500);
                const candles = response.candles.map((c: MarketCandle) => ({
                    time: c.time,
                    open: c.open,
                    high: c.high,
                    low: c.low,
                    close: c.close,
                    volume: c.volume
                }));
                setHistoricalData(candles);
                if (candles.length > 0) {
                    setCurrentCandle(candles[candles.length - 1]);
                }
            } catch (err) {
                console.error('Failed to load candles:', err);
                setError('Failed to load market data');
            } finally {
                setIsLoading(false);
            }
        };
        loadCandles();
    }, [symbol, timeframe]);

    // Load market state
    useEffect(() => {
        const loadMarketState = async () => {
            try {
                const state = await getMarketState(symbol);
                setMarketState(state);
                setCurrentPrice(state.price);
            } catch (err) {
                console.error('Failed to load market state:', err);
            }
        };
        loadMarketState();
    }, [symbol]);

    // WebSocket for real-time updates
    const { isConnected } = useMarketSocket({
        symbol,
        onTick: (tick) => {
            setCurrentPrice(tick.price);
            // Update current candle if it exists
            if (currentCandleRef.current) {
                const updatedCandle = {
                    ...currentCandleRef.current,
                    close: tick.price,
                    high: Math.max(currentCandleRef.current.high, tick.price),
                    low: Math.min(currentCandleRef.current.low, tick.price),
                    volume: currentCandleRef.current.volume + tick.volume
                };
                setCurrentCandle(updatedCandle);
                currentCandleRef.current = updatedCandle;
            }
        },
        onCandle: (candleData) => {
            console.log('[TradePage] Received candle:', candleData);
            if (candleData.timeframe === timeframe) {
                const newCandle = candleData.candle;
                console.log('[TradePage] New candle for timeframe:', timeframe, newCandle);
                setCurrentCandle(newCandle);
                currentCandleRef.current = newCandle;
                // Add to historical data
                setHistoricalData(prev => {
                    const filtered = prev.filter(c => c.time !== newCandle.time);
                    return [...filtered, newCandle].slice(-500);
                });
            }
        }
    });

    const handleReset = () => {
        setBalance(10000.00);
        setActiveTrades([]);
        // Reload candles
        const loadCandles = async () => {
            setIsLoading(true);
            try {
                const response = await getCandles(symbol, timeframe, 500);
                const candles = response.candles.map((c: MarketCandle) => ({
                    time: c.time,
                    open: c.open,
                    high: c.high,
                    low: c.low,
                    close: c.close,
                    volume: c.volume
                }));
                setHistoricalData(candles);
                if (candles.length > 0) {
                    setCurrentCandle(candles[candles.length - 1]);
                }
            } catch (err) {
                console.error('Failed to reload candles:', err);
            } finally {
                setIsLoading(false);
            }
        };
        loadCandles();
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

    const directionToCall = (direction: TradeDirection): 'call' | 'put' => {
        return direction === 'buy' ? 'call' : 'put';
    };

    const callToDirection = (call: 'call' | 'put'): TradeDirection => {
        return call === 'call' ? 'buy' : 'sell';
    };

    // Check trade results
    useEffect(() => {
        const trades = activeTradesRef.current;
        if (trades.length === 0 || !currentCandle) return;

        const now = Date.now();
        const updatedTrades = trades.map(trade => {
            if (trade.result !== 'pending') return trade;

            const elapsed = now - trade.startTime;
            if (elapsed >= trade.duration) {
                const currentPrice = currentCandle.close;
                const isWin = trade.direction === 'buy' 
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
        const completedTrades = updatedTrades.filter(t => t.result !== 'pending' && trades.find(at => at.id === t.id)?.result === 'pending');
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
    }, [currentCandle]);

    return (
        <div className="min-h-screen w-full bg-[#F8F8F8] text-[#1A1A1A] flex flex-col font-sans">
            <Header query={query} setQuery={setQuery} />

            <div className="hidden lg:block">
                <ChartToolbar timeframe={timeframe} setTimeframe={setTimeframe} />
            </div>

            <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
                    <div className="lg:hidden">
                        <ChartToolbar timeframe={timeframe} setTimeframe={setTimeframe} />
                    </div>
                    
                    {/* Mobile Active Trades Bar */}
                    {activeTrades.length > 0 && (
                        <div className="lg:hidden bg-[#FFFFFF] border-b border-[#E5E5E5] p-2">
                            <div className="grid grid-cols-1 gap-2">
                                {activeTrades.map((trade) => {
                                    const elapsed = Date.now() - trade.startTime;
                                    const remaining = Math.max(0, trade.duration - elapsed);
                                    const progress = Math.min(100, (elapsed / trade.duration) * 100);
                                    return (
                                        <div
                                            key={trade.id}
                                            className={`px-3 py-2 rounded-lg text-xs border ${
                                                trade.result === 'win'
                                                    ? 'bg-[#22D67A]/20 border-[#22D67A]'
                                                    : trade.result === 'lose'
                                                    ? 'bg-[#FF4757]/20 border-[#FF4757]'
                                                    : 'bg-[#FFFFFF] border-[#E5E5E5]'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <span className={`font-semibold ${
                                                    trade.direction === 'buy' ? 'text-[#22D67A]' : 'text-[#FF4757]'
                                                }`}>
                                                    {trade.direction === 'buy' ? 'BUY' : 'SELL'} ${trade.amount}
                                                </span>
                                                <span className="text-[#666666] font-medium">
                                                    {Math.ceil(remaining / 1000)}s
                                                </span>
                                            </div>
                                            <div className="w-full bg-[#E5E5E5] rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${
                                                        trade.result === 'win'
                                                            ? 'bg-[#22D67A]'
                                                            : trade.result === 'lose'
                                                            ? 'bg-[#FF4757]'
                                                            : 'bg-[#E8A33D]'
                                                    }`}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <div className="text-[10px] text-[#999999] mt-1">
                                                Entry: ${trade.entryPrice.toFixed(2)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    
                    <div className="flex-1 relative bg-[#FFFFFF]">
                        {isLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-sm text-[#666666]">Loading market data...</div>
                            </div>
                        ) : error ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                <p className="text-sm text-[#FF4757]">{error}</p>
                                <button
                                    onClick={handleReset}
                                    className="px-4 py-2 bg-[#22D67A] text-[#FFFFFF] rounded-lg text-sm font-medium"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : historicalData.length > 0 ? (
                            <TradingChart 
                                key={timeframe} 
                                data={historicalData} 
                                currentTick={currentCandle}
                                activeTrades={activeTrades}
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-sm text-[#666666]">No data available</p>
                            </div>
                        )}
                    </div>
                    
                    {/* Current Price Display */}
                    <div className="bg-[#FFFFFF] border-t border-[#E5E5E5] px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-[#666666]">{symbol}</span>
                            <span className="text-lg font-bold tabular-nums" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                                {currentPrice.toFixed(5)}
                            </span>
                            {marketState && (
                                <span className={`text-xs font-medium flex items-center gap-1 ${
                                    marketState.trend > 0 ? 'text-[#22D67A]' : marketState.trend < 0 ? 'text-[#FF4757]' : 'text-[#666666]'
                                }`}>
                                    {marketState.trend > 0 ? <ArrowUpRight className="w-3 h-3" /> : marketState.trend < 0 ? <ArrowDownRight className="w-3 h-3" /> : null}
                                    {marketState.regime}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-[#666666]">
                            <span>Spread: {(currentPrice * 0.0001).toFixed(5)}</span>
                            <span>Vol: {marketState?.volatility?.toFixed(6) || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                {/* Desktop Panel */}
                <div className="hidden lg:block w-80 shrink-0 bg-[#FFFFFF] border-l border-[#E5E5E5]">
                    <SimulationPanel
                        balance={balance}
                        currentPrice={currentPrice || currentCandle?.close || 0}
                        tradeAmount={tradeAmount}
                        setTradeAmount={setTradeAmount}
                        tradeDuration={tradeDuration}
                        setTradeDuration={setTradeDuration}
                        onPlaceTrade={placeTrade}
                        activeTrades={activeTrades}
                    />
                </div>

                {/* Mobile Bottom Bar */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#FFFFFF] border-t border-[#E5E5E5] z-40">
                    {/* Trade Controls */}
                    <div className="p-3 space-y-2">
                        <div className="flex space-x-2">
                            <div className="flex-1">
                                <label className="text-[#666666] text-[10px] mb-1 block">Amount</label>
                                <input
                                    type="number"
                                    value={tradeAmount}
                                    onChange={(e) => setTradeAmount(Math.max(1, Number(e.target.value)))}
                                    className="w-full px-2 py-1.5 bg-[#F9F9F9] border border-[#E5E5E5] rounded text-[#1A1A1A] text-xs focus:outline-none focus:border-[#22D67A]"
                                    min="1"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="text-[#666666] text-[10px] mb-1 block">Time (s)</label>
                                <input
                                    type="number"
                                    value={tradeDuration}
                                    onChange={(e) => setTradeDuration(Math.max(1, Number(e.target.value)))}
                                    className="w-full px-2 py-1.5 bg-[#F9F9F9] border border-[#E5E5E5] rounded text-[#1A1A1A] text-xs focus:outline-none focus:border-[#22D67A]"
                                    min="1"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Buy/Sell Buttons */}
                    <div className="flex border-t border-[#E5E5E5]">
                        <button
                            onClick={() => placeTrade('buy')}
                            disabled={tradeAmount > balance}
                            className={`flex-1 py-3 font-bold text-sm transition-all flex items-center justify-center space-x-1 ${
                                tradeAmount > balance
                                    ? 'bg-[#E5E5E5] text-[#999999] cursor-not-allowed'
                                    : 'bg-[#22D67A] text-[#FFFFFF] hover:bg-[#1CBE6B]'
                            }`}
                        >
                            <TrendingUp className="w-4 h-4" />
                            <span>BUY ↑</span>
                            <span className="text-[10px] opacity-80">+{tradeAmount * 0.9}</span>
                        </button>
                        <button
                            onClick={() => placeTrade('sell')}
                            disabled={tradeAmount > balance}
                            className={`flex-1 py-3 font-bold text-sm transition-all flex items-center justify-center space-x-1 ${
                                tradeAmount > balance
                                    ? 'bg-[#E5E5E5] text-[#999999] cursor-not-allowed'
                                    : 'bg-[#FF4757] text-[#FFFFFF] hover:bg-[#E03E45]'
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
                        <div className="w-80 h-full bg-[#FFFFFF] shadow-xl animate-in slide-in-from-right">
                            <div className="p-4 border-b border-[#E5E5E5] flex justify-between items-center">
                                <span className="font-bold">Trade Settings</span>
                                <button onClick={() => setIsMobilePanelOpen(false)}>
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="h-[calc(100%-65px)] overflow-y-auto">
                                <div className="p-4 space-y-4">
                                    <div>
                                        <label className="text-[#666666] text-xs font-medium mb-2 block">Quick Amounts</label>
                                        <div className="grid grid-cols-5 gap-1">
                                            {[10, 50, 100, 500, 1000].map((amount) => (
                                                <button
                                                    key={amount}
                                                    onClick={() => setTradeAmount(amount)}
                                                    className={`py-2 rounded text-xs font-medium transition-colors ${tradeAmount === amount ? 'bg-[#22D67A] text-[#FFFFFF]' : 'bg-[#F9F9F9] text-[#666666] hover:text-[#1A1A1A]'}`}
                                                >
                                                    {amount}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[#666666] text-xs font-medium mb-2 block">Quick Times</label>
                                        <div className="grid grid-cols-5 gap-1">
                                            {[5, 10, 30, 60, 120].map((duration) => (
                                                <button
                                                    key={duration}
                                                    onClick={() => setTradeDuration(duration)}
                                                    className={`py-2 rounded text-xs font-medium transition-colors ${tradeDuration === duration ? 'bg-[#22D67A] text-[#FFFFFF]' : 'bg-[#F9F9F9] text-[#666666] hover:text-[#1A1A1A]'}`}
                                                >
                                                    {duration}s
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[#666666] text-xs font-medium mb-2 block">All Active Trades</label>
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
                                                                ? 'bg-[#22D67A]/20 border-[#22D67A]'
                                                                : trade.result === 'lose'
                                                                ? 'bg-[#FF4757]/20 border-[#FF4757]'
                                                                : 'bg-[#FFFFFF] border-[#E5E5E5]'
                                                        }`}
                                                    >
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className={`text-xs font-semibold ${
                                                                trade.direction === 'buy' ? 'text-[#22D67A]' : 'text-[#FF4757]'
                                                            }`}>
                                                                {trade.direction === 'buy' ? 'BUY' : 'SELL'} ${trade.amount}
                                                            </span>
                                                            {trade.result ? (
                                                                <span className={`text-xs font-bold ${
                                                                    trade.result === 'win' ? 'text-[#22D67A]' : 'text-[#FF4757]'
                                                                }`}>
                                                                    {trade.result.toUpperCase()}
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs text-[#666666]">
                                                                    {Math.ceil(remaining / 1000)}s
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="w-full bg-[#E5E5E5] rounded-full h-1.5">
                                                            <div
                                                                className={`h-1.5 rounded-full transition-all ${
                                                                    trade.result === 'win'
                                                                        ? 'bg-[#22D67A]'
                                                                        : trade.result === 'lose'
                                                                        ? 'bg-[#FF4757]'
                                                                        : 'bg-[#E8A33D]'
                                                                }`}
                                                                style={{ width: `${progress}%` }}
                                                            />
                                                        </div>
                                                        <div className="text-[10px] text-[#999999] mt-1">
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