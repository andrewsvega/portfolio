/* Hero.jsx — hero section with an animated PCB-trace / signal-network canvas.
   Layered parallax (mouse + scroll) gives depth; pulses travel along traces. */

import { DATA, Icon, jumpTo } from "./shared.jsx";
import { STLViewer } from "./STLViewer.jsx";

const { useRef, useEffect } = React;

function CircuitCanvas() {
  const ref = useRef(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });
  const scrollY = useRef(0);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let raf, W, H, DPR;
    let nodes = [], edges = [], pulses = [];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function size() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      build();
    }

    function build() {
      nodes = []; edges = [];
      const density = Math.max(26, Math.floor((W * H) / 26000));
      const cols = Math.round(Math.sqrt(density * (W / H)));
      const rows = Math.ceil(density / cols);
      const cw = W / cols, ch = H / rows;
      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const layer = (r + c) % 3; // 0 far .. 2 near
          nodes.push({
            hx: c * cw, hy: r * ch,
            x: c * cw + (Math.random() - 0.5) * cw * 0.55,
            y: r * ch + (Math.random() - 0.5) * ch * 0.55,
            layer,
            size: layer === 2 ? 2.4 : layer === 1 ? 1.7 : 1.1,
            phase: Math.random() * Math.PI * 2,
            hub: Math.random() < 0.12,
          });
        }
      }
      // connect to nearby nodes (orthogonal L-routes -> PCB trace feel)
      const maxD = Math.max(cw, ch) * 1.5;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const d = Math.hypot(a.hx - b.hx, a.hy - b.hy);
          if (d < maxD && Math.random() < 0.5) edges.push({ a: i, b: j });
        }
      }
      pulses = [];
      const pcount = reduce ? 0 : Math.min(18, Math.floor(edges.length * 0.03));
      for (let i = 0; i < pcount; i++) spawnPulse();
    }

    function spawnPulse() {
      if (!edges.length) return;
      const e = edges[(Math.random() * edges.length) | 0];
      pulses.push({ e, t: Math.random(), speed: 0.0025 + Math.random() * 0.004, color: Math.random() < 0.16 ? "amber" : "signal" });
    }

    function project(n, t) {
      // parallax: nearer layers move more with mouse + scroll
      const depth = (n.layer + 1) / 3;
      const mx = (mouse.current.x - 0.5) * 36 * depth;
      const my = (mouse.current.y - 0.5) * 28 * depth;
      const sc = scrollY.current * 0.12 * depth;
      const drift = reduce ? 0 : Math.sin(t * 0.0004 + n.phase) * 3 * depth;
      return { x: n.x + mx + drift, y: n.y + my + sc, depth };
    }

    function lpath(pa, pb) {
      // L-shaped route between two projected points
      const midX = pa.x, midY = pb.y;
      return [pa, { x: midX, y: midY }, pb];
    }

    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      // edges
      for (const e of edges) {
        const a = nodes[e.a], b = nodes[e.b];
        const pa = project(a, t), pb = project(b, t);
        const alpha = 0.05 + Math.min(pa.depth, pb.depth) * 0.08;
        const pts = lpath(pa, pb);
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        ctx.lineTo(pts[1].x, pts[1].y);
        ctx.lineTo(pts[2].x, pts[2].y);
        ctx.strokeStyle = `rgba(157,171,188,${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      // pulses
      for (const p of pulses) {
        const e = edges[ (typeof p.e === 'number' ? p.e : edges.indexOf(p.e)) ] || p.e;
        const ed = (typeof p.e === 'object') ? p.e : edges[p.e];
        const a = nodes[ed.a], b = nodes[ed.b];
        const pa = project(a, t), pb = project(b, t);
        const pts = lpath(pa, pb);
        // travel across two segments
        const seg = p.t < 0.5 ? [pts[0], pts[1], p.t / 0.5] : [pts[1], pts[2], (p.t - 0.5) / 0.5];
        const x = seg[0].x + (seg[1].x - seg[0].x) * seg[2];
        const y = seg[0].y + (seg[1].y - seg[0].y) * seg[2];
        const col = p.color === "amber" ? "244,169,60" : "77,230,190";
        const g = ctx.createRadialGradient(x, y, 0, x, y, 9);
        g.addColorStop(0, `rgba(${col},0.9)`); g.addColorStop(1, `rgba(${col},0)`);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(${col},1)`; ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
        if (!reduce) p.t += p.speed;
        if (p.t >= 1) { pulses.splice(pulses.indexOf(p), 1); spawnPulse(); }
      }
      // nodes
      for (const n of nodes) {
        const pp = project(n, t);
        const tw = reduce ? 1 : 0.6 + 0.4 * Math.sin(t * 0.002 + n.phase);
        if (n.hub) {
          ctx.strokeStyle = `rgba(77,230,190,${0.25 * pp.depth})`;
          ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(pp.x, pp.y, n.size + 4, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = `rgba(124,245,214,${0.7 * tw * pp.depth})`;
        } else {
          ctx.fillStyle = `rgba(157,171,188,${0.4 * pp.depth})`;
        }
        ctx.beginPath(); ctx.arc(pp.x, pp.y, n.size, 0, Math.PI * 2); ctx.fill();
      }
    }

    function loop(t) { draw(t); raf = requestAnimationFrame(loop); }

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
    };
    const onScroll = () => { scrollY.current = window.scrollY; };

    size();
    raf = requestAnimationFrame(loop);
    window.addEventListener("resize", size);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", size); window.removeEventListener("mousemove", onMove); window.removeEventListener("scroll", onScroll); };
  }, []);

  return <canvas ref={ref} className="hero-canvas" aria-hidden="true" />;
}

export function Hero() {
  return (
    <section className="hero" id="top">
      <CircuitCanvas />
      <div className="hero-veil" />
      <div className="wrap">
        <div className="hero-grid">
          <div className="hero-copy">
            <div className="hero-status reveal in">
              <span className="dot-live" />
              <span>Open to embedded · DSP · ML roles — US-wide</span>
            </div>
            <h1 className="t-display reveal in d1">
              {DATA.name.split(" ").slice(0, 2).join(" ")}<br />
              <span style={{ color: "var(--fg-2)" }}>{DATA.name.split(" ").slice(2).join(" ")}</span>
            </h1>
            <div className="hero-roles reveal in d2">
              <span className="role-chip">{DATA.title}</span>
              {DATA.disciplines.map((d, i) => <span className="role-chip" key={i}><b>{d}</b></span>)}
            </div>
            <p className="t-lead hero-summary reveal in d3">{DATA.summary}</p>
            <div className="hero-cta reveal in d4">
              <a className="btn btn-primary" onClick={() => jumpTo("projects")}>
                <Icon name="folder-git-2" size={17} /> View Projects
              </a>
              <a className="btn btn-ghost" onClick={() => jumpTo("contact")}>
                <Icon name="send" size={17} /> Contact Me
              </a>
            </div>
          </div>
          <div className="hero-3d reveal in d2" aria-hidden="true">
            <STLViewer src="models/pyramid-base.stl" controls={false} autoRotate={true} />
            <span className="hero-3d-tag">RSSI beacon housing · printed · real geometry</span>
          </div>
        </div>
      </div>
      <div className="hero-scroll" aria-hidden="true">
        <span>scroll</span>
        <span className="line" />
      </div>
    </section>
  );
}
