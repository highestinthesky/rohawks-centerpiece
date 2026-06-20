/* ============================================================
   Hero intro — a hawk silhouette soars across while the page
   dims (something flew over), then the logo lockup (emblem +
   ROHAWKS wordmark) drops in, then the supporting text fades in.

   The hawk image is public/hawk.png (your silhouette). A
   `multiply` blend (in CSS) keys out a white background, so the
   file can have white OR transparent behind it.

   Tunables: hawk flight (range/duration/scale), flyover darkness,
   drop `delay`, supporting `start`.
   ============================================================ */

const SUPPORTING = ".hero__eyebrow, .hero__rule, .hero__sub, .hero__tag, .scrollcue";

export function playHero(anime, reduce) {
  const flyover = document.querySelector(".flyover");
  const hawkWrap = document.querySelector(".hawk-wrap");
  const hawk = document.getElementById("hawk");
  const lockup = document.getElementById("lockup");

  // reduced motion / no anime: just show the finished hero
  if (reduce || !anime) {
    if (flyover) flyover.style.display = "none";
    if (hawkWrap) hawkWrap.style.display = "none";
    if (lockup) lockup.style.opacity = 1;
    document.querySelectorAll(SUPPORTING).forEach((el) => (el.style.opacity = 1));
    return;
  }

  const W = window.innerWidth;
  const H = window.innerHeight;

  // soft shadow dims the page as the hawk passes
  anime({
    targets: ".flyover",
    translateX: [-1.85 * W, 0.35 * W],
    opacity: [
      { value: 0, duration: 1 },
      { value: 1, duration: 150 },
      { value: 1, duration: 950 },
      { value: 0, duration: 300 },
    ],
    duration: 1400,
    easing: "easeInOutSine",
  });

  // the hawk soars diagonally across (bottom-right -> upper-left, matching the pose)
  anime({
    targets: hawk,
    translateX: [-1.05 * W, 1.05 * W], // fly LEFT -> RIGHT so the head leads
    translateY: [0.45 * H, -0.5 * H], // ascending toward the right
    rotate: [5, -7],
    scale: [
      { value: 0.9, duration: 0 },
      { value: 1.08, duration: 850 },
      { value: 0.85, duration: 850 },
    ],
    opacity: [
      { value: 0, duration: 1 },
      { value: 1, duration: 240 },
      { value: 1, duration: 1130 },
      { value: 0, duration: 330 },
    ],
    duration: 1700,
    easing: "easeInOutSine",
  });

  // the logo lockup drops in, in the hawk's wake
  anime({
    targets: lockup,
    opacity: [0, 1],
    translateY: [-160, 0],
    scale: [0.92, 1],
    duration: 900,
    delay: 1150,
    easing: "easeOutBack",
  });

  // supporting text eases in after the logo lands
  anime({
    targets: SUPPORTING,
    opacity: [0, 1],
    translateY: [12, 0],
    delay: anime.stagger(110, { start: 1800 }),
    duration: 700,
    easing: "easeOutCubic",
  });
}
