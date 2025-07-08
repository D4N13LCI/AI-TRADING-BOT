import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role: 'user' | 'admin' | 'trader';
  apiKeys: {
    binance?: {
      apiKey: string;
      apiSecret: string;
      isActive: boolean;
    };
    bybit?: {
      apiKey: string;
      apiSecret: string;
      isActive: boolean;
    };
  };
  tradingSettings: {
    riskPercentage: number;
    maxPositionSize: number;
    preferredStrategy: string;
    copyTradingEnabled: boolean;
  };
  walletAddress?: string;
  onicBalance: number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'trader'],
    default: 'user',
  },
  apiKeys: {
    binance: {
      apiKey: { type: String, default: '' },
      apiSecret: { type: String, default: '' },
      isActive: { type: Boolean, default: false },
    },
    bybit: {
      apiKey: { type: String, default: '' },
      apiSecret: { type: String, default: '' },
      isActive: { type: Boolean, default: false },
    },
  },
  tradingSettings: {
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
    preferredStrategy: {
      type: String,
      enum: ['scalping', 'momentum', 'rsi_ema', 'copy_trading'],
      default: 'rsi_ema',
    },
    copyTradingEnabled: {
      type: Boolean,
      default: false,
    },
  },
  walletAddress: {
    type: String,
    trim: true,
  },
  onicBalance: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
});

// Índices
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ walletAddress: 1 });

// Middleware para encriptar contraseña antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Método para obtener datos públicos del usuario
userSchema.methods.toPublicJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.apiKeys;
  return user;
};

export default mongoose.model<IUser>('User', userSchema); 