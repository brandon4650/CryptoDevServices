// src/pages/Trading/index.js
import React from 'react';
import TradingChart from './TradingChart';

const TradingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-black text-white">
      {/* Global Disclaimer */}
      <div className="bg-yellow-500/10 border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            <span className="text-yellow-500 text-lg">⚠️</span>
            <p className="text-yellow-400 text-sm">
              Demo Version: This trading interface is for demonstration and testing purposes only. Not intended for actual trading decisions.
            </p>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Trading Charts
          </h1>
        </div>

        {/* Chart Section */}
        <div className="grid gap-6">
          <div className="bg-blue-900/20 rounded-lg p-6">
            <TradingChart tokenAddress="your-token-address" />
          </div>
          
          {/* Additional Market Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-900/20 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Market Activity</h2>
              {/* Add market activity component */}
            </div>
            <div className="bg-blue-900/20 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Recent Trades</h2>
              {/* Add recent trades component */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingPage;
