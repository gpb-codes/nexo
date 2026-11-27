import { requireUser } from "../_lib/application/current-user.js";
import { useCases } from "../_lib/application/container.js";
import { fail, ok, readJson } from "../_lib/infrastructure/http/response.js";

export async function onRequestGet(context) {
  try {
    const user = await requireUser(context.env, context.request);
    return ok({ tasks: await useCases.tasks.list(context.env, user.id) });
  } catch (error) { return fail(error); }
}

export async function onRequestPost(context) {
  try {
    const user = await requireUser(context.env, context.request);
    const task = await useCases.tasks.create(context.env, user.id, await readJson(context.request));
    return ok({ task }, 201);
  } catch (error) { return fail(error); }
}

export async function onRequestPut(context) {
  try {
    const user = await requireUser(context.env, context.request);
    const body = await readJson(context.request);
    await useCases.tasks.update(context.env, user.id, String(body.id || "").trim(), body);
    return ok({ message: "Tarea actualizada." });
  } catch (error) { return fail(error); }
}

export async function onRequestDelete(context) {
  try {
    const user = await requireUser(context.env, context.request);
    const body = await readJson(context.request);
    await useCases.tasks.delete(context.env, user.id, String(body.id || "").trim());
    return ok({ message: "Tarea eliminada." });
  } catch (error) { return fail(error); }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
