import GrafoClient from "./client";

export default function GrafoPage() {
  return (
    <>
      <h1 className="app-title">Grafo 3D del Segundo Cerebro</h1>
      <p className="app-subtitle">
        Mapa estilo JARVIS con nombres de archivo, conexiones curvas, búsqueda, control WASD/flechas y joystick digital en móvil.
      </p>
      <GrafoClient />
    </>
  );
}
