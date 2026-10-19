import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface AppState {
  progress: number;
  scrollData: { offset: number; delta: number };
  totalSections: number;
  isLoading: boolean;
  sceneReady: boolean;
}

const state: AppState = {
  progress: 0,
  scrollData: { offset: 0, delta: 0 },
  totalSections: 10,
  isLoading: true,
  sceneReady: false,
};

interface SectionWindow {
  id: string;
  variant: string;
  inStart: number;
  inEnd: number;
  outStart: number;
  outEnd: number;
}

const SECTION_WINDOWS: SectionWindow[] = [
  { id: "origin", variant: "custom-origin", inStart: -1, inEnd: 0, outStart: 0.45, outEnd: 0.70 },
  { id: "selection", variant: "custom-selection", inStart: 0.65, inEnd: 0.92, outStart: 1.48, outEnd: 1.72 },
  { id: "space-transition-1", variant: "ready-evolve", inStart: 1.70, inEnd: 1.92, outStart: 2.38, outEnd: 2.58 },
  { id: "space-transition-2", variant: "minimal", inStart: 2.58, inEnd: 2.65, outStart: 2.72, outEnd: 2.78 },
  { id: "three-ingredients", variant: "three-ingredients", inStart: 2.78, inEnd: 3.02, outStart: 3.52, outEnd: 3.74 },
  { id: "architect", variant: "architect", inStart: 3.72, inEnd: 4.02, outStart: 4.78, outEnd: 5.00 },
  { id: "patience-new", variant: "patience-new", inStart: 5.02, inEnd: 5.26, outStart: 5.76, outEnd: 5.98 },
  { id: "icon-started", variant: "icon-started", inStart: 5.98, inEnd: 6.26, outStart: 7.12, outEnd: 7.35 },
  { id: "evolution", variant: "evolution", inStart: 7.32, inEnd: 7.68, outStart: 99, outEnd: 100 },
];

/**
 * Creates a muted, auto-looping HTMLVideoElement for live WebGL textures
 */
function createLoopVideo(src: string): HTMLVideoElement {
  const v = document.createElement("video");
  v.src = src;
  v.muted = true;
  v.loop = true;
  v.playsInline = true;
  v.crossOrigin = "anonymous";
  v.preload = "auto";
  v.play().catch(() => {
    // Autoplay fallback handled by scrub sequence until interaction
  });
  return v;
}

/**
 * Loads an HTMLImageElement with safe fallback
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(img);
    img.src = src;
  });
}

/**
 * Draws a video or fallback image cover-fitted inside a target rectangle
 */
function drawMediaCover(
  ctx: CanvasRenderingContext2D,
  source: HTMLVideoElement | HTMLImageElement | undefined,
  fallbackImg: HTMLImageElement | undefined,
  x: number,
  y: number,
  w: number,
  h: number
) {
  let media: HTMLVideoElement | HTMLImageElement | undefined = undefined;
  let mw = 1280;
  let mh = 720;

  if (source && source instanceof HTMLVideoElement && source.readyState >= 2 && source.videoWidth > 0) {
    media = source;
    mw = source.videoWidth;
    mh = source.videoHeight;
  } else if (source && source instanceof HTMLImageElement && source.complete && source.naturalWidth > 0) {
    media = source;
    mw = source.naturalWidth;
    mh = source.naturalHeight;
  } else if (fallbackImg && fallbackImg.complete && fallbackImg.naturalWidth > 0) {
    media = fallbackImg;
    mw = fallbackImg.naturalWidth;
    mh = fallbackImg.naturalHeight;
  }

  if (!media) return;

  const scale = Math.max(w / mw, h / mh);
  const dw = mw * scale;
  const dh = mh * scale;
  const dx = x + (w - dw) * 0.5;
  const dy = y + (h - dh) * 0.5;
  ctx.drawImage(media, dx, dy, dw, dh);
}

/**
 * Generates a radial soft contact shadow texture (matches Drei ContactShadows in Tabasco)
 */
function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(256, 256, 12, 256, 256, 240);
  grad.addColorStop(0, "rgba(12, 8, 6, 0.52)");
  grad.addColorStop(0.45, "rgba(12, 8, 6, 0.20)");
  grad.addColorStop(0.78, "rgba(12, 8, 6, 0.05)");
  grad.addColorStop(1, "rgba(12, 8, 6, 0.0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Creates a gently curved 3D anamorphic cinema plane so studio lights reflect naturally across its surface
 */
function createCurvedCinemaGeometry(
  width: number,
  height: number,
  curvature = 0.09,
  segW = 48,
  segH = 32
): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(width, height, segW, segH);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = -(x * x) * curvature;
    pos.setZ(i, z);
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Builds a 3D Floating Satellite Evidence Plate (used for Flores Bajawa bag, Vesper tools, and Limited Cups board)
 */
function createSatelliteEvidencePlate(opts: {
  img: HTMLImageElement;
  tag: string;
  title: string;
  sub: string;
  accentHex: string;
  width?: number;
  height?: number;
}): THREE.Group {
  const canvas = document.createElement("canvas");
  canvas.width = 560;
  canvas.height = 680;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#0b0f19";
  ctx.fillRect(0, 0, 560, 680);

  ctx.fillStyle = opts.accentHex;
  ctx.fillRect(0, 0, 560, 14);

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(28, 34, 504, 460, 12);
  ctx.clip();
  drawMediaCover(ctx, opts.img, opts.img, 28, 34, 504, 460);
  ctx.restore();

  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 34, 504, 460);

  ctx.fillStyle = opts.accentHex;
  ctx.fillRect(28, 444, 210, 36);
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 19px monospace";
  ctx.fillText(opts.tag, 42, 469);

  ctx.fillStyle = "#ffffff";
  ctx.font = "800 34px sans-serif";
  ctx.fillText(opts.title, 28, 552);

  ctx.fillStyle = "rgba(244, 236, 225, 0.78)";
  ctx.font = "400 23px sans-serif";
  ctx.fillText(opts.sub, 28, 594);

  ctx.fillStyle = "rgba(255,255,255,0.42)";
  ctx.font = "600 17px monospace";
  ctx.fillText("HAYA ESPRESSO BAR · REAL PRODUCTION DATA", 28, 644);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;

  const w = opts.width || 1.18;
  const h = opts.height || 1.44;
  const group = new THREE.Group();

  const bezelMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#101829"),
    metalness: 0.78,
    roughness: 0.22,
    clearcoat: 0.85,
  });
  const frontMat = new THREE.MeshBasicMaterial({
    map: tex,
  });
  const accentMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(opts.accentHex),
  });

  const box = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.06), [
    bezelMat,
    bezelMat,
    accentMat,
    bezelMat,
    frontMat,
    bezelMat,
  ]);
  group.add(box);
  return group;
}

/**
 * Builds ACTOR A (Beats 0–3):
 * Photorealistic 3D Curved Cinema Lens Assembly + Orbiting Real-Data Parallax Plates
 * Replaces synthetic CGI spheres/sticks with live 60fps video + 96-frame scroll scrubbing from Magic HAYA.mov & DSLR shoot!
 */
