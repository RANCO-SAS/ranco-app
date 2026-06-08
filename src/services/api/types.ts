export type ApiResponse<T> = {
  status: string;
  status_reason: string;
  data: T | null;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

export type ApiAuthResponse = {
  user: {
    id: string;
    fullName: string;
    avatarUrl?: string | null;
    email?: string;
  };
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};
