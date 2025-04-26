import axios from 'axios';
import crypto from 'crypto';

// MoonXBT API configuration
const API_KEY = process.env.NEXT_PUBLIC_MOONXBT_API_KEY;
const API_SECRET = process.env.NEXT_PUBLIC_MOONXBT_API_SECRET;
const API_PASSPHRASE = process.env.NEXT_PUBLIC_MOONXBT_API_PASSPHRASE;
const BASE_URL = 'https://api.moonxbt.com'; // Replace with actual MoonXBT API base URL

// Error handling
class MoonXBTApiError extends Error {
  constructor(message: string, public statusCode?: number, public response?: any) {
    super(message);
    this.name = 'MoonXBTApiError';
  }
}

// Generate signature for API authentication
const generateSignature = (timestamp: string, method: string, requestPath: string, body: string = '') => {
  if (!API_SECRET) {
    throw new MoonXBTApiError('API_SECRET is not configured');
  }
  
  const message = timestamp + method.toUpperCase() + requestPath + body;
  return crypto
    .createHmac('sha256', API_SECRET)
    .update(message)
    .digest('base64');
};

// Create headers for API requests
const createHeaders = (method: string, path: string, body: string = '') => {
  if (!API_KEY || !API_PASSPHRASE) {
    throw new MoonXBTApiError('API credentials are not properly configured');
  }

  const timestamp = Date.now().toString();
  const signature = generateSignature(timestamp, method, path, body);

  return {
    'MX-APIKEY': API_KEY,
    'MX-TIMESTAMP': timestamp,
    'MX-SIGNATURE': signature,
    'MX-PASSPHRASE': API_PASSPHRASE,
    'Content-Type': 'application/json',
  };
};

// API client instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  async (config) => {
    const method = config.method?.toUpperCase() || 'GET';
    const path = config.url || '';
    const body = config.data ? JSON.stringify(config.data) : '';
    
    config.headers = {
      ...config.headers,
      ...createHeaders(method, path, body),
    };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      throw new MoonXBTApiError(
        error.response.data.message || 'API request failed',
        error.response.status,
        error.response.data
      );
    }
    throw new MoonXBTApiError(error.message || 'Network error');
  }
);

// Example API methods
export const moonxbtApi = {
  // Get account information
  getAccountInfo: async () => {
    try {
      const response = await apiClient.get('/api/v1/account');
      return response.data;
    } catch (error) {
      if (error instanceof MoonXBTApiError) {
        throw error;
      }
      throw new MoonXBTApiError('Failed to fetch account information');
    }
  },

  // Get market data
  getMarketData: async (symbol: string) => {
    try {
      const response = await apiClient.get(`/api/v1/market/ticker/${symbol}`);
      return response.data;
    } catch (error) {
      if (error instanceof MoonXBTApiError) {
        throw error;
      }
      throw new MoonXBTApiError(`Failed to fetch market data for ${symbol}`);
    }
  },

  // Place a new order
  placeOrder: async (orderData: {
    symbol: string;
    side: 'buy' | 'sell';
    type: 'limit' | 'market';
    quantity: number;
    price?: number;
  }) => {
    try {
      const response = await apiClient.post('/api/v1/order', orderData);
      return response.data;
    } catch (error) {
      if (error instanceof MoonXBTApiError) {
        throw error;
      }
      throw new MoonXBTApiError('Failed to place order');
    }
  },
};

export default moonxbtApi; 