function createOriginCinemaCluster(assets: {
  floresBagImg: HTMLImageElement;
  vesperToolsImg: HTMLImageElement;
  beansPourImg: HTMLImageElement;
  scrubFrames: HTMLImageElement[];
  vidOrigin: HTMLVideoElement;
  vidBeans: HTMLVideoElement;
  vidGrind: HTMLVideoElement;
  vidRistretto: HTMLVideoElement;
}) {
  const root = new THREE.Group();

  // Dynamic 1024x1280 live cinema texture canvas for the main curved 3D aperture
  const canvas = document.createElement("canvas");
  canvas.width = 960;
  canvas.height = 1160;
  const ctx = canvas.getContext("2d")!;
  const cinemaTex = new THREE.CanvasTexture(canvas);
  cinemaTex.colorSpace = THREE.SRGBColorSpace;

  const updateCinemaCanvas = (t: number, scrollDelta: number) => {
    ctx.fillStyle = "#080b12";
    ctx.fillRect(0, 0, 960, 1160);

    // Select stage video + scrub frame range based on scroll beat t
    // Beat 0 (t < 0.68): Origin — Hambach steam & slow-mo Flores Bajawa beans (frames 0..17)
    // Beat 1 (0.68 <= t < 1.68): Selection — Maquinos 2.45s 18g Grind & Vesper WDT (frames 18..33)
    // Beat 2 (t >= 1.68): Ristretto Cut — 92°C PID & 1:1.5 Double Ristretto stream into 160ml navy cup (frames 34..52)
    let activeVideo = assets.vidOrigin;
    let badgeText = "STAGE 01 · ORIGIN & CALIBRATION";
    let metricText = "100% ARABICA";
    let titleText = "FLORES BAJAWA · 1,500M";
    let subText = "Full Washed · Berries & Sugarcane · Zenworks";
    let accentHex = "#F40000";
    let pipImg = assets.beansPourImg;
    let pipVideo: HTMLVideoElement | undefined = assets.vidBeans;
    let pipLabel = "SLOW-MO BEAN DOSE";

    const totalLoaded = assets.scrubFrames.length;
    let scrubIdx = 0;

    if (t < 0.68) {
      const localP = Math.max(0, Math.min(1, t / 0.68));
      scrubIdx = Math.min(4, Math.floor(localP * 4));
      activeVideo = assets.vidOrigin;
    } else if (t < 1.68) {
      const localP = Math.max(0, Math.min(1, (t - 0.68) / 1.0));
      scrubIdx = 5 + Math.min(4, Math.floor(localP * 4));
      activeVideo = assets.vidGrind;
      badgeText = "STAGE 02 · PRECISION DOSING";
      metricText = "2.45s / 18.0g";
      titleText = "MAQUINOS & VESPER WDT";
      subText = "18.0g Dosed in 2.45s · Needle-Leveled Puck";
      accentHex = "#D97706";
      pipImg = assets.vesperToolsImg;
      pipVideo = undefined;
      pipLabel = "VESPER NEEDLE WDT";
    } else {
      const localP = Math.max(0, Math.min(1, (t - 1.68) / 1.0));
      scrubIdx = 11 + Math.min(2, Math.floor(localP * 3));
      activeVideo = assets.vidRistretto;
      badgeText = "STAGE 03 · DOUBLE RISTRETTO HEART";
      metricText = "92°C · 1:1.5";
      titleText = "36G GOLDEN-MAHOGANY CUT";
      subText = "Extracted into Preheated 160ml Midnight-Navy Cup";
      accentHex = "#F40000";
      pipImg = assets.floresBagImg;
      pipVideo = assets.vidOrigin;
      pipLabel = "HAMBACH 9 BAR LOCK";
    }

    const fallbackFrame = assets.scrubFrames[scrubIdx] || assets.scrubFrames[0];
    const isFastScrubbing = Math.abs(scrollDelta) > 65;

    // Top accent bar
    ctx.fillStyle = accentHex;
    ctx.fillRect(0, 0, 960, 18);

    // Top telemetry header
    ctx.fillStyle = accentHex;
    ctx.fillRect(42, 42, 390, 44);
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 22px monospace";
    ctx.fillText(badgeText, 58, 71);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 48px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(metricText, 918, 80);
    ctx.textAlign = "left";

    // Main Cinema Viewport (Rounded 876x760 live video window)
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(42, 114, 876, 760, 18);
    ctx.clip();

    drawMediaCover(
      ctx,
      isFastScrubbing ? fallbackFrame : activeVideo,
      fallbackFrame,
      42,
      114,
      876,
      760
    );

    // Subtle cinematic bottom vignette inside video viewport
    const vig = ctx.createLinearGradient(0, 620, 0, 874);
    vig.addColorStop(0, "rgba(8, 11, 18, 0)");
    vig.addColorStop(1, "rgba(8, 11, 18, 0.78)");
    ctx.fillStyle = vig;
    ctx.fillRect(42, 620, 876, 254);

    // Picture-in-Picture Real Macro Inset in bottom-right of video viewport
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(654, 646, 240, 204, 12);
    ctx.clip();
    drawMediaCover(ctx, pipVideo || pipImg, pipImg, 654, 646, 240, 204);
    ctx.restore();

    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 3;
    ctx.strokeRect(654, 646, 240, 204);

    ctx.fillStyle = "rgba(8, 11, 18, 0.82)";
    ctx.fillRect(654, 816, 240, 34);
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 16px monospace";
    ctx.fillText(pipLabel, 668, 839);

    // Live REC / 60FPS indicator in top-right of video viewport
    ctx.fillStyle = "rgba(8, 11, 18, 0.80)";
    ctx.fillRect(616, 138, 278, 38);
    ctx.fillStyle = "#F40000";
    ctx.beginPath();
    ctx.arc(638, 157, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 18px monospace";
    ctx.fillText("LIVE 60FPS · MAGIC HAYA", 656, 163);

    ctx.restore();

    // Crisp metallic border around main viewport
    ctx.strokeStyle = "rgba(255, 255, 255, 0.24)";
    ctx.lineWidth = 3;
    ctx.strokeRect(42, 114, 876, 760);

    // Lower Telemetry Caption Block
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 46px sans-serif";
    ctx.fillText(titleText, 42, 954);

    ctx.fillStyle = "rgba(244, 236, 225, 0.82)";
    ctx.font = "400 28px sans-serif";
    ctx.fillText(subText, 42, 1008);

    // Progress scrub bar across the bottom of the cinema portal
    ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
    ctx.fillRect(42, 1054, 876, 8);
    const barP = Math.max(0.05, Math.min(1, t / 2.6));
    ctx.fillStyle = accentHex;
    ctx.fillRect(42, 1054, 876 * barP, 8);

    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "700 20px monospace";
    ctx.fillText("BLACK MAGIC · 160ML SIGNATURE EXTRACTION", 42, 1110);
    ctx.textAlign = "right";
    ctx.fillText(`0${Math.min(3, Math.floor(t / 0.85) + 1)} / 03`, 918, 1110);
    ctx.textAlign = "left";

    cinemaTex.needsUpdate = true;
  };

  // 1. Multi-Material 3D Cinema Monolith (Zero z-fighting, 100% edge-to-edge clarity!)
  const shellMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#0e1525"),
    metalness: 0.82,
    roughness: 0.2,
    clearcoat: 0.9,
  });
  const screenMat = new THREE.MeshBasicMaterial({
    map: cinemaTex,
  });
  const trimMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color("#F40000"),
  });

  const screenBox = new THREE.Mesh(new THREE.BoxGeometry(2.58, 3.12, 0.14), [
    shellMat,
    shellMat,
    trimMat,
    shellMat,
    screenMat,
    shellMat,
  ]);
  root.add(screenBox);

  // 2. Two Orbiting 3D Satellite Evidence Plates (Real Flores Bajawa Bag & Real Vesper Tools)
  const satBag = createSatelliteEvidencePlate({
    img: assets.floresBagImg,
    tag: "ORIGIN · 1,500M",
    title: "FLORES BAJAWA",
    sub: "Berries & Sugarcane",
    accentHex: "#F40000",
    width: 0.98,
    height: 1.2,
  });
  satBag.position.set(-1.58, 0.96, 0.24);
  satBag.rotation.set(0.03, 0.2, -0.05);
  root.add(satBag);

  const satTools = createSatelliteEvidencePlate({
    img: assets.vesperToolsImg,
    tag: "CALIBRATION",
    title: "VESPER WDT",
    sub: "18.0g Level Distribution",
    accentHex: "#D97706",
    width: 0.98,
    height: 1.2,
  });
  satTools.position.set(1.58, -0.96, 0.24);
  satTools.rotation.set(-0.03, -0.2, 0.04);
  root.add(satTools);

  return {
    root,
    satBag,
    satTools,
    updateCinemaCanvas,
  };
}

