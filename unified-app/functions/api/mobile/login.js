import { useCases } from "../../_lib/application/container.js";
import { fail, ok, readJson } from "../../_lib/infrastructure/http/response.js";

export async function onRequestPost(context) {
  try {
    const { user, token, expires } = await useCases.auth.login(context.env, await readJson(context.request));
    return ok({ user, token, expiresAt: expires.toISOString() });
  } catch (error) {
    return fail(error);
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
