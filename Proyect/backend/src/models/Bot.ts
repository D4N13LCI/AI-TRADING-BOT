import mongoose, { Document, Schema } from 'mongoose';

export interface IBot extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  strategy: 'scalping' | 'momentum' | 'rsi_ema' | 'copy_trading';
  symbol: string;
  interval: string;
  isActive: boolean;
  settings: {
    riskPercentage: number;
    maxPositionSize: number;
    stopLossPercentage: number;
    takeProfitPercentage: number;
    maxPositions: number;
    tradingHours: {
      start: string;
      end: string;
    };
  };
  performance: {
    totalTrades: number;
    winningTrades: number;
    winRate: number;
    totalProfit: number;
    totalLoss: number;
    netProfit: number;
    maxDrawdown: number;
    sharpeRatio: number;
  };
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

const botSchema = new Schema<IBot>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  strategy: {
    type: String,
    enum: ['scalping', 'momentum', 'rsi_ema', 'copy_trading'],
    required: true,
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true,
  },
  interval: {
    type: String,
    required: true,
    enum: ['1m', '5m', '15m', '1h', '4h', '1d'],
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  settings: {
    riskPercentage: {
      type: Number,
      default: 2,
      min: 0.1,
      max: 10,
    },
    maxPositionSize: {
      type: Number,
      default: 10,
      min: 1,
      max: 100,
    },
    stopLossPercentage: {
      type: Number,
      default: 2.5,
      min: 0.5,
      max: 10,
    },
    takeProfitPercentage: {
      type: Number,
      default: 4,
      min: 1,
      max: 20,
    },
    maxPositions: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },
    tradingHours: {
      start: {
        type: String,
        default: '00:00',
      },
      end: {
        type: String,
        default: '23:59',
      },
    },
  },
  performance: {
    totalTrades: {
      type: Number,
      default: 0,
    },
    winningTrades: {
      type: Number,
      default: 0,
    },
    winRate: {
      type: Number,
      default: 0,
    },
    totalProfit: {
      type: Number,
      default: 0,
    },
    totalLoss: {
      type: Number,
      default: 0,
    },
    netProfit: {
      type: Number,
      default: 0,
    },
    maxDrawdown: {
      type: Number,
      default: 0,
    },
    sharpeRatio: {
      type: Number,
      default: 0,
    },
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Índices
botSchema.index({ userId: 1, isActive: 1 });
botSchema.index({ strategy: 1, isActive: 1 });
botSchema.index({ symbol: 1, isActive: 1 });

// Método para actualizar estadísticas de rendimiento
botSchema.methods.updatePerformance = function(trade: any): void {
  this.performance.totalTrades += 1;
  
  if (trade.pnl > 0) {
    this.performance.winningTrades += 1;
    this.performance.totalProfit += trade.pnl;
  } else {
    this.performance.totalLoss += Math.abs(trade.pnl);
  }
  
  this.performance.netProfit = this.performance.totalProfit - this.performance.totalLoss;
  this.performance.winRate = (this.performance.winningTrades / this.performance.totalTrades) * 100;
  
  // Calcular drawdown máximo
  if (this.performance.netProfit < this.performance.maxDrawdown) {
    this.performance.maxDrawdown = this.performance.netProfit;
  }
  
  this.lastActivity = new Date();
};

// Método para calcular Sharpe Ratio
botSchema.methods.calculateSharpeRatio = function(riskFreeRate: number = 0.02): number {
  if (this.performance.totalTrades === 0) return 0;
  
  const avgReturn = this.performance.netProfit / this.performance.totalTrades;
  const variance = Math.pow(this.performance.maxDrawdown, 2);
  const stdDev = Math.sqrt(variance);
  
  if (stdDev === 0) return 0;
  
  return (avgReturn - riskFreeRate) / stdDev;
};

// Método para obtener datos públicos del bot
botSchema.methods.toPublicJSON = function() {
  const bot = this.toObject();
  return {
    id: bot._id,
    name: bot.name,
    strategy: bot.strategy,
    symbol: bot.symbol,
    interval: bot.interval,
    isActive: bot.isActive,
    settings: bot.settings,
    performance: bot.performance,
    lastActivity: bot.lastActivity,
    createdAt: bot.createdAt,
  };
};

export default mongoose.model<IBot>('Bot', botSchema); 