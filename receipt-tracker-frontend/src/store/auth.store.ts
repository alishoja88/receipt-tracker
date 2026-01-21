import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/modules/auth/types/auth.types';
import { authApi } from '@/modules/auth/api/auth.api';
import { profileApi } from '@/modules/auth/api/profile.api';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  refreshTimer: ReturnType<typeof setTimeout> | null;

  setAuth: (accessToken: string, refreshToken: string, user?: User) => void;
  loginWithGoogle: () => void;
  handleCallback: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  setupTokenRefresh: (accessToken: string) => void;
  clearRefreshTimer: () => void;
  updateUserName: (name: string) => Promise<void>;
  fetchUserProfile: () => Promise<void>;
}

/**
 * Decode JWT token to get expiry time
 */
const getTokenExpiry = (token: string): number | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null; // Convert to milliseconds
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      refreshTimer: null,

      setAuth: (accessToken, refreshToken, user) => {
        console.log('🔐 SET AUTH - Setting authentication tokens');
        set({
          accessToken,
          refreshToken,
          user: user || null,
          isAuthenticated: true,
        });
        // Setup automatic token refresh
        get().setupTokenRefresh(accessToken);
      },

      loginWithGoogle: () => {
        authApi.loginWithGoogle();
      },

      handleCallback: async (accessToken, refreshToken) => {
        console.log('🔐 HANDLE CALLBACK - Processing OAuth callback with tokens');
        console.log(
          '🔐 HANDLE CALLBACK - Access Token (first 50 chars):',
          accessToken.substring(0, 50) + '...',
        );

        // Store tokens
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });

        // Setup automatic token refresh
        get().setupTokenRefresh(accessToken);

        // Fetch user info from token (decode JWT or call API)
        // For now, we'll decode from JWT token
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]));
          console.log('🔐 JWT PAYLOAD DECODED:', payload);
          console.log('🔐 User ID from JWT:', payload.sub);
          console.log('🔐 User Email from JWT:', payload.email);

          const user: User = {
            id: payload.sub,
            email: payload.email,
            name: payload.email.split('@')[0], // Fallback name
          };

          console.log('🔐 Temporary user object created:', user);
          set({ user });
        } catch (error) {
          console.error('❌ Failed to decode user from token:', error);
        }
      },

      logout: async () => {
        console.log('🚪 LOGOUT - Logging out user...');
        // Clear refresh timer
        get().clearRefreshTimer();

        const { refreshToken } = get();
        if (refreshToken) {
          try {
            console.log('🚪 LOGOUT - Revoking refresh token on server...');
            await authApi.logout(refreshToken);
            console.log('✅ LOGOUT - Refresh token revoked successfully');
          } catch (error) {
            console.error('❌ LOGOUT - Error revoking token:', error);
          }
        }
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          refreshTimer: null,
        });
        console.log('✅ LOGOUT - User logged out successfully');
      },

      refreshAccessToken: async () => {
        console.log('🔄 REFRESH TOKEN - Starting token refresh...');
        const { refreshToken } = get();
        if (!refreshToken) {
          console.error('❌ REFRESH TOKEN - No refresh token available');
          throw new Error('No refresh token available');
        }

        try {
          console.log('🔄 REFRESH TOKEN - Calling backend to refresh token...');
          const { accessToken } = await authApi.refreshToken(refreshToken);
          console.log('✅ REFRESH TOKEN - New access token received');
          set({ accessToken });
          // Setup new refresh timer for the new token
          get().setupTokenRefresh(accessToken);
          console.log('✅ REFRESH TOKEN - Token refresh completed successfully');
        } catch (error) {
          console.error('❌ REFRESH TOKEN - Refresh failed:', error);
          console.log('🚪 REFRESH TOKEN - Logging out user due to refresh failure');
          // Refresh failed, logout
          get().logout();
          throw error;
        }
      },

      setupTokenRefresh: (accessToken: string) => {
        console.log('⏰ SETUP TOKEN REFRESH - Setting up automatic token refresh...');
        // Clear existing timer
        get().clearRefreshTimer();

        const expiry = getTokenExpiry(accessToken);
        if (!expiry) {
          console.warn(
            '⚠️ SETUP TOKEN REFRESH - Could not decode token expiry, token refresh may not work',
          );
          return;
        }

        const now = Date.now();
        const timeUntilExpiry = expiry - now;

        // Refresh token 1 minute before it expires
        const refreshTime = timeUntilExpiry - 60 * 1000; // 1 minute before expiry

        if (refreshTime <= 0) {
          // Token already expired or about to expire, refresh immediately
          console.log(
            '⚠️ SETUP TOKEN REFRESH - Token expired or about to expire, refreshing immediately...',
          );
          get().refreshAccessToken().catch(console.error);
          return;
        }

        const minutesUntilRefresh = Math.round(refreshTime / 1000 / 60);
        const minutesUntilExpiry = Math.round(timeUntilExpiry / 1000 / 60);
        const expiryDate = new Date(expiry);
        console.log(`⏰ SETUP TOKEN REFRESH - Token refresh scheduled:`);
        console.log(`   - Refresh in: ${minutesUntilRefresh} minutes`);
        console.log(`   - Token expires in: ${minutesUntilExpiry} minutes`);
        console.log(`   - Token expires at: ${expiryDate.toLocaleString()}`);

        const timer = setTimeout(() => {
          console.log(
            '⏰ SETUP TOKEN REFRESH - Timer triggered! Auto-refreshing token before expiry...',
          );
          get()
            .refreshAccessToken()
            .catch(error => {
              console.error('❌ SETUP TOKEN REFRESH - Auto token refresh failed:', error);
            });
        }, refreshTime);

        set({ refreshTimer: timer });
        console.log('✅ SETUP TOKEN REFRESH - Timer setup completed');
      },

      clearRefreshTimer: () => {
        const { refreshTimer } = get();
        if (refreshTimer) {
          console.log('🧹 CLEAR TIMER - Clearing existing refresh timer');
          clearTimeout(refreshTimer);
          set({ refreshTimer: null });
        }
      },

      updateUserName: async (name: string) => {
        console.log('📝 UPDATE USER NAME - Updating user name...');
        try {
          const updatedUser = await profileApi.updateProfile({ name });
          set({ user: updatedUser });
          console.log('✅ UPDATE USER NAME - User name updated successfully');
        } catch (error) {
          console.error('❌ UPDATE USER NAME - Failed to update user name:', error);
          throw error;
        }
      },

      fetchUserProfile: async () => {
        console.log('👤 FETCH USER PROFILE - Fetching user profile...');
        console.log('👤 Current access token:', get().accessToken?.substring(0, 50) + '...');
        try {
          const user = await profileApi.getProfile();
          console.log('✅ FETCH USER PROFILE - User profile fetched successfully');
          console.log('👤 Profile API returned:', {
            id: user.id,
            email: user.email,
            name: user.name,
            googleId: user.googleId,
          });
          set({ user });
          console.log('👤 User state updated in store');
        } catch (error) {
          console.error('❌ FETCH USER PROFILE - Failed to fetch user profile:', error);
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: state => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
