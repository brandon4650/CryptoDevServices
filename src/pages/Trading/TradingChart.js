// src/pages/Trading/TradingChart.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { 
  ComposedChart, Candle, XAxis, YAxis, 
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

    // Find the main pair (typically the first one)
    const mainPair = pairs[0];

    // Fetch token profile for additional info
    const profileResponse = await axios.get(
      `https://api.dexscreener.com/token-profiles/latest/v1?chainId=solana&tokenAddress=${tokenAddress}`,
      {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'Mozilla/5.0'
        }
      }
    );

    // Fetch token boost status
    const boostResponse = await axios.get(
      `https://api.dexscreener.com/token-boosts/top/v1`,
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
      open: parseFloat(pair.priceChange?.m5 || pair.priceNative),
      high: parseFloat(pair.priceUsd) * 1.05,
      low: parseFloat(pair.priceUsd) * 0.95,
      close: parseFloat(pair.priceUsd),
      volume: parseFloat(pair.volume?.h24 || 0)
    }));

    // Find boost information
    const boostInfo = boostResponse.data.find(
      boost => boost.tokenAddress === tokenAddress
    );

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
          buys: mainPair.txns?.h24?.buys || 0,
          sells: mainPair.txns?.h24?.sells || 0,
          totalTxns: (mainPair.txns?.h24?.buys || 0) + (mainPair.txns?.h24?.sells || 0)
        },
        boostStatus: boostInfo ? {
          isActive: boostInfo.amount > 0,
          boostAmount: boostInfo.amount,
          totalBoostAmount: boostInfo.totalAmount
        } : null,
        profileInfo: profileResponse.data?.[0] || null
      },
      candlestickData,
      pairs
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
              <div className="text-sm text-zinc-400">24h Volume</div>
              <div className="text-xl font-bold text-cyan-400">
                ${formatNumber(tokenData.volume24h)}
              </div>
            </div>
            <div>
              <div className="text-sm text-zinc-400">Market Cap</div>
              <div className="text-xl font-bold text-cyan-400">
                ${formatNumber(tokenData.marketCap)}
              </div>
            </div>
          </div>

          {/* Transaction Stats */}
          <div className="grid grid-cols-3 gap-4 mb-4 bg-blue-900/30 p-4 rounded-lg">
            <div>
              <div className="text-sm text-zinc-400">Total Transactions</div>
              <div className="text-xl font-bold text-cyan-400">
                {tokenData.transactions.totalTxns}
              </div>
            </div>
            <div>
              <div className="text-sm text-zinc-400">Buys</div>
              <div className="text-xl font-bold text-green-500">
                {tokenData.transactions.buys}
              </div>
            </div>
            <div>
              <div className="text-sm text-zinc-400">Buy Ratio</div>
              <div className="text-xl font-bold text-cyan-400">
                {tokenData.transactions.totalTxns > 0 
                  ? ((tokenData.transactions.buys / tokenData.transactions.totalTxns) * 100).toFixed(2) 
                  : '0'}%
              </div>
            </div>
          </div>
        </>
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
                      <p>Volume: ${formatNumber(candle.volume)}</p>
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
