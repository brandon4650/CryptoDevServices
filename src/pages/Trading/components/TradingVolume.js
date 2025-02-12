// pages/Trading/components/TradingVolume.js
import React from 'react';
import { formatNumber } from '../../../utils/formatters';

const TradingVolume = ({ data }) => {
  // Calculate buy and sell volumes
  const buyVolume = data
    .filter(trade => trade.type === 'buy')
    .reduce((sum, trade) => sum + trade.volume, 0);

  const sellVolume = data
    .filter(trade => trade.type === 'sell')
    .reduce((sum, trade) => sum + trade.volume, 0);

  const totalVolume = buyVolume + sellVolume;
  const buyPercentage = (buyVolume / totalVolume) * 100;
  const sellPercentage = (sellVolume / totalVolume) * 100;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold mb-2 text-zinc-200">Trading Volume</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-green-400">Buy Volume</span>
            <span className="text-green-400">{buyPercentage.toFixed(2)}%</span>
          </div>
          <div className="bg-green-900/30 rounded-full h-2">
            <div 
              className="bg-green-500 rounded-full h-2" 
              style={{ width: `${buyPercentage}%` }}
            />
          </div>
          <div className="text-zinc-400 mt-1">
            {formatNumber(buyVolume)}
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-red-400">Sell Volume</span>
            <span className="text-red-400">{sellPercentage.toFixed(2)}%</span>
          </div>
          <div className="bg-red-900/30 rounded-full h-2">
            <div 
              className="bg-red-500 rounded-full h-2" 
              style={{ width: `${sellPercentage}%` }}
            />
          </div>
          <div className="text-zinc-400 mt-1">
            {formatNumber(sellVolume)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingVolume;
