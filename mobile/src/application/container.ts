import { ApiNoteRepository } from "../infrastructure/repositories/note-repository";
import { ApiPreferencesRepository } from "../infrastructure/repositories/preferences-repository";
import { ApiProjectRepository } from "../infrastructure/repositories/project-repository";
import { ApiSessionRepository } from "../infrastructure/repositories/session-repository";
import { ApiTaskRepository } from "../infrastructure/repositories/task-repository";
import { makeNoteUseCases } from "./use-cases/notes";
import { makePreferencesUseCases } from "./use-cases/preferences";
import { makeProjectUseCases } from "./use-cases/projects";
import { makeSessionUseCases } from "./use-cases/session";
import { makeTaskUseCases } from "./use-cases/tasks";

const taskRepository = new ApiTaskRepository();
const projectRepository = new ApiProjectRepository();
const noteRepository = new ApiNoteRepository();
const sessionRepository = new ApiSessionRepository();
const preferencesRepository = new ApiPreferencesRepository();

export const container = {
  useCases: {
    tasks: makeTaskUseCases(taskRepository),
    projects: makeProjectUseCases(projectRepository),
    notes: makeNoteUseCases(noteRepository),
    session: makeSessionUseCases(sessionRepository),
    preferences: makePreferencesUseCases(preferencesRepository),
  },
};

export type Container = typeof container;
