// pages/Trading/components/MarketStats.js
import React from 'react';
import { formatNumber } from '../../../utils/formatters';

const MarketStats = ({ stats }) => {
  const { price, marketCap, volume24h, priceChange24h } = stats;

  const getPriceChangeColor = () => {
    return priceChange24h >= 0 ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      <div>
        <div className="text-sm text-zinc-400">Price</div>
        <div className="text-xl font-bold text-cyan-400">
          ${price.toFixed(9)}
        </div>
      </div>
      <div>
        <div className="text-sm text-zinc-400">Market Cap</div>
        <div className="text-xl font-bold text-cyan-400">
          ${formatNumber(marketCap)}
        </div>
      </div>
      <div>
        <div className="text-sm text-zinc-400">24h Volume</div>
        <div className="text-xl font-bold text-cyan-400">
          ${formatNumber(volume24h)}
        </div>
      </div>
      <div>
        <div className="text-sm text-zinc-400">24h Change</div>
        <div className={`text-xl font-bold ${getPriceChangeColor()}`}>
          {priceChange24h >= 0 ? '+' : ''}{priceChange24h.toFixed(2)}%
        </div>
      </div>
    </div>
  );
};

export default MarketStats;
