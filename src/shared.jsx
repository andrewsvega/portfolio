/* shared.jsx — hooks, Icon helper, and portfolio content data.
   React/lucide are loaded as globals from CDN <script> tags in index.html. */

const { useRef, useEffect, useState, useCallback } = React;

/* ---- Lucide icon wrapper. Renders an <i data-lucide> then hydrates. ---- */
export function Icon({ name, size, style, className }) {
  const ref = useRef(null);
  useEffect(() => {
    if (window.lucide && ref.current) {
      ref.current.innerHTML = "";
      const i = document.createElement("i");
      i.setAttribute("data-lucide", name);
      ref.current.appendChild(i);
      window.lucide.createIcons({ attrs: { width: size || 18, height: size || 18 }, nameAttr: "data-lucide" });
    }
  }, [name, size]);
  return <span ref={ref} className={className} style={{ display: "inline-flex", lineHeight: 0, ...style }} />;
}

/* ---- Scroll-reveal: adds .in when element enters viewport ---- */
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(e => io.observe(e));
    return () => io.disconnect();
  }, []);
}

/* ---- Nav scrolled state ---- */
export function useScrolled(threshold = 40) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

/* ---- Smooth in-page jump ---- */
export function jumpTo(id) {
  const el = document.getElementById(id);
  if (el) window.scrollTo({ top: el.offsetTop - 70, behavior: "smooth" });
}

