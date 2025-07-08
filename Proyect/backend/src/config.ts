import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '../.env') });

export interface Config {
  // Servidor
  port: number;
  nodeEnv: string;
  
  // Base de datos
  mongoUri: string;
  redisUrl: string;
  
  // JWT
  jwtSecret: string;
  jwtExpiresIn: string;
  
  // Binance API
  binanceApiKey: string;
  binanceApiSecret: string;
  
  // Blockchain
  ethereumRpcUrl: string;
  contractAddress: string;
  
  // Trading
  defaultRiskPercentage: number;
  maxPositionSize: number;
  
  // Logging
  logLevel: string;
}

const config: Config = {
  // Servidor
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Base de datos
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/trade-bionic',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  
  // Binance API
  binanceApiKey: process.env.BINANCE_API_KEY || '',
  binanceApiSecret: process.env.BINANCE_API_SECRET || '',
  
  // Blockchain
  ethereumRpcUrl: process.env.ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/your-project-id',
  contractAddress: process.env.CONTRACT_ADDRESS || '',
  
  // Trading
  defaultRiskPercentage: parseFloat(process.env.DEFAULT_RISK_PERCENTAGE || '2'),
  maxPositionSize: parseFloat(process.env.MAX_POSITION_SIZE || '10'),
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
};

// Validar configuración requerida
export function validateConfig(): void {
  const requiredFields: (keyof Config)[] = [
    'jwtSecret',
    'binanceApiKey',
    'binanceApiSecret',
  ];

  for (const field of requiredFields) {
    if (!config[field]) {
      throw new Error(`Missing required configuration: ${field}`);
    }
  }

  if (config.nodeEnv === 'production' && config.jwtSecret === 'your-super-secret-jwt-key-change-in-production') {
    throw new Error('JWT_SECRET must be changed in production');
  }
}

export default config; 