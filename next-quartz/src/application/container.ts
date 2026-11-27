import { HttpGraphRepository } from "../infrastructure/graph-repository";
import { makeLoadGraphUseCase } from "./use-cases/load-graph";

export const container = {
  useCases: {
    loadGraph: makeLoadGraphUseCase(new HttpGraphRepository()),
  },
};
