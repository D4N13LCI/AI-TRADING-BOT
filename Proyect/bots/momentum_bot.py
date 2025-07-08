import os
import time
import schedule
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
import pandas as pd
import numpy as np
from binance.client import Client
from binance.exceptions import BinanceAPIException
from dotenv import load_dotenv

from utils import SignalGenerator, RiskManager, TradeLogger, TradingIndicators

# Cargar variables de entorno
load_dotenv()

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('momentum_bot.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class MomentumBot:
    """
    Bot de trading especializado en momentum (seguimiento de tendencias)
    Identifica tendencias fuertes y sigue el impulso del mercado
    """
    
    def __init__(self, api_key: str = None, api_secret: str = None, 
                 symbol: str = 'BTCUSDT', interval: str = '5m'):
        """
        Inicializa el bot de momentum
        
        Args:
            api_key: API key de Binance
            api_secret: API secret de Binance
            symbol: Par de trading (default: BTCUSDT)
            interval: Intervalo de tiempo (default: 5m)
        """
        self.api_key = api_key or os.getenv('BINANCE_API_KEY')
        self.api_secret = api_secret or os.getenv('BINANCE_API_SECRET')
        self.symbol = symbol
        self.interval = interval
        
        # Configurar cliente de Binance
        try:
            self.client = Client(self.api_key, self.api_secret)
            logger.info(f"Bot de momentum inicializado para {symbol}")
        except Exception as e:
            logger.error(f"Error inicializando cliente Binance: {e}")
            raise
        
        # Parámetros de momentum
        self.momentum_period = 14  # Período para cálculo de momentum
        self.trend_period = 20  # Período para identificar tendencia
        self.volume_threshold = 1.5  # Multiplicador de volumen promedio
        self.min_trend_strength = 0.02  # 2% mínimo de fuerza de tendencia
        self.max_position_time = 3600  # 1 hora máximo
        
        # Estado del bot
        self.active_positions = {}
        self.trade_history = []
        self.is_running = False
        
        # Estadísticas
        self.total_trades = 0
        self.winning_trades = 0
        self.total_profit = 0.0
        
    def get_market_data(self, limit: int = 200) -> pd.DataFrame:
        """
        Obtiene datos de mercado del exchange
        
        Args:
            limit: Número de velas a obtener
            
        Returns:
            DataFrame con datos OHLCV
        """
        try:
            klines = self.client.get_klines(
                symbol=self.symbol,
                interval=self.interval,
                limit=limit
            )
            
            data = pd.DataFrame(klines, columns=[
                'timestamp', 'open', 'high', 'low', 'close', 'volume',
                'close_time', 'quote_asset_volume', 'number_of_trades',
                'taker_buy_base_asset_volume', 'taker_buy_quote_asset_volume', 'ignore'
            ])
            
            # Convertir tipos de datos
            numeric_columns = ['open', 'high', 'low', 'close', 'volume']
            for col in numeric_columns:
                data[col] = pd.to_numeric(data[col], errors='coerce')
            
            data['timestamp'] = pd.to_datetime(data['timestamp'], unit='ms')
            
            return data
            
        except BinanceAPIException as e:
            logger.error(f"Error obteniendo datos de mercado: {e}")
            return pd.DataFrame()
        except Exception as e:
            logger.error(f"Error inesperado obteniendo datos: {e}")
            return pd.DataFrame()
    
    def get_current_price(self) -> Optional[float]:
        """
        Obtiene el precio actual del símbolo
        
        Returns:
            Precio actual o None si hay error
        """
        try:
            ticker = self.client.get_symbol_ticker(symbol=self.symbol)
            return float(ticker['price'])
        except Exception as e:
            logger.error(f"Error obteniendo precio actual: {e}")
            return None
    
    def get_account_balance(self) -> Dict[str, float]:
        """
        Obtiene el balance de la cuenta
        
        Returns:
            Dict con balances de activos
        """
        try:
            account = self.client.get_account()
            balances = {}
            for balance in account['balances']:
                free = float(balance['free'])
                locked = float(balance['locked'])
                if free > 0 or locked > 0:
                    balances[balance['asset']] = free + locked
            return balances
        except Exception as e:
            logger.error(f"Error obteniendo balance: {e}")
            return {}
    
    def calculate_momentum(self, data: pd.DataFrame) -> float:
        """
        Calcula el momentum actual
        
        Args:
            data: DataFrame con datos de mercado
            
        Returns:
            Valor de momentum
        """
        try:
            if len(data) < self.momentum_period:
                return 0.0
            
            close_prices = data['close']
            momentum = close_prices - close_prices.shift(self.momentum_period)
            return momentum.iloc[-1]
            
        except Exception as e:
            logger.error(f"Error calculando momentum: {e}")
            return 0.0
    
    def calculate_trend_strength(self, data: pd.DataFrame) -> float:
        """
        Calcula la fuerza de la tendencia
        
        Args:
            data: DataFrame con datos de mercado
            
        Returns:
            Fuerza de tendencia (0-1)
        """
        try:
            if len(data) < self.trend_period:
                return 0.0
            
            close_prices = data['close']
            
            # Calcular EMA de corto y largo plazo
            ema_short = TradingIndicators.compute_ema(close_prices, 10)
            ema_long = TradingIndicators.compute_ema(close_prices, self.trend_period)
            
            # Calcular distancia entre EMAs
            ema_distance = abs(ema_short.iloc[-1] - ema_long.iloc[-1]) / ema_long.iloc[-1]
            
            return ema_distance
            
        except Exception as e:
            logger.error(f"Error calculando fuerza de tendencia: {e}")
            return 0.0
    
    def calculate_volume_ratio(self, data: pd.DataFrame) -> float:
        """
        Calcula la ratio de volumen actual vs promedio
        
        Args:
            data: DataFrame con datos de mercado
            
        Returns:
            Ratio de volumen
        """
        try:
            if len(data) < 20:
                return 1.0
            
            current_volume = data['volume'].iloc[-1]
            avg_volume = data['volume'].rolling(window=20).mean().iloc[-1]
            
            return current_volume / avg_volume if avg_volume > 0 else 1.0
            
        except Exception as e:
            logger.error(f"Error calculando ratio de volumen: {e}")
            return 1.0
    
    def should_open_position(self, data: pd.DataFrame) -> Tuple[bool, str]:
        """
        Determina si se debe abrir una posición
        
        Args:
            data: DataFrame con datos de mercado
            
        Returns:
            Tuple (debe_abrir, dirección)
        """
        try:
            # Verificar si ya hay una posición activa
            if self.symbol in self.active_positions:
                return False, 'hold'
            
            # Calcular indicadores
            momentum = self.calculate_momentum(data)
            trend_strength = self.calculate_trend_strength(data)
            volume_ratio = self.calculate_volume_ratio(data)
            
            # Verificar condiciones para compra
            if (momentum > 0 and 
                trend_strength > self.min_trend_strength and
                volume_ratio > self.volume_threshold):
                return True, 'buy'
            
            # Verificar condiciones para venta
            elif (momentum < 0 and 
                  trend_strength > self.min_trend_strength and
                  volume_ratio > self.volume_threshold):
                return True, 'sell'
            
            return False, 'hold'
            
        except Exception as e:
            logger.error(f"Error evaluando apertura de posición: {e}")
            return False, 'hold'
    
    def should_close_position(self, position: Dict, current_price: float) -> bool:
        """
        Determina si se debe cerrar una posición
        
        Args:
            position: Información de la posición
            current_price: Precio actual
            
        Returns:
            True si se debe cerrar posición
        """
        try:
            entry_price = position['entry_price']
            entry_time = position['entry_time']
            side = position['side']
            
            # Calcular P&L
            if side == 'buy':
                pnl_percentage = (current_price - entry_price) / entry_price
            else:
                pnl_percentage = (entry_price - current_price) / entry_price
            
            # Verificar tiempo máximo de posición
            time_in_position = (datetime.now() - entry_time).total_seconds()
            if time_in_position > self.max_position_time:
                logger.info(f"Cerrando posición por tiempo máximo: {self.symbol}")
                return True
            
            # Verificar take profit (5%)
            if pnl_percentage >= 0.05:
                logger.info(f"Cerrando posición por take profit: {self.symbol}")
                return True
            
            # Verificar stop loss (3%)
            if pnl_percentage <= -0.03:
                logger.info(f"Cerrando posición por stop loss: {self.symbol}")
                return True
            
            # Verificar reversión de tendencia
            data = self.get_market_data(limit=50)
            if not data.empty:
                momentum = self.calculate_momentum(data)
                if (side == 'buy' and momentum < 0) or (side == 'sell' and momentum > 0):
                    logger.info(f"Cerrando posición por reversión de tendencia: {self.symbol}")
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error evaluando cierre de posición: {e}")
            return False
    
    def open_position(self, side: str, quantity: float, price: float) -> bool:
        """
        Abre una posición en el exchange
        
        Args:
            side: 'buy' o 'sell'
            quantity: Cantidad a operar
            price: Precio de entrada
            
        Returns:
            True si la operación fue exitosa
        """
        try:
            # Crear orden de mercado
            if side == 'buy':
                order = self.client.order_market_buy(
                    symbol=self.symbol,
                    quantity=quantity
                )
            else:
                order = self.client.order_market_sell(
                    symbol=self.symbol,
                    quantity=quantity
                )
            
            # Registrar posición
            position = {
                'order_id': order['orderId'],
                'side': side,
                'quantity': quantity,
                'entry_price': price,
                'entry_time': datetime.now(),
                'status': 'open'
            }
            
            self.active_positions[self.symbol] = position
            
            # Log de la operación
            TradeLogger.log_trade(
                symbol=self.symbol,
                side=side,
                quantity=quantity,
                price=price,
                strategy='momentum'
            )
            
            logger.info(f"Posición abierta: {side} {quantity} {self.symbol} @ {price}")
            return True
            
        except BinanceAPIException as e:
            logger.error(f"Error de API al abrir posición: {e}")
            return False
        except Exception as e:
            logger.error(f"Error inesperado al abrir posición: {e}")
            return False
    
    def close_position(self, position: Dict, current_price: float) -> bool:
        """
        Cierra una posición en el exchange
        
        Args:
            position: Información de la posición
            current_price: Precio actual
            
        Returns:
            True si la operación fue exitosa
        """
        try:
            side = 'sell' if position['side'] == 'buy' else 'buy'
            quantity = position['quantity']
            
            # Crear orden de cierre
            if side == 'buy':
                order = self.client.order_market_buy(
                    symbol=self.symbol,
                    quantity=quantity
                )
            else:
                order = self.client.order_market_sell(
                    symbol=self.symbol,
                    quantity=quantity
                )
            
            # Calcular P&L
            entry_price = position['entry_price']
            if position['side'] == 'buy':
                pnl = (current_price - entry_price) * quantity
            else:
                pnl = (entry_price - current_price) * quantity
            
            # Actualizar estadísticas
            self.total_trades += 1
            if pnl > 0:
                self.winning_trades += 1
            self.total_profit += pnl
            
            # Registrar trade en historial
            trade = {
                'symbol': self.symbol,
                'side': position['side'],
                'quantity': quantity,
                'entry_price': entry_price,
                'exit_price': current_price,
                'pnl': pnl,
                'entry_time': position['entry_time'],
                'exit_time': datetime.now(),
                'strategy': 'momentum'
            }
            self.trade_history.append(trade)
            
            # Log de la operación
            TradeLogger.log_trade(
                symbol=self.symbol,
                side=side,
                quantity=quantity,
                price=current_price,
                strategy='momentum'
            )
            
            logger.info(f"Posición cerrada: {side} {quantity} {self.symbol} @ {current_price}, P&L: {pnl:.8f}")
            
            # Eliminar posición activa
            if self.symbol in self.active_positions:
                del self.active_positions[self.symbol]
            
            return True
            
        except BinanceAPIException as e:
            logger.error(f"Error de API al cerrar posición: {e}")
            return False
        except Exception as e:
            logger.error(f"Error inesperado al cerrar posición: {e}")
            return False
    
    def execute_strategy(self):
        """
        Ejecuta la estrategia de momentum
        """
        try:
            # Obtener datos de mercado
            data = self.get_market_data(limit=100)
            if data.empty:
                logger.warning("No se pudieron obtener datos de mercado")
                return
            
            current_price = self.get_current_price()
            if current_price is None:
                logger.warning("No se pudo obtener precio actual")
                return
            
            # Verificar posiciones activas
            if self.symbol in self.active_positions:
                position = self.active_positions[self.symbol]
                if self.should_close_position(position, current_price):
                    self.close_position(position, current_price)
                return
            
            # Evaluar apertura de nueva posición
            should_open, direction = self.should_open_position(data)
            
            if should_open:
                # Calcular tamaño de posición
                balances = self.get_account_balance()
                usdt_balance = balances.get('USDT', 0.0)
                
                if usdt_balance > 20:  # Mínimo $20 USDT
                    position_size = RiskManager.calculate_position_size(
                        balance=usdt_balance,
                        risk_percentage=0.02,  # 2% de riesgo
                        stop_loss_percentage=0.03  # 3% stop loss
                    )
                    
                    # Convertir a cantidad del símbolo
                    quantity = position_size / current_price
                    
                    # Redondear según las reglas del exchange
                    quantity = self.round_quantity(quantity)
                    
                    if quantity > 0:
                        self.open_position(direction, quantity, current_price)
            
        except Exception as e:
            logger.error(f"Error ejecutando estrategia: {e}")
    
    def round_quantity(self, quantity: float) -> float:
        """
        Redondea la cantidad según las reglas del exchange
        
        Args:
            quantity: Cantidad original
            
        Returns:
            Cantidad redondeada
        """
        try:
            # Obtener información del símbolo
            symbol_info = self.client.get_symbol_info(self.symbol)
            step_size = None
            
            for filter in symbol_info['filters']:
                if filter['filterType'] == 'LOT_SIZE':
                    step_size = float(filter['stepSize'])
                    break
            
            if step_size:
                # Redondear al step size más cercano
                precision = len(str(step_size).split('.')[-1].rstrip('0'))
                return round(quantity, precision)
            
            return quantity
            
        except Exception as e:
            logger.error(f"Error redondeando cantidad: {e}")
            return quantity
    
    def get_statistics(self) -> Dict:
        """
        Obtiene estadísticas del bot
        
        Returns:
            Dict con estadísticas
        """
        win_rate = (self.winning_trades / self.total_trades * 100) if self.total_trades > 0 else 0
        
        return {
            'total_trades': self.total_trades,
            'winning_trades': self.winning_trades,
            'win_rate': win_rate,
            'total_profit': self.total_profit,
            'active_positions': len(self.active_positions),
            'symbol': self.symbol,
            'is_running': self.is_running
        }
    
    def start(self):
        """
        Inicia el bot de momentum
        """
        logger.info("Iniciando bot de momentum...")
        self.is_running = True
        
        # Programar ejecución cada 5 minutos
        schedule.every(5).minutes.do(self.execute_strategy)
        
        try:
            while self.is_running:
                schedule.run_pending()
                time.sleep(1)
        except KeyboardInterrupt:
            logger.info("Deteniendo bot de momentum...")
            self.stop()
        except Exception as e:
            logger.error(f"Error en el bot: {e}")
            self.stop()
    
    def stop(self):
        """
        Detiene el bot de momentum
        """
        logger.info("Deteniendo bot de momentum...")
        self.is_running = False
        
        # Cerrar posiciones activas
        for symbol, position in self.active_positions.items():
            current_price = self.get_current_price()
            if current_price:
                self.close_position(position, current_price)

def main():
    """
    Función principal para ejecutar el bot
    """
    try:
        # Verificar variables de entorno
        api_key = os.getenv('BINANCE_API_KEY')
        api_secret = os.getenv('BINANCE_API_SECRET')
        
        if not api_key or not api_secret:
            logger.error("API_KEY y API_SECRET deben estar configurados")
            return
        
        # Crear y ejecutar bot
        bot = MomentumBot(symbol='BTCUSDT', interval='5m')
        bot.start()
        
    except Exception as e:
        logger.error(f"Error en main: {e}")

if __name__ == "__main__":
    main() 