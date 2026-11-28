import { requireUser } from "../_lib/application/current-user.js";
import { useCases } from "../_lib/application/container.js";
import { ValidationError } from "../_lib/domain/errors.js";
import { fail, ok, readJson } from "../_lib/infrastructure/http/response.js";

export async function onRequestGet(context) {
  try {
    const user = await requireUser(context.env, context.request);
    const projectId = new URL(context.request.url).searchParams.get("projectId");
    if (!projectId) throw new ValidationError("projectId requerido.");
    const detail = await useCases.projects.get(context.env, user.id, projectId);
    return ok({ members: detail.members });
  } catch (error) { return fail(error); }
}

export async function onRequestPost(context) {
  try {
    const user = await requireUser(context.env, context.request);
    const member = await useCases.projects.invite(context.env, user.id, await readJson(context.request));
    return ok({ member }, 201);
  } catch (error) { return fail(error); }
}

export async function onRequestDelete(context) {
  try {
    const user = await requireUser(context.env, context.request);
    const body = await readJson(context.request);
    await useCases.projects.removeMember(
      context.env,
      user.id,
      String(body.projectId || body.project_id || "").trim(),
      String(body.userId || body.user_id || "").trim(),
    );
    return ok({ message: "Miembro eliminado." });
  } catch (error) { return fail(error); }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
