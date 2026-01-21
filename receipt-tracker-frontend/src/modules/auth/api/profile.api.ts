import { api } from '@/lib/api/api';
import type { User } from '../types/auth.types';

export interface UpdateProfileRequest {
  name?: string;
}

export const profileApi = {
  getProfile: async (): Promise<User> => {
    return api.get<User>('/api/auth/profile');
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    return api.patch<User>('/api/auth/profile', data);
  },
};
