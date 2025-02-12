// src/pages/Trading/TradingChart.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ComposedChart, Area, Bar, Line, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import WebSocketService from '../../services/WebSocketService';
import { calculateIndicators } from '../../utils/indicators';
import { calculateMarketCap, calculateVolume24h, calculatePriceChange24h } from '../../utils/marketCalculations';
import MarketStats from './components/MarketStats';
import ChartControls from './components/ChartControls';
import TradingVolume from './components/TradingVolume';

const BITQUERY_API_ENDPOINT = 'https://graphql.bitquery.io';
const BITQUERY_API_KEY = 'BQYhWUv9MCDPvMsNn3Udg3A8MZRmXMZk'; // Consider moving to environment variables

const fetchBitqueryData = async (tokenAddress) => {
  const query = {
    query: `
      query ($network: Network!, $address: String!) {
        ethereum(network: $network) {
          dexTrades(
            baseCurrency: {is: $address}
            options: {limit: 100, desc: "block.height"}
          ) {
            block {
              height
              timestamp {
                time(format: "%Y-%m-%d %H:%M:%S")
              }
            }
            trade {
              price
              amount
              side
            }
          }
        }
      }
    `,
    variables: {
      network: "ethereum",
      address: tokenAddress
    }
  };

  try {
    const response = await fetch(BITQUERY_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': BITQUERY_API_KEY
      },
      body: JSON.stringify(query)
    });

    if (!response.ok) throw new Error('API fetch failed');
    
    const result = await response.json();
    
    // Transform Bitquery data to our expected format
    return result.data.ethereum.dexTrades.map(trade => ({
      timestamp: new Date(trade.block.timestamp.time).getTime(),
      price: trade.trade.price,
      volume: trade.trade.amount,
      type: trade.trade.side.toLowerCase()
    })).reverse(); // Reverse to get chronological order
  } catch (error) {
    console.error('Bitquery API error:', error);
    return [];
  }
};

const generateMockData = (count = 50) => {
  const basePrice = 0.00001;
  return Array.from({ length: count }, (_, index) => ({
    timestamp: Date.now() - (count - index) * 1000 * 60,
    price: basePrice * (1 + Math.sin(index * 0.1) * 0.1),
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

const TradingChart = ({ tokenAddress = '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984' }) => { // Uniswap token as default
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

  // Initialize data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        // First, try Bitquery API
        const apiData = await fetchBitqueryData(tokenAddress);
        
        if (apiData.length > 0) {
          setTradeData(apiData);
          
          // Update market info from API data
          const lastTrade = apiData[apiData.length - 1];
          setMarketInfo({
            price: lastTrade.price,
            marketCap: calculateMarketCap(lastTrade.price),
            volume24h: calculateVolume24h(apiData),
            priceChange24h: calculatePriceChange24h(apiData)
          });
        } else {
          // Fallback to mock data
          const mockData = generateMockData(100);
          setTradeData(mockData);
        }
      } catch (error) {
        console.error('Data fetching error:', error);
        // Fallback to mock data
        const mockData = generateMockData(100);
        setTradeData(mockData);
      }
    };

    fetchData();
  }, [tokenAddress]);

  return (
    <div className="w-full bg-blue-900/20 rounded-lg p-4">
      <MarketStats stats={marketInfo} />
      <ChartControls />
      <div className="h-[600px]">
        <ResponsiveContainer>
          <ComposedChart data={tradeData}>
            <CartesianGrid 
              stroke="#323232" 
              strokeDasharray="3 3" 
            />
            
            {/* Price Chart */}
            <Area
              type="monotone"
              dataKey="price"
              fill="rgba(34, 211, 238, 0.2)"
              stroke="#22d3ee"
            />
            
            {/* Volume Bars */}
            <Bar
              dataKey="volume"
              fill="#22d3ee"
              opacity={0.3}
              yAxisId="volume"
            />

            {/* Price Line */}
            <Line
              type="monotone"
              dataKey="price"
              stroke="#ff0000"
              dot={false}
            />

            {/* Axes */}
            <XAxis 
              dataKey="timestamp"
              tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
            />
            <YAxis 
              label={{ 
                value: 'Price', 
                angle: -90, 
                position: 'insideLeft' 
              }}
            />
            <YAxis 
              yAxisId="volume" 
              orientation="right" 
              label={{ 
                value: 'Volume', 
                angle: 90, 
                position: 'insideRight' 
              }}
            />
            
            <Tooltip content={<CustomTooltip />} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <TradingVolume data={tradeData} />
    </div>
  );
};

export default TradingChart;
