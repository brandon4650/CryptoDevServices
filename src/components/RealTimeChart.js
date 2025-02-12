import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import _ from 'lodash';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea
} from 'recharts';
import { formatNumber } from '../utils/formatters';

const CANDLE_INTERVAL = 60000; // 1 minute in milliseconds

const RealTimeCandlestickChart = ({ tokenAddress }) => {
  const [trades, setTrades] = useState([]);
  const [candles, setCandles] = useState([]);
  const [marketCap, setMarketCap] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [chartRange, setChartRange] = useState({
    start: Date.now() - 3600000, // 1 hour ago
    end: Date.now()
  });
  const wsRef = useRef(null);
  const dragStart = useRef(null);

  // Aggregate trades into candles
  const aggregateCandles = (tradesData) => {
    const groupedTrades = _.groupBy(tradesData, trade => 
      Math.floor(trade.timestamp / CANDLE_INTERVAL) * CANDLE_INTERVAL
    );

    return Object.entries(groupedTrades).map(([timestamp, periodTrades]) => {
      const timestampNum = parseInt(timestamp);
      const opens = periodTrades[0].price;
      const closes = periodTrades[periodTrades.length - 1].price;
      const highs = Math.max(...periodTrades.map(t => t.price));
      const lows = Math.min(...periodTrades.map(t => t.price));
      const volume = _.sumBy(periodTrades, 'volume');
      const isGreen = closes >= opens;

      return {
        timestamp: timestampNum,
        open: opens,
        close: closes,
        high: highs,
        low: lows,
        volume,
        color: isGreen ? '#22c55e' : '#ef4444',
        marketCap: periodTrades[periodTrades.length - 1].marketCap
      };
    });
  };

  // Handle WebSocket updates
  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket('YOUR_WEBSOCKET_ENDPOINT');
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const newTrade = {
          timestamp: new Date(data.timestamp).getTime(),
          price: data.price,
          volume: data.volume,
          type: data.type,
          marketCap: data.marketCap
        };

        setTrades(prevTrades => {
          const newTrades = [...prevTrades, newTrade];
          // Keep last 24 hours of trades
          return newTrades.filter(t => t.timestamp > Date.now() - 86400000);
        });

        setCurrentPrice(data.price);
        setMarketCap(data.marketCap);
      };

      wsRef.current = ws;
    };

    connectWebSocket();
    return () => wsRef.current?.close();
  }, [tokenAddress]);

  // Update candles when trades change
  useEffect(() => {
    setCandles(aggregateCandles(trades));
  }, [trades]);

  // Custom candlestick renderer
  const renderCandlesticks = ({ 
    x, y, width, height, fill, stroke, 
    open, close, low, high, color 
  }) => {
    const candleHeight = Math.abs(open - close);
    const wickHeight = Math.abs(high - low);
    const yStart = Math.min(open, close);
    
    return (
      <g key={`candle-${x}`}>
        {/* Wick */}
        <line
          x1={x + width / 2}
          y1={y + height - (low * height)}
          x2={x + width / 2}
          y2={y + height - (high * height)}
          stroke={color}
          strokeWidth={1}
        />
        {/* Candle body */}
        <rect
          x={x}
          y={y + height - (yStart * height)}
          width={width}
          height={candleHeight * height}
          fill={color}
        />
      </g>
    );
  };

  // Handle chart dragging
  const handleMouseDown = (e) => {
    dragStart.current = e.pageX;
  };

  const handleMouseMove = (e) => {
    if (!dragStart.current) return;

    const diff = (e.pageX - dragStart.current) * 1000; // 1px = 1second
    setChartRange(prev => ({
      start: prev.start - diff,
      end: prev.end - diff
    }));
    dragStart.current = e.pageX;
  };

  const handleMouseUp = () => {
    dragStart.current = null;
  };

  return (
    <div className="w-full bg-blue-900/20 rounded-lg p-4">
      {/* Price and Market Cap Display */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-zinc-400">Price</div>
          <div className="text-2xl text-cyan-400">
            ${currentPrice.toFixed(9)}
          </div>
        </div>
        <div>
          <div className="text-sm text-zinc-400">Market Cap</div>
          <div className="text-2xl text-cyan-400">
            ${formatNumber(marketCap)}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div 
        className="h-[400px]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={candles.filter(c => 
              c.timestamp >= chartRange.start && 
              c.timestamp <= chartRange.end
            )}
            margin={{ top: 10, right: 50, left: 10, bottom: 5 }}
          >
            {/* Candlesticks */}
            <Bar
              dataKey="price"
              shape={renderCandlesticks}
              isAnimationActive={false}
            />

            {/* Volume bars */}
            <Bar
              dataKey="volume"
              yAxisId="volume"
              fill="#22d3ee"
              opacity={0.3}
              isAnimationActive={false}
            />

            <XAxis
              dataKey="timestamp"
              tickFormatter={(ts) => format(new Date(ts), 'HH:mm:ss')}
              interval="preserveStartEnd"
            />

            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={(value) => value.toFixed(9)}
              orientation="left"
            />

            <YAxis
              yAxisId="marketCap"
              orientation="right"
              tickFormatter={(value) => formatNumber(value)}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-blue-900/80 p-4 rounded-lg shadow-lg">
                    <p className="text-white">
                      {format(new Date(data.timestamp), 'HH:mm:ss')}
                    </p>
                    <p className="text-cyan-400">
                      O: ${data.open.toFixed(9)}
                    </p>
                    <p className="text-cyan-400">
                      H: ${data.high.toFixed(9)}
                    </p>
                    <p className="text-cyan-400">
                      L: ${data.low.toFixed(9)}
                    </p>
                    <p className="text-cyan-400">
                      C: ${data.close.toFixed(9)}
                    </p>
                    <p className="text-cyan-400">
                      Vol: ${formatNumber(data.volume)}
                    </p>
                    <p className="text-cyan-400">
                      MC: ${formatNumber(data.marketCap)}
                    </p>
                  </div>
                );
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RealTimeCandlestickChart;
