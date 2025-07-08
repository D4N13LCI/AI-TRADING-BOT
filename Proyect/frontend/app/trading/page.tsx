'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function TradingPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Trading
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Interfaz de trading en tiempo real
            </p>
          </div>

          {/* Trading Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart Area */}
            <div className="lg:col-span-2">
              <div className="trading-card">
                <div className="trading-card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    BTC/USDT
                  </h3>
                </div>
                <div className="trading-card-body">
                  <div className="h-96 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      Gráfico de Trading (Integración con TradingView)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Panel */}
            <div className="space-y-6">
              {/* Market Data */}
              <div className="trading-card">
                <div className="trading-card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Datos de Mercado
                  </h3>
                </div>
                <div className="trading-card-body space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Precio Actual</span>
                    <span className="font-semibold text-gray-900 dark:text-white">$43,250.50</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Cambio 24h</span>
                    <span className="text-success-600 dark:text-success-400">+2.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Volumen 24h</span>
                    <span className="font-semibold text-gray-900 dark:text-white">$2.1B</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Máximo 24h</span>
                    <span className="font-semibold text-gray-900 dark:text-white">$43,500.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Mínimo 24h</span>
                    <span className="font-semibold text-gray-900 dark:text-white">$42,800.00</span>
                  </div>
                </div>
              </div>

              {/* Order Form */}
              <div className="trading-card">
                <div className="trading-card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Nueva Orden
                  </h3>
                </div>
                <div className="trading-card-body space-y-4">
                  {/* Order Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tipo de Orden
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="px-3 py-2 text-sm font-medium bg-primary-600 text-white rounded-md">
                        Compra
                      </button>
                      <button className="px-3 py-2 text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md">
                        Venta
                      </button>
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cantidad (USDT)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Precio (USDT)
                    </label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>

                  {/* Order Summary */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Cantidad BTC</span>
                      <span className="font-medium text-gray-900 dark:text-white">0.0023</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Comisión</span>
                      <span className="font-medium text-gray-900 dark:text-white">$0.50</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-gray-900 dark:text-white">Total</span>
                      <span className="text-gray-900 dark:text-white">$100.50</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                    Ejecutar Orden
                  </button>
                </div>
              </div>

              {/* Account Balance */}
              <div className="trading-card">
                <div className="trading-card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Balance de Cuenta
                  </h3>
                </div>
                <div className="trading-card-body space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">USDT</span>
                    <span className="font-semibold text-gray-900 dark:text-white">$5,234.50</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">BTC</span>
                    <span className="font-semibold text-gray-900 dark:text-white">0.1250</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">ETH</span>
                    <span className="font-semibold text-gray-900 dark:text-white">2.3400</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-900 dark:text-white">Total</span>
                      <span className="text-gray-900 dark:text-white">$12,345.67</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 