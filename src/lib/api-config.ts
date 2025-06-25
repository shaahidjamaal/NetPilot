// API Configuration for NetPilot Frontend
// This allows switching between local Next.js API and external NestJS backend

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  headers: Record<string, string>;
}

// Environment-based configuration
const getApiConfig = (): ApiConfig => {
  // Check if we should use external backend
  const useExternalBackend = process.env.NEXT_PUBLIC_USE_EXTERNAL_BACKEND === 'true';
  const externalApiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (useExternalBackend) {
    if (!externalApiUrl || externalApiUrl.trim() === '') {
      console.error('❌ NEXT_PUBLIC_API_URL is required when NEXT_PUBLIC_USE_EXTERNAL_BACKEND=true');
      throw new Error('External backend URL is not configured. Please set NEXT_PUBLIC_API_URL in your .env.local file.');
    }

    return {
      baseUrl: externalApiUrl.trim(),
      timeout: 30000, // Increased timeout to 30 seconds
      headers: {
        'Content-Type': 'application/json',
      }
    };
  }

  // Default to local Next.js API routes
  return {
    baseUrl: '/api',
    timeout: 30000, // Increased timeout to 30 seconds
    headers: {
      'Content-Type': 'application/json',
    }
  };
};

export const apiConfig = getApiConfig();

// API client with automatic token handling
class ApiClient {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' 
      ? localStorage.getItem('netpilot-token') 
      : null;
    
    return token 
      ? { ...this.config.headers, Authorization: `Bearer ${token}` }
      : this.config.headers;
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const url = `${this.config.baseUrl}${endpoint}`;

    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, this.config.timeout);

    try {
      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);

      // Provide more specific error messages
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.config.timeout}ms. Please check if your backend is running at ${this.config.baseUrl}`);
      } else if (error.message.includes('fetch')) {
        throw new Error(`Network error: Unable to connect to ${this.config.baseUrl}. Please check if your backend is running and CORS is configured.`);
      } else {
        throw new Error(`Request failed: ${error.message}`);
      }
    }
  }

  async get(endpoint: string): Promise<Response> {
    return this.makeRequest(endpoint, { method: 'GET' });
  }

  async post(endpoint: string, data?: any): Promise<Response> {
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put(endpoint: string, data?: any): Promise<Response> {
    return this.makeRequest(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete(endpoint: string): Promise<Response> {
    return this.makeRequest(endpoint, { method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(apiConfig);

// Helper function to handle API responses
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

    try {
      const errorData = await response.json();
      if (errorData.message) {
        if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(', ');
        } else {
          errorMessage = errorData.message;
        }
      }
    } catch (e) {
      // If we can't parse the error response, use the default message
      console.warn('Could not parse error response:', e);
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

// Authentication API endpoints
export const authApi = {
  register: (data: any) => apiClient.post('/auth/register', data),
  login: (data: any) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  profile: () => apiClient.get('/auth/profile'),
  me: () => apiClient.get('/users/me'),
};

// Utility to check if using external backend
export const isUsingExternalBackend = () => {
  return process.env.NEXT_PUBLIC_USE_EXTERNAL_BACKEND === 'true';
};
