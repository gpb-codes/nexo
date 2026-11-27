import type { Graph } from "../entities/graph";

export interface GraphRepository {
  load(): Promise<Graph>;
}
