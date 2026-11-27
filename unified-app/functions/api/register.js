import { useCases } from "../_lib/application/container.js";
import { buildSessionCookie, isSecureRequest } from "../_lib/infrastructure/security/session.js";
import { fail, json, readJson } from "../_lib/infrastructure/http/response.js";

export async function onRequestPost(context) {
  try {
    const input = await readJson(context.request);
    const { user, token, expires } = await useCases.auth.register(context.env, input);
    return json(
      { ok: true, user },
      201,
      { "Set-Cookie": buildSessionCookie(token, expires, isSecureRequest(context.request)) },
    );
  } catch (error) {
    return fail(error);
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
