import axios, { AxiosError } from 'axios';
import type { AxiosInstance } from 'axios';
import type { ApiError } from '@/types/api.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Flag to prevent infinite refresh loops
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor
apiClient.interceptors.request.use(
  async config => {
    // Get token from auth store
    const { useAuthStore } = await import('@/store/auth.store');
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Response interceptor
apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as any;

    // Skip refresh logic for auth endpoints (to prevent infinite loops)
    const isAuthEndpoint =
      originalRequest?.url?.includes('/api/auth/refresh') ||
      originalRequest?.url?.includes('/api/auth/logout');

    // If 401 and not already retrying and not an auth endpoint
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      console.log('🔒 API CLIENT - Received 401 Unauthorized, attempting token refresh...');
      originalRequest._retry = true;

      // If already refreshing, wait for the existing refresh to complete
      if (isRefreshing && refreshPromise) {
        console.log('⏳ API CLIENT - Token refresh already in progress, waiting...');
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
            console.log('✅ API CLIENT - Token refreshed successfully');
          } catch (refreshError) {
            console.error('❌ API CLIENT - Token refresh failed, logging out user:', refreshError);
            const { useAuthStore } = await import('@/store/auth.store');
            await useAuthStore.getState().logout();
            window.location.href = '/login';
            throw refreshError;
          } finally {
            isRefreshing = false;
            refreshPromise = null;
          }
        })();

        try {
          await refreshPromise;

          // Retry original request with new token
          const { useAuthStore } = await import('@/store/auth.store');
          const newToken = useAuthStore.getState().accessToken;
          if (newToken) {
            console.log('✅ API CLIENT - Retrying original request with new token...');
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          } else {
            console.error('❌ API CLIENT - No new token received after refresh');
          }
        } catch (refreshError) {
          return Promise.reject(refreshError);
        }
      }
    }

    // Transform error to consistent format
    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || 'An error occurred',
      statusCode: error.response?.status || 500,
      error: error.response?.data?.error,
    };

    return Promise.reject(apiError);
  },
);

export default apiClient;
