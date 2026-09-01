import { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time, ColorType, IPriceLine } from 'lightweight-charts';
import { Candle } from './SimulationEngine';
import { TradeDirection, ActiveTrade } from './types';

interface TradingChartProps {
    data: Candle[];
    currentTick?: Candle;
    activeTrades?: ActiveTrade[];
}

export default function TradingChart({ data, currentTick, activeTrades = [] }: TradingChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
    const priceLinesRef = useRef<Map<string, IPriceLine>>(new Map());

    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Initialize chart
        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: '#120D08' },
                textColor: '#F3E6D6',
            },
            grid: {
                vertLines: { color: 'rgba(58, 40, 24, 0.5)' },
                horzLines: { color: 'rgba(58, 40, 24, 0.5)' },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: true,
                borderColor: 'rgba(58, 40, 24, 0.5)',
            },
            rightPriceScale: {
                borderColor: 'rgba(58, 40, 24, 0.5)',
            },
            crosshair: {
                mode: 0,
            }
        });

        const series = chart.addCandlestickSeries({
            upColor: '#FF5A1F',
            downColor: '#E5484D',
            borderVisible: false,
            wickUpColor: '#FF5A1F',
            wickDownColor: '#E5484D',
        });

        // Set initial data
        const formattedData: CandlestickData[] = data.map(d => ({
            time: d.time as Time,
            open: d.open,
            high: d.high,
            low: d.low,
            close: d.close,
        }));
        
        series.setData(formattedData);

        chartRef.current = chart;
        seriesRef.current = series;

        const handleResize = () => {
            if (chartContainerRef.current) {
                chart.applyOptions({ width: chartContainerRef.current.clientWidth });
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Run only on mount

    useEffect(() => {
        if (seriesRef.current && currentTick) {
            seriesRef.current.update({
                time: currentTick.time as Time,
                open: currentTick.open,
                high: currentTick.high,
                low: currentTick.low,
                close: currentTick.close,
            });
        }
    }, [currentTick]);

    // Manage trade indicators on chart
    useEffect(() => {
        if (!seriesRef.current) return;

        const currentTradeIds = new Set(activeTrades.map(t => t.id));
        const existingLines = priceLinesRef.current;

        // Remove lines for trades that no longer exist
        for (const [tradeId, line] of existingLines) {
            if (!currentTradeIds.has(tradeId)) {
                seriesRef.current.removePriceLine(line);
                existingLines.delete(tradeId);
            }
        }

        // Add or update lines for active trades
        activeTrades.forEach(trade => {
            if (trade.result !== 'pending') {
                // Remove completed trades
                const existingLine = existingLines.get(trade.id);
                if (existingLine && seriesRef.current) {
                    seriesRef.current.removePriceLine(existingLine);
                    existingLines.delete(trade.id);
                }
                return;
            }

            const existingLine = existingLines.get(trade.id);
            const color = trade.direction === 'buy' ? '#FF5A1F' : '#E5484D';
            const lineWidth = 2;
            const lineStyle = 2; // dashed

            if (existingLine) {
                // Update existing line
                existingLine.applyOptions({
                    price: trade.entryPrice,
                    color,
                    lineWidth,
                    lineStyle,
                    axisLabelVisible: true,
                    title: `${trade.direction === 'buy' ? 'BUY' : 'SELL'} $${trade.amount}`,
                });
            } else if (seriesRef.current) {
                // Create new line
                const newLine = seriesRef.current.createPriceLine({
                    price: trade.entryPrice,
                    color,
                    lineWidth,
                    lineStyle,
                    axisLabelVisible: true,
                    title: `${trade.direction === 'buy' ? 'BUY' : 'SELL'} $${trade.amount}`,
                });
                existingLines.set(trade.id, newLine);
            }
        });
    }, [activeTrades]);

    return (
        <div ref={chartContainerRef} className="w-full h-full min-h-[400px]" />
    );
}
