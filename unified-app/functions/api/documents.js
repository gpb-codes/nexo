import { requireUser } from "../_lib/application/current-user.js";
import { useCases } from "../_lib/application/container.js";
import { fail, ok, readJson } from "../_lib/infrastructure/http/response.js";

export async function onRequestGet(context) {
  try {
    const user = await requireUser(context.env, context.request);
    const params = new URL(context.request.url).searchParams;
    const id = params.get("id");
    if (id) return ok({ document: await useCases.documents.get(context.env, user.id, id) });
    const projectId = params.get("projectId");
    return ok({ documents: await useCases.documents.list(context.env, user.id, projectId || null) });
  } catch (error) { return fail(error); }
}

export async function onRequestPost(context) {
  try {
    const user = await requireUser(context.env, context.request);
    return ok({ document: await useCases.documents.create(context.env, user.id, await readJson(context.request)) }, 201);
  } catch (error) { return fail(error); }
}

export async function onRequestPut(context) {
  try {
    const user = await requireUser(context.env, context.request);
    const body = await readJson(context.request);
    const document = await useCases.documents.update(
      context.env,
      user.id,
      String(body.id || "").trim(),
      body,
    );
    return ok({ message: "Documento actualizado.", document });
  } catch (error) { return fail(error); }
}

export async function onRequestDelete(context) {
  try {
    const user = await requireUser(context.env, context.request);
    const body = await readJson(context.request);
    await useCases.documents.delete(context.env, user.id, String(body.id || "").trim());
    return ok({ message: "Documento eliminado." });
  } catch (error) { return fail(error); }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
