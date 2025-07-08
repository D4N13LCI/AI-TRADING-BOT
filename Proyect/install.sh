#!/bin/bash

echo "🚀 Instalando Trade Bionic - Sistema de Trading Automatizado"
echo "=========================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js 18+ primero."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 no está instalado. Por favor instala Python 3.8+ primero."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor instala npm primero."
    exit 1
fi

echo "✅ Dependencias del sistema verificadas"

# Install backend dependencies
echo "📦 Instalando dependencias del backend..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias del backend"
    exit 1
fi
cd ..

# Install frontend dependencies
echo "📦 Instalando dependencias del frontend..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias del frontend"
    exit 1
fi
cd ..

# Install Python dependencies
echo "📦 Instalando dependencias de Python..."
cd bots
pip3 install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Error instalando dependencias de Python"
    exit 1
fi
cd ..

# Create environment files
echo "🔧 Configurando archivos de entorno..."

# Backend .env
cat > backend/.env << EOF
# Database
DATABASE_URL=mongodb://localhost:27017/trade-bionic

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Binance API
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET_KEY=your_binance_secret_key

# Server
PORT=3001
NODE_ENV=development

# WebSocket
WS_PORT=3002
EOF

# Frontend .env.local
cat > frontend/.env.local << EOF
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Web3 Configuration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-wallet-connect-project-id
NEXT_PUBLIC_CONTRACT_ADDRESS=your-onic-token-contract-address
NEXT_PUBLIC_REVENUE_DISTRIBUTOR_ADDRESS=your-revenue-distributor-contract-address
NEXT_PUBLIC_RPC_URL=https://mainnet.infura.io/v3/your-infura-project-id

# Blockchain Network
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_CHAIN_NAME=Ethereum Mainnet

# Feature Flags
NEXT_PUBLIC_ENABLE_DARK_MODE=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
EOF

echo "✅ Archivos de entorno creados"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configura las variables de entorno en backend/.env y frontend/.env.local"
echo "2. Instala MongoDB y asegúrate de que esté ejecutándose"
echo "3. Configura las claves API de Binance"
echo "4. Despliega los smart contracts en Ethereum"
echo "5. Configura WalletConnect Project ID"
echo ""
echo "🚀 Para ejecutar el sistema:"
echo "  Backend: cd backend && npm run dev"
echo "  Frontend: cd frontend && npm run dev"
echo "  Bots: cd bots && python3 scalping_bot.py"
echo ""
echo "📚 Documentación completa en README.md"
echo ""
echo "🎉 ¡Instalación completada!" 