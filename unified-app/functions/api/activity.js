import { requireUser } from "../_lib/application/current-user.js";
import { useCases } from "../_lib/application/container.js";
import { fail, ok } from "../_lib/infrastructure/http/response.js";

export async function onRequestGet(context) {
  try {
    const user = await requireUser(context.env, context.request);
    const projectId = new URL(context.request.url).searchParams.get("projectId");
    if (!projectId) return ok({ activity: [] });
    return ok({ activity: await useCases.projects.activity(context.env, user.id, projectId) });
  } catch (error) { return fail(error); }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
