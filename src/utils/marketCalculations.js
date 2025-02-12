// utils/marketCalculations.js
export const calculateMarketCap = (price, supply) => {
  return price * supply;
};

export const calculateVolume24h = (trades) => {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  return trades
    .filter(t => t.timestamp > oneDayAgo)
    .reduce((sum, t) => sum + t.volume, 0);
};

export const calculatePriceChange24h = (trades) => {
  // Calculate 24h price change
};
