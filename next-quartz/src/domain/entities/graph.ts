export type GraphNode = { slug: string; title: string; tags: string[] };
export type GraphLink = { source: string; target: string };
export type Graph = { version: number; updatedAt: string; nodes: GraphNode[]; links: GraphLink[] };
