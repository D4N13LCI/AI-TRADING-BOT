'use client';

import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

export function RecentTrades() {
  const trades = [
    {
      id: '1',
      symbol: 'BTC/USDT',
      side: 'BUY',
      quantity: 0.05,
      price: 43250.50,
      profit: 125.30,
      timestamp: '2024-01-10 14:30:25',
      status: 'FILLED',
    },
    {
      id: '2',
      symbol: 'ETH/USDT',
      side: 'SELL',
      quantity: 2.5,
      price: 2650.75,
      profit: -45.20,
      timestamp: '2024-01-10 14:25:10',
      status: 'FILLED',
    },
    {
      id: '3',
      symbol: 'BNB/USDT',
      side: 'BUY',
      quantity: 15.0,
      price: 312.40,
      profit: 67.80,
      timestamp: '2024-01-10 14:20:45',
      status: 'FILLED',
    },
    {
      id: '4',
      symbol: 'ADA/USDT',
      side: 'SELL',
      quantity: 5000,
      price: 0.485,
      profit: 23.50,
      timestamp: '2024-01-10 14:15:30',
      status: 'FILLED',
    },
  ];

  return (
    <div className="trading-card">
      <div className="trading-card-header">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Operaciones Recientes
        </h3>
      </div>
      <div className="trading-card-body">
        <div className="space-y-3">
          {trades.map((trade) => (
            <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  trade.side === 'BUY' 
                    ? 'bg-success-100 dark:bg-success-900' 
                    : 'bg-danger-100 dark:bg-danger-900'
                }`}>
                  {trade.side === 'BUY' ? (
                    <ArrowUpIcon className="h-4 w-4 text-success-600 dark:text-success-400" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 text-danger-600 dark:text-danger-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{trade.symbol}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {trade.quantity} @ ${trade.price.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  trade.profit >= 0 
                    ? 'text-success-600 dark:text-success-400' 
                    : 'text-danger-600 dark:text-danger-400'
                }`}>
                  {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {trade.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <button className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium">
            Ver Todas las Operaciones
          </button>
        </div>
      </div>
    </div>
  );
} 