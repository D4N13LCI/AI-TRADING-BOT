export interface User {
  id: string;
  email: string;
  walletAddress?: string;
  onicBalance: number;
  totalProfit: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Trade {
  id: string;
  userId: string;
  botId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  status: 'PENDING' | 'FILLED' | 'CANCELLED' | 'FAILED';
  profit?: number;
  timestamp: Date;
  createdAt: Date;
}

export interface Bot {
  id: string;
  name: string;
  type: 'SCALPING' | 'MOMENTUM' | 'RSI_EMA' | 'COPY_TRADING';
  status: 'ACTIVE' | 'INACTIVE' | 'PAUSED';
  symbol: string;
  strategy: string;
  settings: Record<string, any>;
  totalTrades: number;
  winRate: number;
  totalProfit: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BotStats {
  totalTrades: number;
  winRate: number;
  totalProfit: number;
  dailyProfit: number;
  weeklyProfit: number;
  monthlyProfit: number;
}

export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
}

export interface TokenInfo {
  name: string;
  symbol: string;
  totalSupply: number;
  circulatingSupply: number;
  price: number;
  marketCap: number;
  holders: number;
}

export interface RevenueDistribution {
  totalRevenue: number;
  holdersShare: number;
  reinvestmentShare: number;
  operationalShare: number;
  marketingShare: number;
  charityShare: number;
  lastDistribution: Date;
}

export interface WalletConnection {
  address: string;
  balance: string;
  network: string;
  isConnected: boolean;
}

export interface ChartData {
  timestamp: number;
  price: number;
  volume: number;
}

export interface Notification {
  id: string;
  type: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
} 