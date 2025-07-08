import Binance from 'node-binance-api';
import { config } from '../config';

export interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  change24h: number;
  high24h: number;
  low24h: number;
}

export interface OrderBook {
  symbol: string;
  bids: [number, number][];
  asks: [number, number][];
  timestamp: number;
}

export interface Trade {
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  orderId: string;
  status: string;
  timestamp: number;
}

export interface AccountBalance {
  asset: string;
  free: number;
  locked: number;
  total: number;
}

export class BinanceService {
  private binance: Binance;
  private isConnected: boolean = false;

  constructor(apiKey?: string, apiSecret?: string) {
    this.binance = new Binance().options({
      APIKEY: apiKey || config.binanceApiKey,
      APISECRET: apiSecret || config.binanceApiSecret,
      useServerTime: true,
      recvWindow: 60000,
      verbose: false,
      log: console.log,
    });
  }

  /**
   * Conecta al servicio de Binance
   */
  async connect(): Promise<boolean> {
    try {
      await this.binance.ping();
      this.isConnected = true;
      console.log('Conectado a Binance API');
      return true;
    } catch (error) {
      console.error('Error conectando a Binance:', error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Verifica si está conectado
   */
  isServiceConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Obtiene el precio actual de un símbolo
   */
  async getCurrentPrice(symbol: string): Promise<number> {
    try {
      const ticker = await this.binance.prices(symbol);
      return parseFloat(ticker[symbol]);
    } catch (error) {
      console.error(`Error obteniendo precio de ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene datos de mercado para un símbolo
   */
  async getMarketData(symbol: string): Promise<MarketData> {
    try {
      const ticker = await this.binance.ticker24hr(symbol);
      
      return {
        symbol: ticker.symbol,
        price: parseFloat(ticker.lastPrice),
        volume: parseFloat(ticker.volume),
        change24h: parseFloat(ticker.priceChangePercent),
        high24h: parseFloat(ticker.highPrice),
        low24h: parseFloat(ticker.lowPrice),
      };
    } catch (error) {
      console.error(`Error obteniendo datos de mercado para ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene el order book de un símbolo
   */
  async getOrderBook(symbol: string, limit: number = 20): Promise<OrderBook> {
    try {
      const depth = await this.binance.depth(symbol, limit);
      
      return {
        symbol: symbol,
        bids: depth.bids.map((bid: string[]) => [parseFloat(bid[0]), parseFloat(bid[1])]),
        asks: depth.asks.map((ask: string[]) => [parseFloat(ask[0]), parseFloat(ask[1])]),
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error(`Error obteniendo order book de ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene datos históricos (klines) de un símbolo
   */
  async getKlines(symbol: string, interval: string, limit: number = 100): Promise<any[]> {
    try {
      const klines = await this.binance.candlesticks(symbol, interval, limit);
      
      return klines.map((kline: any) => ({
        timestamp: kline[0],
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5]),
        closeTime: kline[6],
        quoteAssetVolume: parseFloat(kline[7]),
        numberOfTrades: kline[8],
        takerBuyBaseAssetVolume: parseFloat(kline[9]),
        takerBuyQuoteAssetVolume: parseFloat(kline[10]),
      }));
    } catch (error) {
      console.error(`Error obteniendo klines de ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene el balance de la cuenta
   */
  async getAccountBalance(): Promise<AccountBalance[]> {
    try {
      const account = await this.binance.balance();
      
      return Object.keys(account).map(asset => ({
        asset,
        free: parseFloat(account[asset].available),
        locked: parseFloat(account[asset].onOrder),
        total: parseFloat(account[asset].available) + parseFloat(account[asset].onOrder),
      })).filter(balance => balance.total > 0);
    } catch (error) {
      console.error('Error obteniendo balance de cuenta:', error);
      throw error;
    }
  }

  /**
   * Crea una orden de mercado
   */
  async createMarketOrder(symbol: string, side: 'BUY' | 'SELL', quantity: number): Promise<Trade> {
    try {
      const order = await this.binance.marketBuy(symbol, quantity);
      
      return {
        symbol: order.symbol,
        side: order.side,
        quantity: parseFloat(order.executedQty),
        price: parseFloat(order.price),
        orderId: order.orderId,
        status: order.status,
        timestamp: order.time,
      };
    } catch (error) {
      console.error(`Error creando orden de mercado ${side} ${quantity} ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Crea una orden limit
   */
  async createLimitOrder(symbol: string, side: 'BUY' | 'SELL', quantity: number, price: number): Promise<Trade> {
    try {
      const order = await this.binance.limit(side.toLowerCase(), symbol, quantity, price);
      
      return {
        symbol: order.symbol,
        side: order.side,
        quantity: parseFloat(order.executedQty),
        price: parseFloat(order.price),
        orderId: order.orderId,
        status: order.status,
        timestamp: order.time,
      };
    } catch (error) {
      console.error(`Error creando orden limit ${side} ${quantity} ${symbol} @ ${price}:`, error);
      throw error;
    }
  }

  /**
   * Cancela una orden
   */
  async cancelOrder(symbol: string, orderId: string): Promise<boolean> {
    try {
      await this.binance.cancel(symbol, orderId);
      return true;
    } catch (error) {
      console.error(`Error cancelando orden ${orderId} de ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene el estado de una orden
   */
  async getOrderStatus(symbol: string, orderId: string): Promise<any> {
    try {
      const order = await this.binance.orderStatus(symbol, orderId);
      return order;
    } catch (error) {
      console.error(`Error obteniendo estado de orden ${orderId} de ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene el historial de órdenes
   */
  async getOrderHistory(symbol: string, limit: number = 50): Promise<Trade[]> {
    try {
      const orders = await this.binance.allOrders(symbol, limit);
      
      return orders.map((order: any) => ({
        symbol: order.symbol,
        side: order.side,
        quantity: parseFloat(order.executedQty),
        price: parseFloat(order.price),
        orderId: order.orderId,
        status: order.status,
        timestamp: order.time,
      }));
    } catch (error) {
      console.error(`Error obteniendo historial de órdenes de ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Obtiene las órdenes abiertas
   */
  async getOpenOrders(symbol?: string): Promise<Trade[]> {
    try {
      const orders = await this.binance.openOrders(symbol);
      
      return orders.map((order: any) => ({
        symbol: order.symbol,
        side: order.side,
        quantity: parseFloat(order.executedQty),
        price: parseFloat(order.price),
        orderId: order.orderId,
        status: order.status,
        timestamp: order.time,
      }));
    } catch (error) {
      console.error('Error obteniendo órdenes abiertas:', error);
      throw error;
    }
  }

  /**
   * Obtiene información del símbolo
   */
  async getSymbolInfo(symbol: string): Promise<any> {
    try {
      const info = await this.binance.exchangeInfo();
      return info.symbols.find((s: any) => s.symbol === symbol);
    } catch (error) {
      console.error(`Error obteniendo información de símbolo ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Calcula la cantidad mínima para una orden
   */
  async getMinQuantity(symbol: string): Promise<number> {
    try {
      const info = await this.getSymbolInfo(symbol);
      const lotSizeFilter = info.filters.find((f: any) => f.filterType === 'LOT_SIZE');
      return parseFloat(lotSizeFilter.minQty);
    } catch (error) {
      console.error(`Error obteniendo cantidad mínima para ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Redondea la cantidad según las reglas del exchange
   */
  async roundQuantity(symbol: string, quantity: number): Promise<number> {
    try {
      const info = await this.getSymbolInfo(symbol);
      const lotSizeFilter = info.filters.find((f: any) => f.filterType === 'LOT_SIZE');
      const stepSize = parseFloat(lotSizeFilter.stepSize);
      
      const precision = stepSize.toString().split('.')[1]?.length || 0;
      return Math.round(quantity * Math.pow(10, precision)) / Math.pow(10, precision);
    } catch (error) {
      console.error(`Error redondeando cantidad para ${symbol}:`, error);
      return quantity;
    }
  }

  /**
   * Cierra la conexión
   */
  disconnect(): void {
    this.isConnected = false;
    console.log('Desconectado de Binance API');
  }
}

export default BinanceService; 