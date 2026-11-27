import { safeUser } from "../../domain/entities.js";
import { ConflictError, UnauthorizedError } from "../../domain/errors.js";
import { email as validateEmail, name as validateName, password as validatePassword } from "../../domain/validation.js";

const DEFAULT_SITE = { name: "Nexo", tagline: "Centro de operaciones", description: "Tu segundo cerebro unificado" };

export function makeAuthUseCases({ auth, security }) {
  return {
    async currentUser(env, token) {
      if (!token) throw new UnauthorizedError();
      const row = await auth.findByTokenHash(env, await security.hashToken(token));
      if (!row || row.revoked_at || new Date(row.expires_at).getTime() < Date.now()) {
        throw new UnauthorizedError();
      }
      return safeUser(row);
    },

    async login(env, input) {
      const userEmail = validateEmail(input.email);
      const userPassword = validatePassword(input.password);
      const row = await auth.findByEmail(env, userEmail);
      if (!row || !(await security.verifyPassword(userPassword, row.password))) {
        throw new UnauthorizedError("Correo o contraseña incorrectos.");
      }
      if (!String(row.password).startsWith("pbkdf2$")) {
        try {
          await auth.updateUser(env, row.id, { password: await security.hashPassword(userPassword) });
        } catch { /* non-fatal */ }
      }
      await auth.updateUser(env, row.id, { last_login: new Date().toISOString() });
      const session = await auth.createSession(env, row.id);
      const full = await auth.findByTokenHash(env, await security.hashToken(session.token));
      return { user: full ? safeUser(full) : safeUser(row), token: session.token, expires: session.expires };
    },

    async register(env, input) {
      const userName = validateName(input.name);
      const userEmail = validateEmail(input.email);
      const userPassword = validatePassword(input.password);
      if (await auth.findByEmail(env, userEmail)) {
        throw new ConflictError("No se pudo crear la cuenta. Verifica los datos.");
      }
      const created = await auth.createUser(env, {
        name: userName,
        email: userEmail,
        passwordHash: await security.hashPassword(userPassword),
      });
      try {
        await auth.upsertSiteSettings(env, created.id, DEFAULT_SITE);
      } catch { /* defaults returned even if row cannot be created */ }
      const session = await auth.createSession(env, created.id);
      const full = await auth.findByTokenHash(env, await security.hashToken(session.token));
      return {
        user: full ? safeUser(full) : { ...safeUser(created), site: DEFAULT_SITE },
        token: session.token,
        expires: session.expires,
      };
    },

    async logout(env, token) {
      if (token) await auth.revokeSession(env, await security.hashToken(token));
    },
  };
}
