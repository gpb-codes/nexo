import { requireUser } from "../_lib/application/current-user.js";
import { useCases } from "../_lib/application/container.js";
import { fail, ok, readJson } from "../_lib/infrastructure/http/response.js";

export async function onRequestGet(context) {
  try {
    const user = await requireUser(context.env, context.request);
    return ok({ projects: await useCases.projects.list(context.env, user.id) });
  } catch (error) { return fail(error); }
}

export async function onRequestPost(context) {
  try {
    const user = await requireUser(context.env, context.request);
    return ok({ project: await useCases.projects.create(context.env, user.id, await readJson(context.request)) }, 201);
  } catch (error) { return fail(error); }
}

export async function onRequestPut(context) {
  try {
    const user = await requireUser(context.env, context.request);
    const body = await readJson(context.request);
    await useCases.projects.update(context.env, user.id, String(body.id || "").trim(), body);
    return ok({ message: "Proyecto actualizado." });
  } catch (error) { return fail(error); }
}

export async function onRequestDelete(context) {
  try {
    const user = await requireUser(context.env, context.request);
    const body = await readJson(context.request);
    await useCases.projects.delete(context.env, user.id, String(body.id || "").trim());
    return ok({ message: "Proyecto eliminado." });
  } catch (error) { return fail(error); }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
