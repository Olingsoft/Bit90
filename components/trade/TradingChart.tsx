import { useEffect, useRef } from 'react';
import { createChart, IChartApi, ISeriesApi, CandlestickData, Time, ColorType } from 'lightweight-charts';
import { Candle } from './SimulationEngine';

interface TradingChartProps {
    data: Candle[];
    currentTick?: Candle;
}

export default function TradingChart({ data, currentTick }: TradingChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        // Initialize chart
        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: '#0B0E14' },
                textColor: '#eceef3',
            },
            grid: {
                vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
                horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: true,
                borderColor: 'rgba(42, 46, 57, 0.5)',
            },
            rightPriceScale: {
                borderColor: 'rgba(42, 46, 57, 0.5)',
            },
            crosshair: {
                mode: 0,
            }
        });

        const series = chart.addCandlestickSeries({
            upColor: '#26a69a',
            downColor: '#ef5350',
            borderVisible: false,
            wickUpColor: '#26a69a',
            wickDownColor: '#ef5350',
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

    return (
        <div ref={chartContainerRef} className="w-full h-full min-h-[400px]" />
    );
}
