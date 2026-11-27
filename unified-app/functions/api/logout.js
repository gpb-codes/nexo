import { useCases } from "../_lib/application/container.js";
import { buildClearCookie, getRequestToken, isSecureRequest } from "../_lib/infrastructure/security/session.js";
import { fail, json } from "../_lib/infrastructure/http/response.js";

export async function onRequestPost(context) {
  try {
    await useCases.auth.logout(context.env, getRequestToken(context.request));
    return json({ ok: true }, 200, { "Set-Cookie": buildClearCookie(isSecureRequest(context.request)) });
  } catch (error) {
    return fail(error);
  }
}

export async function onRequestGet(context) {
  return onRequestPost(context);
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
