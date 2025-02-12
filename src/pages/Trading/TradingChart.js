// src/pages/Trading/TradingChart.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ComposedChart, Area, Bar, Line, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import WebSocketService from '../../services/WebSocketService';
import { calculateIndicators } from '../../utils/indicators';
import { calculateMarketCap, calculateVolume24h, calculatePriceChange24h } from '../../utils/marketCalculations';

import MarketStats from './components/MarketStats';
import ChartControls from './components/ChartControls';
import TradingVolume from './components/TradingVolume';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-blue-900/80 p-4 rounded-lg shadow-lg">
        <p className="text-white">Price: ${data.price.toFixed(9)}</p>
        <p className="text-zinc-300">Volume: {data.volume.toLocaleString()}</p>
        <p className="text-zinc-300">Timestamp: {new Date(data.timestamp).toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const TradingChart = ({ tokenAddress }) => {
  const [tradeData, setTradeData] = useState([]);
  const [marketInfo, setMarketInfo] = useState({
    price: 0,
    marketCap: 0,
    volume24h: 0,
    priceChange24h: 0
  });
  const wsRef = useRef(null);
  const chartRef = useRef(null);

  // Memoize calculations
  const indicators = useMemo(() => 
    calculateIndicators(tradeData), [tradeData]);

  // Initialize WebSocket and data fetching
  useEffect(() => {
    const ws = new WebSocketService(tokenAddress);
    wsRef.current = ws;

    // Initial data fetch
    fetchHistoricalData();

    // Subscribe to real-time updates
    const unsubscribe = ws.subscribe(handleTradeUpdates);
    ws.connect();

    return () => {
      unsubscribe();
      ws.disconnect();
    };
  }, [tokenAddress]);

  const fetchHistoricalData = async () => {
    try {
      // Fetch from your preferred API
      const response = await fetch(`/api/historical/${tokenAddress}`);
      const data = await response.json();
      setTradeData(data);
    } catch (error) {
      console.error('Failed to fetch historical data:', error);
    }
  };

  const handleTradeUpdates = (updates) => {
    setTradeData(prevData => {
      // Keep only last 1000 data points for performance
      const newData = [...prevData, ...updates].slice(-1000);
      
      // Update market info
      const lastTrade = updates[updates.length - 1];
      setMarketInfo(prev => ({
        price: lastTrade.price,
        marketCap: calculateMarketCap(lastTrade.price),
        volume24h: calculateVolume24h(newData),
        priceChange24h: calculatePriceChange24h(newData)
      }));

      return newData;
    });
  };

  return (
    <div className="w-full bg-blue-900/20 rounded-lg p-4">
      <MarketStats stats={marketInfo} />
      <ChartControls />
      <div className="h-[600px]">
        <ResponsiveContainer>
          <ComposedChart data={tradeData}>
            {/* Price Chart */}
            <Area
              type="monotone"
              dataKey="price"
              fill="url(#gradientBg)"
              stroke="#22d3ee"
            />
            
            {/* Volume Bars */}
            <Bar
              dataKey="volume"
              fill="#22d3ee"
              opacity={0.3}
              yAxisId="volume"
            />

            {/* Moving Averages */}
            <Line
              type="monotone"
              data={indicators.ema}
              stroke="#ff0000"
              dot={false}
            />

            {/* Axes and Tooltips */}
            <XAxis />
            <YAxis />
            <Tooltip
              content={<CustomTooltip />}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <TradingVolume data={tradeData} />
    </div>
  );
};

export default TradingChart;