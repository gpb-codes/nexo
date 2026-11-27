/* Segundo cerebro 3D en forma de universo + lista curada de Quartz. */
import * as THREE from "/vendor/build/three.module.js";
import { OrbitControls } from "/vendor/examples/jsm/controls/OrbitControls.js";

(() => {
  const root = document.getElementById("grafoRoot");
  const canvas = document.getElementById("brainCanvas");
  const stats = document.getElementById("brainStats");
  const search = document.getElementById("brainSearch");
  const openBtn = document.getElementById("brainOpenBtn");
  const resetBtn = document.getElementById("brainResetBtn");
  const rotateBtn = document.getElementById("brainRotateBtn");
  const quartzSearch = document.getElementById("quartzSearch");
  const quartzStats = document.getElementById("quartzStats");
  const quartzList = document.getElementById("quartzList");
  if (!root || !canvas || !stats || !search || !openBtn || !quartzList || !quartzStats) return;
  root.dataset.brainLoaded = "1";

  const cssVar = (name, fallback) => (getComputedStyle(document.documentElement).getPropertyValue(name) || fallback).trim() || fallback;
  const background = () => cssVar("--bg-1", "#05030a");
  const accent = () => cssVar("--accent-2", "#8b5cf6");

  const width = Math.max(360, Math.floor(canvas.clientWidth));
  const height = Math.max(300, Math.floor(canvas.clientHeight || Math.max(300, width / 1.75)));
  canvas.width = width;
  canvas.height = height;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(width, height);
  renderer.setClearColor(background(), 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(background());
  const camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 500);
  camera.position.set(0, 8, 42);
  camera.lookAt(0, 0, 0);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = true;
  controls.enableZoom = true;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.4;
  controls.minDistance = 10;
  controls.maxDistance = 90;

  scene.fog = new THREE.FogExp2(background(), 0.035);

  /* Estrellas de fondo drifting lento. */
  const starCount = 620;
  const starPositions = new Float32Array(starCount * 3);
  const starSpeeds = new Float32Array(starCount);
  for (let i = 0; i < starCount; i++) {
    const r = Math.sqrt(Math.random()) * 38;
    const theta = Math.random() * Math.PI * 2;
    const z = (Math.random() * 2 - 1) * 30;
    starPositions[i * 3] = r * Math.cos(theta);
    starPositions[i * 3 + 1] = z + Math.random() * 10;
    starPositions[i * 3 + 2] = r * Math.sin(theta);
    starSpeeds[i] = Math.random() * 0.12 + 0.05;
  }
  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const starField = new THREE.Points(starGeometry, new THREE.PointsMaterial({
    size: 0.8,
    sizeAttenuation: true,
    color: "#dfe6ff",
    transparent: true,
    opacity: 0.88,
    depthWrite: false
  }));
  starField.name = "stars";
  scene.add(starField);

  function assignUniverseLayout(data) {
    const n = data.nodes.length;
    const arms = 1 + (n % 4); // 1-3 espirales
    const inner = 0.9;
    const outer = 16.5;
    return data.nodes.map((node, i) => {
      const t = i / Math.max(1, n - 1);
      const angle = t * arms * Math.PI * 2 + Math.random() * 0.2;
      let radius = inner + (outer - inner) * Math.pow(t, 0.58);
      if (i < Math.min(12, n)) radius = 0.38 * radius;
      return new THREE.Vector3(
        radius * Math.cos(angle),
        radius * Math.sin(angle) * 0.55 + Math.random() * 2,
        (Math.random() * 2 - 1) * 3
      );
    });
  }

  function hashColor(str) {
    let h = 7;
    for (const ch of String(str || "")) h = ((h * 31) + ch.charCodeAt(0)) >>> 0;
    return new THREE.Color(`hsl(${h % 360}, 82%, 70%)`);
  }

  function makeLabelSprite(node, color) {
    const textCanvas = document.createElement("canvas");
    textCanvas.width = 320;
    textCanvas.height = 90;
    const ctx = textCanvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, textCanvas.width, textCanvas.height);
      ctx.fillStyle = "rgba(20, 12, 40, 0.62)";
      ctx.fillRect(0, 0, textCanvas.width, textCanvas.height);
      ctx.font = "12px 'JetBrains Mono', monospace";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(node.title || node.slug, textCanvas.width / 2, 24);
      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.fillText(node.slug, textCanvas.width / 2, 54);
    }
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(textCanvas),
      transparent: true,
      depthTest: false,
      opacity: 0.88
    }));
    sprite.scale.set(2.3, 0.45, 1);
    return sprite;
  }

  let graph = null;
  let nodeMeshes = [];
  let edgeGeometry;
  let edgeMaterial;
  let edgeMesh;
  let centerGlow;
  const layoutPositions = [];
  let hoveredIndex = null;

  function buildGraph(data) {
    graph = data;
    layoutPositions.length = 0;
    layoutPositions.push(...assignUniverseLayout(graph));

    const edgeCount = graph.links.length;
    const positions = new Float32Array(edgeCount * 6);
    for (let i = 0; i < edgeCount; i++) {
      const source = graph.nodes.findIndex(n => n.slug === graph.links[i].source);
      const target = graph.nodes.findIndex(n => n.slug === graph.links[i].target);
      const a = layoutPositions[source], b = layoutPositions[target];
      positions.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6);
    }
    edgeGeometry = new THREE.BufferGeometry();
    edgeGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    edgeMaterial = new THREE.LineBasicMaterial({
      color: "#7c6ff0",
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.28,
      linewidth: 1.5,
      depthWrite: false
    });
    edgeMesh = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    scene.add(edgeMesh);

    nodeMeshes = graph.nodes.map((node, i) => {
      const size = 0.13 + Math.min((node.tags || []).length, 6) * 0.015;
      const nodeColor = hashColor(node.slug);
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(size, 14, 10),
        new THREE.MeshBasicMaterial({ color: nodeColor, emissive: nodeColor, emissiveIntensity: 0.22, transparent: true, opacity: 0.98 })
      );
      mesh.position.copy(layoutPositions[i]);
      mesh.userData.index = i;
      mesh.userData.node = node;
      mesh.userData.sprite = makeLabelSprite(node, mesh.material.color);
      mesh.userData.sprite.position.set(mesh.position.x, mesh.position.y + 0.7, mesh.position.z);
      scene.add(mesh);
      scene.add(mesh.userData.sprite);
      return mesh;
    });

    // Núcleo de la galaxia con halo pulsante
    const center = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 10), new THREE.MeshBasicMaterial({ color: accent(), emissive: accent(), emissiveIntensity: 0.28, transparent: true, opacity: 1 }));
    center.position.set(0, 0, 0);
    center.userData.index = 0;
    center.userData.node = graph.nodes[0] || { title: "Núcleo", slug: "nucleo" };
    center.userData.sprite = makeLabelSprite(center.userData.node, accent());
    center.userData.sprite.scale.set(2.6, 0.6, 1);
    center.userData.sprite.position.set(0, 0.8, 0);
    scene.add(center);
    scene.add(center.userData.sprite);
    nodeMeshes.push(center);

    centerGlow = new THREE.Sprite(new THREE.SpriteMaterial({ color: accent(), blending: THREE.AdditiveBlending, transparent: true, opacity: 0.22 }));
    centerGlow.scale.set(3.5, 3.5, 1);
    centerGlow.position.set(0, 0, 0);
    scene.add(centerGlow);

    stats.textContent = `${graph.nodes.length} nodos · ${graph.links.length} conexiones`;
    search.disabled = false;
    openBtn.disabled = false;
    resetBtn.disabled = false;
    const legend = document.getElementById("brainLegend");
    if (legend) legend.hidden = false;
    renderQuartz(graph);
  }

  function updateEdges() {
    const positions = edgeGeometry.getAttribute("position");
    for (let i = 0; i < graph.links.length * 2; i += 2) {
      const link = graph.links[Math.floor(i / 2)];
      const source = graph.nodes.findIndex(n => n.slug === link.source);
      const target = graph.nodes.findIndex(n => n.slug === link.target);
      const a = layoutPositions[source], b = layoutPositions[target];
      positions.setXYZ(i, a.x, a.y, a.z);
      positions.setXYZ(i + 1, b.x, b.y, b.z);
    }
    positions.needsUpdate = true;
  }

  function updateFocus(index) {
    if (!graph) return;
    hoveredIndex = index;
    nodeMeshes.forEach((mesh, i) => {
      const hit = i === index;
      mesh.visible = true;
      mesh.material.opacity = hit ? 1 : 0.12;
      mesh.userData.sprite.visible = true;
      mesh.userData.sprite.material.opacity = hit ? 0.95 : 0.35;
    });
    edgeMaterial.opacity = hoveredIndex === null ? 0.3 : 0.45;
  }

  function updateNodeVisuals() {
    if (!graph) return;
    const query = search.value.trim().toLowerCase();
    nodeMeshes.forEach((mesh, i) => {
      const node = mesh.userData.node;
      const hit = !query || node.title.toLowerCase().includes(query) || node.slug.toLowerCase().includes(query);
      mesh.visible = true;
      mesh.material.opacity = hit ? 0.97 : 0.18;
      if (mesh.userData.sprite) {
        mesh.userData.sprite.visible = hit;
        mesh.userData.sprite.material.opacity = hit ? 0.85 : 0.05;
      }
    });
  }

  function updateStarfield(time) {
    for (let i = 0; i < starCount; i++) {
      const x = starPositions[i * 3], y = starPositions[i * 3 + 1], z = starPositions[i * 3 + 2];
      const radius = Math.sqrt(x * x + y * y + z * z);
      if (radius < 28) {
        starSpeeds[i] = Math.min(starSpeeds[i] + 0.01, 0.18);
      } else if (radius > 42) {
        const theta = Math.atan2(z, x);
        starPositions[i * 3] = Math.cos(theta + 0.25) * radius * 0.75;
        starPositions[i * 3 + 2] = Math.sin(theta + 0.25) * radius * 0.75;
        starSpeeds[i] = Math.random() * 0.1 + 0.04;
      }
      starPositions[i * 3 + 1] = Math.max(-30, Math.min(30, y + Math.sin(time + i * 0.11) * 0.4 + starSpeeds[i]));
    }
    starGeometry.attributes.position.needsUpdate = true;
  }

  function animate() {
    const time = performance.now() / 1000;
    updateStarfield(time);
    updateEdges();
    nodeMeshes.forEach((mesh, i) => {
      if (i < layoutPositions.length) mesh.position.copy(layoutPositions[i]);
      if (mesh.userData.sprite) {
        mesh.userData.sprite.position.set(mesh.position.x, mesh.position.y + 0.7, mesh.position.z);
      }
    });
    if (centerGlow) {
      centerGlow.lookAt(camera.position);
      centerGlow.material.opacity = 0.16 + 0.09 * Math.sin(time * 1.8);
      centerGlow.material.color.set(accent());
    }
    renderer.render(scene, camera);
    controls.update();
    requestAnimationFrame(animate);
  }

  function resetView() {
    camera.position.set(0, 8, 42);
    camera.lookAt(0, 0, 0);
    camera.zoom = 1;
    controls.update();
  }

  function setRotate(enabled) {
    controls.autoRotate = enabled;
    if (rotateBtn) {
      rotateBtn.textContent = enabled ? "Parar rotación" : "Rotar";
      rotateBtn.classList.toggle("btn-primary", enabled);
    }
  }

  function renderQuartz(data) {
    const nodes = data.nodes || [];
    const uniqueTags = new Set(nodes.flatMap(n => n.tags || []));
    quartzStats.textContent = `${nodes.length} entradas · ${uniqueTags.size} tags`;
    quartzList.innerHTML = "";

    const fragment = document.createDocumentFragment();
    nodes.slice().sort((a, b) => String(a.title || a.slug).localeCompare(String(b.title || b.slug))).forEach((node) => {
      const card = document.createElement("a");
      card.className = "quartz-card";
      card.href = `https://segundo-cerebro-e4v.pages.dev/${encodeURIComponent(node.slug)}`;
      card.target = "_blank";
      card.rel = "noopener";
      const title = document.createElement("span");
      title.className = "quartz-title";
      title.textContent = node.title || node.slug;
      const slug = document.createElement("span");
      slug.className = "quartz-slug";
      slug.textContent = node.slug;
      const tags = document.createElement("span");
      tags.className = "quartz-tags";
      (node.tags || []).slice(0, 5).forEach((tag) => {
        const badge = document.createElement("span");
        badge.className = "tag";
        badge.textContent = tag;
        tags.appendChild(badge);
      });
      card.appendChild(title);
      card.appendChild(slug);
      if (tags.children.length) card.appendChild(tags);
      fragment.appendChild(card);
    });
    quartzList.appendChild(fragment);

    const qSearch = quartzSearch;
    qSearch.disabled = false;
    qSearch.addEventListener("input", () => {
      const q = qSearch.value.trim().toLowerCase();
      Array.from(quartzList.children).forEach((card) => {
        const text = card.textContent.toLowerCase();
        card.style.display = !q || text.includes(q) ? "" : "none";
      });
    });
  }

  function openNode(index) {
    if (!graph) return;
    const node = graph.nodes[index];
    if (node) window.open(`https://segundo-cerebro-e4v.pages.dev/${encodeURIComponent(node.slug)}`, "_blank", "noopener");
  }

  function onPointerMove(event) {
    if (!graph) return;
    const rect = canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.setFromCamera(mouse, camera);
    const hit = raycaster.intersectObjects(nodeMeshes, true)[0];
    const index = hit?.object?.userData?.index ?? null;
    if (index !== hoveredIndex) {
      updateFocus(index);
    }
    canvas.style.cursor = hit ? "pointer" : "grab";
  }

  function onPointerDown(event) {
    if (!graph) return;
    const rect = canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycaster.setFromCamera(mouse, camera);
    const hit = raycaster.intersectObjects(nodeMeshes, true)[0];
    const index = hit?.object?.userData?.index;
    if (index !== undefined && graph.nodes[index]) openNode(index);
  }

  function onResize() {
    const w = Math.max(360, Math.floor(canvas.clientWidth));
    const h = Math.max(300, Math.floor(canvas.clientHeight));
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    updateEdges();
  }

  const raycaster = new THREE.Raycaster();
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerdown", onPointerDown);
  search.addEventListener("input", updateNodeVisuals);
  openBtn.addEventListener("click", () => window.open("https://segundo-cerebro-e4v.pages.dev", "_blank", "noopener"));
  resetBtn.addEventListener("click", resetView);
  rotateBtn.addEventListener("click", () => setRotate(!controls.autoRotate));
  window.addEventListener("resize", onResize);

  fetch("/brain-graph.json").then(async r => { if (!r.ok) throw new Error("graph 404"); return r.json(); }).then(data => {
    graph = data;
    buildGraph(graph);
    setRotate(false);
  }).catch(() => {
    stats.textContent = "No se pudo cargar el grafo del vault.";
    quartzStats.textContent = "No se pudo cargar Quartz.";
    search.disabled = true;
    quartzSearch.disabled = true;
    openBtn.disabled = true;
  }).finally(() => animate());
})();
