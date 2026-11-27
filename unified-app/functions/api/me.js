import { requireUser } from "../_lib/application/current-user.js";
import { fail, ok } from "../_lib/infrastructure/http/response.js";

export async function onRequestGet(context) {
  try {
    return ok({ user: await requireUser(context.env, context.request) });
  } catch (error) {
    return fail(error);
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
