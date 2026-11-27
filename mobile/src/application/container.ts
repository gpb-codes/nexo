import { ApiAiRepository } from "../infrastructure/repositories/ai-repository";
import { ApiNoteRepository } from "../infrastructure/repositories/note-repository";
import { ApiPreferencesRepository } from "../infrastructure/repositories/preferences-repository";
import { ApiProjectRepository } from "../infrastructure/repositories/project-repository";
import { ApiSessionRepository } from "../infrastructure/repositories/session-repository";
import { ApiTaskRepository } from "../infrastructure/repositories/task-repository";
import { SqliteOutboxRepository } from "../infrastructure/repositories/outbox-repository";
import { makeAiUseCases } from "./use-cases/ai";
import { makeNoteUseCases } from "./use-cases/notes";
import { makePreferencesUseCases } from "./use-cases/preferences";
import { makeProjectUseCases } from "./use-cases/projects";
import { makeSessionUseCases } from "./use-cases/session";
import { makeSyncUseCases } from "./use-cases/sync";
import { makeTaskUseCases } from "./use-cases/tasks";

const taskRepository = new ApiTaskRepository();
const projectRepository = new ApiProjectRepository();
const noteRepository = new ApiNoteRepository();
const sessionRepository = new ApiSessionRepository();
const preferencesRepository = new ApiPreferencesRepository();
const outboxRepository = new SqliteOutboxRepository();
const aiRepository = new ApiAiRepository();

export const container = {
  useCases: {
    ai: makeAiUseCases(aiRepository),
    tasks: makeTaskUseCases(taskRepository),
    projects: makeProjectUseCases(projectRepository),
    notes: makeNoteUseCases(noteRepository),
    session: makeSessionUseCases(sessionRepository),
    preferences: makePreferencesUseCases(preferencesRepository),
    sync: makeSyncUseCases(outboxRepository, taskRepository),
  },
};

export type Container = typeof container;
