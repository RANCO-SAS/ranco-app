export type AuthSession = {
  userId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
};

export type SignInInput = {
  email: string;
  password: string;
};

export type SignUpInput = {
  email: string;
  password: string;
  fullName: string;
};

export type ResetPasswordInput = {
  password: string;
};
