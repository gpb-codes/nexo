import type { OutboxItem } from "../../domain/entities/sync";
import type { OutboxRepository } from "../../domain/repositories/outbox-repository";
import { markDone, markFailed, pendingChanges } from "../storage/sqlite";

export class SqliteOutboxRepository implements OutboxRepository {
  pending(): Promise<OutboxItem[]> {
    return pendingChanges();
  }
  markDone(id: string): Promise<void> {
    return markDone(id);
  }
  markFailed(id: string): Promise<void> {
    return markFailed(id);
  }
}
