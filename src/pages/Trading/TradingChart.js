// src/pages/Trading/TradingChart.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ComposedChart, Area, Bar, Line, XAxis, YAxis, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import WebSocketService from '../../services/WebSocketService';
import { calculateIndicators } from '../../utils/indicators';
import { calculateMarketCap, calculateVolume24h, calculatePriceChange24h } from '../../utils/marketCalculations';
import MarketStats from './components/MarketStats';
import ChartControls from './components/ChartControls';
import TradingVolume from './components/TradingVolume';

const generateMockData = (count = 50) => {
  const basePrice = 0.00001;
  return Array.from({ length: count }, (_, index) => ({
    timestamp: Date.now() - (count - index) * 1000 * 60, // mock timestamps
    price: basePrice * (1 + Math.sin(index * 0.1) * 0.1), // slight price variation
    volume: Math.random() * 10000,
    type: Math.random() > 0.5 ? 'buy' : 'sell'
  }));
};

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

const TradingChart = ({ tokenAddress = 'default-token' }) => {
  const [tradeData, setTradeData] = useState(generateMockData());
  const [marketInfo, setMarketInfo] = useState({
    price: tradeData[tradeData.length - 1]?.price || 0,
    marketCap: 0,
    volume24h: 0,
    priceChange24h: 0
  });
  const wsRef = useRef(null);

  // Memoize calculations
  const indicators = useMemo(() => 
    calculateIndicators(tradeData), [tradeData]);

  // Initialize WebSocket and data fetching
  useEffect(() => {
    let ws;
    try {
      ws = new WebSocketService(tokenAddress);
      wsRef.current = ws;

      // Initial data fetch
      fetchHistoricalData();

      // Subscribe to real-time updates
      const unsubscribe = ws.subscribe(handleTradeUpdates);
      
      // Use try-catch for connect method
      try {
        ws.connect();
      } catch (connectError) {
        console.error('WebSocket connection failed:', connectError);
      }

      return () => {
        unsubscribe();
        try {
          ws.disconnect();
        } catch (disconnectError) {
          console.error('WebSocket disconnect failed:', disconnectError);
        }
      };
    } catch (error) {
      console.error('WebSocket setup failed:', error);
      return () => {};
    }
  }, [tokenAddress]);

  const fetchHistoricalData = async () => {
    try {
      // Use mock data if no API is available
      const mockData = generateMockData(100);
      setTradeData(mockData);

      // Attempt to fetch from API, but fallback to mock data
      try {
        const response = await fetch(`/api/historical/${tokenAddress}`);
        if (!response.ok) throw new Error('API fetch failed');
        const data = await response.json();
        if (data && data.length) setTradeData(data);
      } catch (apiError) {
        console.warn('Failed to fetch historical data from API:', apiError);
      }
    } catch (error) {
      console.error('Data fetching error:', error);
    }
  };

  const handleTradeUpdates = (updates) => {
    setTradeData(prevData => {
      // Keep only last 1000 data points for performance
      const newData = [...prevData, ...updates].slice(-1000);
      
      // Update market info
      const lastTrade = updates[updates.length - 1] || prevData[prevData.length - 1];
      if (lastTrade) {
        setMarketInfo(prev => ({
          price: lastTrade.price,
          marketCap: calculateMarketCap(lastTrade.price),
          volume24h: calculateVolume24h(newData),
          priceChange24h: calculatePriceChange24h(newData)
        }));
      }
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
              dataKey="price"
              stroke="#ff0000"
              dot={false}
            />

            {/* Axes and Tooltips */}
            <XAxis 
              dataKey="timestamp"
              tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
            />
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
