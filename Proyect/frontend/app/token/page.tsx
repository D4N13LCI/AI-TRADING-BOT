'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function TokenPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Token ONIC
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Gestiona tu participación en el token ONIC
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Token Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Token Overview */}
              <div className="trading-card">
                <div className="trading-card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Información del Token
                  </h3>
                </div>
                <div className="trading-card-body">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">$0.125</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Precio Actual</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">$2.5M</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Market Cap</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">1,250</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Holders</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">15M</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Circulación</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Distribution Chart */}
              <div className="trading-card">
                <div className="trading-card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Distribución de Ganancias
                  </h3>
                </div>
                <div className="trading-card-body">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-success-50 dark:bg-success-900 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-success-500 rounded-full"></div>
                        <span className="font-medium text-gray-900 dark:text-white">Holders (40%)</span>
                      </div>
                      <span className="font-semibold text-success-600 dark:text-success-400">$40,000</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-primary-500 rounded-full"></div>
                        <span className="font-medium text-gray-900 dark:text-white">Reinversión (35%)</span>
                      </div>
                      <span className="font-semibold text-primary-600 dark:text-primary-400">$35,000</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-warning-50 dark:bg-warning-900 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-warning-500 rounded-full"></div>
                        <span className="font-medium text-gray-900 dark:text-white">Operacional (15%)</span>
                      </div>
                      <span className="font-semibold text-warning-600 dark:text-warning-400">$15,000</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
                        <span className="font-medium text-gray-900 dark:text-white">Marketing (9%)</span>
                      </div>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">$9,000</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        <span className="font-medium text-gray-900 dark:text-white">Caridad (1%)</span>
                      </div>
                      <span className="font-semibold text-red-600 dark:text-red-400">$1,000</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div className="trading-card">
                <div className="trading-card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Historial de Transacciones
                  </h3>
                </div>
                <div className="trading-card-body">
                  <div className="space-y-3">
                    {[
                      { type: 'Recompensa', amount: '+125.50 ONIC', date: '2024-01-10 14:30', status: 'Completado' },
                      { type: 'Compra', amount: '-500.00 USDT', date: '2024-01-09 16:45', status: 'Completado' },
                      { type: 'Recompensa', amount: '+89.25 ONIC', date: '2024-01-08 12:15', status: 'Completado' },
                      { type: 'Venta', amount: '+750.00 USDT', date: '2024-01-07 09:20', status: 'Completado' },
                    ].map((tx, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{tx.type}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{tx.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">{tx.amount}</p>
                          <p className="text-sm text-success-600 dark:text-success-400">{tx.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* My Holdings */}
              <div className="trading-card">
                <div className="trading-card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Mis Tenencias
                  </h3>
                </div>
                <div className="trading-card-body space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">1,250</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ONIC Tokens</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">$156.25</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Valor Total</p>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Participación</span>
                      <span className="font-semibold text-gray-900 dark:text-white">0.008%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Claim Rewards */}
              <div className="trading-card">
                <div className="trading-card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Reclamar Recompensas
                  </h3>
                </div>
                <div className="trading-card-body space-y-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success-600 dark:text-success-400">125.50</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ONIC Disponibles</p>
                  </div>
                  <button className="w-full bg-success-600 hover:bg-success-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                    Reclamar Recompensas
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    Próxima distribución: 15 de Enero, 2024
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="trading-card">
                <div className="trading-card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Acciones Rápidas
                  </h3>
                </div>
                <div className="trading-card-body space-y-3">
                  <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    Comprar ONIC
                  </button>
                  <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    Vender ONIC
                  </button>
                  <button className="w-full bg-warning-600 hover:bg-warning-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    Ver en Etherscan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 