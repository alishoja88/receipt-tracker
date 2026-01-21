import { api } from '@/lib/api/api';

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export const contactApi = {
  sendMessage: async (data: ContactFormData) => {
    return api.post<void>('/api/contact', data);
  },
};
