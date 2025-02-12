import React, { useState, useEffect, useRef, useMemo } from 'react';
import { format } from 'date-fns';
import _ from 'lodash';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { formatNumber } from '../utils/formatters';

const CANDLE_INTERVAL = 60000; // 1 minute in milliseconds

const RealTimeChart = ({ tokenAddress }) => {
  const [priceData, setPriceData] = useState([]);
  const [candles, setCandles] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange24h, setPriceChange24h] = useState(0);
  const [totalBuys, setTotalBuys] = useState(0);
  const [totalSells, setTotalSells] = useState(0);
  const lastPriceRef = useRef(null);
  const lastMarketCapRef = useRef(null);

  // Function to determine if a trade is a buy or sell based on price and market cap changes
  const determineTradeType = (price, marketCap) => {
    if (!lastPriceRef.current || !lastMarketCapRef.current) {
      lastPriceRef.current = price;
      lastMarketCapRef.current = marketCap;
      return { type: 'buy', volume: 0 }; // Default for first trade
    }

    const priceChange = price - lastPriceRef.current;
    const marketCapChange = marketCap - lastMarketCapRef.current;
    
    // Calculate volume from market cap change
    const volume = Math.abs(marketCapChange / price);
    
    // If price went up, it's likely a buy. If down, likely a sell
    const type = priceChange >= 0 ? 'buy' : 'sell';

    lastPriceRef.current = price;
    lastMarketCapRef.current = marketCap;

    return { type, volume };
  };

  // Process new price update
  const processPrice = (price, marketCap, timestamp = Date.now()) => {
    const { type, volume } = determineTradeType(price, marketCap);
    
    setPriceData(prev => {
      const newData = [...prev, {
        timestamp,
        price,
        marketCap,
        volume,
        type
      }];

      // Keep last 24 hours of data
      return newData.filter(d => d.timestamp > Date.now() - 86400000);
    });

    setCurrentPrice(price);

    // Update buy/sell counts
    if (type === 'buy') {
      setTotalBuys(prev => prev + 1);
    } else {
      setTotalSells(prev => prev + 1);
    }
  };

  // Aggregate candles from price data
  const aggregateCandles = (data) => {
    const groupedData = _.groupBy(data, item => 
      Math.floor(item.timestamp / CANDLE_INTERVAL) * CANDLE_INTERVAL
    );

    return Object.entries(groupedData).map(([timestamp, trades]) => {
      const timestampNum = parseInt(timestamp);
      const open = trades[0].price;
      const close = trades[trades.length - 1].price;
      const high = Math.max(...trades.map(t => t.price));
      const low = Math.min(...trades.map(t => t.price));
      const buyVolume = _.sumBy(
        trades.filter(t => t.type === 'buy'),
        'volume'
      );
      const sellVolume = _.sumBy(
        trades.filter(t => t.type === 'sell'),
        'volume'
      );

      return {
        timestamp: timestampNum,
        open,
        high,
        low,
        close,
        buyVolume,
        sellVolume,
        color: close >= open ? '#22c55e' : '#ef4444'
      };
    });
  };

  // Update candles when price data changes
  useEffect(() => {
    setCandles(aggregateCandles(priceData));
    
    // Calculate 24h price change
    if (priceData.length >= 2) {
      const oldestPrice = priceData[0].price;
      const latestPrice = priceData[priceData.length - 1].price;
      setPriceChange24h(((latestPrice - oldestPrice) / oldestPrice) * 100);
    }
  }, [priceData]);

  // Custom candlestick renderer
  const renderCandlestick = (props) => {
    const {
      x, y, width, height,
      payload
    } = props;

    const { open, close, high, low, color } = payload;
    
    // Calculate positions
    const candleY = Math.min(
      y + height * (1 - (open / high)),
      y + height * (1 - (close / high))
    );
    const candleHeight = Math.abs(
      height * ((close - open) / high)
    );

    return (
      <g key={`candle-${x}`}>
        {/* Wick */}
        <line
          x1={x + width / 2}
          y1={y + height * (1 - (high / high))}
          x2={x + width / 2}
          y2={y + height * (1 - (low / high))}
          stroke={color}
          strokeWidth={1}
        />
        {/* Candle body */}
        <rect
          x={x + width * 0.25}
          y={candleY}
          width={width * 0.5}
          height={Math.max(candleHeight, 1)}
          fill={color}
        />
      </g>
    );
  };

  // Simulate price updates for testing
  useEffect(() => {
    const interval = setInterval(() => {
      const lastPrice = currentPrice || 0.0001;
      const priceChange = (Math.random() - 0.5) * lastPrice * 0.02; // 2% max change
      const newPrice = Math.max(lastPrice + priceChange, 0.00000001);
      const newMarketCap = newPrice * 1000000000; // Assuming 1B supply
      
      processPrice(newPrice, newMarketCap);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPrice]);

  return (
    <div className="w-full bg-blue-950 rounded-lg p-4">
      {/* Stats Display */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div>
          <div className="text-sm text-zinc-400">Price</div>
          <div className="text-xl font-bold text-cyan-400">
            ${currentPrice.toFixed(9)}
          </div>
        </div>
        <div>
          <div className="text-sm text-zinc-400">24h Change</div>
          <div className={`text-xl font-bold ${
            priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {priceChange24h.toFixed(2)}%
          </div>
        </div>
        <div>
          <div className="text-sm text-zinc-400">Total Buys</div>
          <div className="text-xl font-bold text-green-500">
            {totalBuys}
          </div>
        </div>
        <div>
          <div className="text-sm text-zinc-400">Total Sells</div>
          <div className="text-xl font-bold text-red-500">
            {totalSells}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={candles}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#334155" 
              vertical={false}
            />
            
            {/* Candlesticks */}
            <Bar
              dataKey="price"
              shape={renderCandlestick}
              isAnimationActive={false}
            />

            {/* Volume bars */}
            <Bar
              dataKey="buyVolume"
              yAxisId="volume"
              fill="#22c55e"
              opacity={0.3}
              stackId="volume"
              isAnimationActive={false}
            />
            <Bar
              dataKey="sellVolume"
              yAxisId="volume"
              fill="#ef4444"
              opacity={0.3}
              stackId="volume"
              isAnimationActive={false}
            />

            <XAxis
              dataKey="timestamp"
              tickFormatter={(ts) => format(new Date(ts), 'HH:mm:ss')}
              stroke="#64748b"
            />

            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={(value) => value.toFixed(9)}
              stroke="#64748b"
            />

            <YAxis
              yAxisId="volume"
              orientation="right"
              stroke="#64748b"
              tickFormatter={formatNumber}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-blue-900/80 p-4 rounded-lg shadow-lg">
                    <p className="text-gray-300">
                      {format(new Date(data.timestamp), 'HH:mm:ss')}
                    </p>
                    <p className="text-cyan-400">O: ${data.open.toFixed(9)}</p>
                    <p className="text-cyan-400">H: ${data.high.toFixed(9)}</p>
                    <p className="text-cyan-400">L: ${data.low.toFixed(9)}</p>
                    <p className="text-cyan-400">C: ${data.close.toFixed(9)}</p>
                    <div className="mt-2 border-t border-gray-700 pt-2">
                      <p className="text-green-500">
                        Buy Vol: ${formatNumber(data.buyVolume)}
                      </p>
                      <p className="text-red-500">
                        Sell Vol: ${formatNumber(data.sellVolume)}
                      </p>
                    </div>
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

export default RealTimeChart;
