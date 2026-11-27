/* Esfera 3D de perfil para el dashboard de Nexo. */
import * as THREE from "three";

let mounted = null;

function disposeCurrent() {
  if (!mounted) return;
  const { renderer, scene, geometry, material, ringGeometry, ringMaterial, glowGeometry, glowMaterial, onResize, onPointerMove } = mounted;
  window.removeEventListener("resize", onResize);
  window.removeEventListener("pointermove", onPointerMove);
  geometry.dispose();
  material.dispose();
  ringGeometry.dispose();
  ringMaterial.dispose();
  glowGeometry.dispose();
  glowMaterial.dispose();
  scene.traverse((obj) => {
    if (obj.isLight && obj.dispose) obj.dispose();
  });
  renderer.dispose();
  mounted = null;
}

export function mountProfileSphere(canvas, avatarUrl) {
  if (!canvas) return;
  disposeCurrent();

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 4.2);
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  const group = new THREE.Group();
  scene.add(group);

  const geometry = new THREE.SphereGeometry(1, 48, 32);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.22,
    metalness: 0.12,
    transmission: 0.22,
    thickness: 0.65,
    transparent: true,
    opacity: 0.97,
    clearcoat: 0.7,
    clearcoatRoughness: 0.18,
  });
  const sphere = new THREE.Mesh(geometry, material);
  group.add(sphere);

  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");
  loader.load(
    avatarUrl,
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      material.map = texture;
      material.needsUpdate = true;
    },
    undefined,
    () => {
      material.color.set("#a78bfa");
      material.needsUpdate = true;
    },
  );

  const glowGeometry = new THREE.SphereGeometry(1.16, 32, 24);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x8b5cf6,
    transparent: true,
    opacity: 0.08,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  });
  group.add(new THREE.Mesh(glowGeometry, glowMaterial));

  const ringGeometry = new THREE.TorusGeometry(1.32, 0.012, 8, 96);
  const ringMaterial = new THREE.MeshBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.42 });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI / 2.7;
  group.add(ring);

  scene.add(new THREE.AmbientLight(0xb7a7d9, 1.5));
  const purple = new THREE.PointLight(0x8b5cf6, 18, 12);
  purple.position.set(-2.5, 2, 3);
  scene.add(purple);
  const cyan = new THREE.PointLight(0x7dd3fc, 14, 12);
  cyan.position.set(2.5, -1.5, 2);
  scene.add(cyan);

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pointer = { x: 0, y: 0 };
  let frame = 0;
  let disposed = false;

  const onResize = () => {
    const size = canvas.clientWidth || 240;
    canvas.width = size;
    canvas.height = size;
    camera.aspect = 1;
    camera.updateProjectionMatrix();
    renderer.setSize(size, size, false);
  };
  const onPointerMove = (event) => {
    if (reduced) return;
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener("resize", onResize);
  window.addEventListener("pointermove", onPointerMove);
  onResize();

  const render = () => {
    if (disposed) return;
    if (!reduced) {
      group.rotation.y += 0.0035;
      group.rotation.x += (pointer.y * 0.12 - group.rotation.x) * 0.04;
      group.rotation.z += (-pointer.x * 0.08 - group.rotation.z) * 0.04;
      ring.rotation.z += 0.006;
    }
    renderer.render(scene, camera);
    frame = requestAnimationFrame(render);
  };
  render();

  mounted = {
    canvas,
    renderer,
    scene,
    geometry,
    material,
    ringGeometry,
    ringMaterial,
    glowGeometry,
    glowMaterial,
    onResize,
    onPointerMove,
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      disposeCurrent();
    },
  };
}
