/* STLViewer.jsx — renders the real 3D-printed enclosure parts.
   Primary path: Three.js / WebGL (dark metal + mint edges, orbit + auto-rotate).
   Fallback path: a self-contained software renderer that parses the binary STL
   and draws a shaded, depth-sorted, rotatable model on a 2D canvas — so it works
   even where WebGL is unavailable, and never crashes the page.
   THREE (+ STLLoader/OrbitControls) is loaded as a global from CDN in index.html. */

const { useRef, useState, useEffect } = React;

function webglOK() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
  } catch (e) { return false; }
}

/* ---------- binary STL parser ---------- */
function parseSTL(buf) {
  const dv = new DataView(buf);
  const n = dv.getUint32(80, true);
  const tris = []; let o = 84;
  if (84 + n * 50 !== buf.byteLength) return null; // not binary STL we expect
  for (let i = 0; i < n; i++) {
    o += 12; // skip stored normal (recompute)
    const v = [];
    for (let k = 0; k < 3; k++) { v.push([dv.getFloat32(o, true), dv.getFloat32(o + 4, true), dv.getFloat32(o + 8, true)]); o += 12; }
    o += 2;
    tris.push(v);
  }
  return tris;
}

/* ---------- WebGL (Three.js) viewer ---------- */
function makeGLViewer(container, { controls, autoRotate }) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
  catch (e) { return null; }
  const W = () => container.clientWidth, H = () => container.clientHeight;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, W() / H(), 0.1, 5000);
  camera.position.set(0, 0, 100);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(W(), H());
  container.appendChild(renderer.domElement);
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%;cursor:" + (controls ? "grab" : "default");

  scene.add(new THREE.AmbientLight(0x3a4654, 0.7));
  const key = new THREE.DirectionalLight(0xeaf3ff, 1.15); key.position.set(60, 80, 70); scene.add(key);
  const rim = new THREE.DirectionalLight(0x4de6be, 1.4); rim.position.set(-70, 20, -40); scene.add(rim);
  const fill = new THREE.DirectionalLight(0x5bb8ff, 0.5); fill.position.set(20, -60, 30); scene.add(fill);

  let ctrl = null;
  if (controls && THREE.OrbitControls) {
    ctrl = new THREE.OrbitControls(camera, renderer.domElement);
    ctrl.enableDamping = true; ctrl.dampingFactor = 0.08;
    ctrl.enablePan = false; ctrl.enableZoom = false;
    ctrl.autoRotate = autoRotate; ctrl.autoRotateSpeed = 1.6;
  }

  const group = new THREE.Group(); scene.add(group);
  const loader = new THREE.STLLoader();
  let spin = autoRotate && !controls;

  function clear() { while (group.children.length) { const c = group.children.pop(); c.geometry && c.geometry.dispose(); c.material && c.material.dispose(); } }
  function fit() {
    const box = new THREE.Box3().setFromObject(group);
    const size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
    group.position.sub(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const dist = (maxDim / 2) / Math.tan((camera.fov * Math.PI / 180) / 2);
    camera.position.set(0, 0, dist * 1.95);
    camera.near = dist / 100; camera.far = dist * 10; camera.updateProjectionMatrix();
    if (ctrl) { ctrl.target.set(0, 0, 0); ctrl.update(); }
  }
  function loadModel(url, cb) {
    loader.load(url, (geo) => {
      clear(); geo.computeVertexNormals();
      const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x18222e, metalness: 0.55, roughness: 0.42 }));
      group.rotation.set(-Math.PI / 2.35, 0, 0); group.add(mesh);
      const line = new THREE.LineSegments(new THREE.EdgesGeometry(geo, 32), new THREE.LineBasicMaterial({ color: 0x4de6be, transparent: true, opacity: 0.32 }));
      group.add(line); group.position.set(0, 0, 0); fit(); cb && cb();
    }, undefined, (err) => cb && cb(err));
  }
  let raf;
  (function loop() { if (spin) group.rotation.z += 0.004; ctrl && ctrl.update(); renderer.render(scene, camera); raf = requestAnimationFrame(loop); })();
  function resize() { camera.aspect = W() / H(); camera.updateProjectionMatrix(); renderer.setSize(W(), H()); }
  window.addEventListener("resize", resize);
  return { loadModel, setSpin(v) { spin = v; if (ctrl) ctrl.autoRotate = v; }, destroy() { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); clear(); renderer.dispose(); renderer.domElement.remove(); } };
}

