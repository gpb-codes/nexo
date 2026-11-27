import type { Graph } from "../domain/entities/graph";
import type { GraphRepository } from "../domain/repositories/graph-repository";

export class HttpGraphRepository implements GraphRepository {
  constructor(private readonly url = "/brain-graph.json") {}

  async load(): Promise<Graph> {
    const response = await fetch(this.url);
    if (!response.ok) throw new Error("No se pudo cargar el grafo.");
    return response.json();
  }
}
