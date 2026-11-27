import type { AuthUser, LoginInput, RegisterInput, SessionResult } from "../../domain/entities/session";
import type { SessionRepository } from "../../domain/repositories/session-repository";
import { api } from "../api/client";
import { endpoints } from "../api/endpoints";
import { clearSessionToken, setSessionToken } from "../storage/session-store";

export class ApiSessionRepository implements SessionRepository {
  async login(input: LoginInput): Promise<SessionResult> {
    const data = await api<{ ok: boolean; user: AuthUser; token: string; expiresAt: string }>(
      endpoints.mobileLogin,
      { method: "POST", body: JSON.stringify(input) },
    );
    await setSessionToken(data.token);
    return { user: data.user, token: data.token, expiresAt: data.expiresAt };
  }

  async register(input: RegisterInput): Promise<SessionResult> {
    const data = await api<{ ok: boolean; user: AuthUser; token: string; expiresAt: string }>(
      endpoints.mobileRegister,
      { method: "POST", body: JSON.stringify(input) },
    );
    await setSessionToken(data.token);
    return { user: data.user, token: data.token, expiresAt: data.expiresAt };
  }

  async logout(): Promise<void> {
    try {
      await api(endpoints.logout, { method: "POST" });
    } catch {
      // La revocación local continúa aunque falle la red.
    }
    await clearSessionToken();
  }

  async me(): Promise<AuthUser> {
    const data = await api<{ ok: boolean; user: AuthUser }>(endpoints.me);
    return data.user;
  }
}
