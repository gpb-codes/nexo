import brainGraph from "../public/brain-graph.json";
import Link from "next/link";

export default function Home() {
  const nodes = (brainGraph as { nodes: Array<{ title: string }> }).nodes;
  return (
    <>
      <h1 className="app-title">Quartz — Segundo Cerebro</h1>
      <p className="app-subtitle">
        Explora el mapa de conocimiento publicado desde tu bóveda. Implementación en Next.js, Three.js y anime.js.
      </p>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{nodes.length}</h3>
          <p>Nodos de conocimiento</p>
        </div>
        <div className="stat-card">
          <h3>
            {(brainGraph as { links: unknown[] }).links.length}
          </h3>
          <p>Conexiones</p>
        </div>
        <div className="stat-card">
          <h3>7</h3>
          <p>Carpetas principales</p>
        </div>
        <div className="stat-card">
          <h3>144</h3>
          <p>Archivos total</p>
        </div>
      </div>
      <Link className="note-link" href="/grafo">Abrir grafo 3D interactivo</Link>
    </>
  );
}
