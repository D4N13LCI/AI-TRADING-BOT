import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import { 
  User, 
  Bot, 
  Trade, 
  BotStats, 
  MarketData, 
  TokenInfo, 
  RevenueDistribution,
  ApiResponse 
} from '@/types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        const token = localStorage.getItem('authToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: any) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    const response = await this.client.post('/api/auth/login', { email, password });
    return response.data;
  }

  async register(email: string, password: string, walletAddress?: string): Promise<ApiResponse<{ token: string; user: User }>> {
    const response = await this.client.post('/api/auth/register', { email, password, walletAddress });
    return response.data;
  }

  async logout(): Promise<ApiResponse<void>> {
    const response = await this.client.post('/api/auth/logout');
    return response.data;
  }

  // User endpoints
  async getProfile(): Promise<ApiResponse<User>> {
    const response = await this.client.get('/api/user/profile');
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.client.put('/api/user/profile', data);
    return response.data;
  }

  // Bot endpoints
  async getBots(): Promise<ApiResponse<Bot[]>> {
    const response = await this.client.get('/api/bots');
    return response.data;
  }

  async getBot(id: string): Promise<ApiResponse<Bot>> {
    const response = await this.client.get(`/api/bots/${id}`);
    return response.data;
  }

  async createBot(data: Partial<Bot>): Promise<ApiResponse<Bot>> {
    const response = await this.client.post('/api/bots', data);
    return response.data;
  }

  async updateBot(id: string, data: Partial<Bot>): Promise<ApiResponse<Bot>> {
    const response = await this.client.put(`/api/bots/${id}`, data);
    return response.data;
  }

  async deleteBot(id: string): Promise<ApiResponse<void>> {
    const response = await this.client.delete(`/api/bots/${id}`);
    return response.data;
  }

  async getBotStats(id: string): Promise<ApiResponse<BotStats>> {
    const response = await this.client.get(`/api/bots/${id}/stats`);
    return response.data;
  }

  async testBot(id: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    const response = await this.client.post(`/api/bots/${id}/test`);
    return response.data;
  }

  // Trade endpoints
  async getTrades(filters?: {
    botId?: string;
    symbol?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Trade[]>> {
    const response = await this.client.get('/api/trades', { params: filters });
    return response.data;
  }

  async getTrade(id: string): Promise<ApiResponse<Trade>> {
    const response = await this.client.get(`/api/trades/${id}`);
    return response.data;
  }

  // Market data endpoints
  async getMarketData(symbols?: string[]): Promise<ApiResponse<MarketData[]>> {
    const response = await this.client.get('/api/market/data', { 
      params: { symbols: symbols?.join(',') } 
    });
    return response.data;
  }

  async getChartData(symbol: string, interval: string, limit: number = 100): Promise<ApiResponse<any[]>> {
    const response = await this.client.get(`/api/market/chart/${symbol}`, {
      params: { interval, limit }
    });
    return response.data;
  }

  // Token endpoints
  async getTokenInfo(): Promise<ApiResponse<TokenInfo>> {
    const response = await this.client.get('/api/token/info');
    return response.data;
  }

  async getRevenueDistribution(): Promise<ApiResponse<RevenueDistribution>> {
    const response = await this.client.get('/api/token/revenue');
    return response.data;
  }

  async claimRewards(): Promise<ApiResponse<{ success: boolean; amount: number }>> {
    const response = await this.client.post('/api/token/claim');
    return response.data;
  }

  // WebSocket connection for real-time data
  getWebSocketUrl(): string {
    return process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
  }
}

export const apiClient = new ApiClient();
export default apiClient; 