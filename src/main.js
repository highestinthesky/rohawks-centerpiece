import "./style.css";
import { playHero } from "./hero.js";

const anime = window.anime; // loaded as a classic <script> in index.html
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ============================================================
   1) CAD frame sequence (reused in the blueprint finale)
   Swap public/frames/* for your real CAD render later.
   ============================================================ */
const FRAME_COUNT = 120;
const framePath = (i) => `./frames/frame_${String(i).padStart(3, "0")}.png`;
const images = [];
for (let i = 0; i < FRAME_COUNT; i++) {
  const img = new Image();
  img.src = framePath(i);
  images[i] = img;
}

const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");
let curFrame = -1;

function sizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const r = canvas.getBoundingClientRect();
  canvas.width = Math.round(r.width * dpr);
  canvas.height = Math.round(r.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
function drawFrame(i) {
  const img = images[i];
  if (!img || !img.complete) return;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  ctx.clearRect(0, 0, w, h);
  const s = Math.min(w / img.width, h / img.height);
  const dw = img.width * s;
  const dh = img.height * s;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

/* ============================================================
   2) Hero — a hawk swoops in and drops the logo (see src/hero.js)
   ============================================================ */
function heroIntro() {
  playHero(anime, reduce);
}

/* ============================================================
   3) The Deck — messy paper sheets slide in/out on scroll,
      then the blueprint expands and the CAD rotates.
   ============================================================ */
const deck = document.getElementById("deck");
const sheets = [...document.querySelectorAll(".sheet")];
const paperSheets = sheets.filter((s) => !s.classList.contains("sheet--blueprint"));
const blueprint = document.querySelector(".sheet--blueprint");
const cad = document.querySelector(".cad");
const counter = document.getElementById("counter");
const nav = document.querySelector(".nav");

const PAPER = paperSheets.length; // 4

// ▶ SCROLL SENSITIVITY for the deck: bigger = LESS sensitive (more scrolling per page).
const DECK_VH = 1100;

/* Scroll timeline (one-way; scrolling UP reverses it naturally):
   [0  .. A ]  all sheets crash in together (messy), anchored near the top
   [A  .. P0]  HOLD — the pile sits so page 1 stays on screen
   [P0 .. B ]  sheets peel off one by one, revealing the blueprint
   [B  .. C ]  blueprint expands and the CAD turntable rotates
   [C  .. D ]  blueprint closes back to a normal page (papers stay gone)
   [D  .. 1 ]  blueprint card just holds as you scroll out               */
const A = 0.07;
const P0 = 0.24;
const B = 0.62;
const C = 0.84;
const D = 0.94;
const PEEL_SPAN = (B - P0) / PAPER; // each sheet's peel-off window
const TOP_GAP = 0.06; // page top sits this fraction of the viewport below the top edge

// Per-sheet choreography. ein/eout = off-screen direction it crashes in from / peels out to.
// rx = small horizontal mess (fraction of W); rr = resting tilt; inr/outr = tilt off-screen.
// rx = small horizontal mess (fraction of W); rr = resting tilt; inr/outr = tilt off-screen.
const SHEETS = [
  { ein: [-1, -1], eout: [0, -1], rx: -0.04, rr: -4, inr: -18, outr: -22 },
  { ein: [1, -1], eout: [1, 0], rx: 0.05, rr: 4, inr: 18, outr: 24 },
  { ein: [-1, 1], eout: [-1, 0], rx: -0.04, rr: -3, inr: 16, outr: -26 },
  { ein: [1, 1], eout: [1, -1], rx: 0.05, rr: 4, inr: -16, outr: 28 },
];

let restW = 600;
let restH = 820;
function measure() {
  // resting size comes from a real paper sheet, so the blueprint
  // (which is sized inline by JS) matches the others exactly.
  if (paperSheets[0]) {
    restW = paperSheets[0].offsetWidth;
    restH = paperSheets[0].offsetHeight;
  }
  sizeCanvas();
}

const clamp = (t, a, b) => Math.min(Math.max(t, a), b);
const smooth = (t) => {
  t = clamp(t, 0, 1);
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;

function render(p) {
  const W = window.innerWidth;
  const H = window.innerHeight;

  // exits must clear fully even when the page is tilted, so add the rotated-corner
  // cross-term (a tilted page's bounding box is bigger than its width/height).
  const offX = W / 2 + restW / 2 + restH * 0.6 + 80;
  const offY = H / 2 + restH / 2 + restW * 0.6 + 80;
  const restCenterY = TOP_GAP * H + restH / 2 - H / 2; // center offset that top-anchors a page

  // blueprint expand factor: opens, holds, then closes back to a card
  let exp;
  const openEnd = B + (C - B) * 0.4;
  if (p < B) exp = 0;
  else if (p < openEnd) exp = smooth((p - B) / (openEnd - B));
  else if (p < C) exp = 1;
  else if (p < D) exp = 1 - smooth((p - C) / (D - C));
  else exp = 0;

  // --- paper sheets: crash in (top-anchored), hold, peel off 1-by-1 (no restack) ---
  paperSheets.forEach((sheet, i) => {
    const s = SHEETS[i] || SHEETS[0];
    const inP = smooth(p / A); // crash in, all at once
    const outP = smooth((p - (P0 + i * PEEL_SPAN)) / PEEL_SPAN); // sheet 0 peels first

    const enterX = s.ein[0] * offX, enterY = s.ein[1] * offY;
    const exitX = s.eout[0] * offX, exitY = s.eout[1] * offY;
    const restX = s.rx * W;

    const x = enterX + (restX - enterX) * inP + (exitX - restX) * outP;
    const y = enterY + (restCenterY - enterY) * inP + (exitY - restCenterY) * outP;
    const rot = s.inr + (s.rr - s.inr) * inP + (s.outr - s.rr) * outP;
    const sc = 0.9 + 0.1 * inP;

    sheet.style.zIndex = String(20 + (PAPER - i)); // sheet 0 sits on top
    sheet.style.opacity = inP < 0.02 ? 0 : 1;
    sheet.style.transform =
      `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rot}deg) scale(${sc})`;
  });

  // --- blueprint: top-anchored card -> full screen -> back to a normal card ---
  blueprint.style.zIndex = "14";
  blueprint.style.opacity = String(clamp(p / (A * 0.7), 0, 1)); // hidden until papers land
  const bpY = lerp(restCenterY, 0, exp); // card is top-anchored, full screen is centered
  blueprint.style.transform =
    `translate(-50%, -50%) translate(0px, ${bpY}px) rotate(${lerp(-2, 0, exp)}deg)`;
  if (exp <= 0.0001) {
    blueprint.style.width = "";
    blueprint.style.height = "";
    blueprint.style.borderRadius = "";
  } else {
    blueprint.style.width = `${lerp(restW, W, exp)}px`;
    blueprint.style.height = `${lerp(restH, H, exp)}px`;
    blueprint.style.borderRadius = `${(1 - exp) * 6}px`;
  }

  // --- CAD reveal + scrub (rotation tied to the open window) ---
  cad.style.opacity = exp;
  const cadProg = clamp((p - (B + 0.02)) / (C - (B + 0.02)), 0, 1);
  const frame = Math.min(FRAME_COUNT - 1, Math.floor(cadProg * FRAME_COUNT));
  if (frame !== curFrame) {
    curFrame = frame;
    drawFrame(frame);
  }

  // --- nav hides while the blueprint owns the screen ---
  nav.style.opacity = String(1 - exp);

  // --- page counter ---
  let active;
  if (p < P0) active = 1;
  else if (p < B) active = clamp(Math.floor((p - P0) / PEEL_SPAN) + 1, 1, PAPER);
  else active = 5;
  counter.textContent = `${String(active).padStart(2, "0")} / 05`;
}

function onScroll() {
  const rect = deck.getBoundingClientRect();
  const total = deck.offsetHeight - window.innerHeight;
  const scrolled = clamp(-rect.top, 0, total);
  const p = total > 0 ? scrolled / total : 0;
  render(p);
}

/* ============================================================
   4) Boot
   ============================================================ */
function boot() {
  deck.style.height = DECK_VH + "vh"; // apply the scroll-sensitivity setting
  measure();
  heroIntro();
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

window.addEventListener("resize", () => {
  measure();
  onScroll();
});

if (document.readyState === "complete") boot();
else window.addEventListener("load", boot);