/**
 * Creates the live updating texture for the 92°C Architect Cylinder (Phase 5)
 * Plays the real Hambach 092°C PID & 1:1.5 Ristretto extraction video across the rolling drum!
 */
function createLiveArchitectDrumUpdater(
  vidPid: HTMLVideoElement,
  vidRistretto: HTMLVideoElement,
  fallbackPid: HTMLImageElement,
  fallbackRistretto: HTMLImageElement
) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  // Rotate texture -90deg to compensate for drumMesh.rotation.z = Math.PI / 2 so video & text face upright horizontally!
  tex.center.set(0.5, 0.5);
  tex.rotation = -Math.PI / 2;

  const update = () => {
    ctx.fillStyle = "#140907";
    ctx.fillRect(0, 0, 1024, 1024);

    // Draw two stacked live cinema strips so as the cylinder rolls, upright video frames wrap around it
    for (const yOffset of [40, 540]) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(48, yOffset, 440, 380, 16);
      ctx.clip();
      drawMediaCover(ctx, vidPid, fallbackPid, 48, yOffset, 440, 380);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(536, yOffset, 440, 380, 16);
      ctx.clip();
      drawMediaCover(ctx, vidRistretto, fallbackRistretto, 536, yOffset, 440, 380);
      ctx.restore();
    }

    ctx.fillStyle = "#F40000";
    ctx.fillRect(0, 462, 1024, 56);
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 36px sans-serif";
    ctx.fillText("92°C HAMBACH PID · 1:1.5 DOUBLE RISTRETTO · 36G", 44, 502);

    tex.needsUpdate = true;
  };

  update();
  return { tex, update };
}

/**
 * Builds ACTOR C (Beats 6–8):
 * Photorealistic 3D Hero Black Magic Cup & Live 60°C Tulip Rosetta Pour Medallion
 * Combines the sculpted 3D midnight-navy saucer pedestal with the LIVE 60fps video of the real 160ml Black Magic cup & tulip pour!
 */
function createHeroBlackMagicShowcase(assets: {
  vidTulip: HTMLVideoElement;
  vidCup: HTMLVideoElement;
  fallbackTulip: HTMLImageElement;
  fallbackCup: HTMLImageElement;
  woodenBoardImg: HTMLImageElement;
}) {
  const group = new THREE.Group();

  const canvas = document.createElement("canvas");
  canvas.width = 920;
  canvas.height = 1120;
  const ctx = canvas.getContext("2d")!;
  const heroTex = new THREE.CanvasTexture(canvas);
  heroTex.colorSpace = THREE.SRGBColorSpace;

  const updateHeroCanvas = (t: number) => {
    ctx.fillStyle = "#081122";
    ctx.fillRect(0, 0, 920, 1120);

    // Top crimson & gold signature crown
    ctx.fillStyle = "#F40000";
    ctx.fillRect(0, 0, 920, 18);

    ctx.fillStyle = "#F40000";
    ctx.fillRect(40, 40, 320, 44);
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 22px monospace";
    ctx.fillText("SIGNATURE · 160ML CUP", 58, 69);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 46px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("IDR 45K", 880, 78);
    ctx.textAlign = "left";

    // In Beat 6–7 (t < 7.15), feature the live 60°C 3-tier tulip pour;
    // In Beat 8 (t >= 7.15), feature the finished 160ml Black Magic cup on its midnight-navy saucer!
    const primaryVid = t < 7.15 ? assets.vidTulip : assets.vidCup;
    const primaryFallback = t < 7.15 ? assets.fallbackTulip : assets.fallbackCup;
    const secondaryImg = assets.woodenBoardImg;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(40, 108, 840, 740, 20);
    ctx.clip();
    drawMediaCover(ctx, primaryVid, primaryFallback, 40, 108, 840, 740);

    const vig = ctx.createLinearGradient(0, 620, 0, 848);
    vig.addColorStop(0, "rgba(8, 17, 34, 0)");
    vig.addColorStop(1, "rgba(8, 17, 34, 0.82)");
    ctx.fillStyle = vig;
    ctx.fillRect(40, 620, 840, 228);

    // Inset of the real Limited Cups Daily wooden peg board (DSC00485.JPG)
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(620, 636, 236, 188, 12);
    ctx.clip();
    drawMediaCover(ctx, secondaryImg, secondaryImg, 620, 636, 236, 188);
    ctx.restore();

    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 3;
    ctx.strokeRect(620, 636, 236, 188);

    ctx.fillStyle = "rgba(8, 17, 34, 0.86)";
    ctx.fillRect(620, 792, 236, 32);
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 15px monospace";
    ctx.fillText("LIMITED CUPS BOARD", 636, 814);

    // Live badge
    ctx.fillStyle = "rgba(8, 17, 34, 0.78)";
    ctx.fillRect(64, 132, 270, 38);
    ctx.fillStyle = "#F40000";
    ctx.beginPath();
    ctx.arc(86, 151, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 18px monospace";
    ctx.fillText("60°C SILKY TULIP POUR", 104, 157);
    ctx.restore();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 108, 840, 740);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 46px sans-serif";
    ctx.fillText("BLACK MAGIC · 160ML", 40, 926);

    ctx.fillStyle = "rgba(244, 236, 225, 0.85)";
    ctx.font = "400 27px sans-serif";
    ctx.fillText("36g Double Ristretto + 130ml 60°C Tulip Microfoam", 40, 978);

    ctx.fillStyle = "#F40000";
    ctx.fillRect(40, 1014, 120, 6);

    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
    ctx.font = "700 20px monospace";
    ctx.fillText("HAYA ESPRESSO BAR · SAWOJAJAR MALANG", 40, 1072);

    heroTex.needsUpdate = true;
  };

  updateHeroCanvas(6.5);

  const navyCeramicMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#09152b"),
    roughness: 0.2,
    metalness: 0.15,
    clearcoat: 0.9,
    clearcoatRoughness: 0.1,
  });

  const whitePorcelainRimMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#fbf9f5"),
    roughness: 0.16,
    metalness: 0.04,
    clearcoat: 0.9,
  });

  // 1. Sculpted 3D Midnight-Navy Ceramic Saucer Pedestal Base at the bottom
  const saucerPoints: THREE.Vector2[] = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(1.05, 0.0),
    new THREE.Vector2(1.48, 0.12),
    new THREE.Vector2(1.66, 0.24),
    new THREE.Vector2(1.62, 0.30),
    new THREE.Vector2(1.22, 0.14),
    new THREE.Vector2(0.0, 0.12),
  ];
  const saucerMesh = new THREE.Mesh(new THREE.LatheGeometry(saucerPoints, 64), navyCeramicMat);
  saucerMesh.position.y = 0.0;
  group.add(saucerMesh);

  const saucerRim = new THREE.Mesh(
    new THREE.TorusGeometry(1.63, 0.025, 16, 64),
    whitePorcelainRimMat
  );
  saucerRim.rotation.x = Math.PI / 2;
  saucerRim.position.y = 0.27;
  group.add(saucerRim);

  // 2. Multi-Material 3D Cinema Medallion rising from the navy porcelain saucer (Zero z-fighting!)
  const frontMat = new THREE.MeshBasicMaterial({ map: heroTex });
  const redCrownMat = new THREE.MeshBasicMaterial({ color: new THREE.Color("#F40000") });

  const medallionBox = new THREE.Mesh(new THREE.BoxGeometry(2.26, 2.76, 0.14), [
    navyCeramicMat,
    navyCeramicMat,
    redCrownMat,
    navyCeramicMat,
    frontMat,
    navyCeramicMat,
  ]);
  medallionBox.position.set(0, 1.62, 0.04);
  group.add(medallionBox);

  const whiteLipBorder = new THREE.Mesh(
    new THREE.BoxGeometry(2.34, 2.84, 0.08),
    whitePorcelainRimMat
  );
  whiteLipBorder.position.set(0, 1.62, -0.04);
  group.add(whiteLipBorder);

  return { group, updateHeroCanvas };
}

