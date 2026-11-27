"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/examples/jsm/lines/LineSegmentsGeometry.js";

type Node = { slug: string; title: string; tags: string[] };
type Link = { source: string; target: string };
type Graph = { version: number; updatedAt: string; nodes: Node[]; links: Link[] };
type Move = { x: number; z: number };
type NodeState = { value: number; base: number; opacity: number };

const JARVIS_PALETTE = ["#7dd3fc", "#a78bfa", "#cbd5e1", "#60a5fa", "#e2e8f0", "#93c5fd"];

function jarvisColor(slug: string) {
  let h = 7;
  for (const ch of slug) h = ((h * 31) + ch.charCodeAt(0)) >>> 0;
  return new THREE.Color(JARVIS_PALETTE[h % JARVIS_PALETTE.length]);
}

function universePositions(n: number) {
  const arms = 2 + (n % 3);
  const inner = 1.1;
  const outer = 18;
  return Array.from({ length: n }, (_, i) => {
    const t = i / Math.max(1, n - 1);
    const angle = t * arms * Math.PI * 2 + Math.random() * 0.18;
    const radius = inner + (outer - inner) * Math.pow(t, 0.6);
    return new THREE.Vector3(
      radius * Math.cos(angle),
      radius * Math.sin(angle) * 0.5 + (Math.random() - 0.5) * 2.5,
      (Math.random() - 0.5) * 5,
    );
  });
}

function pushCurve(positions: number[], a: THREE.Vector3, b: THREE.Vector3, lift = 0.16) {
  const dir = b.clone().sub(a);
  const dist = dir.length();
  if (dist < 0.001) return;
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const normal = new THREE.Vector3(-dir.z, 0, dir.x).normalize().multiplyScalar(dist * lift);
  mid.add(normal);
  const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
  const points = curve.getPoints(6);
  for (let i = 0; i < points.length - 1; i++) {
    positions.push(
      points[i].x, points[i].y, points[i].z,
      points[i + 1].x, points[i + 1].y, points[i + 1].z,
    );
  }
}

function makeLineSegments(positions: number[], width: number, color: string, opacity: number, widthPx: number) {
  const geometry = new LineSegmentsGeometry();
  geometry.setPositions(positions);
  const material = new LineMaterial({ color, linewidth: width, transparent: true, opacity });
  material.resolution.set(widthPx, Math.max(300, widthPx));
  const lines = new LineSegments2(geometry, material);
  lines.computeLineDistances();
  return lines;
}

