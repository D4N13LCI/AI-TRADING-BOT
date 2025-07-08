'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { MarketOverview } from '@/components/market/MarketOverview';
import { TokenOverview } from '@/components/token/TokenOverview';
import { RecentTrades } from '@/components/trading/RecentTrades';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Bienvenido al sistema de trading automatizado
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Dashboard Overview */}
            <div className="lg:col-span-2 space-y-8">
              <DashboardOverview />
              <MarketOverview />
              <RecentTrades />
            </div>

            {/* Right Column - Token Info & Quick Actions */}
            <div className="space-y-8">
              <TokenOverview />
              
              {/* Quick Actions */}
              <div className="trading-card">
                <div className="trading-card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Acciones Rápidas
                  </h3>
                </div>
                <div className="trading-card-body space-y-4">
                  <button className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    Crear Nuevo Bot
                  </button>
                  <button className="w-full bg-success-600 hover:bg-success-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    Reclamar Recompensas
                  </button>
                  <button className="w-full bg-warning-600 hover:bg-warning-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    Ver Historial
                  </button>
                </div>
              </div>

              {/* System Status */}
              <div className="trading-card">
                <div className="trading-card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Estado del Sistema
                  </h3>
                </div>
                <div className="trading-card-body space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Bots Activos
                    </span>
                    <span className="text-sm font-medium text-success-600">
                      5/8
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Conexión Exchange
                    </span>
                    <span className="text-sm font-medium text-success-600">
                      Conectado
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Wallet Conectada
                    </span>
                    <span className="text-sm font-medium text-success-600">
                      Sí
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Última Actualización
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Hace 2 min
                    </span>
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