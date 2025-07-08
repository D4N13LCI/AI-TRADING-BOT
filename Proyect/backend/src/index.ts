import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';

import config, { validateConfig } from './config';

// Importar rutas
import authRoutes from './routes/auth';
import botsRoutes from './routes/bots';
import tradesRoutes from './routes/trades';
import usersRoutes from './routes/users';
import marketRoutes from './routes/market';

// Importar middleware
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

class App {
  public app: express.Application;
  public server: any;
  public io: Server;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new Server(this.server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeSocketIO();
  }

  private initializeMiddlewares(): void {
    // Seguridad
    this.app.use(helmet());
    
    // CORS
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    }));

    // Compresión
    this.app.use(compression());

    // Logging
    this.app.use(morgan('combined'));

    // Parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      });
    });
  }

  private initializeRoutes(): void {
    // Rutas públicas
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/market', marketRoutes);

    // Rutas protegidas
    this.app.use('/api/bots', authMiddleware, botsRoutes);
    this.app.use('/api/trades', authMiddleware, tradesRoutes);
    this.app.use('/api/users', authMiddleware, usersRoutes);
  }

  private initializeErrorHandling(): void {
    // Manejador de errores global
    this.app.use(errorHandler);

    // Manejador de rutas no encontradas
    this.app.use('*', (req, res) => {
      res.status(404).json({ error: 'Ruta no encontrada' });
    });
  }

  private initializeSocketIO(): void {
    this.io.on('connection', (socket) => {
      console.log('Cliente conectado:', socket.id);

      // Unirse a sala de trading
      socket.on('join-trading', (data) => {
        socket.join(`trading-${data.userId}`);
        console.log(`Usuario ${data.userId} se unió a trading`);
      });

      // Salir de sala de trading
      socket.on('leave-trading', (data) => {
        socket.leave(`trading-${data.userId}`);
        console.log(`Usuario ${data.userId} salió de trading`);
      });

      // Desconexión
      socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
      });
    });
  }

  public async connectDatabase(): Promise<void> {
    try {
      await mongoose.connect(config.mongoUri);
      console.log('Conectado a MongoDB');
    } catch (error) {
      console.error('Error conectando a MongoDB:', error);
      process.exit(1);
    }
  }

  public async start(): Promise<void> {
    try {
      // Validar configuración
      validateConfig();

      // Conectar a base de datos
      await this.connectDatabase();

      // Iniciar servidor
      const port = config.port;
      this.server.listen(port, () => {
        console.log(`Servidor ejecutándose en puerto ${port}`);
        console.log(`Ambiente: ${config.nodeEnv}`);
        console.log(`Health check: http://localhost:${port}/health`);
      });
    } catch (error) {
      console.error('Error iniciando servidor:', error);
      process.exit(1);
    }
  }

  public getIO(): Server {
    return this.io;
  }
}

// Crear y ejecutar aplicación
const app = new App();

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  app.server.close(() => {
    console.log('Servidor cerrado');
    mongoose.connection.close();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT recibido, cerrando servidor...');
  app.server.close(() => {
    console.log('Servidor cerrado');
    mongoose.connection.close();
    process.exit(0);
  });
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promesa rechazada no manejada:', reason);
  process.exit(1);
});

// Iniciar aplicación
app.start().catch((error) => {
  console.error('Error fatal:', error);
  process.exit(1);
});

export default app; 