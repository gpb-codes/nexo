/* Shared authentication helpers for Nexo (Cloudflare Pages Functions). */
const SESSION_COOKIE = "nexo_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const PBKDF2_ITERATIONS = 100000;
const SALT_BYTES = 16;

function b64(bytes) {
  let bin = "";
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) bin += String.fromCharCode(arr[i]);
  return btoa(bin);
}

function b64url(bytes) {
  return b64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64(b64str) {
  const bin = atob(b64str);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function importPbkdf2Key(password) {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const key = await importPbkdf2Key(password);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    key,
    256
  );
  return `pbkdf2$${PBKDF2_ITERATIONS}$${b64(salt)}$${b64(bits)}`;
}

export async function verifyPassword(password, stored) {
  if (typeof stored !== "string" || !stored) return false;
  if (stored.startsWith("pbkdf2$")) {
    const parts = stored.split("$");
    if (parts.length !== 4) return false;
    const iterations = Number(parts[1]);
    if (!Number.isFinite(iterations) || iterations <= 0) return false;
    let salt, expected;
    try {
      salt = fromB64(parts[2]);
      expected = fromB64(parts[3]);
    } catch {
      return false;
    }
    const key = await importPbkdf2Key(password);
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
      key,
      expected.length * 8
    );
    return timingSafeEqualBytes(new Uint8Array(bits), expected);
  }
  // Legacy SHA-256 (hex). Migrated on successful login.
  const legacy = await sha256Hex(password);
  return timingSafeEqualHex(legacy, stored);
}

function timingSafeEqualBytes(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

function timingSafeEqualHex(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function generateToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return b64url(bytes);
}

export async function hashToken(token) {
  return sha256Hex(token);
}

export function parseCookies(header) {
  const out = {};
  if (!header) return out;
  header.split(";").forEach(part => {
    const idx = part.indexOf("=");
    if (idx === -1) return;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  });
  return out;
}

export function getBearerToken(request) {
  const header = request.headers.get("Authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

export async function getSessionUser(env, request) {
  const cookies = parseCookies(request.headers.get("Cookie"));
  const token = cookies[SESSION_COOKIE] || getBearerToken(request);
  if (!token) return null;
  const tokenHash = await hashToken(token);
  let row;
  try {
    row = await env.DB.prepare(
      `SELECT s.user_id AS uid, s.expires_at AS expires_at, s.revoked_at AS revoked_at,
              u.id, u.name, u.email, u.avatar, u.accent, u.theme, u.display_name, u.created_at, u.last_login,
              u.ai_api_key, u.ai_model, u.ai_base_url,
              ss.site_name, ss.tagline, ss.description
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN site_settings ss ON ss.user_id = u.id
       WHERE s.token_hash = ?`
    ).bind(tokenHash).first();
  } catch (e) {
    return null;
  }
  if (!row) return null;
  if (row.revoked_at) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatar: row.avatar,
    accent: row.accent,
    theme: row.theme || "oscuro",
    displayName: row.display_name || row.name,
    aiApiKey: row.ai_api_key || null,
    aiModel: row.ai_model || null,
    aiBaseUrl: row.ai_base_url || null,
    createdAt: row.created_at,
    lastLogin: row.last_login,
    site: {
      name: row.site_name || "Nexo",
      tagline: row.tagline || "Centro de operaciones",
      description: row.description || "Tu segundo cerebro unificado",
    },
  };
}

export async function createSession(env, userId) {
  const token = generateToken();
  const tokenHash = await hashToken(token);
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_TTL_MS);
  const id = "s_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  await env.DB.prepare(
    "INSERT INTO sessions (id, user_id, token_hash, created_at, expires_at) VALUES (?, ?, ?, ?, ?)"
  ).bind(id, userId, tokenHash, now.toISOString(), expires.toISOString()).run();
  return { token, expires };
}

export async function revokeSession(env, request) {
  const cookies = parseCookies(request.headers.get("Cookie"));
  const token = cookies[SESSION_COOKIE] || getBearerToken(request);
  if (!token) return;
  const tokenHash = await hashToken(token);
  await env.DB.prepare("UPDATE sessions SET revoked_at = ? WHERE token_hash = ?")
    .bind(new Date().toISOString(), tokenHash).run().catch(() => {});
}

export function isSecureRequest(request) {
  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return false;
  }
}

export function buildSessionCookie(token, expires, secure) {
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    `Expires=${expires.toUTCString()}`,
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function buildClearCookie(secure) {
  const parts = [
    `${SESSION_COOKIE}=`,
    "HttpOnly",
    "Path=/",
    "SameSite=Lax",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "Max-Age=0",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export { SESSION_COOKIE };
