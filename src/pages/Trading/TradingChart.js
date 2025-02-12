// src/pages/Trading/TradingChart.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ComposedChart, Candle, XAxis, YAxis, 
  Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import axios from 'axios';

const fetchTokenData = async (tokenAddress) => {
  try {
    // Fetch token data from DexScreener
    const tokenResponse = await axios.get(
      `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`,
      {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'Mozilla/5.0'
        }
      }
    );

    const pairs = tokenResponse.data.pairs || [];
    if (pairs.length === 0) {
      throw new Error('No token data found');
    }

    const mainPair = pairs[0];

    // Fetch recent transactions
    const transactionsResponse = await axios.get(
      `https://api.dexscreener.com/latest/dex/trades/${mainPair.pairAddress}`,
      {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'Mozilla/5.0'
        }
      }
    );

    // Process candlestick data
    const candlestickData = pairs.map(pair => ({
      time: pair.pairCreatedAt,
      open: parseFloat(pair.priceChange.m5),
      high: parseFloat(pair.priceUsd) * 1.05,
      low: parseFloat(pair.priceUsd) * 0.95,
      close: parseFloat(pair.priceUsd),
      volume: parseFloat(pair.volume.h24)
    }));

    return {
      tokenInfo: {
        name: mainPair.baseToken.name,
        symbol: mainPair.baseToken.symbol,
        address: tokenAddress,
        currentPrice: parseFloat(mainPair.priceUsd),
        priceChange24h: parseFloat(mainPair.priceChange.h24),
        volume24h: parseFloat(mainPair.volume.h24),
        marketCap: parseFloat(mainPair.fdv),
        liquidity: parseFloat(mainPair.liquidity.usd)
      },
      candlestickData,
      transactions: transactionsResponse.data?.trades || []
    };
  } catch (error) {
    console.error('DexScreener API Error:', error);
    throw error;
  }
};

const TradingChart = () => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenData, setTokenData] = useState(null);
  const [candlestickData, setCandlestickData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTokenFetch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchTokenData(tokenAddress);
      setTokenData(data.tokenInfo);
      setCandlestickData(data.candlestickData);
    } catch (err) {
      setError(err.message);
      setTokenData(null);
      setCandlestickData([]);
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
          placeholder="Enter Token Contract Address"
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
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-sm text-zinc-400">Price</div>
            <div className="text-xl font-bold text-cyan-400">
              ${tokenData.currentPrice.toFixed(6)}
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
            <div className="text-sm text-zinc-400">24h Volume</div>
            <div className="text-xl font-bold text-cyan-400">
              ${(tokenData.volume24h / 1_000_000).toFixed(2)}M
            </div>
          </div>
          <div>
            <div className="text-sm text-zinc-400">Market Cap</div>
            <div className="text-xl font-bold text-cyan-400">
              ${(tokenData.marketCap / 1_000_000).toFixed(2)}M
            </div>
          </div>
        </div>
      )}

      {/* Candlestick Chart */}
      <div className="h-[600px]">
        <ResponsiveContainer>
          <ComposedChart data={candlestickData}>
            <CartesianGrid stroke="#323232" strokeDasharray="3 3" />
            <XAxis 
              dataKey="time"
              tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
            />
            <YAxis />
            <Tooltip 
              content={({ payload }) => {
                if (payload && payload.length) {
                  const candle = payload[0].payload;
                  return (
                    <div className="bg-blue-900/80 p-4 rounded-lg">
                      <p>Open: ${candle.open.toFixed(6)}</p>
                      <p>High: ${candle.high.toFixed(6)}</p>
                      <p>Low: ${candle.low.toFixed(6)}</p>
                      <p>Close: ${candle.close.toFixed(6)}</p>
                      <p>Volume: ${candle.volume.toFixed(2)}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Candle 
              wickStroke={(d) => d.close > d.open ? 'green' : 'red'}
              fill={(d) => d.close > d.open ? 'green' : 'red'}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TradingChart;
