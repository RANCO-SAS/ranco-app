import * as Linking from 'expo-linking';

export function getPasswordResetRedirectUri(): string {
  return Linking.createURL('/auth/reset-password');
}
