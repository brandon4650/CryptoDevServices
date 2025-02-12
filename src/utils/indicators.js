// src/utils/indicators.js
export const calculateIndicators = (data) => {
  return {
    ema: calculateEMA(data, 20),
    rsi: calculateRSI(data, 14),
    macd: calculateMACD(data),
    bollinger: calculateBollingerBands(data)
  };
};

const calculateEMA = (data, period) => {
  // Placeholder EMA calculation
  if (!data || data.length === 0) return [];
  return data.map(d => ({ 
    time: d.timestamp, 
    value: d.price 
  }));
};

const calculateRSI = (data, period) => {
  // Placeholder RSI calculation
  if (!data || data.length === 0) return [];
  return data.map(d => ({ 
    time: d.timestamp, 
    value: 50 // Neutral RSI value
  }));
};

const calculateMACD = (data) => {
  // Placeholder MACD calculation
  if (!data || data.length === 0) return [];
  return data.map(d => ({ 
    time: d.timestamp, 
    value: d.price 
  }));
};

const calculateBollingerBands = (data) => {
  // Placeholder Bollinger Bands calculation
  if (!data || data.length === 0) return {
    upper: [],
    middle: [],
    lower: []
  };

  const prices = data.map(d => d.price);
  const middleBand = prices.map(p => ({
    time: data.find(d => d.price === p)?.timestamp,
    value: p
  }));

  return {
    upper: middleBand.map(m => ({ 
      ...m, 
      value: m.value * 1.1 
    })),
    middle: middleBand,
    lower: middleBand.map(m => ({ 
      ...m, 
      value: m.value * 0.9 
    }))
  };
};
