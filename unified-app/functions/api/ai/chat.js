import { requireUser } from "../../_lib/application/current-user.js";
import { useCases } from "../../_lib/application/container.js";
import { fail, ok, readJson } from "../../_lib/infrastructure/http/response.js";

export async function onRequestPost(context) {
  try {
    const user = await requireUser(context.env, context.request);
    const body = await readJson(context.request);
    const result = await useCases.ai.chat(user, body);
    return ok(result);
  } catch (error) {
    return fail(error);
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
