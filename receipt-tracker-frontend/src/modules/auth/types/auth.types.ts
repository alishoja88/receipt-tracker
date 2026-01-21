export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  googleId?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user?: User;
}
