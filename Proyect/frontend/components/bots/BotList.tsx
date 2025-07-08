'use client';

import React from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  StopIcon, 
  CogIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

export function BotList() {
  const bots = [
    {
      id: '1',
      name: 'Scalping BTC',
      type: 'SCALPING',
      symbol: 'BTC/USDT',
      status: 'ACTIVE',
      totalTrades: 156,
      winRate: 78.5,
      totalProfit: 2340.50,
      dailyProfit: 125.30,
      settings: {
        minProfit: 0.5,
        maxLoss: 2.0,
        tradeSize: 100,
      },
    },
    {
      id: '2',
      name: 'Momentum ETH',
      type: 'MOMENTUM',
      symbol: 'ETH/USDT',
      status: 'ACTIVE',
      totalTrades: 89,
      winRate: 82.1,
      totalProfit: 1890.75,
      dailyProfit: 67.45,
      settings: {
        momentumPeriod: 14,
        threshold: 0.02,
        tradeSize: 150,
      },
    },
    {
      id: '3',
      name: 'RSI EMA Strategy',
      type: 'RSI_EMA',
      symbol: 'BNB/USDT',
      status: 'PAUSED',
      totalTrades: 203,
      winRate: 75.3,
      totalProfit: 3120.25,
      dailyProfit: -45.20,
      settings: {
        rsiPeriod: 14,
        emaPeriod: 20,
        overbought: 70,
        oversold: 30,
      },
    },
    {
      id: '4',
      name: 'Copy Trading Pro',
      type: 'COPY_TRADING',
      symbol: 'ADA/USDT',
      status: 'ACTIVE',
      totalTrades: 67,
      winRate: 85.2,
      totalProfit: 890.40,
      dailyProfit: 23.50,
      settings: {
        traderId: 'trader_001',
        copyPercentage: 50,
        maxRisk: 5.0,
      },
    },
  ];

  const getBotIcon = (type: string) => {
    switch (type) {
      case 'SCALPING':
        return CurrencyDollarIcon;
      case 'MOMENTUM':
        return TrendingUpIcon;
      case 'RSI_EMA':
        return ChartBarIcon;
      case 'COPY_TRADING':
        return UserGroupIcon;
      default:
        return CogIcon;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200';
      case 'PAUSED':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Activo';
      case 'PAUSED':
        return 'Pausado';
      case 'INACTIVE':
        return 'Inactivo';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div className="trading-card">
      <div className="trading-card-header">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Mis Bots
        </h3>
      </div>
      <div className="trading-card-body">
        <div className="space-y-4">
          {bots.map((bot) => {
            const BotIcon = getBotIcon(bot.type);
            return (
              <div key={bot.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                        <BotIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {bot.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {bot.symbol} • {bot.type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        ${bot.totalProfit.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Ganancia Total
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        bot.dailyProfit >= 0 
                          ? 'text-success-600 dark:text-success-400' 
                          : 'text-danger-600 dark:text-danger-400'
                      }`}>
                        {bot.dailyProfit >= 0 ? '+' : ''}${bot.dailyProfit.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Hoy
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {bot.winRate}%
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Win Rate
                      </p>
                    </div>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(bot.status)}`}>
                      {getStatusText(bot.status)}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <CogIcon className="h-5 w-5" />
                      </button>
                      {bot.status === 'ACTIVE' ? (
                        <button className="p-2 text-warning-400 hover:text-warning-600 dark:hover:text-warning-300">
                          <PauseIcon className="h-5 w-5" />
                        </button>
                      ) : (
                        <button className="p-2 text-success-400 hover:text-success-600 dark:hover:text-success-300">
                          <PlayIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button className="p-2 text-danger-400 hover:text-danger-600 dark:hover:text-danger-300">
                        <StopIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 