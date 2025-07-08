import mongoose, { Document, Schema } from 'mongoose';

export interface ITrade extends Document {
  userId: mongoose.Types.ObjectId;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  totalValue: number;
  strategy: string;
  exchange: string;
  orderId: string;
  status: 'pending' | 'filled' | 'cancelled' | 'failed';
  pnl?: number;
  pnlPercentage?: number;
  entryTime: Date;
  exitTime?: Date;
  stopLoss?: number;
  takeProfit?: number;
  copyTradeInfo?: {
    leaderId: string;
    leaderName: string;
    originalTradeId: string;
  };
  metadata: {
    botId?: string;
    riskPercentage: number;
    marketConditions?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const tradeSchema = new Schema<ITrade>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true,
  },
  side: {
    type: String,
    enum: ['buy', 'sell'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  totalValue: {
    type: Number,
    required: true,
    min: 0,
  },
  strategy: {
    type: String,
    enum: ['scalping', 'momentum', 'rsi_ema', 'copy_trading'],
    required: true,
  },
  exchange: {
    type: String,
    enum: ['binance', 'bybit'],
    required: true,
  },
  orderId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'filled', 'cancelled', 'failed'],
    default: 'pending',
  },
  pnl: {
    type: Number,
  },
  pnlPercentage: {
    type: Number,
  },
  entryTime: {
    type: Date,
    required: true,
    default: Date.now,
  },
  exitTime: {
    type: Date,
  },
  stopLoss: {
    type: Number,
  },
  takeProfit: {
    type: Number,
  },
  copyTradeInfo: {
    leaderId: { type: String },
    leaderName: { type: String },
    originalTradeId: { type: String },
  },
  metadata: {
    botId: { type: String },
    riskPercentage: { type: Number, default: 2 },
    marketConditions: { type: String },
  },
}, {
  timestamps: true,
});

// Índices
tradeSchema.index({ userId: 1, createdAt: -1 });
tradeSchema.index({ symbol: 1, createdAt: -1 });
tradeSchema.index({ strategy: 1, createdAt: -1 });
tradeSchema.index({ status: 1 });
tradeSchema.index({ 'copyTradeInfo.leaderId': 1 });

// Método para calcular P&L
tradeSchema.methods.calculatePnL = function(exitPrice: number): number {
  if (this.side === 'buy') {
    return (exitPrice - this.price) * this.quantity;
  } else {
    return (this.price - exitPrice) * this.quantity;
  }
};

// Método para calcular P&L porcentual
tradeSchema.methods.calculatePnLPercentage = function(exitPrice: number): number {
  if (this.side === 'buy') {
    return ((exitPrice - this.price) / this.price) * 100;
  } else {
    return ((this.price - exitPrice) / this.price) * 100;
  }
};

// Método para obtener datos públicos del trade
tradeSchema.methods.toPublicJSON = function() {
  const trade = this.toObject();
  delete trade.metadata;
  return trade;
};

export default mongoose.model<ITrade>('Trade', tradeSchema); 