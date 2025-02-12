// src/pages/Trading/TradingChart.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, CartesianGrid, ComposedChart 
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

const fetchTokenData = async (tokenAddress) => {
  try {
    // Fetch token pairs data
    const pairsResponse = await axios.get(
      `https://api.dexscreener.com/token-pairs/v1/solana/${tokenAddress}`,
      {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'Mozilla/5.0'
        }
      }
    );

    const pairs = pairsResponse.data || [];
    if (pairs.length === 0) {
      throw new Error('No token data found');
    }

    // Fetch trades data
    const tradesResponse = await axios.get(
      `https://api.dexscreener.com/latest/dex/trades/${pairs[0].pairAddress}`,
      {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'Mozilla/5.0'
        }
      }
    );

    // Find the main pair (typically the first one)
    const mainPair = pairs[0];

    // Process trades data
    const trades = tradesResponse.data?.trades || [];
    const processedTrades = trades.map(trade => ({
      timestamp: new Date(trade.timestamp).getTime(),
      price: parseFloat(trade.price),
      volume: parseFloat(trade.volume),
      type: trade.type.toLowerCase(),
      amount: parseFloat(trade.amount)
    }));

    // Group trades by type
    const groupedTrades = processedTrades.reduce((acc, trade) => {
      const time = new Date(trade.timestamp).toLocaleTimeString();
      if (!acc[time]) {
        acc[time] = { 
          time: trade.timestamp, 
          buyVolume: 0, 
          sellVolume: 0,
          buyAmount: 0,
          sellAmount: 0
        };
      }

      if (trade.type === 'buy') {
        acc[time].buyVolume += trade.volume;
        acc[time].buyAmount += trade.amount;
      } else {
        acc[time].sellVolume += trade.volume;
        acc[time].sellAmount += trade.amount;
      }

      return acc;
    }, {});

    const historicalData = Object.values(groupedTrades)
      .sort((a, b) => a.time - b.time);

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
          buys: processedTrades.filter(t => t.type === 'buy').length,
          sells: processedTrades.filter(t => t.type === 'sell').length
        }
      },
      historicalData,
      processedTrades
    };
  } catch (error) {
    console.error('DexScreener API Error:', error);
    throw error;
  }
};

const TradingChart = () => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenData, setTokenData] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTokenFetch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchTokenData(tokenAddress);
      setTokenData(data.tokenInfo);
      setHistoricalData(data.historicalData);
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
      <form onSubmit={handleTokenFetch} className="mb-4 flex space-x-2">
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

      {/* Error Handling */}
      {error && (
        <div className="bg-red-900/30 text-red-300 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Token Information */}
      {tokenData && (
        <>
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
        </>
      )}

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
            <Tooltip 
              formatter={(value, name) => [formatNumber(value), name]}
              labelFormatter={(label) => new Date(label).toLocaleString()}
            />
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
