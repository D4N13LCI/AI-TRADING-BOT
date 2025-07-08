# Trade Bionic - Sistema Automatizado de Trading

Un sistema completo de trading automatizado que combina estrategias algorítmicas y copy-trading, integra con exchanges populares, emite un token ERC-20 para distribución de beneficios, y ofrece una interfaz web moderna con conexión Web3.

## 🚀 Características Principales

- **Trading Algorítmico**: Bots automatizados con estrategias de scalping, momentum y RSI/EMA
- **Copy-Trading**: Réplica automática de operaciones de traders expertos
- **Integración Multi-Exchange**: Soporte para Binance, Bybit y otros exchanges
- **Token ERC-20 ($ONIC)**: Token de participación con distribución automática de ganancias
- **Dashboard Web3**: Interfaz moderna con conexión de wallets y reclamación de recompensas
- **Smart Contracts**: Distribución transparente y auditable de beneficios

## 📁 Estructura del Proyecto

```
/project-root
├─ bots/                     # Bots de trading en Python
├─ backend/                  # Servidor API (TypeScript/Node)
├─ frontend/                 # Next.js / React (TypeScript)
└─ smart-contracts/         # Contratos Solidity
```

## 🛠️ Tecnologías Utilizadas

- **Backend**: Node.js, TypeScript, Express
- **Frontend**: Next.js, React, TypeScript, Web3Modal
- **Blockchain**: Solidity, OpenZeppelin, ethers.js
- **Trading**: Python, pandas, ccxt, python-binance
- **Base de Datos**: MongoDB/PostgreSQL
- **Gráficos**: Chart.js, Recharts

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- Python 3.8+
- MetaMask o wallet compatible
- Cuenta en exchange (Binance/Bybit)

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd trade-bionic
```

2. **Instalar dependencias del backend**
```bash
cd backend
npm install
```

3. **Instalar dependencias del frontend**
```bash
cd ../frontend
npm install
```

4. **Instalar dependencias de Python**
```bash
cd ../bots
pip install -r requirements.txt
```

5. **Configurar variables de entorno**
```bash
# Backend (.env)
DATABASE_URL=mongodb://localhost:27017/trade-bionic
BINANCE_API_KEY=your_binance_api_key
BINANCE_SECRET_KEY=your_binance_secret_key
JWT_SECRET=your_jwt_secret

# Frontend (.env.local)
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
NEXT_PUBLIC_RPC_URL=your_ethereum_rpc_url
```

## 🏃‍♂️ Ejecución

### Backend
```bash
cd backend
npm run dev
```

### Frontend
```bash
cd frontend
npm run dev
```

### Bots de Trading
```bash
cd bots
python scalping_bot.py
python momentum_bot.py
python copy_trading.py
```

## 📊 Modelo de Distribución de Ganancias

- **40%** - Distribuido a holders del token $ONIC
- **35%** - Reinvertido en el portafolio
- **15%** - Costos operativos
- **9%** - Marketing
- **1%** - Caridad

## 🔐 Seguridad

- Claves API encriptadas en base de datos
- Autenticación JWT
- Validación de transacciones blockchain
- Auditoría completa de operaciones

## 📈 Estrategias de Trading

### Algorítmicas
- **Scalping**: Operaciones rápidas basadas en spreads
- **Momentum**: Seguimiento de tendencias fuertes
- **RSI/EMA**: Combinación de indicadores técnicos

### Copy-Trading
- Selección de traders expertos
- Réplica proporcional de operaciones
- Gestión de riesgo por trader

## 🎯 Roadmap

- [ ] Integración con más exchanges
- [ ] Estrategias de trading avanzadas
- [ ] Panel administrativo
- [ ] Mobile app
- [ ] Análisis de sentimiento
- [ ] Machine Learning para predicciones

## 📄 Licencia

MIT License

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, lee las guías de contribución antes de enviar un pull request.

## 📞 Soporte

Para soporte técnico o preguntas, contacta al equipo de desarrollo. 