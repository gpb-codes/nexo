import type { LoginInput, RegisterInput } from "../../domain/entities/session";
import type { SessionRepository } from "../../domain/repositories/session-repository";

export function makeSessionUseCases(repository: SessionRepository) {
  return {
    login: (input: LoginInput) => repository.login(input),
    register: (input: RegisterInput) => repository.register(input),
    logout: () => repository.logout(),
    me: () => repository.me(),
  };
}
