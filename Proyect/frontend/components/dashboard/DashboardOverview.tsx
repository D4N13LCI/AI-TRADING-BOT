'use client';

import React from 'react';
import { 
  CurrencyDollarIcon, 
  TrendingUpIcon, 
  TrendingDownIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline';

export function DashboardOverview() {
  const stats = [
    {
      name: 'Ganancia Total',
      value: '$12,345.67',
      change: '+12.5%',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'Bots Activos',
      value: '5',
      change: '+2',
      changeType: 'positive',
      icon: ChartBarIcon,
    },
    {
      name: 'Win Rate',
      value: '78.5%',
      change: '+2.1%',
      changeType: 'positive',
      icon: TrendingUpIcon,
    },
    {
      name: 'Operaciones Hoy',
      value: '24',
      change: '-3',
      changeType: 'negative',
      icon: TrendingDownIcon,
    },
  ];

  return (
    <div className="trading-card">
      <div className="trading-card-header">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Resumen del Dashboard
        </h3>
      </div>
      <div className="trading-card-body">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <span
                  className={`text-sm font-medium ${
                    stat.changeType === 'positive'
                      ? 'text-success-600 dark:text-success-400'
                      : 'text-danger-600 dark:text-danger-400'
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                  vs mes anterior
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 