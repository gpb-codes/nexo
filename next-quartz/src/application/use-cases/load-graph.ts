import type { Graph } from "../../domain/entities/graph";
import type { GraphRepository } from "../../domain/repositories/graph-repository";

export function makeLoadGraphUseCase(repository: GraphRepository) {
  return {
    execute: (): Promise<Graph> => repository.load(),
  };
}
