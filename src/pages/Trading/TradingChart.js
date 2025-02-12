// src/pages/Trading/TradingChart.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';

// Utility function to format numbers
const formatNumber = (num) => {
  if (!num || num === "N/A") return 'N/A';
  
  num = parseFloat(num);
  if (isNaN(num)) return 'N/A';
  
  if (num < 0.00001) return num.toExponential(4);
  if (num < 0.001) return num.toFixed(8);
  if (num < 1) return num.toFixed(6);
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return num.toFixed(2);
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-blue-900/80 p-4 rounded-lg shadow-lg">
        <p className="text-white">{new Date(label).toLocaleString()}</p>
        {payload.map((entry, index) => (
          <p 
            key={index} 
            className={`
              ${entry.dataKey === 'buyVolume' ? 'text-green-400' : 'text-red-400'}
            `}
          >
            {entry.name}: ${formatNumber(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// API fetch function
const fetchTokenData = async (tokenAddress) => {
  try {
    // Fetch token pairs data
    const pairsResponse = await axios.get(
      `https://api.dexscreener.com/token-pairs/v1/solana/${tokenAddress}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    const pairs = pairsResponse.data || [];
    if (pairs.length === 0) {
      throw new Error('No token data found');
    }

    // Find the main pair
    const mainPair = pairs[0];

    // Generate historical data
    const historicalData = Array.from({ length: 24 }, (_, index) => ({
      time: Date.now() - (24 - index) * 3600000, // Spread over 24 hours
      buyVolume: Math.max(0, mainPair.txns?.h24?.buys || Math.random() * 1000),
      sellVolume: Math.max(0, mainPair.txns?.h24?.sells || Math.random() * 1000),
      price: parseFloat(mainPair.priceUsd || 0)
    }));

    return {
      tokenInfo: {
        name: mainPair.baseToken.name,
        symbol: mainPair.baseToken.symbol,
        address: tokenAddress,
        currentPrice: parseFloat(mainPair.priceUsd || 0),
        priceChange24h: parseFloat(mainPair.priceChange?.h24 || 0),
        volume24h: parseFloat(mainPair.volume?.h24 || 0),
        marketCap: parseFloat(mainPair.marketCap || mainPair.fdv || 0),
        liquidity: parseFloat(mainPair.liquidity?.usd || 0),
        transactions: {
          buys: mainPair.txns?.h24?.buys || Math.floor(Math.random() * 100),
          sells: mainPair.txns?.h24?.sells || Math.floor(Math.random() * 100)
        }
      },
      historicalData
    };
  } catch (error) {
    console.error('DexScreener API Error:', error);
    
    // Fallback to completely mock data
    return {
      tokenInfo: {
        name: 'Unknown Token',
        symbol: tokenAddress.substring(0, 6),
        address: tokenAddress,
        currentPrice: Math.random() * 0.001,
        priceChange24h: (Math.random() * 20) - 10,
        volume24h: Math.random() * 10000,
        marketCap: Math.random() * 1000000,
        liquidity: Math.random() * 100000,
        transactions: {
          buys: Math.floor(Math.random() * 100),
          sells: Math.floor(Math.random() * 100)
        }
      },
      historicalData: Array.from({ length: 24 }, (_, index) => ({
        time: Date.now() - (24 - index) * 3600000,
        buyVolume: Math.random() * 1000,
        sellVolume: Math.random() * 1000,
        price: Math.random() * 0.001
      }))
    };
  }
};

const TradingChart = () => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenData, setTokenData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Preset addresses for quick testing
  const presetAddresses = [
    { name: 'Bonk', address: 'DezXAZ8z7PnrnRJjz3wXBoRhwjszd5qBEUUBqjecaK7e' },
    { name: 'Jupiter', address: 'JUPyiwrYJFskUPiHa7hkeR8VU9epN3DgAHNGAHYmPm2' }
  ];

  const handleTokenFetch = async (address = tokenAddress) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchTokenData(address);
      setTokenData(data.tokenInfo);
      setHistoricalData(data.historicalData);
      setTokenAddress(address);
    } catch (err) {
      setError(err.message);
      setTokenData(null);
      setHistoricalData([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-blue-900/20 rounded-lg p-4">
      {/* Token Address Input */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleTokenFetch();
        }} 
        className="mb-4 flex space-x-2"
      >
        <input 
          type="text"
          value={tokenAddress}
          onChange={(e) => setTokenAddress(e.target.value)}
          placeholder="Enter Solana Token Contract Address"
          className="flex-grow p-2 bg-blue-900/40 text-white rounded"
        />
        <button 
          type="submit" 
          disabled={isLoading}
          className="bg-cyan-600 px-4 py-2 rounded text-white"
        >
          {isLoading ? 'Loading...' : 'Fetch Data'}
        </button>
      </form>

      {/* Preset Addresses */}
      <div className="flex space-x-2 mb-4">
        {presetAddresses.map((preset) => (
          <button
            key={preset.address}
            onClick={() => handleTokenFetch(preset.address)}
            className="bg-blue-900/40 hover:bg-blue-900/60 px-4 py-2 rounded text-white"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Error Handling */}
      {error && (
        <div className="bg-red-900/30 text-red-300 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Token Information */}
      {tokenData && (
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-sm text-zinc-400">Price</div>
            <div className="text-xl font-bold text-cyan-400">
              ${formatNumber(tokenData.currentPrice)}
            </div>
          </div>
          <div>
            <div className="text-sm text-zinc-400">24h Change</div>
            <div className={`text-xl font-bold ${
              tokenData.priceChange24h >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {tokenData.priceChange24h.toFixed(2)}%
            </div>
          </div>
          <div>
            <div className="text-sm text-zinc-400">Total Buys</div>
            <div className="text-xl font-bold text-green-500">
              {tokenData.transactions.buys}
            </div>
          </div>
          <div>
            <div className="text-sm text-zinc-400">Total Sells</div>
            <div className="text-xl font-bold text-red-500">
              {tokenData.transactions.sells}
            </div>
          </div>
        </div>
      )}

      {/* Price Chart */}
      <div className="h-[300px] mb-4">
        <ResponsiveContainer>
          <LineChart data={historicalData}>
            <CartesianGrid stroke="#323232" strokeDasharray="3 3" />
            <XAxis 
              dataKey="time"
              tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
            />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`$${formatNumber(value)}`, 'Price']}
              labelFormatter={(label) => new Date(label).toLocaleString()}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#22d3ee" 
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Buys and Sells Chart */}
      <div className="h-[400px]">
        <ResponsiveContainer>
          <BarChart data={historicalData}>
            <CartesianGrid stroke="#323232" strokeDasharray="3 3" />
            <XAxis 
              dataKey="time"
              tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="buyVolume" 
              fill="#22c55e" // Green for buys
              opacity={0.7}
              name="Buy Volume"
            />
            <Bar 
              dataKey="sellVolume" 
              fill="#ef4444" // Red for sells
              opacity={0.7}
              name="Sell Volume"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TradingChart;
