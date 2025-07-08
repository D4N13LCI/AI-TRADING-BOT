import pandas as pd
import numpy as np
import ta
from typing import Dict, List, Tuple, Optional
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TradingIndicators:
    """Clase para calcular indicadores técnicos de trading"""
    
    @staticmethod
    def compute_rsi(prices: pd.Series, period: int = 14) -> pd.Series:
        """
        Calcula el RSI (Relative Strength Index)
        
        Args:
            prices: Serie de precios
            period: Período para el cálculo (default: 14)
            
        Returns:
            Serie con valores RSI
        """
        try:
            deltas = prices.diff()
            gain = deltas.clip(lower=0).rolling(window=period).mean()
            loss = -deltas.clip(upper=0).rolling(window=period).mean()
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs))
            return rsi
        except Exception as e:
            logger.error(f"Error calculando RSI: {e}")
            return pd.Series([np.nan] * len(prices))
    
    @staticmethod
    def compute_ema(prices: pd.Series, period: int = 20) -> pd.Series:
        """
        Calcula la EMA (Exponential Moving Average)
        
        Args:
            prices: Serie de precios
            period: Período para el cálculo (default: 20)
            
        Returns:
            Serie con valores EMA
        """
        try:
            return prices.ewm(span=period).mean()
        except Exception as e:
            logger.error(f"Error calculando EMA: {e}")
            return pd.Series([np.nan] * len(prices))
    
    @staticmethod
    def compute_sma(prices: pd.Series, period: int = 20) -> pd.Series:
        """
        Calcula la SMA (Simple Moving Average)
        
        Args:
            prices: Serie de precios
            period: Período para el cálculo (default: 20)
            
        Returns:
            Serie con valores SMA
        """
        try:
            return prices.rolling(window=period).mean()
        except Exception as e:
            logger.error(f"Error calculando SMA: {e}")
            return pd.Series([np.nan] * len(prices))
    
    @staticmethod
    def compute_bollinger_bands(prices: pd.Series, period: int = 20, std_dev: int = 2) -> Tuple[pd.Series, pd.Series, pd.Series]:
        """
        Calcula las Bandas de Bollinger
        
        Args:
            prices: Serie de precios
            period: Período para el cálculo (default: 20)
            std_dev: Desviación estándar (default: 2)
            
        Returns:
            Tuple con (banda_superior, banda_media, banda_inferior)
        """
        try:
            sma = prices.rolling(window=period).mean()
            std = prices.rolling(window=period).std()
            upper_band = sma + (std * std_dev)
            lower_band = sma - (std * std_dev)
            return upper_band, sma, lower_band
        except Exception as e:
            logger.error(f"Error calculando Bollinger Bands: {e}")
            return pd.Series([np.nan] * len(prices)), pd.Series([np.nan] * len(prices)), pd.Series([np.nan] * len(prices))
    
    @staticmethod
    def compute_macd(prices: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> Tuple[pd.Series, pd.Series, pd.Series]:
        """
        Calcula el MACD
        
        Args:
            prices: Serie de precios
            fast: EMA rápida (default: 12)
            slow: EMA lenta (default: 26)
            signal: EMA de señal (default: 9)
            
        Returns:
            Tuple con (macd_line, signal_line, histogram)
        """
        try:
            ema_fast = prices.ewm(span=fast).mean()
            ema_slow = prices.ewm(span=slow).mean()
            macd_line = ema_fast - ema_slow
            signal_line = macd_line.ewm(span=signal).mean()
            histogram = macd_line - signal_line
            return macd_line, signal_line, histogram
        except Exception as e:
            logger.error(f"Error calculando MACD: {e}")
            return pd.Series([np.nan] * len(prices)), pd.Series([np.nan] * len(prices)), pd.Series([np.nan] * len(prices))

class SignalGenerator:
    """Clase para generar señales de trading basadas en indicadores"""
    
    @staticmethod
    def rsi_ema_signal(data: pd.DataFrame, rsi_period: int = 14, ema_period: int = 20) -> str:
        """
        Genera señal basada en RSI y EMA
        
        Args:
            data: DataFrame con columnas ['close', 'high', 'low', 'volume']
            rsi_period: Período para RSI
            ema_period: Período para EMA
            
        Returns:
            'buy', 'sell', o 'hold'
        """
        try:
            if len(data) < max(rsi_period, ema_period):
                return 'hold'
            
            close_prices = data['close']
            ema = TradingIndicators.compute_ema(close_prices, ema_period)
            rsi = TradingIndicators.compute_rsi(close_prices, rsi_period)
            
            latest = len(data) - 1
            
            # Señal de compra: precio por encima de EMA y RSI en sobreventa
            if (close_prices.iloc[latest] > ema.iloc[latest] and 
                rsi.iloc[latest] < 30):
                return 'buy'
            
            # Señal de venta: precio por debajo de EMA y RSI en sobrecompra
            elif (close_prices.iloc[latest] < ema.iloc[latest] and 
                  rsi.iloc[latest] > 70):
                return 'sell'
            
            return 'hold'
            
        except Exception as e:
            logger.error(f"Error generando señal RSI/EMA: {e}")
            return 'hold'
    
    @staticmethod
    def momentum_signal(data: pd.DataFrame, period: int = 14) -> str:
        """
        Genera señal basada en momentum
        
        Args:
            data: DataFrame con columnas ['close', 'high', 'low', 'volume']
            period: Período para el cálculo
            
        Returns:
            'buy', 'sell', o 'hold'
        """
        try:
            if len(data) < period:
                return 'hold'
            
            close_prices = data['close']
            momentum = close_prices - close_prices.shift(period)
            
            latest = len(data) - 1
            prev = latest - 1
            
            # Señal de compra: momentum positivo y creciente
            if (momentum.iloc[latest] > 0 and 
                momentum.iloc[latest] > momentum.iloc[prev]):
                return 'buy'
            
            # Señal de venta: momentum negativo y decreciente
            elif (momentum.iloc[latest] < 0 and 
                  momentum.iloc[latest] < momentum.iloc[prev]):
                return 'sell'
            
            return 'hold'
            
        except Exception as e:
            logger.error(f"Error generando señal momentum: {e}")
            return 'hold'
    
    @staticmethod
    def scalping_signal(data: pd.DataFrame, spread_threshold: float = 0.001) -> str:
        """
        Genera señal de scalping basada en spreads
        
        Args:
            data: DataFrame con columnas ['close', 'high', 'low', 'volume']
            spread_threshold: Umbral mínimo de spread
            
        Returns:
            'buy', 'sell', o 'hold'
        """
        try:
            if len(data) < 2:
                return 'hold'
            
            latest = len(data) - 1
            current_price = data['close'].iloc[latest]
            prev_price = data['close'].iloc[latest - 1]
            
            spread = abs(current_price - prev_price) / prev_price
            
            if spread > spread_threshold:
                # Si el precio subió significativamente, vender
                if current_price > prev_price:
                    return 'sell'
                # Si el precio bajó significativamente, comprar
                else:
                    return 'buy'
            
            return 'hold'
            
        except Exception as e:
            logger.error(f"Error generando señal scalping: {e}")
            return 'hold'

class RiskManager:
    """Clase para gestión de riesgo"""
    
    @staticmethod
    def calculate_position_size(balance: float, risk_percentage: float = 0.02, 
                              stop_loss_percentage: float = 0.05) -> float:
        """
        Calcula el tamaño de posición basado en gestión de riesgo
        
        Args:
            balance: Balance disponible
            risk_percentage: Porcentaje de riesgo por operación (default: 2%)
            stop_loss_percentage: Porcentaje de stop loss (default: 5%)
            
        Returns:
            Tamaño de posición calculado
        """
        try:
            risk_amount = balance * risk_percentage
            position_size = risk_amount / stop_loss_percentage
            return min(position_size, balance * 0.1)  # Máximo 10% del balance
        except Exception as e:
            logger.error(f"Error calculando tamaño de posición: {e}")
            return 0
    
    @staticmethod
    def calculate_stop_loss(entry_price: float, side: str, 
                           stop_loss_percentage: float = 0.05) -> float:
        """
        Calcula el precio de stop loss
        
        Args:
            entry_price: Precio de entrada
            side: 'buy' o 'sell'
            stop_loss_percentage: Porcentaje de stop loss
            
        Returns:
            Precio de stop loss
        """
        try:
            if side == 'buy':
                return entry_price * (1 - stop_loss_percentage)
            else:
                return entry_price * (1 + stop_loss_percentage)
        except Exception as e:
            logger.error(f"Error calculando stop loss: {e}")
            return 0
    
    @staticmethod
    def calculate_take_profit(entry_price: float, side: str, 
                             take_profit_percentage: float = 0.10) -> float:
        """
        Calcula el precio de take profit
        
        Args:
            entry_price: Precio de entrada
            side: 'buy' o 'sell'
            take_profit_percentage: Porcentaje de take profit
            
        Returns:
            Precio de take profit
        """
        try:
            if side == 'buy':
                return entry_price * (1 + take_profit_percentage)
            else:
                return entry_price * (1 - take_profit_percentage)
        except Exception as e:
            logger.error(f"Error calculando take profit: {e}")
            return 0

class TradeLogger:
    """Clase para logging de operaciones"""
    
    @staticmethod
    def log_trade(symbol: str, side: str, quantity: float, price: float, 
                  strategy: str, timestamp: str = None) -> Dict:
        """
        Registra una operación de trading
        
        Args:
            symbol: Par de trading
            side: 'buy' o 'sell'
            quantity: Cantidad
            price: Precio
            strategy: Estrategia utilizada
            timestamp: Timestamp (opcional)
            
        Returns:
            Dict con información de la operación
        """
        if timestamp is None:
            timestamp = pd.Timestamp.now().isoformat()
        
        trade = {
            'symbol': symbol,
            'side': side,
            'quantity': quantity,
            'price': price,
            'strategy': strategy,
            'timestamp': timestamp,
            'total_value': quantity * price
        }
        
        logger.info(f"Trade ejecutado: {trade}")
        return trade 