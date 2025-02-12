// pages/Trading/components/ChartControls.js
import React, { useState } from 'react';

const ChartControls = () => {
  const [timeframe, setTimeframe] = useState('1h');
  const [chartType, setChartType] = useState('price');

  const timeframes = ['1h', '4h', '1d', '1w', '1m'];
  const chartTypes = ['price', 'volume', 'indicators'];

  return (
    <div className="flex justify-between items-center mb-4">
      {/* Timeframe Selector */}
      <div className="flex space-x-2">
        {timeframes.map((frame) => (
          <button
            key={frame}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              timeframe === frame 
                ? 'bg-cyan-600 text-white' 
                : 'bg-blue-900/20 text-zinc-400 hover:bg-blue-900/40'
            }`}
            onClick={() => setTimeframe(frame)}
          >
            {frame}
          </button>
        ))}
      </div>

      {/* Chart Type Selector */}
      <div className="flex space-x-2">
        {chartTypes.map((type) => (
          <button
            key={type}
            className={`px-3 py-1 rounded-md text-sm capitalize transition-colors ${
              chartType === type 
                ? 'bg-cyan-600 text-white' 
                : 'bg-blue-900/20 text-zinc-400 hover:bg-blue-900/40'
            }`}
            onClick={() => setChartType(type)}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChartControls;
