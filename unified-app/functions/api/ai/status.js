import { requireUser } from "../../_lib/application/current-user.js";
import { useCases } from "../../_lib/application/container.js";
import { fail, ok } from "../../_lib/infrastructure/http/response.js";

export async function onRequestGet(context) {
  try {
    const user = await requireUser(context.env, context.request);
    return ok(useCases.ai.status(user));
  } catch (error) {
    return fail(error);
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