export default function GrafoClient() {
  const [stats, setStats] = useState("Cargando grafo...");
  const [query, setQuery] = useState("");
  const [labelsVisible, setLabelsVisible] = useState(true);
  const [focus, setFocus] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const labelRendererRef = useRef<CSS2DRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshesRef = useRef<THREE.Mesh[]>([]);
  const statesRef = useRef<NodeState[]>([]);
  const labelElsRef = useRef<HTMLElement[]>([]);
  const keysRef = useRef(new Set<string>());
  const moveRef = useRef<Move>({ x: 0, z: 0 });

  const resetView = useCallback(() => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(0, 9, 44);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  }, []);

  useEffect(() => {
    let cancelled = false;
    let frame = 0;

    const load = async () => {
      if (!rootRef.current) return;
      const data: Graph = await (await fetch("/brain-graph.json")).json();
      if (cancelled || !rootRef.current) return;

      const container = rootRef.current;
      const width = container.clientWidth;
      const height = Math.max(420, container.clientHeight);

      const canvas = document.createElement("canvas");
      canvas.className = "jarvis-canvas";
      container.appendChild(canvas);

      const labelRenderer = new CSS2DRenderer();
      labelRenderer.setSize(width, height);
      labelRenderer.domElement.className = "jarvis-label-layer";
      container.appendChild(labelRenderer.domElement);
      labelRendererRef.current = labelRenderer;

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2("#05030a", 0.032);
      const camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 600);
      camera.position.set(0, 9, 44);
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      renderer.setClearColor("#05030a", 1);

      const controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.dampingFactor = 0.075;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.28;
      controls.minDistance = 8;
      controls.maxDistance = 120;
      controlsRef.current = controls;

      // JARVIS atmosphere: grid, rings, star dust.
      const grid = new THREE.GridHelper(40, 40, "#164e63", "#0e2a3a");
      const gridMat = grid.material as THREE.Material;
      gridMat.transparent = true;
      gridMat.opacity = 0.18;
      scene.add(grid);

      const ringGeo = new THREE.RingGeometry(6, 6.06, 96);
      const ringMat = new THREE.MeshBasicMaterial({ color: "#22d3ee", transparent: true, opacity: 0.18, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      scene.add(ring);

      const starCount = 420;
      const starPositions = new Float32Array(starCount * 3);
      for (let i = 0; i < starCount; i++) {
        const r = 20 + Math.random() * 60;
        const theta = Math.random() * Math.PI * 2;
        starPositions[i * 3] = r * Math.cos(theta);
        starPositions[i * 3 + 1] = (Math.random() - 0.5) * 50;
        starPositions[i * 3 + 2] = r * Math.sin(theta);
      }
      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
      scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: "#bae6fd", size: 0.22, transparent: true, opacity: 0.65, depthWrite: false })));

      const positions = universePositions(data.nodes.length);
      const nodeIndex = new Map(data.nodes.map((n, i) => [n.slug, i]));
      const states: NodeState[] = [];
      const labels: HTMLElement[] = [];
      const nodeGeometry = new THREE.SphereGeometry(1, 14, 10);

      const meshes = data.nodes.map((node, i) => {
        const base = 0.15 + Math.min(node.tags.length, 6) * 0.014;
        const mesh = new THREE.Mesh(nodeGeometry, new THREE.MeshBasicMaterial({ color: jarvisColor(node.slug) }));
        mesh.position.copy(positions[i]);
        mesh.scale.setScalar(0);
        mesh.userData.index = i;
        mesh.userData.node = node;
        scene.add(mesh);
        states.push({ value: 0, base, opacity: 1 });

        const labelEl = document.createElement("div");
        labelEl.className = "jarvis-label";
        const nameEl = document.createElement("span");
        nameEl.className = "jarvis-label-name";
        nameEl.textContent = node.title || node.slug;
        const fileEl = document.createElement("span");
        fileEl.className = "jarvis-label-file";
        fileEl.textContent = node.slug;
        labelEl.append(nameEl, fileEl);
        const label = new CSS2DObject(labelEl);
        label.center.set(0.5, 0);
        label.position.set(0, -0.38, 0);
        mesh.add(label);
        labels.push(labelEl);
        return mesh;
      });
      meshesRef.current = meshes;
      statesRef.current = states;
      labelElsRef.current = labels;

      animate(states, {
        value: [0, 1],
        duration: 950,
        ease: "outElastic(1, 0.7)",
        onUpdate: () => meshes.forEach((mesh, i) => mesh.scale.setScalar(states[i].value * states[i].base)),
      });

      // Curved, glowing connections.
      const edges: number[] = [];
      data.links.forEach((link) => {
        const a = positions[nodeIndex.get(link.source) ?? -1];
        const b = positions[nodeIndex.get(link.target) ?? -1];
        if (a && b) pushCurve(edges, a, b, 0.14);
      });
      const links = makeLineSegments(edges, 1.25, "#38bdf8", 0.34, width);
      scene.add(links);

      let highlight: LineSegments2 | null = null;
      const setHighlight = (index: number | null) => {
        if (highlight) {
          scene.remove(highlight);
          highlight.geometry.dispose();
          (highlight.material as THREE.Material).dispose();
          highlight = null;
        }
        if (index === null) return;
        const node = data.nodes[index];
        if (!node) return;
        const pts: number[] = [];
        data.links.forEach((link) => {
          if (link.source !== node.slug && link.target !== node.slug) return;
          const a = positions[nodeIndex.get(link.source) ?? -1];
          const b = positions[nodeIndex.get(link.target) ?? -1];
          if (a && b) pushCurve(pts, a, b, 0.2);
        });
        if (!pts.length) return;
        highlight = makeLineSegments(pts, 2.6, "#67e8f9", 0.95, width);
        scene.add(highlight);
      };

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      let hovered: number | null = null;

      const applyFocus = (index: number | null) => {
        if (hovered === index) return;
        if (hovered !== null) {
          const prev = states[hovered];
          if (prev) animate(prev, { value: 1, duration: 180, ease: "outQuad", onUpdate: () => meshes[hovered ?? 0]?.scale.setScalar(prev.value * prev.base) });
        }
        hovered = index;
        setHighlight(index);
        setFocus(index === null ? null : data.nodes[index]?.slug || null);
        if (index !== null) {
          const state = states[index];
          if (state) animate(state, { value: 1.35, duration: 180, ease: "outBack", onUpdate: () => meshes[index]?.scale.setScalar(state.value * state.base) });
        }
      };

      const pick = (event: PointerEvent | MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);
        return raycaster.intersectObjects(meshes, true)[0]?.object as THREE.Mesh | undefined;
      };

      const onPointerMove = (event: PointerEvent) => {
        const hit = pick(event);
        applyFocus(hit ? (hit.userData.index as number) : null);
        canvas.style.cursor = hit ? "pointer" : "grab";
      };
      const onPointerDown = (event: PointerEvent) => {
        const hit = pick(event);
        const node = hit?.userData.node as Node | undefined;
        if (node) window.open(`/${node.slug}`, "_blank", "noopener");
      };

      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerdown", onPointerDown);

      // Keyboard navigation: WASD + arrows.
      const onKeyDown = (event: KeyboardEvent) => {
        const target = event.target as HTMLElement | null;
        if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
        const key = event.key.toLowerCase();
        if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
          event.preventDefault();
          keysRef.current.add(key);
        }
      };
      const onKeyUp = (event: KeyboardEvent) => keysRef.current.delete(event.key.toLowerCase());
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);

      const onResize = () => {
        const w = Math.max(360, container.clientWidth);
        const h = Math.max(420, container.clientHeight);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        labelRenderer.setSize(w, h);
        (links.material as LineMaterial).resolution.set(w, h);
        if (highlight) (highlight.material as LineMaterial).resolution.set(w, h);
      };
      window.addEventListener("resize", onResize);

      const forward = new THREE.Vector3();
      const right = new THREE.Vector3();
      const up = new THREE.Vector3(0, 1, 0);
      frame = requestAnimationFrame(function tick() {
        const pressed = keysRef.current;
        const joy = moveRef.current;
        const fwd = (pressed.has("w") || pressed.has("arrowup") ? 1 : 0) - (pressed.has("s") || pressed.has("arrowdown") ? 1 : 0) + joy.z;
        const side = (pressed.has("d") || pressed.has("arrowright") ? 1 : 0) - (pressed.has("a") || pressed.has("arrowleft") ? 1 : 0) + joy.x;
        if (fwd !== 0 || side !== 0) {
          controls.autoRotate = false;
          forward.subVectors(controls.target, camera.position);
          forward.y = 0;
          if (forward.lengthSq() < 0.0001) forward.set(0, 0, -1);
          forward.normalize();
          right.crossVectors(forward, up).normalize();
          const speed = 0.55;
          const delta = forward.multiplyScalar(fwd * speed).add(right.multiplyScalar(side * speed));
          camera.position.add(delta);
          controls.target.add(delta);
        }
        ring.rotation.z += 0.0015;
        renderer.render(scene, camera);
        labelRenderer.render(scene, camera);
        controls.update();
        frame = requestAnimationFrame(tick);
      });

      setStats(`${data.nodes.length} nodos · ${data.links.length} conexiones · JARVIS ONLINE`);

      return () => {
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        window.removeEventListener("resize", onResize);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerdown", onPointerDown);
        cancelAnimationFrame(frame);
        meshesRef.current = [];
        statesRef.current = [];
        labelElsRef.current = [];
        renderer.dispose();
        nodeGeometry.dispose();
        links.geometry.dispose();
        (links.material as THREE.Material).dispose();
        labelRenderer.domElement.remove();
        canvas.remove();
      };
    };

    const cleanupPromise = load();
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      cleanupPromise.then((cleanup) => cleanup?.());
    };
  }, []);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    const meshes = meshesRef.current;
    const states = statesRef.current;
    states.forEach((state, i) => {
      const node = meshes[i]?.userData.node as Node | undefined;
      const hit = !q || !node || node.title.toLowerCase().includes(q) || node.slug.toLowerCase().includes(q);
      const target = hit ? 1 : 0.08;
      animate(state, {
        opacity: target,
        duration: 240,
        ease: "outQuad",
        onUpdate: () => {
          const mat = meshes[i]?.material as THREE.MeshBasicMaterial | undefined;
          if (mat) mat.opacity = state.opacity;
          const label = labelElsRef.current[i];
          if (label) label.style.opacity = String(Math.max(state.opacity, 0.25));
        },
      });
    });
  }, [query]);

  useEffect(() => {
    const layer = labelRendererRef.current?.domElement;
    if (layer) layer.style.display = labelsVisible ? "block" : "none";
  }, [labelsVisible]);

  const setMove = (x: number, z: number) => {
    moveRef.current = { x, z };
  };

  const active = focus ? (meshesRef.current.find((m) => (m.userData.node as Node)?.slug === focus)?.userData.node as Node | undefined) : null;

  return (
    <div className="jarvis-shell">
      <div className="jarvis-toolbar">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar archivo o nodo..."
          className="jarvis-search"
          aria-label="Buscar nodos"
        />
        <button className="jarvis-btn" type="button" onClick={resetView}>Centrar</button>
        <button className="jarvis-btn" type="button" onClick={() => setLabelsVisible((v) => !v)}>
          {labelsVisible ? "Ocultar nombres" : "Mostrar nombres"}
        </button>
        <span className="jarvis-stats">{stats}</span>
      </div>

      <div className="jarvis-viewport">
        <div ref={rootRef} className="jarvis-root" />
        <div className="jarvis-hud" aria-hidden="true">
          <div className="jarvis-corner top-left" />
          <div className="jarvis-corner top-right" />
          <div className="jarvis-corner bottom-left" />
          <div className="jarvis-corner bottom-right" />
          <div className="jarvis-crosshair" />
          <div className="jarvis-scanline" />
          <div className="jarvis-hud-left">JARVIS // NEXUS<br />VISUALIZACIÓN DE GRAFO</div>
          <div className="jarvis-hud-right">WASD / FLECHAS · MOVER<br />ARRASTRAR · ROTAR</div>
        </div>
        {active && (
          <div className="jarvis-focus">
            <strong>{active.title}</strong>
            <span>{active.slug}</span>
          </div>
        )}
      </div>

      <div className="jarvis-joystick" aria-label="Control digital de movimiento">
        <span className="joystick-caption">MOVIMIENTO</span>
        <div className="joystick-grid">
          <button
            className="joy-btn joy-up"
            type="button"
            onPointerDown={() => setMove(0, 1)}
            onPointerUp={() => setMove(0, 0)}
            onPointerLeave={() => setMove(0, 0)}
          >▲</button>
          <button
            className="joy-btn joy-left"
            type="button"
            onPointerDown={() => setMove(-1, 0)}
            onPointerUp={() => setMove(0, 0)}
            onPointerLeave={() => setMove(0, 0)}
          >◀</button>
          <span className="joy-center" />
          <button
            className="joy-btn joy-right"
            type="button"
            onPointerDown={() => setMove(1, 0)}
            onPointerUp={() => setMove(0, 0)}
            onPointerLeave={() => setMove(0, 0)}
          >▶</button>
          <button
            className="joy-btn joy-down"
            type="button"
            onPointerDown={() => setMove(0, -1)}
            onPointerUp={() => setMove(0, 0)}
            onPointerLeave={() => setMove(0, 0)}
          >▼</button>
        </div>
      </div>
    </div>
  );
}
