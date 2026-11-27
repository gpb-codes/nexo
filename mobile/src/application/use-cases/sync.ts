import type { SyncResult } from "../../domain/entities/sync";
import type { OutboxRepository } from "../../domain/repositories/outbox-repository";
import type { TaskRepository } from "../../domain/repositories/task-repository";

type PushPayload = {
  title?: string;
  priority?: "alta" | "media" | "baja";
  description?: string;
  category?: string;
  due_date?: string;
  clientId?: string;
  id?: string;
  patch?: Record<string, unknown>;
};

export function makeSyncUseCases(outbox: OutboxRepository, tasks: TaskRepository) {
  return {
    async pendingCount(): Promise<number> {
      return (await outbox.pending()).length;
    },

    async run(): Promise<SyncResult> {
      const pending = await outbox.pending();
      let processed = 0;
      let failed = 0;

      for (const item of pending) {
        try {
          const payload = JSON.parse(item.payload) as PushPayload;
          if (item.entity === "tasks") {
            if (item.operation === "create") {
              await tasks.pushCreate({
                title: payload.title || "Tarea",
                priority: payload.priority || "media",
                description: payload.description,
                category: payload.category,
                due_date: payload.due_date,
                clientId: payload.clientId,
              });
            } else if (item.operation === "update" && payload.id) {
              await tasks.pushUpdate(payload.id, payload.patch || {});
            } else if (item.operation === "delete" && payload.id) {
              await tasks.pushDelete(payload.id);
            }
          }
          await outbox.markDone(item.id);
          processed += 1;
        } catch {
          await outbox.markFailed(item.id);
          failed += 1;
        }
      }

      if (processed > 0) await tasks.list();
      return { processed, failed };
    },
  };
}
