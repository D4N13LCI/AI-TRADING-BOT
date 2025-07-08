'use client';

import React from 'react';
import { WalletIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export function TokenOverview() {
  const tokenInfo = {
    name: 'ONIC Token',
    symbol: 'ONIC',
    price: 0.125,
    marketCap: '2.5M',
    holders: 1250,
    totalSupply: '20,000,000',
    circulatingSupply: '15,000,000',
  };

  const rewards = {
    available: 125.50,
    totalEarned: 2340.75,
    nextDistribution: '2024-01-15',
  };

  return (
    <div className="trading-card">
      <div className="trading-card-header">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Token ONIC
        </h3>
      </div>
      <div className="trading-card-body space-y-6">
        {/* Token Info */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <WalletIcon className="h-5 w-5 text-primary-600" />
            <span className="font-medium text-gray-900 dark:text-white">{tokenInfo.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Precio</p>
              <p className="font-semibold text-gray-900 dark:text-white">${tokenInfo.price}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Market Cap</p>
              <p className="font-semibold text-gray-900 dark:text-white">${tokenInfo.marketCap}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Holders</p>
              <p className="font-semibold text-gray-900 dark:text-white">{tokenInfo.holders.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Circulación</p>
              <p className="font-semibold text-gray-900 dark:text-white">{tokenInfo.circulatingSupply}</p>
            </div>
          </div>
        </div>

        {/* Rewards */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center space-x-2 mb-3">
            <CurrencyDollarIcon className="h-5 w-5 text-success-600" />
            <span className="font-medium text-gray-900 dark:text-white">Recompensas</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Disponibles</span>
              <span className="font-semibold text-success-600">{rewards.available} ONIC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Total Ganado</span>
              <span className="font-semibold text-gray-900 dark:text-white">{rewards.totalEarned} ONIC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">Próxima Distribución</span>
              <span className="font-semibold text-gray-900 dark:text-white">{rewards.nextDistribution}</span>
            </div>
          </div>
          <button className="w-full mt-4 bg-success-600 hover:bg-success-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Reclamar Recompensas
          </button>
        </div>
      </div>
    </div>
  );
} 