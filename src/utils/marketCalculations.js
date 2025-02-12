// src/utils/marketCalculations.js
export const calculateMarketCap = (price, supply = 1) => {
  return price * supply;
};

export const calculateVolume24h = (trades) => {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  return trades
    .filter(t => t.timestamp > oneDayAgo)
    .reduce((sum, t) => sum + t.volume, 0);
};

export const calculatePriceChange24h = (trades) => {
  if (trades.length < 2) return 0;
  
  const firstPrice = trades[0].price;
  const lastPrice = trades[trades.length - 1].price;
  
  return ((lastPrice - firstPrice) / firstPrice) * 100;
};
