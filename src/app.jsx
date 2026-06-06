/* app.jsx — composes the portfolio page and mounts it.
   React / ReactDOM are loaded as globals from CDN <script> tags in index.html. */

import "./colors_and_type.css";
import "./styles.css";

import { useReveal } from "./shared.jsx";
import { Hero } from "./Hero.jsx";
import { Nav, About, Projects, Skills, Experience, Contact, Footer } from "./sections.jsx";

const { useEffect } = React;

function App() {
  useReveal();
  useEffect(() => { if (window.lucide) window.lucide.createIcons(); }, []);
  return (
    <React.Fragment>
      <Nav />
      <main>
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
