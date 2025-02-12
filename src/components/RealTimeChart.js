import React, { useState, useEffect, useRef } from 'react';
import { 
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { formatNumber } from '../utils/formatters';

const RealTimeChart = ({ tokenAddress }) => {
  const [trades, setTrades] = useState([]);
  const [marketCap, setMarketCap] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const wsRef = useRef(null);

  // Handle real-time WebSocket updates
  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket('YOUR_WEBSOCKET_ENDPOINT');
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // Update trades with new transaction
        setTrades(prevTrades => {
          const newTrades = [...prevTrades, {
            time: new Date(data.timestamp).getTime(),
            price: data.price,
            volume: data.volume,
            type: data.type, // 'buy' or 'sell'
            marketCap: data.marketCap
          }].slice(-200); // Keep last 200 trades
          
          return newTrades;
        });

        // Update current price and market cap
        setCurrentPrice(data.price);
        setMarketCap(data.marketCap);
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [tokenAddress]);

  return (
    <div className="w-full bg-blue-900/20 rounded-lg p-4">
      {/* Price and Market Cap Display */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-zinc-400">Price</div>
          <div className="text-2xl text-cyan-400">${currentPrice.toFixed(9)}</div>
        </div>
        <div>
          <div className="text-sm text-zinc-400">Market Cap</div>
          <div className="text-2xl text-cyan-400">${formatNumber(marketCap)}</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={trades}>
            {/* Candlestick background */}
            <Area
              type="monotone"
              dataKey="price"
              fill="url(#gradientBg)"
              stroke="#22d3ee"
              dot={false}
            />
            
            {/* Volume bars */}
            <Bar
              dataKey="volume"
              fill="#22d3ee"
              opacity={0.3}
              yAxisId="volume"
            />

            {/* Price line */}
            <Line
              type="monotone"
              dataKey="price"
              stroke="#22d3ee"
              dot={false}
              strokeWidth={2}
            />

            <XAxis 
              dataKey="time"
              tickFormatter={(time) => new Date(time).toLocaleTimeString()}
            />
            
            <YAxis 
              domain={['auto', 'auto']}
              tickFormatter={(value) => value.toFixed(9)}
            />
            
            <YAxis 
              yAxisId="volume"
              orientation="right"
              tickFormatter={(value) => formatNumber(value)}
            />

            <Tooltip />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RealTimeChart;