/* ================= CONTENT (from master resume) ================= */
export const DATA = {
  name: "Andrew Vega Sanchez",
  title: "Computer Engineer",
  disciplines: ["Embedded Systems", "Signal Processing", "ML"],
  summary: "Hardware you can touch, circuits you can build, problems you can't solve by just staring at a screen. A computer engineer drawn to FPGA design, signal processing, and the precision of semiconductor manufacturing.",
  email: "andrewvss2468@gmail.com",
  phone: "(559) 754-8667",
  linkedin: "linkedin.com/in/andrewvss",
  github: "andrewsvega",

  facts: [
    { k: "Based in", v: "California — <em>open to relocation, US-wide</em>" },
    { k: "Currently", v: "AI Training @ <em>Handshake AI</em>" },
    { k: "Drawn to", v: "Semiconductor & <em>chip manufacturing</em>" },
    { k: "Status", v: "<em>Open</em> to full-time roles" },
  ],

  // NQN Jewelry — personal venture; logo provided
  venture: {
    name: "NQN Jewelry",
    url: "nqnjewelry.com",
    note: "Independently launched and operate an online jewelry business — sourcing, operations, UX/content, and fulfillment.",
    logo: "assets/nqn-logo.png",
  },

  featured: {
    title: "Wireless Indoor Localization System",
    course: "CSUB Senior Project · Spring 2026",
    blurb: "A team-built real-time indoor positioning system that locates a device from Wi‑Fi RSSI alone — no GPS. Signal data is collected across a spatial grid, classified by ML, and stabilized through a Kalman pipeline. Demoed live at the Senior Engineering Expo, housed in the 3D-printed enclosures shown here.",
    points: [
      "WiFi RSSI fingerprinting across a spatial grid",
      "KNN · Decision Tree · Random Forest · Neural Net classifiers",
      "Per-beacon Kalman → alpha-trimmed smoothing → prediction",
      "2D constant-velocity Kalman for position stabilization",
      "Beat trilateration under real-world multipath",
    ],
    stack: ["Python", "scikit-learn", "NumPy", "Matplotlib"],
    // real 3D-printed parts (binary STL)
    models: [
      { id: "case-base", label: "Case · Base", src: "models/case-base.stl" },
      { id: "case-lid", label: "Case · Lid", src: "models/case-lid.stl" },
      { id: "case-secure", label: "Case · Clip", src: "models/case-secure.stl" },
      { id: "pyramid-base", label: "Beacon · Base", src: "models/pyramid-base.stl" },
      { id: "pyramid-door", label: "Beacon · Door", src: "models/pyramid-door.stl" },
    ],
  },

  // Real projects from the resume. hasModels flags a future 3D viewer slot.
  projects: [
    { title: "RC Car with Wireless Remote", discipline: "Embedded · FPGA", icon: "car", course: "ECE 3220 — Digital Design with VHDL",
      blurb: "Digital logic designed in VHDL on Quartus II (FSMs, counters, muxes) and synthesized to FPGA, with embedded C++ firmware driving NRF24L01 wireless and DC motor control. Live end-of-semester demo.",
      stack: ["VHDL", "C++", "Quartus II", "NRF24L01"], hasModels: true },
    { title: "Digital FIR / IIR Filter Design", discipline: "Signal Processing", icon: "audio-waveform", course: "ECE 4220 — DSP",
      blurb: "Linear-phase FIR and IIR filters implemented in Python, with DTFT, DFT, FFT, and z-transform algorithms built from their mathematical definitions — worked out by hand, then validated against theory.",
      stack: ["Python", "NumPy", "FFT", "z-transform"] },
    { title: "Wireless Channel Modeling", discipline: "Communications", icon: "radio", course: "ECE 4250 — Wireless Comms",
      blurb: "MATLAB simulations of log-normal shadowing and path loss across urban, mid-city, suburban, and rural environments, plus Rician fading statistics. Studied OFDM, MIMO, spread spectrum, and diversity.",
      stack: ["MATLAB", "OFDM", "MIMO"] },
    { title: "ARMv8 Assembly & Cache Architecture", discipline: "Computer Architecture", icon: "cpu", course: "CMPS 3240 — Comp Arch II",
      blurb: "ARMv8 programs covering control flow, subroutines, SIMD, and loop unrolling on a remote Linux server. Benchmarked direct-mapped vs. set-associative caches in C and analyzed pipeline hazards by hand.",
      stack: ["ARMv8 Asm", "C", "SIMD"] },
    { title: "ML-Based 3D Indoor Localization", discipline: "Machine Learning", icon: "brain-circuit", course: "CMPS 4550 — Applied ML",
      blurb: "Benchmarked KNN, Decision Tree, Random Forest, and Neural Network models on a real RSSI dataset for 3D position estimation — full pipeline: normalization, feature selection, dimensionality reduction, outlier detection.",
      stack: ["Python", "scikit-learn", "KNN", "Random Forest"] },
  ],
  moreProjects: { note: "Analog & digital circuit design, embedded systems (FSM traffic controller), OS & concurrency, and more — write-ups and 3D models on the way." },

  skills: [
    { group: "Languages", sub: "code // hdl", icon: "code-2", items: ["Python", "C", "C++", "MATLAB", "VHDL", "ARMv8 Asm", "MIPS Asm", "LabVIEW", "LaTeX"] },
    { group: "EDA & FPGA", sub: "design", icon: "circuit-board", items: ["Quartus II", "FPGA synthesis", "LabVIEW FPGA", "Multisim", "HDL co-design"] },
    { group: "Signal Processing", sub: "dsp", icon: "audio-waveform", items: ["FIR / IIR", "FFT / DFT / DTFT", "z-transform", "Convolution", "Laplace", "Sampling"] },
    { group: "Machine Learning", sub: "ml", icon: "brain-circuit", items: ["KNN", "Decision Trees", "Random Forest", "Neural Nets", "k-means", "Feature selection"] },
    { group: "Wireless & Comms", sub: "rf", icon: "radio", items: ["OFDM", "MIMO", "Path loss", "Log-normal shadowing", "Rician fading", "Spread spectrum"] },
    { group: "Hardware", sub: "lab // bench", icon: "cpu", items: ["NI ELVIS", "Arduino", "NRF24L01", "Oscilloscope", "Motor drivers", "3D CAD & printing"] },
    { group: "Systems", sub: "arch", icon: "binary", items: ["CPU pipeline", "Cache architecture", "Virtual memory", "Scheduling", "Concurrency", "SIMD"] },
  ],

  experience: [
    { when: "May 2026 — Present", role: "AI Training Contractor", org: "Handshake AI", note: "Evaluate and annotate AI-generated outputs for technical accuracy and logical reasoning across engineering and STEM. Apply subject-matter expertise in DSP, FPGA design, and applied ML to surface technical errors and produce high-quality training data." },
  ],
  education: {
    school: "California State University, Bakersfield",
    degree: "B.S. Computer Engineering",
    when: "May 2026",
    prior: { school: "Santa Monica College", degree: "A.A. General Science", when: "Jan 2022" },
    stats: [{ num: "3.35", lbl: "CSUB GPA" }, { num: "×4", lbl: "Dean's List" }],
  },
};
