import { useMutation } from '@tanstack/react-query';

import { authService } from '@/features/auth/services/auth.service';

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authService.resetPasswordForEmail(email),
  });
}
