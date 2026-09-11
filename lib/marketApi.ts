import { API_URL } from './api';

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketState {
  price: number;
  trend: number;
  regime: string;
  volatility?: number;
}

export async function getCandles(symbol: string, timeframe: string, limit: number): Promise<{ candles: Candle[] }> {
  const response = await fetch(`${API_URL}api/market/candles?symbol=${symbol}&timeframe=${timeframe}&limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch candles');
  }
  return response.json();
}

export async function getMarketState(symbol: string): Promise<MarketState> {
  const response = await fetch(`${API_URL}api/market/state?symbol=${symbol}`);
  if (!response.ok) {
    throw new Error('Failed to fetch market state');
  }
  return response.json();
}
