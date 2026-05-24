import { useMutation } from '@tanstack/react-query';

import type { ForgotPasswordFormData } from '@/features/auth/schemas/forgot-password.schema';
import { authService } from '@/features/auth/services/auth.service';

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordFormData) => authService.resetPassword(data.email),
  });
}