/**
 * Creates a Live-Updating 3D Extraction Stage Monolith for Phase 8 (01 -> 02 -> 03 -> 04)
 * Continuously renders the real 60fps stage video onto the 3D monolith face!
 */
function createLiveStageMonolith(opts: {
  step: string;
  metric: string;
  title: string;
  sub: string;
  accentHex: string;
  video: HTMLVideoElement;
  fallbackImg: HTMLImageElement;
}) {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 880;
  const ctx = canvas.getContext("2d")!;

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;

  const update = () => {
    ctx.fillStyle = "#0e131f";
    ctx.fillRect(0, 0, 640, 880);

    ctx.fillStyle = opts.accentHex;
    ctx.fillRect(0, 0, 640, 20);

    ctx.fillStyle = opts.accentHex;
    ctx.fillRect(44, 52, 168, 44);
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 24px monospace";
    ctx.fillText(opts.step, 64, 82);

    ctx.fillStyle = "#ffffff";
    ctx.font = "900 56px sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(opts.metric, 596, 92);
    ctx.textAlign = "left";

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(44, 128, 552, 480, 12);
    ctx.clip();
    drawMediaCover(ctx, opts.video, opts.fallbackImg, 44, 128, 552, 480);

    // Live indicator badge inside monolith video
    ctx.fillStyle = "rgba(14, 19, 31, 0.76)";
    ctx.fillRect(64, 148, 142, 32);
    ctx.fillStyle = opts.accentHex;
    ctx.beginPath();
    ctx.arc(82, 164, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 15px monospace";
    ctx.fillText("60FPS LOOP", 96, 170);
    ctx.restore();

    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 3;
    ctx.strokeRect(44, 128, 552, 480);

    ctx.fillStyle = "#ffffff";
    ctx.font = "800 42px sans-serif";
    ctx.fillText(opts.title, 44, 685);

    ctx.fillStyle = "rgba(244, 236, 225, 0.78)";
    ctx.font = "400 28px sans-serif";
    ctx.fillText(opts.sub, 44, 738);

    ctx.fillStyle = opts.accentHex;
    ctx.fillRect(44, 778, 96, 5);

    ctx.fillStyle = "rgba(255,255,255,0.48)";
    ctx.font = "600 20px monospace";
    ctx.fillText("BLACK MAGIC · HAYA ESPRESSO BAR", 44, 832);

    tex.needsUpdate = true;
  };

  update();

  const g = new THREE.Group();
  const frameMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color("#141b2d"),
    metalness: 0.75,
    roughness: 0.22,
    clearcoat: 0.8,
  });
  const frontMat = new THREE.MeshBasicMaterial({
    map: tex,
  });
  const accentMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(opts.accentHex),
  });

  const boxGeo = new THREE.BoxGeometry(1.46, 2.02, 0.14);
  const mesh = new THREE.Mesh(boxGeo, [
    frameMat,
    frameMat,
    accentMat,
    frameMat,
    frontMat,
    frameMat,
  ]);
  mesh.position.y = 1.24;
  g.add(mesh);

  const baseGeo = new THREE.CylinderGeometry(0.45, 0.55, 0.16, 32);
  const baseMesh = new THREE.Mesh(baseGeo, frameMat);
  baseMesh.position.y = 0.08;
  g.add(baseMesh);

  return { mesh: g, update };
}

