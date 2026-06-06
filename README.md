# Andrew Vega Sanchez — Portfolio

Single-page portfolio (dark "oscilloscope" aesthetic, animated circuit hero, live 3D
viewer of real printed STL parts). Ported from a no-build, in-browser-Babel handoff to a
small **Vite** static build and wired for **GitHub Pages**.

## Stack
- **Vite** precompiles the JSX → plain ES modules (no in-browser Babel, no console warning).
- **React 18**, **Three.js r128** (+ STLLoader/OrbitControls), and **Lucide** load as pinned
  CDN globals in `index.html` — kept identical to the original so the look and the 3D viewer
  are pixel-for-pixel the same.
- `base: "./"` (relative) so the build works at a project-pages subpath *and* a custom-domain root.

## Project layout
```
index.html              # CDN libs + <script type="module"> entry
vite.config.js          # base "./", classic JSX against global React
package.json
src/
  app.jsx               # entry — imports CSS, mounts <App>
  shared.jsx            # DATA, hooks, Icon helper (ES exports)
  STLViewer.jsx         # WebGL viewer + software-canvas fallback
  Hero.jsx              # animated circuit canvas + hero
  sections.jsx          # Nav, About, Projects, Skills, Experience, Contact, Footer
  colors_and_type.css   # design tokens
  styles.css            # layout & components
public/
  favicon.svg
  models/*.stl          # real printed parts (served at /models/…)
  assets/               # drop nqn-logo.png here (see note below)
.github/workflows/deploy.yml   # build + deploy to Pages on push to main
```

## Develop / build
```bash
npm install
npm run dev       # local dev server (hot reload)
npm run build     # outputs static site to dist/
npm run preview   # serve the built dist/ locally
```

## Deploy to GitHub Pages
The repo auto-builds and deploys via GitHub Actions on every push to `main`.

1. Create an **empty** repo on GitHub named `portfolio` (no README/.gitignore).
2. From this folder in your Mac terminal:
   ```bash
   git remote add origin https://github.com/andrewsvega/portfolio.git
   git branch -M main
   git push -u origin main
   ```
   *(This repo is already initialized with a first commit.)*
3. On GitHub: **Settings → Pages → Build and deployment → Source = GitHub Actions**.
4. The `Deploy to GitHub Pages` workflow runs; your site goes live at
   `https://andrewsvega.github.io/portfolio/`.

## Custom domain
Once your domain is registered:
1. **Settings → Pages → Custom domain** → enter the domain → Save (then check *Enforce HTTPS*).
2. Add a `public/CNAME` file containing just the domain (e.g. `andrewvega.dev`) and commit it,
   so every Actions deploy preserves the domain.
3. At your registrar, point DNS at GitHub Pages:
   - Apex (`example.com`): four `A` records → `185.199.108.153`, `185.199.109.153`,
     `185.199.110.153`, `185.199.111.153` (and the matching `AAAA` records if you want IPv6).
   - `www` subdomain: a `CNAME` record → `andrewsvega.github.io`.

## Notes
- **NQN logo:** the About card expects `public/assets/nqn-logo.png`. It wasn't in the handoff,
  so the image is hidden gracefully until you drop the file in. Add it and it appears — no code change.
- **Fonts** still load from Google Fonts (`@import` in `colors_and_type.css`). Self-hosting
  Space Grotesk / IBM Plex is an optional later speed/privacy upgrade.
