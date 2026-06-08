import type { AuthSession, SignInInput, SignUpInput } from '@/features/auth/types/auth.types';
import type { ApiAuthResponse } from '@/services/api/types';
import type { UserProfile } from '@/features/profile/types/profile.types';
import { apiGet, apiPublicPost } from '@/services/api/client';

export const authRepository = {
  signUp(input: SignUpInput) {
    return apiPublicPost<ApiAuthResponse>('/v1/app/auth/signup', {
      email: input.email.trim(),
      password: input.password,
      fullName: input.fullName.trim(),
    });
  },

  signIn(input: SignInInput) {
    return apiPublicPost<ApiAuthResponse>('/v1/app/auth/login', {
      email: input.email.trim(),
      password: input.password,
    });
  },

  refresh(refreshToken: string) {
    return apiPublicPost<ApiAuthResponse>('/v1/app/auth/refresh', { refreshToken });
  },

  getMe() {
    return apiGet<UserProfile>('/v1/app/profile/me');
  },
};

export function mapAuthResponse(response: ApiAuthResponse): AuthSession {
  return {
    userId: response.user.id,
    email: response.user.email ?? '',
    fullName: response.user.fullName || null,
    avatarUrl: response.user.avatarUrl ?? null,
  };
}
