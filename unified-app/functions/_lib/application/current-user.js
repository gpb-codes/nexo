import { getRequestToken } from "../infrastructure/security/session.js";
import { useCases } from "./container.js";

export async function requireUser(env, request) {
  return useCases.auth.currentUser(env, getRequestToken(request));
}
