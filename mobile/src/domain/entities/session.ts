export type AuthUser = {
  id: string;
  name: string;
  email: string;
  displayName?: string;
  avatar?: string;
  accent?: string;
  theme?: string;
  site?: {
    name?: string;
    tagline?: string;
    description?: string;
  };
};

export type LoginInput = { email: string; password: string };
export type RegisterInput = { name: string; email: string; password: string };
export type SessionResult = { user: AuthUser; token: string; expiresAt: string };
