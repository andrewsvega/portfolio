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

## Custom domain — andrewvegasanchez.com
Records below verified against GitHub's official docs.

1. *(Recommended, do first)* Verify the domain: **Settings → Pages → "Verify a domain"**, then
   add the `TXT` record GitHub gives you. This blocks anyone else from claiming your domain.
2. **Settings → Pages → Custom domain** → enter `andrewvegasanchez.com` → Save.
   With the Actions deploy flow this setting is authoritative and persists across deploys;
   the committed `public/CNAME` file is just a marker (GitHub ignores it when deploying via Actions).
3. At your registrar, set DNS for the apex `andrewvegasanchez.com`:

   | Type | Name | Value |
   |---|---|---|
   | `A` | `@` | `185.199.108.153` |
   | `A` | `@` | `185.199.109.153` |
   | `A` | `@` | `185.199.110.153` |
   | `A` | `@` | `185.199.111.153` |
   | `AAAA` | `@` | `2606:50c0:8000::153` |
   | `AAAA` | `@` | `2606:50c0:8001::153` |
   | `AAAA` | `@` | `2606:50c0:8002::153` |
   | `AAAA` | `@` | `2606:50c0:8003::153` |
   | `CNAME` | `www` | `andrewsvega.github.io` |

   Remove any default/parking `A` record the registrar pre-populates. The `www` CNAME lets GitHub
   auto-redirect `www.andrewvegasanchez.com` ↔ the apex.
4. DNS can take up to 24h to propagate. Verify with `dig andrewvegasanchez.com +noall +answer -t A`.
5. Back in **Settings → Pages**, check **Enforce HTTPS** (available within ~24h of the DNS resolving).

## Notes
- **NQN logo:** the About card expects `public/assets/nqn-logo.png`. It wasn't in the handoff,
  so the image is hidden gracefully until you drop the file in. Add it and it appears — no code change.
- **Fonts** still load from Google Fonts (`@import` in `colors_and_type.css`). Self-hosting
  Space Grotesk / IBM Plex is an optional later speed/privacy upgrade.
