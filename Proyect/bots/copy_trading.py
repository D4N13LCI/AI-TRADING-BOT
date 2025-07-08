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
import requests
import json

from utils import RiskManager, TradeLogger

# Cargar variables de entorno
load_dotenv()

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('copy_trading.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class CopyTradingBot:
    """
    Bot de copy-trading que replica operaciones de traders expertos
    Monitorea las operaciones de líderes y las replica proporcionalmente
    """
    
    def __init__(self, api_key: str = None, api_secret: str = None):
        """
        Inicializa el bot de copy-trading
        
        Args:
            api_key: API key de Binance
            api_secret: API secret de Binance
        """
        self.api_key = api_key or os.getenv('BINANCE_API_KEY')
        self.api_secret = api_secret or os.getenv('BINANCE_API_SECRET')
        
        # Configurar cliente de Binance
        try:
            self.client = Client(self.api_key, self.api_secret)
            logger.info("Bot de copy-trading inicializado")
        except Exception as e:
            logger.error(f"Error inicializando cliente Binance: {e}")
            raise
        
        # Configuración de copy-trading
        self.leaders = self.load_leaders()
        self.followers = self.load_followers()
        self.copy_ratio = 0.1  # 10% del tamaño de operación del líder
        self.max_leaders = 5  # Máximo número de líderes a seguir
        self.min_leader_balance = 1000  # Balance mínimo del líder en USDT
        
        # Estado del bot
        self.active_copies = {}
        self.trade_history = []
        self.is_running = False
        
        # Estadísticas
        self.total_copies = 0
        self.successful_copies = 0
        self.total_profit = 0.0
        
    def load_leaders(self) -> List[Dict]:
        """
        Carga la lista de traders líderes desde configuración
        
        Returns:
            Lista de líderes con sus configuraciones
        """
        # En un sistema real, esto vendría de una base de datos
        # Por ahora usamos una configuración hardcodeada
        return [
            {
                'id': 'leader_1',
                'name': 'CryptoMaster',
                'api_key': os.getenv('LEADER_1_API_KEY'),
                'api_secret': os.getenv('LEADER_1_API_SECRET'),
                'min_trade_size': 50,  # USDT
                'max_trade_size': 500,  # USDT
                'risk_level': 'medium',
                'performance_score': 0.85
            },
            {
                'id': 'leader_2',
                'name': 'BitcoinTrader',
                'api_key': os.getenv('LEADER_2_API_KEY'),
                'api_secret': os.getenv('LEADER_2_API_SECRET'),
                'min_trade_size': 100,
                'max_trade_size': 1000,
                'risk_level': 'high',
                'performance_score': 0.92
            }
        ]
    
    def load_followers(self) -> List[Dict]:
        """
        Carga la lista de seguidores desde configuración
        
        Returns:
            Lista de seguidores con sus configuraciones
        """
        # En un sistema real, esto vendría de una base de datos
        return [
            {
                'id': 'follower_1',
                'api_key': self.api_key,
                'api_secret': self.api_secret,
                'copy_ratio': 0.1,  # 10% del tamaño del líder
                'max_daily_copies': 10,
                'risk_tolerance': 'medium'
            }
        ]
    
    def get_leader_trades(self, leader: Dict, hours_back: int = 24) -> List[Dict]:
        """
        Obtiene las operaciones recientes de un líder
        
        Args:
            leader: Información del líder
            hours_back: Horas hacia atrás para buscar operaciones
            
        Returns:
            Lista de operaciones del líder
        """
        try:
            # En un sistema real, esto se haría a través de la API del líder
            # Por ahora simulamos obteniendo datos de Binance
            leader_client = Client(leader['api_key'], leader['api_secret'])
            
            # Obtener órdenes recientes
            orders = leader_client.get_all_orders(limit=50)
            
            trades = []
            cutoff_time = datetime.now() - timedelta(hours=hours_back)
            
            for order in orders:
                if order['status'] == 'FILLED':
                    order_time = datetime.fromtimestamp(order['time'] / 1000)
                    if order_time > cutoff_time:
                        trade = {
                            'symbol': order['symbol'],
                            'side': order['side'],
                            'quantity': float(order['executedQty']),
                            'price': float(order['price']),
                            'time': order_time,
                            'order_id': order['orderId']
                        }
                        trades.append(trade)
            
            return trades
            
        except Exception as e:
            logger.error(f"Error obteniendo trades del líder {leader['name']}: {e}")
            return []
    
    def calculate_leader_performance(self, leader: Dict) -> float:
        """
        Calcula el rendimiento de un líder
        
        Args:
            leader: Información del líder
            
        Returns:
            Score de rendimiento (0-1)
        """
        try:
            # Obtener trades recientes
            trades = self.get_leader_trades(leader, hours_back=168)  # 1 semana
            
            if not trades:
                return 0.0
            
            # Calcular métricas
            total_trades = len(trades)
            winning_trades = 0
            total_pnl = 0.0
            
            for i in range(1, len(trades)):
                prev_trade = trades[i-1]
                current_trade = trades[i]
                
                if prev_trade['symbol'] == current_trade['symbol']:
                    # Calcular P&L
                    if prev_trade['side'] == 'BUY' and current_trade['side'] == 'SELL':
                        pnl = (current_trade['price'] - prev_trade['price']) * prev_trade['quantity']
                        total_pnl += pnl
                        if pnl > 0:
                            winning_trades += 1
            
            if total_trades == 0:
                return 0.0
            
            win_rate = winning_trades / total_trades
            avg_pnl = total_pnl / total_trades if total_trades > 0 else 0
            
            # Score basado en win rate y P&L promedio
            performance_score = (win_rate * 0.7) + (min(avg_pnl / 100, 1.0) * 0.3)
            
            return max(0.0, min(1.0, performance_score))
            
        except Exception as e:
            logger.error(f"Error calculando rendimiento del líder: {e}")
            return 0.0
    
    def should_copy_trade(self, trade: Dict, leader: Dict) -> bool:
        """
        Determina si se debe copiar una operación
        
        Args:
            trade: Operación del líder
            leader: Información del líder
            
        Returns:
            True si se debe copiar la operación
        """
        try:
            # Verificar tamaño mínimo de operación
            trade_value = trade['quantity'] * trade['price']
            if trade_value < leader['min_trade_size']:
                return False
            
            # Verificar tamaño máximo de operación
            if trade_value > leader['max_trade_size']:
                return False
            
            # Verificar si ya copiamos esta operación
            trade_id = f"{leader['id']}_{trade['order_id']}"
            if trade_id in self.active_copies:
                return False
            
            # Verificar rendimiento del líder
            performance = self.calculate_leader_performance(leader)
            if performance < 0.6:  # Mínimo 60% de rendimiento
                return False
            
            # Verificar límite diario de copias
            today = datetime.now().date()
            today_copies = sum(1 for copy in self.active_copies.values() 
                             if copy['date'].date() == today)
            
            if today_copies >= 10:  # Máximo 10 copias por día
                return False
            
            return True
            
        except Exception as e:
            logger.error(f"Error evaluando copia de trade: {e}")
            return False
    
    def copy_trade(self, trade: Dict, leader: Dict, follower: Dict) -> bool:
        """
        Copia una operación del líder
        
        Args:
            trade: Operación del líder
            leader: Información del líder
            follower: Información del seguidor
            
        Returns:
            True si la copia fue exitosa
        """
        try:
            # Calcular cantidad a copiar
            original_value = trade['quantity'] * trade['price']
            copy_value = original_value * follower['copy_ratio']
            copy_quantity = copy_value / trade['price']
            
            # Redondear cantidad según reglas del exchange
            copy_quantity = self.round_quantity(copy_quantity, trade['symbol'])
            
            if copy_quantity <= 0:
                logger.warning(f"Cantidad de copia demasiado pequeña: {copy_quantity}")
                return False
            
            # Ejecutar orden de copia
            if trade['side'] == 'BUY':
                order = self.client.order_market_buy(
                    symbol=trade['symbol'],
                    quantity=copy_quantity
                )
            else:
                order = self.client.order_market_sell(
                    symbol=trade['symbol'],
                    quantity=copy_quantity
                )
            
            # Registrar copia
            copy_id = f"{leader['id']}_{trade['order_id']}"
            copy_info = {
                'copy_id': copy_id,
                'leader_id': leader['id'],
                'leader_name': leader['name'],
                'symbol': trade['symbol'],
                'side': trade['side'],
                'quantity': copy_quantity,
                'price': trade['price'],
                'original_trade': trade,
                'date': datetime.now(),
                'status': 'open'
            }
            
            self.active_copies[copy_id] = copy_info
            
            # Log de la operación
            TradeLogger.log_trade(
                symbol=trade['symbol'],
                side=trade['side'].lower(),
                quantity=copy_quantity,
                price=trade['price'],
                strategy=f"copy_trading_{leader['name']}"
            )
            
            logger.info(f"Trade copiado: {trade['side']} {copy_quantity} {trade['symbol']} @ {trade['price']} (Líder: {leader['name']})")
            
            return True
            
        except BinanceAPIException as e:
            logger.error(f"Error de API al copiar trade: {e}")
            return False
        except Exception as e:
            logger.error(f"Error inesperado al copiar trade: {e}")
            return False
    
    def close_copied_trade(self, copy_info: Dict, current_price: float) -> bool:
        """
        Cierra una operación copiada
        
        Args:
            copy_info: Información de la copia
            current_price: Precio actual
            
        Returns:
            True si el cierre fue exitoso
        """
        try:
            side = 'SELL' if copy_info['side'] == 'BUY' else 'BUY'
            quantity = copy_info['quantity']
            symbol = copy_info['symbol']
            
            # Ejecutar orden de cierre
            if side == 'BUY':
                order = self.client.order_market_buy(
                    symbol=symbol,
                    quantity=quantity
                )
            else:
                order = self.client.order_market_sell(
                    symbol=symbol,
                    quantity=quantity
                )
            
            # Calcular P&L
            entry_price = copy_info['price']
            if copy_info['side'] == 'BUY':
                pnl = (current_price - entry_price) * quantity
            else:
                pnl = (entry_price - current_price) * quantity
            
            # Actualizar estadísticas
            self.total_copies += 1
            if pnl > 0:
                self.successful_copies += 1
            self.total_profit += pnl
            
            # Registrar en historial
            trade_record = {
                'copy_id': copy_info['copy_id'],
                'leader_name': copy_info['leader_name'],
                'symbol': symbol,
                'side': copy_info['side'],
                'quantity': quantity,
                'entry_price': entry_price,
                'exit_price': current_price,
                'pnl': pnl,
                'entry_time': copy_info['date'],
                'exit_time': datetime.now(),
                'strategy': f"copy_trading_{copy_info['leader_name']}"
            }
            self.trade_history.append(trade_record)
            
            # Log de la operación
            TradeLogger.log_trade(
                symbol=symbol,
                side=side.lower(),
                quantity=quantity,
                price=current_price,
                strategy=f"copy_trading_{copy_info['leader_name']}"
            )
            
            logger.info(f"Trade copiado cerrado: {side} {quantity} {symbol} @ {current_price}, P&L: {pnl:.8f}")
            
            # Eliminar de copias activas
            if copy_info['copy_id'] in self.active_copies:
                del self.active_copies[copy_info['copy_id']]
            
            return True
            
        except BinanceAPIException as e:
            logger.error(f"Error de API al cerrar trade copiado: {e}")
            return False
        except Exception as e:
            logger.error(f"Error inesperado al cerrar trade copiado: {e}")
            return False
    
    def should_close_copied_trade(self, copy_info: Dict, current_price: float) -> bool:
        """
        Determina si se debe cerrar una operación copiada
        
        Args:
            copy_info: Información de la copia
            current_price: Precio actual
            
        Returns:
            True si se debe cerrar la operación
        """
        try:
            entry_price = copy_info['price']
            entry_time = copy_info['date']
            
            # Calcular P&L
            if copy_info['side'] == 'BUY':
                pnl_percentage = (current_price - entry_price) / entry_price
            else:
                pnl_percentage = (entry_price - current_price) / entry_price
            
            # Verificar tiempo máximo (2 horas)
            time_in_position = (datetime.now() - entry_time).total_seconds()
            if time_in_position > 7200:  # 2 horas
                logger.info(f"Cerrando trade copiado por tiempo máximo: {copy_info['symbol']}")
                return True
            
            # Verificar take profit (3%)
            if pnl_percentage >= 0.03:
                logger.info(f"Cerrando trade copiado por take profit: {copy_info['symbol']}")
                return True
            
            # Verificar stop loss (2%)
            if pnl_percentage <= -0.02:
                logger.info(f"Cerrando trade copiado por stop loss: {copy_info['symbol']}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error evaluando cierre de trade copiado: {e}")
            return False
    
    def round_quantity(self, quantity: float, symbol: str) -> float:
        """
        Redondea la cantidad según las reglas del exchange
        
        Args:
            quantity: Cantidad original
            symbol: Símbolo del trading
            
        Returns:
            Cantidad redondeada
        """
        try:
            # Obtener información del símbolo
            symbol_info = self.client.get_symbol_info(symbol)
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
    
    def execute_copy_trading(self):
        """
        Ejecuta la estrategia de copy-trading
        """
        try:
            # Verificar copias activas
            for copy_id, copy_info in list(self.active_copies.items()):
                current_price = self.get_current_price(copy_info['symbol'])
                if current_price and self.should_close_copied_trade(copy_info, current_price):
                    self.close_copied_trade(copy_info, current_price)
            
            # Buscar nuevas operaciones de líderes
            for leader in self.leaders:
                if len(self.active_copies) >= self.max_leaders:
                    break
                
                # Obtener trades recientes del líder
                recent_trades = self.get_leader_trades(leader, hours_back=1)
                
                for trade in recent_trades:
                    if self.should_copy_trade(trade, leader):
                        # Copiar trade para cada seguidor
                        for follower in self.followers:
                            if self.copy_trade(trade, leader, follower):
                                break  # Solo copiar una vez por trade
            
        except Exception as e:
            logger.error(f"Error ejecutando copy-trading: {e}")
    
    def get_current_price(self, symbol: str) -> Optional[float]:
        """
        Obtiene el precio actual de un símbolo
        
        Args:
            symbol: Símbolo del trading
            
        Returns:
            Precio actual o None si hay error
        """
        try:
            ticker = self.client.get_symbol_ticker(symbol=symbol)
            return float(ticker['price'])
        except Exception as e:
            logger.error(f"Error obteniendo precio actual: {e}")
            return None
    
    def get_statistics(self) -> Dict:
        """
        Obtiene estadísticas del bot de copy-trading
        
        Returns:
            Dict con estadísticas
        """
        success_rate = (self.successful_copies / self.total_copies * 100) if self.total_copies > 0 else 0
        
        return {
            'total_copies': self.total_copies,
            'successful_copies': self.successful_copies,
            'success_rate': success_rate,
            'total_profit': self.total_profit,
            'active_copies': len(self.active_copies),
            'leaders_count': len(self.leaders),
            'followers_count': len(self.followers),
            'is_running': self.is_running
        }
    
    def start(self):
        """
        Inicia el bot de copy-trading
        """
        logger.info("Iniciando bot de copy-trading...")
        self.is_running = True
        
        # Programar ejecución cada 2 minutos
        schedule.every(2).minutes.do(self.execute_copy_trading)
        
        try:
            while self.is_running:
                schedule.run_pending()
                time.sleep(1)
        except KeyboardInterrupt:
            logger.info("Deteniendo bot de copy-trading...")
            self.stop()
        except Exception as e:
            logger.error(f"Error en el bot: {e}")
            self.stop()
    
    def stop(self):
        """
        Detiene el bot de copy-trading
        """
        logger.info("Deteniendo bot de copy-trading...")
        self.is_running = False
        
        # Cerrar copias activas
        for copy_id, copy_info in self.active_copies.items():
            current_price = self.get_current_price(copy_info['symbol'])
            if current_price:
                self.close_copied_trade(copy_info, current_price)

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
        bot = CopyTradingBot()
        bot.start()
        
    except Exception as e:
        logger.error(f"Error en main: {e}")

if __name__ == "__main__":
    main() 