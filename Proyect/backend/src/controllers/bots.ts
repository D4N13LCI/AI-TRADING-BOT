import { Request, Response } from 'express';
import Bot from '../models/Bot';
import Trade from '../models/Trade';
import BinanceService from '../services/BinanceService';

export class BotsController {
  /**
   * Obtiene todos los bots del usuario
   */
  static async getUserBots(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const bots = await Bot.find({ userId }).sort({ createdAt: -1 });
      
      res.json({
        success: true,
        data: bots.map(bot => bot.toPublicJSON()),
      });
    } catch (error) {
      console.error('Error obteniendo bots:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  /**
   * Crea un nuevo bot
   */
  static async createBot(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const {
        name,
        strategy,
        symbol,
        interval,
        settings,
      } = req.body;

      // Validar datos requeridos
      if (!name || !strategy || !symbol || !interval) {
        res.status(400).json({ error: 'Faltan datos requeridos' });
        return;
      }

      // Validar estrategia
      const validStrategies = ['scalping', 'momentum', 'rsi_ema', 'copy_trading'];
      if (!validStrategies.includes(strategy)) {
        res.status(400).json({ error: 'Estrategia no válida' });
        return;
      }

      // Validar intervalo
      const validIntervals = ['1m', '5m', '15m', '1h', '4h', '1d'];
      if (!validIntervals.includes(interval)) {
        res.status(400).json({ error: 'Intervalo no válido' });
        return;
      }

      // Crear bot
      const bot = new Bot({
        userId,
        name,
        strategy,
        symbol: symbol.toUpperCase(),
        interval,
        settings: settings || {},
      });

      await bot.save();

      res.status(201).json({
        success: true,
        data: bot.toPublicJSON(),
      });
    } catch (error) {
      console.error('Error creando bot:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  /**
   * Actualiza un bot
   */
  static async updateBot(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const botId = req.params.id;

      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const bot = await Bot.findOne({ _id: botId, userId });
      if (!bot) {
        res.status(404).json({ error: 'Bot no encontrado' });
        return;
      }

      const {
        name,
        strategy,
        symbol,
        interval,
        settings,
        isActive,
      } = req.body;

      // Actualizar campos permitidos
      if (name) bot.name = name;
      if (strategy) bot.strategy = strategy;
      if (symbol) bot.symbol = symbol.toUpperCase();
      if (interval) bot.interval = interval;
      if (settings) bot.settings = { ...bot.settings, ...settings };
      if (typeof isActive === 'boolean') bot.isActive = isActive;

      await bot.save();

      res.json({
        success: true,
        data: bot.toPublicJSON(),
      });
    } catch (error) {
      console.error('Error actualizando bot:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  /**
   * Elimina un bot
   */
  static async deleteBot(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const botId = req.params.id;

      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const bot = await Bot.findOne({ _id: botId, userId });
      if (!bot) {
        res.status(404).json({ error: 'Bot no encontrado' });
        return;
      }

      // Verificar que el bot no esté activo
      if (bot.isActive) {
        res.status(400).json({ error: 'No se puede eliminar un bot activo' });
        return;
      }

      await bot.deleteOne();

      res.json({
        success: true,
        message: 'Bot eliminado correctamente',
      });
    } catch (error) {
      console.error('Error eliminando bot:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  /**
   * Activa/desactiva un bot
   */
  static async toggleBot(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const botId = req.params.id;

      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const bot = await Bot.findOne({ _id: botId, userId });
      if (!bot) {
        res.status(404).json({ error: 'Bot no encontrado' });
        return;
      }

      bot.isActive = !bot.isActive;
      await bot.save();

      res.json({
        success: true,
        data: {
          id: bot._id,
          isActive: bot.isActive,
        },
        message: `Bot ${bot.isActive ? 'activado' : 'desactivado'} correctamente`,
      });
    } catch (error) {
      console.error('Error cambiando estado del bot:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  /**
   * Obtiene estadísticas de un bot
   */
  static async getBotStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const botId = req.params.id;

      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const bot = await Bot.findOne({ _id: botId, userId });
      if (!bot) {
        res.status(404).json({ error: 'Bot no encontrado' });
        return;
      }

      // Obtener trades del bot
      const trades = await Trade.find({
        userId,
        strategy: bot.strategy,
        symbol: bot.symbol,
      }).sort({ createdAt: -1 }).limit(100);

      // Calcular estadísticas adicionales
      const totalTrades = trades.length;
      const winningTrades = trades.filter(t => (t.pnl || 0) > 0).length;
      const totalProfit = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
      const avgProfit = totalTrades > 0 ? totalProfit / totalTrades : 0;

      const stats = {
        bot: bot.toPublicJSON(),
        trades: {
          total: totalTrades,
          winning: winningTrades,
          winRate: totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0,
          totalProfit,
          avgProfit,
        },
        recentTrades: trades.slice(0, 10).map(t => t.toPublicJSON()),
      };

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas del bot:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  /**
   * Ejecuta una operación de prueba del bot
   */
  static async testBot(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const botId = req.params.id;

      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const bot = await Bot.findOne({ _id: botId, userId });
      if (!bot) {
        res.status(404).json({ error: 'Bot no encontrado' });
        return;
      }

      // Obtener datos de mercado para la prueba
      const binanceService = new BinanceService();
      await binanceService.connect();

      try {
        const marketData = await binanceService.getMarketData(bot.symbol);
        const klines = await binanceService.getKlines(bot.symbol, bot.interval, 50);

        // Simular análisis de la estrategia
        const analysis = {
          symbol: bot.symbol,
          currentPrice: marketData.price,
          strategy: bot.strategy,
          signal: 'hold', // En una implementación real, aquí se ejecutaría la lógica de la estrategia
          confidence: 0.5,
          marketConditions: {
            volume: marketData.volume,
            change24h: marketData.change24h,
            volatility: Math.abs(marketData.change24h),
          },
        };

        res.json({
          success: true,
          data: {
            bot: bot.toPublicJSON(),
            analysis,
            marketData,
          },
        });
      } finally {
        binanceService.disconnect();
      }
    } catch (error) {
      console.error('Error probando bot:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  /**
   * Obtiene el historial de trades de un bot
   */
  static async getBotTrades(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const botId = req.params.id;
      const { page = 1, limit = 20 } = req.query;

      if (!userId) {
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
      }

      const bot = await Bot.findOne({ _id: botId, userId });
      if (!bot) {
        res.status(404).json({ error: 'Bot no encontrado' });
        return;
      }

      const skip = (Number(page) - 1) * Number(limit);
      
      const trades = await Trade.find({
        userId,
        strategy: bot.strategy,
        symbol: bot.symbol,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await Trade.countDocuments({
        userId,
        strategy: bot.strategy,
        symbol: bot.symbol,
      });

      res.json({
        success: true,
        data: {
          trades: trades.map(t => t.toPublicJSON()),
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error) {
      console.error('Error obteniendo trades del bot:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

export default BotsController; 