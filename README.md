<<<<<<< HEAD
# KarnArchery (कर्ण धनुर्विद्या)
### 3D Mythological Archery Browser Game

> *"Born to Rise. Trained to Conquer. Destined to Become a Legend."*

**KarnArchery** is a complete, polished, playable 3D browser game inspired by the legendary archer Karna and the Mahabharata era. Featuring ancient Indian palace and hermitage environments, royal training grounds, custom 3D vector ballistics, first-person and third-person camera modes, 25 story levels across 5 chapters, and procedural mythological audio.

---

## 🏹 Features

- **Realistic 3D Projectile Ballistics**:
  - Vector-based projectile equations of motion with true gravitational drop ($g = -9.81 \text{ m/s}^2$).
  - Dynamic lateral wind vector drift and aerodynamic drag compensation.
  - Tangent-aligned arrow trajectory rotation.
  - Continuous swept-line ray collision detection against targets and concentric rings.
  - Arrows embed with realistic penetration depth into targets or ground.
- **Dual Camera System**:
  - **First-Person (FPS)**: Sight along the arrow and bow riser with precision reticle.
  - **Third-Person (TPS)**: Over-the-shoulder cinematic perspective showcasing the archer's armor, flowing cape, and bow draw.
  - Instant toggle with the `C` key or on-screen button without losing aim or draw tension.
- **Story Mode (25 Playable Levels across 5 Chapters)**:
  - **Chapter 1: The Beginning** – Gurukul training, stationary targets, wind fundamentals.
  - **Chapter 2: The Royal Tournament** – Moving targets, arena crosswinds, royal final.
  - **Chapter 3: The Guru's Test** – Parashurama's trials, darkness challenges with torchlight, rotating chakras.
  - **Chapter 4: The Battlefield** – Kurukshetra dusk, moving war chariots, long-range skirmishes.
  - **Chapter 5: The Legend** – Divine reach, Matsya Vedha (Fish Eye reflection challenge), unlocking the sacred Vijaya Dhanush.
- **Mythological Bow Armory**:
  1. *Gurukul Training Bow* (Bamboo & Teak, 45 m/s)
  2. *Royal Palace Bow* (Rosewood & Brass filigree, 55 m/s)
  3. *Kshatriya Warrior Bow* (Horn-reinforced & bronze tips, 68 m/s)
  4. *Surya Dhanush (Sun Bow)* (Solar gold alloy, 80 m/s)
  5. *Vijaya Dhanush (Invincible Divine Bow)* (Divine celestial bow, 95 m/s, 99% wind defiance)
- **Procedural Mythological Audio Engine**:
  - Web Audio API synthesizer for bowstring draw tension creak, snappy release twang, in-flight whistle, wooden impact thud, and divine temple bell chimes for bullseyes.
  - Procedural Indian ambient music with Tanpura drones, Bansuri flute scales (Raag Bhupali), and battlefield war drums.
- **Cross-Platform Controls**:
  - Full desktop mouse aiming, click-and-hold bow draw, keyboard shortcuts (`C`, `R`, `ESC`).
  - Mobile touch support: dedicated aim touch zone, press-and-hold Draw & Shoot button, responsive HUD.
- **Local Progress Saving**:
  - Unlocked levels, high scores, 3-star ratings, earned gold coins, equipped bow, and audio/control settings are saved via `localStorage`.

---

## 💻 Tech Stack

- **HTML5 & CSS3** (Vanilla, no frontend framework bloat)
- **Vanilla JavaScript (ES Modules)**
- **Three.js (r170)** for 3D graphics, shaders, particles, and lighting
- **Matter.js** for 2D physics prototyping experiments
- **Vite** for blazing fast local development and optimized production bundling
- **Web Audio API** for zero-latency, zero-404 procedural sound synthesis

---

## 🚀 Installation & Local Development

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Steps
1. Clone or navigate to the project directory:
   ```bash
   cd KarnArchery
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`.

---

## 📦 Production Build & Deployment

To create an optimized production build:
```bash
npm run build
```
This bundles all assets, scripts, and stylesheets into the `dist/` directory.

To preview the production build locally:
```bash
npm run preview
```

### Static Hosting Deployment
The generated `dist/` folder can be hosted on any static hosting provider:
- **Vercel**: Run `npx vercel` or link your repository.
- **Netlify**: Drag and drop the `dist/` folder or deploy via GitHub.
- **GitHub Pages**: Deploy the `dist/` folder using `gh-pages` or GitHub Actions.

---

## 🎮 Controls

### Desktop
| Action | Control |
|---|---|
| **Aim** | Move Mouse |
| **Draw Bow** | Press & Hold Left Mouse Button |
| **Shoot Arrow** | Release Left Mouse Button |
| **Switch Camera (FPS/TPS)** | `C` key or on-screen button |
| **Restart Level** | `R` key or on-screen button |
| **Pause Game** | `ESC` key or on-screen button |

### Mobile / Tablet
| Action | Control |
|---|---|
| **Aim** | Drag finger on the Aim Zone (left 70% of screen) |
| **Draw & Shoot** | Press & hold the golden **Draw** button, then release to shoot |
| **Switch Camera** | Tap the **Camera** button |
| **Pause** | Tap the **Pause** button |

---

## 📜 Asset Credits & Attribution

See [docs/ASSET_CREDITS.md](./docs/ASSET_CREDITS.md) for detailed documentation of concept art, audio synthesis, and procedural 3D model geometry.
=======
# KarnArchery
KarnArchery is a 3D mythological archery game inspired by the Mahabharata era, featuring realistic warriors, immersive environments, challenging levels and thrilling bow-and-arrow gameplay.
>>>>>>> 00acd8d6a742816561c0364f5fe26d52221d10de