/* ---------- Software (2D canvas) fallback viewer ---------- */
function makeSoftViewer(container, { controls, autoRotate }) {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "display:block;width:100%;height:100%;cursor:" + (controls ? "grab" : "default");
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W, H, DPR, tris = null, ctr = [0, 0, 0], scl = 1;
  let ay = 0.6, ax = -1.15, spin = autoRotate, raf;
  let dragging = false, lx = 0, ly = 0;
  const light = (() => { const v = [0.45, 0.6, 0.95]; const m = Math.hypot(...v); return v.map(x => x / m); })();

  function size() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = container.clientWidth; H = container.clientHeight;
    canvas.width = W * DPR; canvas.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  function prep() {
    let mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
    for (const t of tris) for (const p of t) for (let i = 0; i < 3; i++) { if (p[i] < mn[i]) mn[i] = p[i]; if (p[i] > mx[i]) mx[i] = p[i]; }
    ctr = [(mn[0] + mx[0]) / 2, (mn[1] + mx[1]) / 2, (mn[2] + mx[2]) / 2];
    const dim = Math.max(mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]) || 1;
    scl = (Math.min(W, H) * 0.62) / dim;
  }
  function rot(p) {
    let x = p[0] - ctr[0], y = p[1] - ctr[1], z = p[2] - ctr[2];
    const cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
    let x1 = x * cy + z * sy, z1 = -x * sy + z * cy;          // yaw
    let y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;          // pitch
    return [x1, y2, z2];
  }
  function renderFrame() {
    ctx.clearRect(0, 0, W, H);
    if (!tris) return;
    const cx = W / 2, cyp = H / 2;
    const faces = [];
    for (const t of tris) {
      const a = rot(t[0]), b = rot(t[1]), c = rot(t[2]);
      const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
      const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
      let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
      if (nz <= 0) continue; // backface cull (camera looks +z)
      const inten = Math.max(0.12, nx * light[0] + ny * light[1] + nz * light[2]);
      faces.push({ a, b, c, inten, az: (a[2] + b[2] + c[2]) / 3 });
    }
    faces.sort((p, q) => p.az - q.az);
    for (const f of faces) {
      const i = f.inten;
      const r = Math.round(18 + i * 46), g = Math.round(30 + i * 92), bl = Math.round(42 + i * 96);
      ctx.beginPath();
      ctx.moveTo(cx + f.a[0] * scl, cyp - f.a[1] * scl);
      ctx.lineTo(cx + f.b[0] * scl, cyp - f.b[1] * scl);
      ctx.lineTo(cx + f.c[0] * scl, cyp - f.c[1] * scl);
      ctx.closePath();
      ctx.fillStyle = `rgb(${r},${g},${bl})`; ctx.fill();
      ctx.strokeStyle = `rgba(77,230,190,${0.10 + i * 0.18})`; ctx.lineWidth = 0.6; ctx.stroke();
    }
  }
  function loop() {
    renderFrame();
    if (spin && !dragging && !reduce) ay += 0.006;
    raf = requestAnimationFrame(loop);
  }
  function loadModel(url, cb) {
    fetch(url).then(r => r.arrayBuffer()).then(buf => { tris = parseSTL(buf); if (tris) prep(); renderFrame(); cb && cb(tris ? null : new Error("parse")); })
      .catch(e => cb && cb(e));
  }
  if (controls) {
    canvas.addEventListener("pointerdown", (e) => { dragging = true; lx = e.clientX; ly = e.clientY; canvas.style.cursor = "grabbing"; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener("pointermove", (e) => { if (!dragging) return; ay += (e.clientX - lx) * 0.01; ax += (e.clientY - ly) * 0.01; ax = Math.max(-2.4, Math.min(0.4, ax)); lx = e.clientX; ly = e.clientY; });
    const up = () => { dragging = false; canvas.style.cursor = "grab"; };
    canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", up);
  }
  size(); loop();
  function resize() { size(); if (tris) { prep(); renderFrame(); } }
  window.addEventListener("resize", resize);
  return { loadModel, setSpin(v) { spin = v; }, destroy() { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); canvas.remove(); } };
}

export function STLViewer({ src, controls = true, autoRotate = true }) {
  const box = useRef(null);
  const viewer = useRef(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!box.current) return;
    const opts = { controls, autoRotate };
    let v = null;
    if (window.THREE && webglOK()) v = makeGLViewer(box.current, opts);
    if (!v) v = makeSoftViewer(box.current, opts);
    viewer.current = v;
    return () => { if (viewer.current) viewer.current.destroy(); viewer.current = null; };
  }, []);

  useEffect(() => {
    if (!viewer.current) return;
    setLoading(true); setFailed(false);
    viewer.current.loadModel(src, (err) => { setLoading(false); if (err) setFailed(true); });
  }, [src]);

  return (
    <div className="stl-stage">
      <div ref={box} className="stl-canvas" />
      {loading && !failed && <div className="stl-status"><span className="stl-spin" /> loading geometry…</div>}
      {failed && <div className="stl-status">3D preview unavailable</div>}
      {controls && !loading && !failed && <span className="stl-hint">drag to orbit</span>}
    </div>
  );
}
