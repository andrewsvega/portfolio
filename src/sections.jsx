/* sections.jsx — Nav, About, Projects, Skills, Experience/Education, Contact, Footer */

import { DATA, Icon, useScrolled, jumpTo } from "./shared.jsx";
import { STLViewer } from "./STLViewer.jsx";

const { useState } = React;

/* ---- Top navigation ---- */
export function Nav() {
  const scrolled = useScrolled();
  const links = [["about", "about"], ["projects", "work"], ["skills", "skills"], ["experience", "experience"], ["contact", "contact"]];
  return (
    <nav className={"nav" + (scrolled ? " scrolled" : "")}>
      <a className="brand" onClick={() => jumpTo("top")} style={{ cursor: "pointer" }}>
        <span className="mark">AV</span>
        <span className="who">Andrew Vega <span>/ Computer Eng.</span></span>
      </a>
      <div className="nav-links">
        {links.map(([id, label]) => (
          <a className="nav-link" key={id} onClick={() => jumpTo(id)}>{label}</a>
        ))}
        <a className="btn btn-ghost" style={{ padding: "9px 16px" }} href={"mailto:" + DATA.email}>
          <Icon name="mail" size={16} /> Email
        </a>
      </div>
    </nav>
  );
}

/* ---- About ---- */
export function About() {
  const v = DATA.venture;
  return (
    <section className="section-pad" id="about">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="section-index"><b>01</b> / about <span className="rule" /></span>
          <h2 className="t-h2">Computer engineering appealed to me because of how physical it is.</h2>
        </div>
        <div className="about-grid">
          <div className="about-body t-body reveal">
            <p>Hardware you can touch, circuits you can build, problems you can't solve by just staring at a screen. That instinct toward <strong>building things</strong> — combined with a lifelong interest in how technology works at a fundamental level — is what led me to <strong>FPGA design, signal processing, and embedded systems</strong>.</p>
            <p>I learn by making and measuring: collecting RSSI fingerprints across a hallway, tuning a Kalman filter until the estimate stops jittering, synthesizing VHDL to an FPGA stage by stage, then 3D-printing the enclosure it all lives in. What I find most compelling is <strong>semiconductor and chip manufacturing</strong> — the intersection of precision, physics, and engineering complexity that makes it one of the hardest things to pull off.</p>
            <p>I graduated from <strong>Cal State Bakersfield in May 2026</strong> and am now doing AI training work at <strong>Handshake AI</strong>. I'm looking for roles where the engineering is as hands-on as it is technical — and I'm <strong>open to relocating anywhere in the US</strong>.</p>
          </div>
          <div className="about-side">
            {DATA.facts.map((f, i) => (
              <div className={"fact reveal d" + (i + 1)} key={i}>
                <span className="k">{f.k}</span>
                <span className="v" dangerouslySetInnerHTML={{ __html: f.v }} />
              </div>
            ))}
            <a className="fact venture reveal d4" href={"https://" + v.url} target="_blank" rel="noreferrer">
              <span className="k">Also building</span>
              <img className="venture-logo" src={v.logo} alt="NQN Jewelry" onError={(e) => { e.currentTarget.style.display = "none"; }} />
              <span className="venture-note">{v.note}</span>
              <span className="venture-link">{v.url} <Icon name="arrow-up-right" size={13} /></span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---- Featured project 3D enclosure viewer (real STL parts) ---- */
function FeaturedViewer() {
  const models = DATA.featured.models;
  const [idx, setIdx] = useState(3); // default: beacon base
  return (
    <div className="feat-visual-wrap">
      <div className="feat-visual">
        <STLViewer src={models[idx].src} controls={true} autoRotate={true} />
        <span className="feat-visual-tag">{models[idx].label} · STL</span>
      </div>
      <div className="model-switch">
        {models.map((m, i) => (
          <button key={m.id} className={"model-btn" + (i === idx ? " on" : "")} onClick={() => setIdx(i)}>{m.label}</button>
        ))}
      </div>
    </div>
  );
}

/* ---- Projects ---- */
export function Projects() {
  const f = DATA.featured;
  return (
    <section className="section-pad" id="projects">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="section-index"><b>02</b> / projects <span className="rule" /></span>
          <h2 className="t-h2">Selected work</h2>
          <p className="t-body" style={{ margin: 0 }}>Real builds from coursework, capstone, and the bench. Drag the model below to inspect the actual printed parts.</p>
        </div>
        <div className="proj-grid">
          <article className="card featured reveal">
            <FeaturedViewer />
            <div className="feat-body">
              <div className="card-top">
                <span className="badge-featured">★ Featured</span>
                <span className="tag">{f.course}</span>
              </div>
              <h3 className="t-h3">{f.title}</h3>
              <p className="t-body">{f.blurb}</p>
              <div className="point-list">
                {f.points.map((p, i) => (
                  <span className="point" key={i}><span className="pt-mark">▸</span>{p}</span>
                ))}
              </div>
              <div className="tag-row">
                {f.stack.map((s, i) => <span className="tag" key={i}>{s}</span>)}
              </div>
              <a className="proj-link" style={{ marginTop: 8 }}>
                Case study & code coming soon <Icon name="arrow-up-right" size={15} />
              </a>
            </div>
          </article>

          {DATA.projects.map((p, i) => (
            <article className={"card reveal d" + ((i % 4) + 1)} key={i}>
              <div className="card-top">
                <span className="ph-icon"><Icon name={p.icon} size={20} /></span>
                <span className="tag">{p.discipline}</span>
              </div>
              <h3 className="t-h3">{p.title}</h3>
              <p className="t-body" style={{ fontSize: "0.95rem" }}>{p.blurb}</p>
              <div className="tag-row">
                {p.stack.map((s, j) => <span className="tag" key={j}>{s}</span>)}
              </div>
              <div className="card-foot">
                <span className="course-tag">{p.course}</span>
                {p.hasModels && <span className="model-flag"><Icon name="box" size={13} /> 3D models soon</span>}
              </div>
            </article>
          ))}

          <article className="card placeholder reveal d2">
            <div className="card-top">
              <span className="ph-icon"><Icon name="plus" size={20} /></span>
              <span className="tag">/ more</span>
            </div>
            <h3 className="t-h3" style={{ color: "var(--fg-2)" }}>More on the way</h3>
            <p className="t-body" style={{ fontSize: "0.95rem" }}>{DATA.moreProjects.note}</p>
            <a className="proj-link" style={{ marginTop: "auto", color: "var(--fg-3)" }}>
              In progress <Icon name="loader" size={15} />
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}

/* ---- Skills ---- */
export function Skills() {
  return (
    <section className="section-pad" id="skills">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="section-index"><b>03</b> / skills <span className="rule" /></span>
          <h2 className="t-h2">Toolchain</h2>
        </div>
        <div className="skills-grid">
          {DATA.skills.map((g, i) => (
            <div className={"skill-group reveal d" + ((i % 4) + 1)} key={i}>
              <div className="sg-head">
                <span className="sg-ico"><Icon name={g.icon} size={18} /></span>
                <div>
                  <h3 className="t-h3">{g.group}</h3>
                  <span className="sg-sub">{g.sub}</span>
                </div>
              </div>
              <div className="pill-row">
                {g.items.map((it, j) => <span className="pill" key={j}>{it}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---- Experience + Education ---- */
export function Experience() {
  const edu = DATA.education;
  return (
    <section className="section-pad" id="experience">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="section-index"><b>04</b> / experience + education <span className="rule" /></span>
          <h2 className="t-h2">Track record</h2>
        </div>
        <div className="xp-grid">
          <div className="timeline reveal">
            {DATA.experience.map((e, i) => (
              <div className="tl-item" key={i}>
                <span className="tl-when">{e.when}</span>
                <h3 className="tl-role">{e.role}</h3>
                <span className="tl-org">{e.org}</span>
                <p className="t-body tl-note" style={{ fontSize: "0.98rem" }}>{e.note}</p>
              </div>
            ))}
          </div>
          <div className="edu-card reveal d2">
            <span className="section-index" style={{ color: "var(--fg-3)" }}><Icon name="graduation-cap" size={16} /> Education</span>
            <div>
              <h3 className="t-h3" style={{ marginBottom: 4 }}>{edu.degree}</h3>
              <span className="tl-org">{edu.school}</span>
              <div className="tl-when" style={{ marginTop: 8 }}>{edu.when}</div>
            </div>
            <div className="edu-stats">
              {edu.stats.map((s, i) => (
                <div className="stat" key={i}><div className="num">{s.num}</div><div className="lbl">{s.lbl}</div></div>
              ))}
            </div>
            <div className="edu-prior">
              <span className="tl-org" style={{ color: "var(--fg-1)" }}>{edu.prior.degree}</span>
              <span className="tl-when">{edu.prior.school} · {edu.prior.when}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---- Contact ---- */
export function Contact() {
  const links = [
    { icon: "mail", label: DATA.email, href: "mailto:" + DATA.email },
    { icon: "linkedin", label: DATA.linkedin, href: "https://" + DATA.linkedin },
    { icon: "github", label: "github.com/" + DATA.github, href: "https://github.com/" + DATA.github },
  ];
  return (
    <section className="section-pad contact" id="contact">
      <div className="wrap">
        <span className="section-index reveal" style={{ justifyContent: "center" }}><b>05</b> / contact</span>
        <h2 className="t-h2 reveal d1">Let's build something that reads the physical world.</h2>
        <p className="t-lead reveal d2" style={{ maxWidth: 560 }}>Open to full-time embedded, DSP, and ML roles across the US. The fastest way to reach me is email.</p>
        <div className="contact-links reveal d3">
          {links.map((l, i) => (
            <a className="contact-link" key={i} href={l.href} target="_blank" rel="noreferrer">
              <Icon name={l.icon} size={17} /> {l.label}
            </a>
          ))}
        </div>
        <a className="btn btn-primary reveal d3" style={{ marginTop: 12 }} href={"mailto:" + DATA.email}>
          <Icon name="send" size={17} /> Start a conversation
        </a>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <span>© 2026 Andrew Vega Sanchez</span>
        <span>Computer Engineer · Embedded // DSP // ML</span>
        <span>Built from signal.</span>
      </div>
    </footer>
  );
}
