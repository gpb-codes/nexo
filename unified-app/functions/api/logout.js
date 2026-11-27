import { revokeSession, buildClearCookie, isSecureRequest } from "../_lib/auth.js";

const jsonHeaders = (extra = {}) => ({
  "Content-Type": "application/json",
  ...extra,
});

export async function onRequestPost(context) {
  const { request, env } = context;
  const secure = isSecureRequest(request);
  try {
    await revokeSession(env, request);
  } catch (e) { /* non-fatal */ }
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      ...jsonHeaders(),
      "Set-Cookie": buildClearCookie(secure),
    },
  });
}

export async function onRequestGet(context) {
  return onRequestPost(context);
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
