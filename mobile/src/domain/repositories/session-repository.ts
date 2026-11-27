import type { AuthUser, LoginInput, RegisterInput, SessionResult } from "../entities/session";

export interface SessionRepository {
  login(input: LoginInput): Promise<SessionResult>;
  register(input: RegisterInput): Promise<SessionResult>;
  logout(): Promise<void>;
  me(): Promise<AuthUser>;
}
