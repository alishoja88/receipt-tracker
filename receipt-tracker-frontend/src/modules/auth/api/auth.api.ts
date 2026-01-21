import { api } from '@/lib/api/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const authApi = {
  /**
   * Redirect to Google OAuth
   */
  loginWithGoogle: () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    return api.post<{ accessToken: string }>('/api/auth/refresh', { refreshToken });
  },

  /**
   * Logout (revoke refresh token)
   */
  logout: async (refreshToken: string): Promise<void> => {
    await api.post<void>('/api/auth/logout', { refreshToken });
  },
};
