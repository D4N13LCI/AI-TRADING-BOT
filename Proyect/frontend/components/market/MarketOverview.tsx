'use client';

import React from 'react';

export function MarketOverview() {
  const marketData = [
    { symbol: 'BTC/USDT', price: 43250.50, change: 2.5, volume: '2.1B' },
    { symbol: 'ETH/USDT', price: 2650.75, change: -1.2, volume: '1.8B' },
    { symbol: 'BNB/USDT', price: 312.40, change: 0.8, volume: '450M' },
    { symbol: 'ADA/USDT', price: 0.485, change: 3.1, volume: '320M' },
  ];

  return (
    <div className="trading-card">
      <div className="trading-card-header">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Mercado
        </h3>
      </div>
      <div className="trading-card-body">
        <div className="space-y-4">
          {marketData.map((item) => (
            <div key={item.symbol} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-primary-600 dark:text-primary-400">
                    {item.symbol.split('/')[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.symbol}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Vol: {item.volume}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white">${item.price.toLocaleString()}</p>
                <p className={`text-sm font-medium ${item.change >= 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
                  {item.change >= 0 ? '+' : ''}{item.change}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 