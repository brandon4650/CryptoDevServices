// src/pages/Trading/TradingChart.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ComposedChart, Area, Bar, Line, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { Connection, PublicKey } from '@solana/web3.js';
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

// Solana RPC endpoint (you can replace with your preferred provider)
const SOLANA_RPC_ENDPOINT = process.env.REACT_APP_SOLANA_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com';

const fetchSolanaTokenData = async (tokenAddress) => {
  try {
    // Validate the token address
    const connection = new Connection(SOLANA_RPC_ENDPOINT, 'confirmed');
    const mintPublicKey = new PublicKey(tokenAddress);

    // Fetch token data from Jupiter Aggregator
    const jupiterResponse = await fetch(`https://price.jup.ag/v4/price?ids=${tokenAddress}`);
    const priceData = await jupiterResponse.json();

    // Fetch recent transactions (simplified example)
    const signatures = await connection.getSignaturesForAddress(mintPublicKey, {
      limit: 100
    });

    // Transform transaction data
    const trades = await Promise.all(signatures.map(async (sig) => {
      const transaction = await connection.getTransaction(sig.signature);
      
      return {
        timestamp: transaction?.blockTime ? transaction.blockTime * 1000 : Date.now(),
        price: priceData.data[tokenAddress]?.price || 0,
        volume: transaction?.meta?.postTokenBalances?.reduce((sum, balance) => 
          sum + (balance.uiTokenAmount?.amount || 0), 0) || 0,
        type: 'trade' // Simplified, actual type detection would be more complex
      };
    }));

    return trades.filter(trade => trade.price > 0);
  } catch (error) {
    console.error('Solana Token Data Fetch Error:', {
      message: error.message,
      stack: error.stack
    });
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

const TradingChart = () => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [tradeData, setTradeData] = useState(generateMockData());
  const [marketInfo, setMarketInfo] = useState({
    price: tradeData[tradeData.length - 1]?.price || 0,
    marketCap: 0,
    volume24h: 0,
    priceChange24h: 0
  });

  // Memoize calculations
  const indicators = useMemo(() => 
    calculateIndicators(tradeData), [tradeData]);

  // Function to fetch data for a given token
  const fetchTokenData = async (address) => {
    if (!address) return;

    try {
      // Fetch Solana token data
      const apiData = await fetchSolanaTokenData(address);
      
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

  // Handle token address input
  const handleTokenAddressSubmit = (e) => {
    e.preventDefault();
    fetchTokenData(tokenAddress);
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
          className="bg-cyan-600 hover:bg-cyan-700 px-4 py-2 rounded-lg text-white transition-colors"
        >
          Fetch Token Data
        </button>
      </form>

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