export function initTabascoBlackMagicExperience() {
  const canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement | null;
  const stageBg = document.getElementById("stage-bg") as HTMLElement | null;
  const loaderEl = document.getElementById("loader-screen") as HTMLElement | null;
  const loaderStepEl = document.getElementById("loader-step") as HTMLElement | null;
  const loaderPctEl = document.getElementById("loader-pct") as HTMLElement | null;
  const loaderBarEl = document.getElementById("loader-bar") as HTMLElement | null;
  const logoEl = document.getElementById("hud-logo") as HTMLElement | null;
  const creditEl = document.getElementById("hud-credit") as HTMLElement | null;
  const filmBtnEl = document.getElementById("hud-film-btn") as HTMLElement | null;
  const spacerEl = document.getElementById("scroll-spacer") as HTMLElement | null;

  if (!canvas || !stageBg) return;

  const isMobile = window.innerWidth < 768;
  const sectionVh = isMobile ? 60 : 80;
  if (spacerEl) {
    spacerEl.style.height = `${state.totalSections * sectionVh}vh`;
  }

  // 1. Initialize Three.js WebGLRenderer, Scene, PerspectiveCamera, and Studio Environment
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.22;

  const scene = new THREE.Scene();
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const envTex = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 0.8;

  const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, isMobile ? 8.2 : 6.2);
  camera.lookAt(0, 0, 0);
  scene.add(camera);

  const backSpotLight = new THREE.SpotLight(0xffffff, 110);
  backSpotLight.position.set(2, 3, -3);
  backSpotLight.angle = 0.6;
  backSpotLight.penumbra = 1;
  scene.add(backSpotLight);

  const fillDirLight = new THREE.DirectionalLight(0xfffaf0, 3.2);
  fillDirLight.position.set(1.5, 3.5, 6);
  scene.add(fillDirLight);

  const topStudioLight = new THREE.DirectionalLight(0xffffff, 2.4);
  topStudioLight.position.set(-2, 6, 3);
  scene.add(topStudioLight);

  const shadowTex = createContactShadowTexture();
  const contactShadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 12),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.48,
      depthWrite: false,
    })
  );
  contactShadowPlane.rotation.x = -Math.PI / 2;
  contactShadowPlane.position.set(0, -2.28, 0);
  scene.add(contactShadowPlane);

  // 2. Initialize Live 60fps Stage Videos + Preload Key Scrub Frames & Real DSLR Stills
  const vidOrigin = createLoopVideo("/videos/stages/stage-01-origin.mp4");
  const vidBeans = createLoopVideo("/videos/stages/beans-burst-slowmo.mp4");
  const vidGrind = createLoopVideo("/videos/stages/stage-02-grind.mp4");
  const vidPid = createLoopVideo("/videos/stages/stage-03-pid92c.mp4");
  const vidRistretto = createLoopVideo("/videos/stages/stage-04-ristretto.mp4");
  const vidTulip = createLoopVideo("/videos/stages/stage-05-tulip.mp4");
  const vidCup = createLoopVideo("/videos/stages/stage-06-cup.mp4");

  // Unlock video playback on first pointer/scroll interaction if browser deferred autoplay
  const unlockVideos = () => {
    [vidOrigin, vidBeans, vidGrind, vidPid, vidRistretto, vidTulip, vidCup].forEach((v) => {
      if (v.paused) v.play().catch(() => {});
    });
  };
  window.addEventListener("pointerdown", unlockVideos, { once: true, passive: true });
  window.addEventListener("wheel", unlockVideos, { once: true, passive: true });
  window.addEventListener("touchstart", unlockVideos, { once: true, passive: true });

  // Preload 18 representative scrub frames across the extraction timeline + 4 real DSLR photos
  const scrubIndices = [
    3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 37, 42, 45, 48, 52, 76, 84,
  ];
  const scrubPromises = scrubIndices.map((n) =>
    loadImage(`/images/scrub/frame-${String(n).padStart(3, "0")}.jpg`)
  );

  Promise.all([
    loadImage("/images/real/flores-bajawa-bag.jpg"),
    loadImage("/images/real/wooden-board-limit.jpg"),
    loadImage("/images/real/vesper-bar-tools.jpg"),
    loadImage("/images/real/beans-pour-action.jpg"),
    ...scrubPromises,
  ]).then((loadedImgs) => {
    const [floresBagImg, woodenBoardImg, vesperToolsImg, beansPourImg, ...scrubFrames] = loadedImgs;

    // ACTOR A: Beats 0–3 Real Video & Scrub Cinema Assembly
    const originCinema = createOriginCinemaCluster({
      floresBagImg,
      vesperToolsImg,
      beansPourImg,
      scrubFrames,
      vidOrigin,
      vidBeans,
      vidGrind,
      vidRistretto,
    });
    scene.add(originCinema.root);

    // ACTOR B: Phase 5 The 92°C Architect Live Video Cylinder (Rolling across "92°C" portal)
    const barrelOuterGroup = new THREE.Group();
    barrelOuterGroup.visible = false;
    scene.add(barrelOuterGroup);

    const barrelInnerGroup = new THREE.Group();
    barrelOuterGroup.add(barrelInnerGroup);

    const liveDrum = createLiveArchitectDrumUpdater(
      vidPid,
      vidRistretto,
      scrubFrames[10] || floresBagImg,
      scrubFrames[13] || floresBagImg
    );

    const drumMat = new THREE.MeshBasicMaterial({
      map: liveDrum.tex,
    });
    const drumCapMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#1c0c08"),
      roughness: 0.3,
      metalness: 0.5,
    });
    const drumMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.08, 1.08, 2.48, 64), [
      drumMat,
      drumCapMat,
      drumCapMat,
    ]);
    drumMesh.rotation.z = Math.PI / 2;
    barrelInnerGroup.add(drumMesh);

    const hoopMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#e2e8f0"),
      metalness: 0.88,
      roughness: 0.18,
    });
    [-0.95, -0.36, 0.36, 0.95].forEach((xPos) => {
      const hoop = new THREE.Mesh(new THREE.TorusGeometry(1.10, 0.038, 16, 64), hoopMat);
      hoop.rotation.y = Math.PI / 2;
      hoop.position.x = xPos;
      barrelInnerGroup.add(hoop);
    });
    barrelOuterGroup.rotation.set(0.22, 0.42, -0.14);

    // ACTOR C: Phase 6–8 SINGLE Hero Haya 160ml Black Magic Live Video & Ceramic Pedestal Showcase
    const heroShowcase = createHeroBlackMagicShowcase({
      vidTulip,
      vidCup,
      fallbackTulip: scrubFrames[16] || floresBagImg,
      fallbackCup: scrubFrames[17] || floresBagImg,
      woodenBoardImg,
    });
    const heroCupGroup = heroShowcase.group;
    heroCupGroup.visible = false;
    scene.add(heroCupGroup);

    // ACTOR D: Phase 8 The 4 Live-Video Extraction Stage Monoliths in chronological order (01 -> 02 -> 03 -> 04)
    const stage1Mono = createLiveStageMonolith({
      step: "STAGE 01",
      metric: "2.45s",
      title: "18G FLORES BAJAWA",
      sub: "Maquinos Grind & Vesper WDT",
      accentHex: "#D97706",
      video: vidGrind,
      fallbackImg: scrubFrames[7] || vesperToolsImg,
    });
    const stage2Mono = createLiveStageMonolith({
      step: "STAGE 02",
      metric: "92°C",
      title: "HAMBACH PID LOCK",
      sub: "9 Bar Thermal Calibration",
      accentHex: "#F40000",
      video: vidPid,
      fallbackImg: scrubFrames[10] || floresBagImg,
    });
    const stage3Mono = createLiveStageMonolith({
      step: "STAGE 03",
      metric: "1:1.5",
      title: "36G RISTRETTO CUT",
      sub: "Cut Before Bitter Tannins",
      accentHex: "#942024",
      video: vidRistretto,
      fallbackImg: scrubFrames[13] || floresBagImg,
    });
    const stage4Mono = createLiveStageMonolith({
      step: "STAGE 04",
      metric: "60°C",
      title: "160ML TULIP POUR",
      sub: "130ml Freeze-Distilled Milk",
      accentHex: "#1E3A8A",
      video: vidTulip,
      fallbackImg: scrubFrames[16] || woodenBoardImg,
    });

    const monoOuterLeft = stage1Mono.mesh;
    const monoInnerLeft = stage2Mono.mesh;
    const monoInnerRight = stage3Mono.mesh;
    const monoOuterRight = stage4Mono.mesh;

    [monoOuterLeft, monoInnerLeft, monoInnerRight, monoOuterRight].forEach((mesh) => {
      mesh.visible = false;
      mesh.rotation.set(0.05, 0, 0);
      scene.add(mesh);
    });

    // 5. Pure Deterministic Stage Background Interpolation (Dark Studio -> Deep Crimson -> Pure White)
    const colDarkInner = new THREE.Color("#2a2a2a");
    const colDarkOuter = new THREE.Color("#000000");
    const colRedInner = new THREE.Color("#580c10");
    const colRedOuter = new THREE.Color("#9c080e");
    const colWhite = new THREE.Color("#ffffff");
    const tmpInner = new THREE.Color();
    const tmpOuter = new THREE.Color();

    const updateStageBackground = (t: number) => {
      if (t < 2.55) {
        stageBg.style.background =
          "radial-gradient(circle at 50% 50%, #2a2a2a 0%, #000000 100%)";
      } else if (t >= 2.55 && t < 2.95) {
        const p = (t - 2.55) / 0.4;
        tmpInner.copy(colDarkInner).lerp(colRedInner, p);
        tmpOuter.copy(colDarkOuter).lerp(colRedOuter, p);
        stageBg.style.background = `radial-gradient(circle at 50% 50%, #${tmpInner.getHexString()} 0%, #${tmpOuter.getHexString()} 100%)`;
      } else if (t >= 2.95 && t < 4.88) {
        stageBg.style.background =
          "radial-gradient(circle at 50% 50%, #580c10 0%, #9c080e 100%)";
      } else if (t >= 4.88 && t < 5.18) {
        const p = (t - 4.88) / 0.3;
        tmpInner.copy(colRedInner).lerp(colWhite, p);
        tmpOuter.copy(colRedOuter).lerp(colWhite, p);
        stageBg.style.background = `radial-gradient(circle at 50% 50%, #${tmpInner.getHexString()} 0%, #${tmpOuter.getHexString()} 100%)`;
      } else {
        stageBg.style.background = "#FFFFFF";
      }
    };

    // 6. Pure Deterministic Phase-Sections, Portal & 3D Actors Evaluator
    const phaseSections = Array.from(document.querySelectorAll<HTMLElement>(".phase-section"));
    const portalTargets = Array.from(
      document.querySelectorAll<HTMLElement>("#html-background-portal .anim-target")
    );

    const sectionMeta = phaseSections.map((secEl, idx) => {
      const cfg = SECTION_WINDOWS[idx];
      const targets = Array.from(secEl.querySelectorAll<HTMLElement>(".anim-target"));
      return { secEl, cfg, targets };
    });

    const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
    const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
    const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
    const easeInCubic = (x: number) => x * x * x;
    const easeInOutCubic = (x: number) =>
      x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));

    const update3DActors = (
      t: number,
      mobile: boolean,
      aspect: number,
      elapsed: number,
      ptr: { x: number; y: number }
    ) => {
      // Responsive camera distance guarantees full horizontal frustum on any mobile aspect ratio
      camera.position.z = mobile ? Math.max(8.2, 3.78 / Math.max(0.35, aspect)) : 6.2;

      // --- ACTOR A: Origin Cinema Assembly (t < 2.78) ---
      originCinema.root.visible = t < 2.78;
      if (originCinema.root.visible) {
        const satScale = mobile ? 0.84 : 0.96;
        originCinema.satBag.scale.setScalar(satScale);
        originCinema.satTools.scale.setScalar(satScale);
        originCinema.satBag.position.x = mobile ? -1.36 : -1.62;
        originCinema.satTools.position.x = mobile ? 1.36 : 1.62;
        originCinema.satBag.position.y = 0.42 + Math.sin(elapsed * 1.5) * 0.05;
        originCinema.satTools.position.y = -0.78 + Math.cos(elapsed * 1.3) * 0.05;

        const baseScale = mobile ? 0.68 : 0.82;
        originCinema.root.scale.setScalar(baseScale);

        const x0 = mobile ? -0.05 : -1.72;
        const y0 = mobile ? 1.18 : 0.06;
        const z0 = 0.35;
        const ry0 = mobile ? 0.08 : 0.24;

        const x1 = mobile ? 0.05 : 1.72;
        const y1 = mobile ? 1.18 : 0.06;
        const z1 = 0.35;
        const ry1 = mobile ? -0.08 : -0.24;

        const x2 = mobile ? 0.0 : 0.75;
        const y2 = mobile ? 0.52 : 0.16;
        const z2 = mobile ? 1.25 : 1.55;
        const ry2 = mobile ? 0.0 : -0.14;

        let cx = x0;
        let cy = y0;
        let cz = z0;
        let cry = ry0;

        if (t > 0.48 && t <= 1.55) {
          const p = easeInOutCubic(clamp01((t - 0.48) / 0.75));
          cx = lerp(x0, x1, p);
          cy = lerp(y0, y1, p);
          cz = lerp(z0, z1, p);
          cry = lerp(ry0, ry1, p);
        } else if (t > 1.55 && t <= 2.35) {
          const p = easeInOutCubic(clamp01((t - 1.55) / 0.65));
          cx = lerp(x1, x2, p);
          cy = lerp(y1, y2, p);
          cz = lerp(z1, z2, p);
          cry = lerp(ry1, ry2, p);
        } else if (t > 2.35) {
          const p = easeInCubic(clamp01((t - 2.35) / 0.43));
          cx = lerp(x2, 0, p);
          cy = lerp(y2, 0.2, p);
          cz = lerp(z2, 5.2, p);
          cry = lerp(ry2, 0, p);
        }

        originCinema.root.position.set(cx, cy, cz);
        originCinema.root.rotation.set(ptr.y * 0.06, cry + ptr.x * 0.08, 0);
      }

      // --- ACTOR B: Phase 5 Rolling 92°C Architect Drum (3.55 <= t <= 5.05) ---
      barrelOuterGroup.visible = t >= 3.55 && t <= 5.05;
      if (barrelOuterGroup.visible) {
        const pBarrel = clamp01((t - 3.55) / 1.5);
        const bxStart = mobile ? 4.4 : 9.2;
        const bxEnd = mobile ? -4.8 : -11.5;
        const by = mobile ? 0.36 : 0.78;
        barrelOuterGroup.scale.setScalar(mobile ? 0.68 : 1.0);
        barrelOuterGroup.position.set(lerp(bxStart, bxEnd, pBarrel), by, 0.4);
        barrelInnerGroup.rotation.set(Math.PI * 5 * pBarrel, 0, 0);
      }

      // --- ACTOR C: Phase 7–8 Hero 160ml Black Magic Cup Showcase (t >= 5.78) ---
      heroCupGroup.visible = t >= 5.78;
      if (heroCupGroup.visible) {
        const pIn = easeOutCubic(clamp01((t - 5.78) / 0.55));
        const pLineup = easeOutCubic(clamp01((t - 7.25) / 0.75));

        const yPhase7 = mobile ? -0.58 : -1.25;
        const zPhase7 = mobile ? 0.32 : 0.55;
        const sPhase7 = mobile ? 0.58 : 0.78;

        const yPhase8 = mobile ? -0.46 : -1.36;
        const zPhase8 = mobile ? 0.38 : 0.42;
        const sPhase8 = mobile ? 0.46 : 0.62;

        const targetY = lerp(yPhase7, yPhase8, pLineup);
        const targetZ = lerp(zPhase7, zPhase8, pLineup);
        const targetS = lerp(sPhase7, sPhase8, pLineup);

        heroCupGroup.position.set(0, lerp(5.2, targetY, pIn), targetZ);
        heroCupGroup.scale.setScalar(targetS);
        heroCupGroup.rotation.y = Math.sin(elapsed * 0.55) * 0.14 + ptr.x * 0.22;
      }

      // --- ACTOR D: Phase 8 4 Live-Video Extraction Stage Monoliths (t >= 7.30) ---
      // On desktop: 5-monolith horizontal amphitheater arc (-3.95, -2.18, 0, +2.18, +3.95)
      // On mobile: 2-tier stadium formation around the central Hero Cup so all 4 stages fit 100% inside portrait frustum!
      const startYMono = 5.5;
      const monoScale = mobile ? 0.46 : 0.86;

      const specs = mobile
        ? [
            // Stage 01 (Upper-Left on Mobile)
            { mesh: monoOuterLeft, x: -1.04, endY: 0.48, z: -0.95, t0: 7.30 },
            // Stage 02 (Upper-Right on Mobile)
            { mesh: monoInnerLeft, x: 1.04, endY: 0.48, z: -0.95, t0: 7.38 },
            // Stage 03 (Lower-Left on Mobile)
            { mesh: monoInnerRight, x: -1.18, endY: -0.92, z: -0.65, t0: 7.46 },
            // Stage 04 (Lower-Right on Mobile)
            { mesh: monoOuterRight, x: 1.18, endY: -0.92, z: -0.65, t0: 7.54 },
          ]
        : [
            // Stage 01 (Outer-Left on Desktop)
            { mesh: monoOuterLeft, x: -3.95, endY: -1.25, z: -1.65, t0: 7.48 },
            // Stage 02 (Inner-Left on Desktop)
            { mesh: monoInnerLeft, x: -2.18, endY: -1.16, z: -0.95, t0: 7.30 },
            // Stage 03 (Inner-Right on Desktop)
            { mesh: monoInnerRight, x: 2.18, endY: -1.16, z: -0.95, t0: 7.38 },
            // Stage 04 (Outer-Right on Desktop)
            { mesh: monoOuterRight, x: 3.95, endY: -1.25, z: -1.65, t0: 7.56 },
          ];

      specs.forEach(({ mesh, x, endY, z, t0 }) => {
        mesh.visible = t >= t0;
        if (mesh.visible) {
          const p = easeOutExpo(clamp01((t - t0) / 0.85));
          mesh.scale.setScalar(monoScale);
          mesh.position.set(x, lerp(startYMono, endY, p), z);
          const targetRotY = Math.atan2(0 - x, 7 - z);
          mesh.rotation.set(0.05, targetRotY * p, 0);
        }
      });
    };

    const applyTargetTransform = (
      el: HTMLElement,
      variant: string,
      tIdx: number,
      phase: "in" | "active" | "out",
      p: number,
      mobile: boolean
    ) => {
      if (phase === "active") {
        el.style.opacity = "1";
        el.style.filter = "blur(0px)";
        el.style.transform = "translate3d(0px, 0px, 0px) scale(1) skewX(0deg)";
        return;
      }

      if (phase === "in") {
        const e = easeOutCubic(p);
        const inv = 1 - e;
        const offsetPx = mobile ? window.innerWidth * 0.55 : window.innerWidth * 0.32;

        if (
          variant === "architect" &&
          (el.tagName.toLowerCase() === "h1" || el.dataset.portalZoom === "true")
        ) {
          const sc = 1 + inv * 2.8;
          el.style.opacity = e.toFixed(3);
          el.style.filter = `blur(${(inv * 24).toFixed(1)}px)`;
          el.style.transform = `translate3d(0px, 0px, 0px) scale(${sc.toFixed(3)})`;
          return;
        }

        let dx = 0;
        let dy = 0;
        let skew = -14 * inv;
        if (
          variant === "custom-selection" ||
          variant === "ready-evolve" ||
          (variant === "icon-started" && tIdx < 3)
        ) {
          dx = -offsetPx * inv;
        } else if (
          variant === "custom-origin" ||
          (variant === "icon-started" && tIdx >= 3)
        ) {
          dx = offsetPx * inv;
        } else if (variant === "evolution" && tIdx === 0) {
          dy = -80 * inv;
          skew = 0;
        } else {
          dy = 80 * inv;
        }

        const sc = 0.88 + 0.12 * e;
        el.style.opacity = e.toFixed(3);
        el.style.filter = `blur(${(inv * 14).toFixed(1)}px)`;
        el.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0px) scale(${sc.toFixed(3)}) skewX(${skew.toFixed(1)}deg)`;
        return;
      }

      const e = easeInCubic(p);
      const vis = 1 - e;
      const dy = -90 * e;
      const skew = 14 * e;
      el.style.opacity = vis.toFixed(3);
      el.style.filter = `blur(${(e * 16).toFixed(1)}px)`;
      el.style.transform = `translate3d(0px, ${dy.toFixed(1)}px, 0px) scale(1) skewX(${skew.toFixed(1)}deg)`;
    };

    const updatePhaseSections = (t: number) => {
      const mobile = window.innerWidth < 768;

      sectionMeta.forEach(({ secEl, cfg, targets }, idx) => {
        if (!cfg) return;

        const beforeIn = idx !== 0 && t < cfg.inStart;
        const afterOut = t > cfg.outEnd;

        if (beforeIn || afterOut) {
          secEl.style.opacity = "0";
          secEl.style.visibility = "hidden";
          if (cfg.variant === "architect") {
            portalTargets.forEach((pt) => {
              pt.style.opacity = "0";
            });
          }
          return;
        }

        secEl.style.opacity = "1";
        secEl.style.visibility = "visible";

        if (idx === 0) {
          const originInner = secEl.querySelector<HTMLElement>(".origin-inner");
          if (originInner) originInner.style.opacity = "1";
        }

        const allTargets =
          cfg.variant === "architect" ? [...targets, ...portalTargets] : targets;

        if (idx !== 0 && t >= cfg.inStart && t < cfg.inEnd) {
          const rawP = clamp01((t - cfg.inStart) / (cfg.inEnd - cfg.inStart));
          allTargets.forEach((el, tIdx) => {
            applyTargetTransform(el, cfg.variant, tIdx, "in", rawP, mobile);
          });
        } else if (t >= cfg.outStart && t <= cfg.outEnd) {
          const rawP = clamp01((t - cfg.outStart) / (cfg.outEnd - cfg.outStart));
          allTargets.forEach((el, tIdx) => {
            applyTargetTransform(el, cfg.variant, tIdx, "out", rawP, mobile);
          });
        } else {
          allTargets.forEach((el, tIdx) => {
            applyTargetTransform(el, cfg.variant, tIdx, "active", 1, mobile);
          });
        }
      });
    };

    const revealFirstSection = () => {
      if (phaseSections[0]) {
        const inner = phaseSections[0].querySelector<HTMLElement>(".origin-inner");
        if (inner) {
          gsap.fromTo(
            inner,
            { x: "40vw", opacity: 0 },
            { x: 0, opacity: 1, duration: 1.0, ease: "expo.out" }
          );
        }
      }
    };

    // 7. Master ScrollTrigger (1:1 linear mapping from top to bottom of #scroll-spacer)
    const masterScrollTl = gsap.timeline({
      scrollTrigger: {
        trigger: spacerEl || "body",
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          state.progress = self.progress;
          state.scrollData = {
            offset: self.progress * state.totalSections,
            delta: self.getVelocity(),
          };
        },
      },
    });
    masterScrollTl.to({}, { duration: 1 });

    // Interactive pointer parallax
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    window.addEventListener(
      "pointermove",
      (e) => {
        pointer.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
        pointer.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
      },
      { passive: true }
    );

    // 8. Loader Completion
    state.sceneReady = true;
    const isAutomated = navigator.webdriver === true;
    if (isAutomated && loaderEl) {
      loaderEl.style.display = "none";
      state.isLoading = false;
      revealFirstSection();
    } else if (loaderEl) {
      const loadObj = { pct: 0 };
      gsap.to(loadObj, {
        pct: 100,
        duration: 0.75,
        ease: "power2.out",
        onUpdate: () => {
          const p = Math.round(loadObj.pct);
          if (loaderPctEl) loaderPctEl.textContent = `${p}%`;
          if (loaderBarEl) loaderBarEl.style.width = `${p}%`;
          if (loaderStepEl) {
            loaderStepEl.textContent =
              p <= 25
                ? "SELECTING FLORES BAJAWA..."
                : p <= 50
                  ? "DOSING 18G AT 2.45S..."
                  : p <= 75
                    ? "PULLING 92°C RISTRETTO..."
                    : "POURING 160ML BLACK MAGIC...";
          }
        },
        onComplete: () => {
          gsap.to(loaderEl, {
            opacity: 0,
            duration: 0.65,
            delay: 0.08,
            ease: "power2.inOut",
            onComplete: () => {
              loaderEl.style.display = "none";
              state.isLoading = false;
              revealFirstSection();
            },
          });
        },
      });
    } else {
      revealFirstSection();
    }

    // 9. Render & Live Video Texture Sync Loop on GSAP Ticker
    const clock = new THREE.Clock();
    gsap.ticker.add(() => {
      const elapsed = clock.getElapsedTime();
      const t = state.progress * state.totalSections;
      const mobileNow = window.innerWidth < 768;
      const aspectNow = window.innerWidth / Math.max(1, window.innerHeight);

      pointer.x += (pointer.targetX - pointer.x) * 0.08;
      pointer.y += (pointer.targetY - pointer.y) * 0.08;

      update3DActors(t, mobileNow, aspectNow, elapsed, pointer);
      updateStageBackground(t);
      updatePhaseSections(t);

      // Update live video textures only for currently visible actors
      if (originCinema.root.visible) {
        originCinema.updateCinemaCanvas(t, state.scrollData.delta);
      }
      if (barrelOuterGroup.visible) {
        liveDrum.update();
      }
      if (heroCupGroup.visible) {
        heroShowcase.updateHeroCanvas(t);
      }
      if (monoOuterLeft.visible || monoInnerLeft.visible) {
        stage1Mono.update();
        stage2Mono.update();
        stage3Mono.update();
        stage4Mono.update();
      }

      // Deterministic studio lighting curve across all phases
      const dip = t >= 2.2 && t <= 2.85 ? Math.sin(((t - 2.2) / 0.65) * Math.PI) : 0;
      scene.environmentIntensity = (t >= 5.0 ? 0.95 : 0.72) * (1 - dip * 0.85);
      backSpotLight.intensity = 110 * (1 - dip * 0.9);
      fillDirLight.intensity = (t >= 5.0 ? 3.6 : 2.8) * (1 - dip * 0.85);
      contactShadowPlane.visible = t >= 5.0;

      // HUD Logo & Credit Inversion
      if (logoEl) {
        logoEl.dataset.stageLight = t >= 5.0 ? "true" : "false";
      }

      if (creditEl) {
        if (t >= 5.0) {
          creditEl.style.color = "#111111";
          creditEl.style.mixBlendMode = "normal";
        } else {
          creditEl.style.color = "#ffffff";
          creditEl.style.mixBlendMode = "difference";
        }
      }

      if (filmBtnEl) {
        if (t >= 5.0) {
          filmBtnEl.style.color = "#111111";
          filmBtnEl.style.borderColor = "rgba(17,17,17,0.25)";
          filmBtnEl.style.backgroundColor = "rgba(255,255,255,0.82)";
        } else {
          filmBtnEl.style.color = "#ffffff";
          filmBtnEl.style.borderColor = "rgba(255,255,255,0.25)";
          filmBtnEl.style.backgroundColor = "rgba(0,0,0,0.38)";
        }
      }

      renderer.render(scene, camera);
    });

    // Responsive Resize Handler (dynamically updates spacer height, camera aspect & ScrollTrigger while preserving beat progress)
    let lastMobile = window.innerWidth < 768;
    window.addEventListener("resize", () => {
      const savedProgress = state.progress;
      const nowMobile = window.innerWidth < 768;
      if (spacerEl && nowMobile !== lastMobile) {
        lastMobile = nowMobile;
        spacerEl.style.height = `${state.totalSections * (nowMobile ? 60 : 80)}vh`;
      }
      camera.aspect = window.innerWidth / Math.max(1, window.innerHeight);
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      ScrollTrigger.refresh();
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      window.scrollTo(0, savedProgress * maxScroll);
      state.progress = savedProgress;
    });
  });

  // 10. Full 25s Extraction Film Modal Controls (with interactive stage clip switcher)
  const modal = document.getElementById("film-modal") as HTMLElement | null;
  const videoEl = document.getElementById("film-video") as HTMLVideoElement | null;
  const openBtns = document.querySelectorAll<HTMLElement>("[data-open-film]");
  const closeBtn = document.getElementById("close-film-btn") as HTMLElement | null;
  const clipBtns = document.querySelectorAll<HTMLElement>("[data-film-src]");

  const openFilmModal = () => {
    if (!modal) return;
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    if (videoEl) {
      videoEl.currentTime = 0;
      videoEl.play().catch(() => {});
    }
  };

  const closeFilmModal = () => {
    if (!modal) return;
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    if (videoEl) {
      videoEl.pause();
    }
  };

  clipBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const src = btn.getAttribute("data-film-src");
      if (src && videoEl) {
        videoEl.src = src;
        videoEl.currentTime = 0;
        videoEl.play().catch(() => {});
      }
    });
  });

  openBtns.forEach((btn) => btn.addEventListener("click", openFilmModal));
  closeBtn?.addEventListener("click", closeFilmModal);
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeFilmModal();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeFilmModal();
  });
}
