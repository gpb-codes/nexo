import { api, endpoints, ApiError } from "../api/client";
import { clearSessionToken, setSessionToken } from "../storage/session";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  displayName?: string;
  avatar?: string;
  accent?: string;
  theme?: string;
};

type AuthResponse = { ok: boolean; user: AuthUser; token: string; expiresAt: string };

async function persist(response: AuthResponse) {
  await setSessionToken(response.token);
  return response.user;
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const response = await api<AuthResponse>(endpoints.mobileLogin, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return persist(response);
}

export async function register(name: string, email: string, password: string): Promise<AuthUser> {
  const response = await api<AuthResponse>(endpoints.mobileRegister, {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  return persist(response);
}

export async function logout(): Promise<void> {
  try {
    await api(endpoints.logout, { method: "POST" });
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 401)) {
      // La revocación local continúa aunque falle la red.
    }
  }
  await clearSessionToken();
}
