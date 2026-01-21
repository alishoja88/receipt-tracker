import axios, { AxiosError } from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// API Response Types (for future backend standardization)
export interface ApiResponse<T> {
  success?: boolean;
  data: T | null;
  error?: {
    code: string;
    message: string;
    details: Record<string, unknown> | null;
  };
  meta?: {
    timestamp: string;
    path: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Pagination interface for list endpoints
export interface ApiPaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Extend axios config type to include _retry flag
interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Error Codes
export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  CONFLICT: 'CONFLICT',
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

// Error messages for user display
const ERROR_MESSAGES: Record<string, string> = {
  [ErrorCode.VALIDATION_ERROR]: 'Please check your input data',
  [ErrorCode.UNAUTHORIZED]: 'Please login again',
  [ErrorCode.FORBIDDEN]: 'You do not have permission for this operation',
  [ErrorCode.RESOURCE_NOT_FOUND]: 'Requested information not found',
  [ErrorCode.CONFLICT]: 'Data conflict - operation cannot be completed',
  [ErrorCode.BUSINESS_RULE_VIOLATION]: 'System rules violation',
  [ErrorCode.INTERNAL_SERVER_ERROR]: 'Server error - please try again',
  [ErrorCode.NETWORK_ERROR]: 'Connection error - please check your internet connection',
};

// Custom Error Class
export class ApiError extends Error {
  public code: string;
  public details: Record<string, unknown> | null;
  public status: number;

  constructor(
    code: string,
    message: string,
    details: Record<string, unknown> | null = null,
    status: number = 500,
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.status = status;
  }

  getLocalizedMessage(): string {
    return ERROR_MESSAGES[this.code] || this.message;
  }

  getValidationErrors(): Record<string, string> {
    if (this.code === ErrorCode.VALIDATION_ERROR && this.details) {
      return this.details as Record<string, string>;
    }
    return {};
  }
}

// API Configuration
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 30000,
};

// Flag to prevent infinite refresh loops
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

// Create axios instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add Bearer token
apiClient.interceptors.request.use(
  async config => {
    // Get token from auth store
    const { useAuthStore } = await import('@/store/auth.store');
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Development logging (skip auth requests)
    if (import.meta.env.DEV && !config.url?.includes('/auth/')) {
      console.log(`🔵 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
        params: config.params,
      });
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Response interceptor for handling errors and token refresh
apiClient.interceptors.response.use(
  response => {
    // Development logging (skip auth responses)
    if (import.meta.env.DEV && !response.config.url?.includes('/auth/')) {
      console.log(
        `🟢 API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`,
        {
          data: response.data,
        },
      );
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;

    // Development error logging (skip auth-related errors)
    if (import.meta.env.DEV && !originalRequest?.url?.includes('/auth/')) {
      console.log(
        `🔴 API Error: ${error.response?.status} ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`,
        {
          error: error.response?.data,
          config: originalRequest,
        },
      );
    }

    // Handle 401 Unauthorized - refresh token
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const isAuthEndpoint =
        originalRequest.url?.includes('/api/auth/refresh') ||
        originalRequest.url?.includes('/api/auth/logout');

      if (!isAuthEndpoint) {
        originalRequest._retry = true;

        // If already refreshing, wait for the existing refresh to complete
        if (isRefreshing && refreshPromise) {
          try {
            await refreshPromise;
            const { useAuthStore } = await import('@/store/auth.store');
            const newToken = useAuthStore.getState().accessToken;
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return apiClient(originalRequest);
            }
          } catch {
            // Refresh failed, will be handled below
          }
        } else {
          // Start new refresh
          isRefreshing = true;
          refreshPromise = (async () => {
            try {
              const { useAuthStore } = await import('@/store/auth.store');
              await useAuthStore.getState().refreshAccessToken();
            } catch (refreshError) {
              console.error('Token refresh failed, logging out user:', refreshError);
              const { useAuthStore } = await import('@/store/auth.store');
              await useAuthStore.getState().logout();

              // Dispatch custom event for React Router navigation
              if (window.location.pathname !== '/login') {
                window.dispatchEvent(
                  new CustomEvent('auth:logout', {
                    detail: { redirectTo: '/login' },
                  }),
                );
              }
              throw refreshError;
            } finally {
              isRefreshing = false;
              refreshPromise = null;
            }
          })();

          try {
            await refreshPromise;
            const { useAuthStore } = await import('@/store/auth.store');
            const newToken = useAuthStore.getState().accessToken;
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return apiClient(originalRequest);
            }
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }
      }
    }

    // Transform error to ApiError
    if (error.response?.data) {
      const errorData = error.response.data as any;

      // Handle wrapped error format (future)
      if (errorData.error) {
        const { code, message, details } = errorData.error;
        throw new ApiError(
          code || ErrorCode.INTERNAL_SERVER_ERROR,
          message,
          details,
          error.response.status,
        );
      }

      // Handle current backend format
      if (errorData.message) {
        throw new ApiError(
          ErrorCode.INTERNAL_SERVER_ERROR,
          errorData.message,
          null,
          error.response.status,
        );
      }
    }

    // Handle network errors
    if (!error.response) {
      throw new ApiError(ErrorCode.NETWORK_ERROR, 'Network error occurred', null, 0);
    }

    // Fallback error
    throw new ApiError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'An unexpected error occurred',
      null,
      error.response?.status || 500,
    );
  },
);

// Helper functions for making API calls with TypeScript support
export const api = {
  // GET request with optional query parameters
  get: async <T>(url: string, params?: Record<string, unknown>): Promise<T> => {
    const response = await apiClient.get<T>(url, { params });

    // Handle direct paginated response (current backend format)
    if (
      response.data &&
      typeof response.data === 'object' &&
      'items' in response.data &&
      'pagination' in response.data
    ) {
      return response.data as T;
    }

    // Handle wrapped response format (future)
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      const wrappedData = response.data as unknown as ApiResponse<T>;
      if (wrappedData.success && wrappedData.data !== null) {
        return wrappedData.data as T;
      }
      if (wrappedData.error) {
        throw new ApiError(
          wrappedData.error.code || ErrorCode.INTERNAL_SERVER_ERROR,
          wrappedData.error.message,
          wrappedData.error.details,
          response.status,
        );
      }
    }

    // Direct data response (current backend format)
    return response.data as T;
  },

  // POST request
  post: async <T>(
    url: string,
    data?: unknown,
    config?: { headers?: Record<string, string> },
  ): Promise<T> => {
    const response = await apiClient.post<T>(url, data, config);

    // Handle wrapped response
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      const wrappedData = response.data as unknown as ApiResponse<T>;
      if (wrappedData.success && wrappedData.data !== null) {
        return wrappedData.data as T;
      }
    }

    // Handle direct data response (current backend format)
    return response.data as T;
  },

  // PATCH request
  patch: async <T>(url: string, data: unknown): Promise<T> => {
    const response = await apiClient.patch<T>(url, data);

    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      const wrappedData = response.data as unknown as ApiResponse<T>;
      if (wrappedData.success && wrappedData.data !== null) {
        return wrappedData.data as T;
      }
    }

    return response.data as T;
  },

  // PUT request
  put: async <T>(url: string, data: unknown): Promise<T> => {
    const response = await apiClient.put<T>(url, data);

    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      const wrappedData = response.data as unknown as ApiResponse<T>;
      if (wrappedData.success && wrappedData.data !== null) {
        return wrappedData.data as T;
      }
    }

    return response.data as T;
  },

  // DELETE request
  delete: async <T>(url: string): Promise<T> => {
    const response = await apiClient.delete<T>(url);

    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      const wrappedData = response.data as unknown as ApiResponse<T>;
      if (wrappedData.success && wrappedData.data !== null) {
        return wrappedData.data as T;
      }
    }

    return response.data as T;
  },
};

// Utility functions for common operations
export const ApiUtils = {
  formatError: (error: unknown): string => {
    if (error instanceof ApiError) {
      return error.getLocalizedMessage();
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unknown error occurred';
  },

  getValidationErrors: (error: unknown): Record<string, string> => {
    if (error instanceof ApiError) {
      return error.getValidationErrors();
    }
    return {};
  },

  isErrorType: (error: unknown, errorCode: ErrorCode): boolean => {
    return error instanceof ApiError && error.code === errorCode;
  },

  createQueryString: (params: Record<string, string | number | boolean>): string => {
    const filtered = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');

    return filtered ? `?${filtered}` : '';
  },

  formatPaginationParams: (
    page: number,
    limit: number = 20,
    search?: string,
  ): Record<string, string | number> => {
    const params: Record<string, string | number> = { page, limit };
    if (search && search.trim()) {
      params.search = search.trim();
    }
    return params;
  },
};

export default apiClient;
