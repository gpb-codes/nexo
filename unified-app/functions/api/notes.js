import { requireUser } from "../_lib/application/current-user.js";
import { useCases } from "../_lib/application/container.js";
import { fail, ok, readJson } from "../_lib/infrastructure/http/response.js";

export async function onRequestGet(context) {
  try {
    const user = await requireUser(context.env, context.request);
    const id = new URL(context.request.url).searchParams.get("id");
    if (id) return ok({ note: await useCases.notes.get(context.env, user.id, id) });
    return ok({ notes: await useCases.notes.list(context.env, user.id) });
  } catch (error) { return fail(error); }
}

export async function onRequestPost(context) {
  try {
    const user = await requireUser(context.env, context.request);
    return ok({ note: await useCases.notes.create(context.env, user.id, await readJson(context.request)) }, 201);
  } catch (error) { return fail(error); }
}

export async function onRequestDelete(context) {
  try {
    const user = await requireUser(context.env, context.request);
    const body = await readJson(context.request);
    await useCases.notes.delete(context.env, user.id, String(body.id || "").trim());
    return ok({ message: "Nota eliminada." });
  } catch (error) { return fail(error); }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
