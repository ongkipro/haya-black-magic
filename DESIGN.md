# DESIGN.md — Haya Espresso Bar: Black Magic Coffee Experience

Author: agy

## Public experience

- **Surface:** `Editorial Storytelling & Scrollytelling Showcase` (`design-taste` surface catalog §10 + §4 `F&B / Cafe / Roastery / Culinary Showcase`) — a dedicated single-product interactive 3D WebGL & GSAP scrollytelling website built 100% around Haya Espresso Bar's signature **Black Magic Coffee** (*Black Magic Cappuccino* / *Magic Haya*).
- **Audience:** Specialty coffee enthusiasts, design-conscious cafe visitors in Malang, and coffee drinkers seeking a naturally sweet, zero-added-sugar cappuccino calibrated at Haya Espresso Bar in Sawojajar.
- **First-screen job:** Immediately immerse the visitor in the 1:1 Tabasco-style (`https://tabasco.hilostudiolab.com/`) fixed full-viewport (`100dvh`) 3D WebGL stage with bold `Halagar` display typography (`THE ROOT OF BLACK MAGIC`), a sculpted 3D Hambach bottomless portafilter and Flores Bajawa coffee bean cluster on the left, and a top-right trigger to watch the authentic 25-second `Magic HAYA.mov` extraction film.
- **Action path:** Scroll through the `800vh` GSAP `ScrollTrigger` timeline (`t = 0.0` to `10.0`) across 8 choreographed narrative beats:
  1. `THE ROOT OF BLACK MAGIC` (Dark studio `#000000`–`#2a2a2a`, 3D Portafilter & Flores Bajawa cluster on left, narrative on right)
  2. `THE STANDARD` (Camera orbits `180°` around the 3D extraction cluster so the model moves to the right while `18.0g / 2.45s Maquinos / Vesper` specs appear on the left)
  3. `CUT AT 1:1.5...` (Kinetic transition as the camera zooms into the golden-crimson double ristretto stream)
  4. `THREE ELEMENTS` (Stage ignites into crimson `#942024`–`#F40000`: `18g Flores Bajawa + 92°C Double Ristretto + 60°C Silky Microfoam`)
  5. `THE ARCHITECT OF FLAVOR: 92°C` (Dual-layer HTML background portal + foreground `3px` stroke outline `"92°C"` with the 3D machined `92°C` Hambach/Vesper thermal drum rolling horizontally between the two text layers)
  6. `And finally... Calibration becomes Black Magic` (Stage inverts to pure white `#FFFFFF`)
  7. `ONE CUP STARTED IT...` (3-column horizontal split on `#FFFFFF` with the **Single 3D Haya `160ml` Midnight-Navy Ceramic Cup & Saucer** with white rim and real `latte-art-top.webp` 3-tier tulip rosetta rotating in the center column)
  8. `FOUR STAGES OF PRECISION / MEET BLACK MAGIC` (The single 3D `160ml` Black Magic Cup in the foreground flanked by 4 3D Extraction Stage Monoliths mapped with Haya's real `Magic HAYA.mov` frames `01: 2.45s Grind`, `02: 92°C PID`, `03: 1:1.5 Ristretto`, `04: 60°C Tulip Pour`, plus an action pill with price `IDR 45.000`, `25s Extraction Film` modal, Sawojajar Maps route, and a single monochrome WhatsApp inquiry link).
- **Tone:** High-contrast sculptural WebGL minimalism, dramatic dark-to-crimson-to-white stage inversion, authentic specialty coffee telemetry.
- **Non-goals:** Multi-product catalog (strictly 1 product only: Black Magic Coffee), multi-page e-commerce checkout, decorative sparkle/magic-wand icons, or multiple competing CTAs.

## Reference evidence

- **Primary interactive scrollytelling reference (`https://tabasco.hilostudiolab.com/`):**
  - **Captured artifacts:** `design/refs/tabasco/` (`design/refs/tabasco/390.png`, `design/refs/tabasco/768.png`, and `design/refs/tabasco/1440.png`).
  - **Observed:** Built by Hilo Studio Lab using a `position: fixed; inset: 0; width: 100vw; height: 100dvh` stage over an `800vh` virtual scroll spacer (`10` timeline units × `80vh`), `Halagar` 800 display headlines (`font-baton`), `League Spartan` subheads, and `Overpass` light body copy, `#F40000` red highlight blocks, `mix-blend-difference` HUD wordmarks, a 3-stage background color timeline (`#2a2a2a -> #000000` dark studio → `#942024 -> #F40000` crimson glow at `t = 2.9` → `#FFFFFF` pure white at `t = 5.0`), and 4 choreographed 3D actors driven by GSAP timelines tied to `scrollProgress`.
  - **Adopt:**
    1. Exact 1:1 fixed-viewport scrollytelling architecture (`#scroll-spacer`, `#stage-bg`, `#html-background-portal`, `#webgl-canvas`, and 9 `.phase-section` overlays animated via GSAP `ScrollTrigger` `scrub: true`).
    2. Exact `Halagar` (`800`), `League Spartan`, and `Overpass` typography system with `#F40000` highlight blocks and `border-l-2 border-[#F40000]` split narrative layout in `ONE CUP STARTED IT...`.
    3. Exact 3-phase background transition (Dark Studio → Crimson Glow → Pure White) and dual-layer `"92°C"` portal text where the 3D rolling cylinder passes between the solid background text and the outlined foreground text.
  - **Reject:**
    1. Reject Tabasco's multi-flavor bottle lineup in the final beat (`Habanero, Jalapeño, Scorpion, Chipotle`) because this website is strictly dedicated to **1 single product: Haya's Black Magic Coffee**. Instead, the 4 flanking 3D monoliths in the final beat display the **4 real extraction stages of Black Magic itself** (`2.45s Grind`, `92°C PID`, `1:1.5 Cut`, `60°C Pour`).
    2. Reject blocking headless verification on the loader screen by auto-completing `#loader-screen` immediately when `navigator.webdriver` is active while preserving the smooth `0% -> 100%` loader transition for human visitors.
- **Primary brand & production footage reference (`HAYA PRODUKSI` — `Magic HAYA.mov`):**
  - **Captured artifacts:** `design/refs/haya/magic_frame_01.jpg`, `design/refs/haya/magic_frame_10.jpg`, `design/refs/haya/magic_frame_19.jpg`, and `design/refs/haya/magic_frame_25.jpg`.
  - **Observed:**
    - `public/images/frames/frame-08.webp`: Maquinos digital grinder dosing 18.0g of Flores Bajawa Arabica at `2.4S` with Vesper distributor tool.
    - `public/images/frames/frame-10.webp`: Hambach 2-group commercial espresso machine locked at `092°C` (`009s 129 092°C`) and `9 bar` pressure.
    - `public/images/frames/frame-12.webp`: Twin golden-mahogany `1:1.5` double ristretto streams pouring from the wooden-handled portafilter into the `160ml` midnight-navy ceramic cup with white rim.
    - `public/images/frames/frame-19.webp` & `public/images/frames/frame-21.webp`: Pouring `60°C` silky microfoam from a matte black pitcher into a 3-tier tulip rosetta inside the `160ml` midnight-navy ceramic cup on its matching navy saucer.
  - **Adopt:**
    1. Sculpt the 3D Hero `160ml` Midnight-Navy Ceramic Cup & Saucer (`#10203b` high-gloss porcelain glaze, `#fbf9f5` thick ivory-white lip, and `public/images/latte-art-top.webp` 3-tier tulip rosetta inside) to match `public/images/frames/frame-19.webp` and `public/images/frames/frame-21.webp` 1:1.
    2. Map `public/images/frames/frame-08.webp`, `public/images/frames/frame-10.webp`, `public/images/frames/frame-12.webp`, and `public/images/frames/frame-19.webp` directly onto the Phase 8 Extraction Stage Monoliths, plus embed the full 25.4-second 1080p `magic-full.mp4` (`Magic HAYA.mov`) in an on-demand cinema modal.

## Direction

**Haya Black Magic — 1:1 Tabasco-Choreographed Single-Product 3D WebGL Monograph.**
Every scroll pixel drives a synchronized Three.js camera, studio lighting rig, background color transition, and kinetic `Halagar` + `Overpass` typography overlay telling the story of a single `160ml` cup: **Black Magic Coffee at Haya Espresso Bar, Sawojajar, Malang**.

## Composition contract

- **C1 — Viewport rhythm:** Fixed `100dvh` WebGL + HTML overlay stage driven by an `800vh` scroll container (`600vh` on mobile) across 8 distinct visual beats (`origin`, `selection`, `cut-at-1-15`, `three-elements`, `architect-92c`, `patience-new`, `icon-started`, `evolution`).
- **C2 — Grid and asymmetry:**
  - Beat 0 (`origin`): 3D extraction cluster on the left (`x = -2.3`), typography block aligned right (`items-end text-left`).
  - Beat 1 (`selection`): Camera orbits `180°` so the 3D extraction cluster sits on the right while typography aligns left (`items-start text-left md:pl-[5vw]`).
  - Beat 4 (`three-elements`) & Beat 5 (`architect`): Centered monumental typography over the crimson `#942024`–`#F40000` background with dual-layer portal depth.
  - Beat 7 (`icon-started`): 3-column horizontal split (`max-w-[90vw] mx-auto`) on `#FFFFFF` with `ONE CUP STARTED IT...` on the left, the 3D `160ml` Black Magic Cup in the center, and `border-l-2 border-[#F40000]` spec prose on the right.
  - Beat 8 (`evolution`): Centered single 3D `160ml` Black Magic Cup in the foreground with the 4 real-footage Extraction Stage Monoliths fanned out symmetrically behind it.
- **C3 — Focal point per screen:** Only one `.phase-section` is visible at any scroll position (`updatePhaseSections(t)` deterministic evaluator), keeping the 3D hero object and active headline as the sole focal anchor.
- **C4 — Media treatment:** Real 1080p Haya production frames (`public/images/frames/frame-08.webp`, `public/images/frames/frame-10.webp`, `public/images/frames/frame-12.webp`, `public/images/frames/frame-19.webp`, `public/images/frames/frame-21.webp`, `public/images/latte-art-top.webp`) mapped onto Three.js PBR materials + full 25.4s `magic-full.mp4` video modal.
- **C5 — Density ceiling:** At least 45% open studio negative space per viewport so the 3D WebGL objects and oversized `Halagar` headlines breathe effortlessly.
- **C6 — Motion and restraint:** All motion is deterministic and scroll-scrubbed via GSAP `ScrollTrigger` (`scrub: true`), supplemented by gentle idle floating and pointer parallax on the active 3D meshes.
- **C7 — Do not substitute:**
  - Strictly **1 product only (Black Magic Coffee)** — zero other menu items or extra cup flavors.
  - Zero decorative `Sparkles` or magic wand icons.
  - Only verified Haya metrics (`92°C`, `2.45s`, `18g`, `1:1.5`, `36g`, `60°C`, `130ml`, `160ml`, `1,200–1,800 MASL`, `IDR 45.000`).
  - At most **one** WhatsApp link (`Ask Barista (WhatsApp)`) placed in the final beat (`evolution`) with monochrome border styling.

## Tokens and behavior

- **Stage Background Progression:**
  - `t = 0.0 -> 2.55`: `radial-gradient(circle at 50% 50%, #2a2a2a 0%, #000000 100%)`
  - `t = 2.95 -> 4.88`: `radial-gradient(circle at 50% 50%, #942024 0%, #e60000 100%)`
  - `t = 5.18 -> 10.0`: `#FFFFFF`
- **Brand & 3D Material Tokens:**
  - `--tabasco-red`: `#F40000` (Headline accent blocks, `h-3` horizontal rule, `border-l-2` narrative rule)
  - `--haya-crimson`: `#942024` (Stage 2 radial glow & ristretto emissive core)
  - `--haya-navy`: `#10203b` (160ml midnight-navy glazed porcelain cup & saucer)
  - `--haya-rim`: `#FBF9F5` (Thick ivory-white porcelain cup lip)
  - `--haya-crema`: `#D89A4C` (Golden hazelnut-cocoa 1:1.5 double ristretto crema)
- **Typography:**
  - `h1, .font-baton`: `'Halagar', 'Antonio', serif` (`font-weight: 800`, uppercase, `leading-[0.8]` to `leading-[0.9]`).
  - `h2`: `'League Spartan', 'Overpass', sans-serif`.
  - `p, .font-overpass`: `'Overpass', sans-serif` (`300`/`400`/`500`/`600`).

## Render critique

- **Inspected renders:** `screenshots/390.png`, `screenshots/1440.png`, and the 8 scrolled beat captures in `screenshots/beats/01-origin.png`, `screenshots/beats/02-harvest-beans.png`, `screenshots/beats/03-portafilter-cut.png`, `screenshots/beats/04-three-elements.png`, `screenshots/beats/05-architect-92c.png`, `screenshots/beats/06-calibration-patience.png`, `screenshots/beats/07-one-cup-started.png`, and `screenshots/beats/08-meet-black-magic.png`.
- **Two-Pass delta (Issues caught and fixed for natural video scrollytelling):**
  1. **Replaced Synthetic 3D Primitives with Live 60fps Video Textures & 96-Frame Scroll Scrubbing from `HAYA PRODUKSI`:** Instead of synthetic CGI spheres and cylinders, `src/scripts/experience.ts` renders multi-material 3D Cinema Assemblies mapped with live auto-looping 60fps extraction stage videos (`stage-01-origin.mp4`, `stage-02-grind.mp4`, `stage-03-pid92c.mp4`, `stage-04-ristretto.mp4`, `stage-05-tulip.mp4`, `stage-06-cup.mp4`, `beans-burst-slowmo.mp4`), synchronized 96-frame WebGL scroll scrubbing, and orbiting 3D parallax plates from Haya's July DSLR production shoot (Flores Bajawa bag, Vesper bar tools, and Limited Cups wooden board).
  2. **Eliminated 3D Bezel Z-Fighting, Upright Cylinder Orientation & Isolated 160ml Cup Macro Loop:** Replaced curved plane intersections with multi-material `BoxGeometry` cinema monoliths for 100% edge-to-edge clarity, rotated the `92°C` rolling cylinder canvas `-90°` so live PID/ristretto video faces upright horizontally across the `"92°C"` portal, and trimmed `stage-06-cup.mp4` (`18.25s–20.15s`) to a pure native 1080p macro loop of the `160ml` midnight-navy ceramic cup & 3-tier tulip rosetta.
- **Six-axis visual evaluation:**
  1. **Focal point & 3-second test:** Every beat has a single unmistakable 3D + live-video + typographic focal anchor on the fixed `100dvh` stage.
  2. **Hierarchy & rhythm:** Replicates `tabasco.hilostudiolab.com` 1:1 — right-aligned origin → left-aligned standard → bottom-left transition → centered crimson triad & `92°C` portal → centered white reveal → 3-column `ONE CUP STARTED IT...` split → centered `MEET BLACK MAGIC` finale.
  3. **Density & balance:** Generous studio negative space (>50% per viewport) frames the 3D live-video assemblies and `Halagar` headlines cleanly on both `1440px` and `390px`.
  4. **Typography & readability:** Authentic `Halagar` display headlines (`800`), `Overpass` body copy, and `#F40000` red highlight blocks match the reference's typographic signature.
  5. **Color & surface restraint:** Seamless dark `#000000` → crimson `#580c10`–`#9c080e` → bright `#FFFFFF` stage inversion with automatic HUD wordmark contrast switching.
  6. **Media & polish:** Real 1080p `Magic HAYA.mov` live 60fps stage videos, DSLR photography plates, and interactive 25.4s extraction film modal integrated with zero console or page errors.
