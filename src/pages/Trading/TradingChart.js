// src/pages/Trading/TradingChart.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ComposedChart, Area, Bar, Line, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import axios from 'axios';
import { 
  calculateIndicators 
} from '../../utils/indicators';
import { 
  calculateMarketCap, 
  calculateVolume24h, 
  calculatePriceChange24h 
} from '../../utils/marketCalculations';
import MarketStats from './components/MarketStats';
import ChartControls from './components/ChartControls';
import TradingVolume from './components/TradingVolume';

// Solana RPC endpoints
const RPC_ENDPOINTS = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-api.projectserum.com',
  'https://solana-rpc.linkpool.io',
  'https://rpc.ankr.com/solana'
];

const fetchTokenData = async (tokenAddress) => {
  try {
    // Fetch historical price data from Jupiter Aggregator
    const priceResponse = await axios.get(
      `https://price.jup.ag/v4/price?ids=${tokenAddress}`
    );

    // Fetch token metadata from Solana FM
    const metadataResponse = await axios.get(
      `https://public-api.solana.fm/v1/token/meta?address=${tokenAddress}`
    );

    // Generate mock trade data based on available information
    const currentPrice = priceResponse.data.data[tokenAddress]?.price || 0;
    const metadata = metadataResponse.data;

    // Generate simulated historical data
    const trades = Array.from({ length: 50 }, (_, index) => ({
      timestamp: Date.now() - (50 - index) * 1000 * 60 * 60, // Spread over last 50 hours
      price: currentPrice * (1 + (Math.random() - 0.5) * 0.2), // Add some price variation
      volume: Math.random() * 10000,
      type: Math.random() > 0.5 ? 'buy' : 'sell'
    }));

    return {
      trades,
      metadata: {
        name: metadata.name || 'Unknown Token',
        symbol: metadata.symbol || 'UNKN',
        currentPrice: currentPrice,
        marketCap: metadata.market_cap || 0
      }
    };
  } catch (error) {
    console.error('Token Data Fetch Error:', {
      message: error.message,
      stack: error.stack
    });
    return null;
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

const TradingChart = () => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [tradeData, setTradeData] = useState(generateMockData());
  const [tokenMetadata, setTokenMetadata] = useState(null);
  const [marketInfo, setMarketInfo] = useState({
    price: tradeData[tradeData.length - 1]?.price || 0,
    marketCap: 0,
    volume24h: 0,
    priceChange24h: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoize calculations
  const indicators = useMemo(() => 
    calculateIndicators(tradeData), [tradeData]);

  // Function to fetch data for a given token
  const handleTokenDataFetch = async (address) => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchTokenData(address);
      
      if (result) {
        setTradeData(result.trades);
        setTokenMetadata(result.metadata);
        
        // Update market info
        setMarketInfo({
          price: result.metadata.currentPrice,
          marketCap: result.metadata.marketCap,
          volume24h: calculateVolume24h(result.trades),
          priceChange24h: calculatePriceChange24h(result.trades)
        });
      } else {
        // Fallback to mock data
        const mockData = generateMockData(100);
        setTradeData(mockData);
        setError('No data found for this token');
      }
    } catch (error) {
      console.error('Data fetching error:', error);
      const mockData = generateMockData(100);
      setTradeData(mockData);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle token address input
  const handleTokenAddressSubmit = (e) => {
    e.preventDefault();
    handleTokenDataFetch(tokenAddress);
  };

  return (
    <div className="w-full bg-blue-900/20 rounded-lg p-4">
      {/* Token Address Input */}
      <form 
        onSubmit={handleTokenAddressSubmit} 
        className="mb-4 flex items-center space-x-2"
      >
        <input 
          type="text" 
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          placeholder="Enter Solana Token Contract Address"
          className="flex-grow px-4 py-2 bg-blue-900/40 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Fetching...' : 'Fetch Token Data'}
        </button>
      </form>

      {/* Token Metadata Display */}
      {tokenMetadata && (
        <div className="mb-4 bg-blue-900/30 p-3 rounded-lg">
          <h3 className="text-xl font-bold text-cyan-400">
            {tokenMetadata.name} ({tokenMetadata.symbol})
          </h3>
          <p className="text-zinc-300">Current Price: ${tokenMetadata.currentPrice.toFixed(6)}</p>
        </div>
      )}

      {/* Error Handling */}
      {error && (
        <div className="bg-red-900/30 text-red-300 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

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
            
            <Tooltip 
              content={({ active, payload }) => {
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
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      <TradingVolume data={tradeData} />
    </div>
  );
};

export default TradingChart;
