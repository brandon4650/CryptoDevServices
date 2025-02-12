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
  CartesianGrid
} from 'recharts';
import { formatNumber } from '../utils/formatters';

const CANDLE_INTERVAL = 60000; // 1 minute in milliseconds

const RealTimeCandlestickChart = ({ tokenAddress }) => {
  const [trades, setTrades] = useState([]);
  const [candles, setCandles] = useState([]);
  const [marketCap, setMarketCap] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange24h, setPriceChange24h] = useState(0);
  const [totalBuys, setTotalBuys] = useState(0);
  const [totalSells, setTotalSells] = useState(0);
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
      const buyVolume = _.sumBy(
        periodTrades.filter(t => t.type === 'buy'),
        'volume'
      );
      const sellVolume = _.sumBy(
        periodTrades.filter(t => t.type === 'sell'),
        'volume'
      );

      return {
        timestamp: timestampNum,
        open: opens,
        close: closes,
        high: highs,
        low: lows,
        volume,
        buyVolume,
        sellVolume,
        color: closes >= opens ? '#22c55e' : '#ef4444',
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
          const filteredTrades = newTrades.filter(t => 
            t.timestamp > Date.now() - 86400000
          );

          // Update 24h stats
          const oldestTrade = filteredTrades[0];
          if (oldestTrade) {
            setPriceChange24h(
              ((newTrade.price - oldestTrade.price) / oldestTrade.price) * 100
            );
          }

          setTotalBuys(filteredTrades.filter(t => t.type === 'buy').length);
          setTotalSells(filteredTrades.filter(t => t.type === 'sell').length);

          return filteredTrades;
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
  const renderCandlestick = (props) => {
    const {
      x, y, width, height,
      payload
    } = props;

    const { open, close, high, low, color } = payload;
    const candleY = Math.min(
      y + height * (1 - open),
      y + height * (1 - close)
    );
    const candleHeight = Math.abs(
      height * open - height * close
    );
    const wickY1 = y + height * (1 - high);
    const wickY2 = y + height * (1 - low);

    return (
      <g key={`candle-${x}`}>
        {/* Wick */}
        <line
          x1={x + width / 2}
          y1={wickY1}
          x2={x + width / 2}
          y2={wickY2}
          stroke={color}
          strokeWidth={1}
        />
        {/* Candle body */}
        <rect
          x={x + width * 0.2}
          y={candleY}
          width={width * 0.6}
          height={Math.max(candleHeight, 1)}
          fill={color}
          stroke={color}
        />
      </g>
    );
  };

  return (
    <div className="w-full bg-[#0a0a0a] rounded-lg p-4">
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
          <ComposedChart
            data={candles}
            margin={{ top: 10, right: 50, left: 10, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#2c2c2c"
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
              stroke="#666"
              tick={{ fill: '#666' }}
            />

            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={(value) => value.toFixed(9)}
              orientation="right"
              stroke="#666"
              tick={{ fill: '#666' }}
            />

            <YAxis
              yAxisId="volume"
              orientation="left"
              stroke="#666"
              tick={{ fill: '#666' }}
              tickFormatter={(value) => formatNumber(value)}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-[#1a1a1a] p-4 rounded-lg shadow-lg border border-gray-800">
                    <p className="text-gray-400">
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
                    <div className="mt-2 border-t border-gray-800 pt-2">
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

export default RealTimeCandlestickChart;
