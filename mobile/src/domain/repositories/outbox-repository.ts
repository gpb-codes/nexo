import type { OutboxItem } from "../entities/sync";

export interface OutboxRepository {
  pending(): Promise<OutboxItem[]>;
  markDone(id: string): Promise<void>;
  markFailed(id: string): Promise<void>;
}
