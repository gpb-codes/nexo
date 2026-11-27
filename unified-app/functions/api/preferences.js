import { requireUser } from "../_lib/application/current-user.js";
import { useCases } from "../_lib/application/container.js";
import { fail, ok, readJson } from "../_lib/infrastructure/http/response.js";

export async function onRequestGet(context) {
  try {
    const user = await requireUser(context.env, context.request);
    return ok({ site: await useCases.preferences.get(context.env, user.id) });
  } catch (error) { return fail(error); }
}

export async function onRequestPut(context) {
  try {
    const user = await requireUser(context.env, context.request);
    const site = await useCases.preferences.update(context.env, user.id, await readJson(context.request));
    return ok({ message: "Preferencias actualizadas.", site });
  } catch (error) { return fail(error); }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
