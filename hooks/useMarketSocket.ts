'use client';

import { useEffect, useState, useRef } from 'react';
import { getSocket } from '@/frontend/socketClient';

interface MarketSocketOptions {
  symbol: string;
  onTick?: (tick: { price: number; volume: number }) => void;
  onCandle?: (candleData: { timeframe: string; candle: any }) => void;
}

export function useMarketSocket({ symbol, onTick, onCandle }: MarketSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<any>(null);
  const symbolRef = useRef(symbol);

  // Update symbol ref when symbol changes
  useEffect(() => {
    symbolRef.current = symbol;
  }, [symbol]);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    // Connection status
    socket.on('connect', () => {
      console.log('[useMarketSocket] Connected');
      setIsConnected(true);
      // Subscribe to symbol
      socket.emit('subscribe', { symbol: symbolRef.current });
    });

    socket.on('disconnect', () => {
      console.log('[useMarketSocket] Disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (error: any) => {
      console.error('[useMarketSocket] Connection error:', error);
      setIsConnected(false);
    });

    // Market data handlers
    socket.on('tick', (tick: any) => {
      if (onTick) {
        onTick({
          price: tick.price,
          volume: tick.volume || 0
        });
      }
    });

    socket.on('candle', (candleData: any) => {
      if (onCandle) {
        onCandle(candleData);
      }
    });

    // Initial connection
    if (socket.connected) {
      setIsConnected(true);
      socket.emit('subscribe', { symbol: symbolRef.current });
    }

    return () => {
      // Unsubscribe from current symbol
      socket.emit('unsubscribe', { symbol: symbolRef.current });
      
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('tick');
      socket.off('candle');
    };
  }, [onTick, onCandle]);

  // Re-subscribe when symbol changes
  useEffect(() => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('unsubscribe', { symbol: symbolRef.current });
      socketRef.current.emit('subscribe', { symbol });
    }
  }, [symbol]);

  return { isConnected };
}
