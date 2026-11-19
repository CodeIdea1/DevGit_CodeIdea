"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as RPointerEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import styles from "./Projects.module.css";
import { PROJECTS, CATS } from "@/app/Projects/projects-data";
import type { Project, Cat, Kind } from "@/app/Projects/projects-data";

const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect;
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const pad = (n: number) => String(n).padStart(2, "0");

const INTRO = "Every project is a fusion of strategy, creativity and passion.";
const KINDS: { id: "all" | Kind; label: string }[] = [
  { id: "all", label: "All" },
  { id: "project", label: "Projects" },
  { id: "template", label: "Templates" },
];

/* ═══════════════════════════════════════════
   HERO TUNNEL: cards sit on a golden-angle spiral along the Z axis.
   Scrolling moves the world forward (one element) and every card gets its own
   scrubbed "door swing" as it passes the camera.
   ═══════════════════════════════════════════ */
const TRAVEL = 4900;
const SCROLL_T = 3; // duration of the master scroll timeline

/* NEW: soft-focus start. Cards begin blurred + a bit transparent, then "come into focus"
   as they approach the camera, so the title reads calmly over them. */
const BLUR_START = 12; // px
const OPACITY_START = 0.55;

const BLOG_HERO_IMAGES = [
  "/blog/luxury-is-quiet.webp",
  "/blog/easing-second-language.webp",
  "/blog/no-templates3.webp",
  "/blog/pinning-without-pain.webp",
  "/blog/brief-to-quote2.webp",
  "/blog/the-paid-task2.webp",
  "/blog/soft-palettes.webp",
] as const;

type TunnelCard = {
  p: Project;
  imageSrc: string;
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
};

const TUNNEL: TunnelCard[] = PROJECTS.slice(0, 10).map((p: Project, i: number): TunnelCard => {
  const a = i * 2.4;
  const R = 470 + (i % 3) * 80;
  const cx = Math.cos(a);
  const cy = Math.sin(a);
  return {
    p,
    imageSrc: BLOG_HERO_IMAGES[i % BLOG_HERO_IMAGES.length],
    x: Math.round(cx * R),
    y: Math.round(cy * R * 0.72),
    z: -700 - i * 440,
    ry: Math.round(-cx * 26),
    rx: Math.round(cy * 18),
    rz: ((i % 5) - 2) * 4,
  };
});

/* ═══════════════════════════════════════════
   BENTO: repeats every 7 cards, 17 rows per cycle, no holes.
   full (4×5)
   big (2×6) + 2 small (2×3) stacked on the right
   2 small (2×3) stacked on the left + big (2×6)
   ═══════════════════════════════════════════ */
type Shape = "full" | "big" | "small";
const place = (i: number): { shape: Shape; gc: string; gr: string } => {
  const r = Math.floor(i / 7) * 17;
  switch (i % 7) {
    case 0: return { shape: "full", gc: "1 / 5", gr: `${r + 1} / span 5` };
    case 1: return { shape: "big", gc: "1 / 3", gr: `${r + 6} / span 6` };
    case 2: return { shape: "small", gc: "3 / 5", gr: `${r + 6} / span 3` };
    case 3: return { shape: "small", gc: "3 / 5", gr: `${r + 9} / span 3` };
    case 4: return { shape: "small", gc: "1 / 3", gr: `${r + 12} / span 3` };
    case 5: return { shape: "small", gc: "1 / 3", gr: `${r + 15} / span 3` };
    default: return { shape: "big", gc: "3 / 5", gr: `${r + 12} / span 6` };
  }
};
const SHAPE_CLS: Record<Shape, string> = { full: styles.tFull, big: styles.tBig, small: "" };

/* ═══════════════════════════════════════════
   PLANE FLIGHTS: a different route on every filter change.
   (el, grid width, flight height, random scale) → timeline
   Mirrored flights use a negative scaleX, so for them a positive rotation = nose up.
   ═══════════════════════════════════════════ */
type Flight = (el: HTMLElement, w: number, h: number, s: number) => gsap.core.Timeline;

const FLIGHTS: Flight[] = [
  /* 0 · classic arc, left → right */
  (el, w, h, s) => {
    gsap.set(el, { x: -140, y: h * 0.22, rotation: 14, scaleX: s, scaleY: s, opacity: 1 });
    return gsap
      .timeline()
      .to(el, { x: w + 140, rotation: -10, duration: 1.5, ease: "power1.inOut" }, 0)
      .to(el, { y: h * 0.04, duration: 0.75, ease: "sine.out" }, 0)
      .to(el, { y: h * 0.3, duration: 0.75, ease: "sine.in" }, 0.75);
  },
  /* 1 · return flight, right → left (mirrored) */
  (el, w, h, s) => {
    gsap.set(el, { x: w + 140, y: h * 0.34, rotation: -12, scaleX: -s, scaleY: s, opacity: 1 });
    return gsap
      .timeline()
      .to(el, { x: -140, rotation: 10, duration: 1.7, ease: "power2.inOut" }, 0)
      .to(el, { y: h * 0.1, duration: 0.9, ease: "sine.out" }, 0)
      .to(el, { y: h * 0.26, duration: 0.8, ease: "sine.in" }, 0.9);
  },
  /* 2 · steep climb, bottom-left → top-right */
  (el, w, h, s) => {
    gsap.set(el, { x: -140, y: h * 0.72, rotation: -16, scaleX: s, scaleY: s, opacity: 1 });
    return gsap
      .timeline()
      .to(el, { x: w + 140, duration: 1.6, ease: "power1.inOut" }, 0)
      .to(el, { y: -h * 0.1, duration: 1.6, ease: "power2.in" }, 0)
      .to(el, { rotation: -34, duration: 1.6, ease: "power1.in" }, 0);
  },
  /* 3 · dive, top-right → bottom-left (mirrored) */
  (el, w, h, s) => {
    gsap.set(el, { x: w + 140, y: -h * 0.06, rotation: -14, scaleX: -s, scaleY: s, opacity: 1 });
    return gsap
      .timeline()
      .to(el, { x: -140, duration: 1.5, ease: "power1.inOut" }, 0)
      .to(el, { y: h * 0.62, duration: 1.5, ease: "power2.in" }, 0)
      .to(el, { rotation: -34, duration: 1.5, ease: "power1.in" }, 0);
  },
  /* 4 · loop-the-loop, left → right */
  (el, w, h, s) => {
    gsap.set(el, { x: -140, y: h * 0.24, rotation: 8, scaleX: s, scaleY: s, opacity: 1 });
    return gsap
      .timeline()
      .to(el, { x: w + 140, duration: 2, ease: "power1.inOut" }, 0)
      .to(el, { y: h * 0.1, duration: 0.7, ease: "sine.out" }, 0)
      .to(el, { y: h * 0.32, duration: 1.3, ease: "sine.inOut" }, 0.7)
      .to(el, { rotation: -352, duration: 0.9, ease: "power2.inOut" }, 0.55);
  },
  /* 5 · lazy wave, right → left (mirrored) */
  (el, w, h, s) => {
    gsap.set(el, { x: w + 140, y: h * 0.2, rotation: 0, scaleX: -s, scaleY: s, opacity: 1 });
    return gsap
      .timeline()
      .to(el, { x: -140, duration: 2.2, ease: "power1.inOut" }, 0)
      .to(el, { keyframes: { y: [h * 0.08, h * 0.28, h * 0.1, h * 0.3, h * 0.16], easeEach: "sine.inOut" }, duration: 2.2 }, 0)
      .to(el, { keyframes: { rotation: [-10, 12, -10, 12, 0], easeEach: "sine.inOut" }, duration: 2.2 }, 0);
  },
];

/* ═══════════════════════════════════════════
   Small pieces
   ═══════════════════════════════════════════ */
function Chars({ text }: { text: string }) {
  return (
    <>
      {Array.from(text).map((c, i) => (
        <span key={i} data-ch className={styles.ch} aria-hidden="true">
          {c === " " ? "\u00A0" : c}
        </span>
      ))}
    </>
  );
}

/* the folded paper plane from the Journal */
function PaperPlane() {
  const uid = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 90 56" className={styles.planeSvg} aria-hidden="true">
      <defs>
        <linearGradient id={`pa${uid}`} x1="0" y1="0" x2="1" y2="0.6">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e3eef6" />
        </linearGradient>
        <linearGradient id={`pb${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d4e3ee" />
          <stop offset="1" stopColor="#a4c0d4" />
        </linearGradient>
        <linearGradient id={`pc${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8fb0c8" />
          <stop offset="1" stopColor="#5d84a4" />
        </linearGradient>
      </defs>
      <polygon points="6,50 86,26 30,29" fill={`url(#pb${uid})`} stroke="rgba(45,118,165,.55)" strokeWidth="1" strokeLinejoin="round" />
      <polygon points="30,29 86,26 16,42" fill={`url(#pc${uid})`} stroke="rgba(45,118,165,.55)" strokeWidth="1" strokeLinejoin="round" />
      <polygon points="6,6 86,26 30,29" fill={`url(#pa${uid})`} stroke="rgba(45,118,165,.6)" strokeWidth="1" strokeLinejoin="round" />
      <polygon points="6,6 86,26 46,20" fill="#fff" opacity="0.7" />
    </svg>
  );
}

/** Real screenshot if it exists, otherwise a generated cover (static gradient mesh + outlined word) */
function Cover({ p, imageSrc }: { p: Project; imageSrc?: string }) {
  return (
    <div className={styles.cover} style={{ "--c1": p.hue[0], "--c2": p.hue[1], "--c3": p.hue[2] } as CSSProperties} aria-hidden="true">
      <span className={styles.coverMesh} />
      <i className={`${styles.coverRing} ${styles.coverRing1}`} />
      <i className={`${styles.coverRing} ${styles.coverRing2}`} />
      <span className={styles.coverGlyph}>{p.glyph}</span>
      <img
        className={styles.coverImg}
        src={imageSrc ?? `/projects/${p.slug}.webp`}
        alt=""
        loading="lazy"
        decoding="async"
        draggable={false}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
}

/* pointer position inside a tile → CSS variables (spotlight + calm vertical drift), no re-render */
const onTileMove = (e: RPointerEvent<HTMLElement>) => {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;
  el.style.setProperty("--px", `${x}px`);
  el.style.setProperty("--py", `${y}px`);
  el.style.setProperty("--my", String((y / r.height) * 2 - 1));
};
const onTileLeave = (e: RPointerEvent<HTMLElement>) => {
  e.currentTarget.style.setProperty("--my", "0");
};

/* ═══════════════════════════════════════════
   Page
   ═══════════════════════════════════════════ */
export default function Projects() {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLUListElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const swoopRef = useRef<HTMLSpanElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const pillFirst = useRef(true);
  const flipState = useRef<ReturnType<typeof Flip.getState> | null>(null);
  const flipTl = useRef<gsap.core.Timeline | null>(null);
  const flightTl = useRef<gsap.core.Timeline | null>(null);
  const lastFlight = useRef(-1);

  const [kind, setKind] = useState<"all" | Kind>("all");
  const [cat, setCat] = useState<"All" | Cat>("All");

  const inKind = (p: Project) => kind === "all" || p.kind === kind;
  const visible = PROJECTS.filter((p: Project) => inKind(p) && (cat === "All" || p.cat === cat));
  const catCount = (c: Cat) => PROJECTS.filter((p: Project) => inKind(p) && p.cat === c).length;
  const kindIdx = KINDS.findIndex((k) => k.id === kind);

  /* the plane takes a different route every time (never the same one twice in a row) */
  const swoop = () => {
    const el = swoopRef.current;
    const wrap = gridRef.current;
    if (!el || !wrap) return;
    const w = wrap.offsetWidth;
    if (!w) return;
    const h = Math.min(wrap.offsetHeight, window.innerHeight * 0.75);

    const n = (lastFlight.current + 1) % FLIGHTS.length;
    lastFlight.current = n;

    flightTl.current?.kill();
    const s = 0.8 + (n / Math.max(1, FLIGHTS.length - 1)) * 0.5;
    flightTl.current = FLIGHTS[n](el, w, h, s).set(el, { opacity: 0 });
  };

  const capture = () => {
    if (reduced() || !gridRef.current) return;
    flipTl.current?.progress(1);
    flipState.current = Flip.getState(gridRef.current.querySelectorAll("[data-tile]"));
    swoop();
  };
  const onKind = (k: "all" | Kind) => {
    if (k === kind) return;
    capture();
    setKind(k);
  };
  const onCat = (c: "All" | Cat) => {
    if (c === cat) return;
    capture();
    setCat(c);
  };

  useIso(() => {
    const st = flipState.current;
    if (!st) return;
    flipState.current = null;
    flipTl.current = Flip.from(st, {
      duration: 0.8,
      ease: "power3.inOut",
      stagger: 0.025,
      onEnter: (els) => {
        gsap.set((els as HTMLElement[]).map((el) => el.querySelector("[data-in]")), { opacity: 1, y: 0 });
        return gsap.fromTo(els, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.6, delay: 0.25, ease: "power3.out" });
      },
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.92, duration: 0.3, ease: "power2.in" }),
      onComplete: () => ScrollTrigger.refresh(),
    });
  }, [kind, cat]);

  /* filter block slides between the tabs */
  useEffect(() => {
    const move = (instant: boolean) => {
      const btn = filtersRef.current?.querySelector<HTMLElement>(`[data-cat="${cat}"]`);
      if (!btn || !pillRef.current) return;
      gsap.to(pillRef.current, {
        x: btn.offsetLeft, y: btn.offsetTop, width: btn.offsetWidth, height: btn.offsetHeight,
        duration: instant || reduced() ? 0 : 0.55, ease: "power3.out", overwrite: true,
      });
    };
    move(pillFirst.current);
    pillFirst.current = false;
    const onResize = () => move(true);
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(() => move(true)).catch((error: unknown) => {
      console.error("Could not reposition the Projects filters after fonts loaded.", error);
    });
    return () => window.removeEventListener("resize", onResize);
  }, [cat, kind]);

  /* ═══════════ Motion ═══════════ */
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, Flip);
    const root = rootRef.current;
    if (!root) return;
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();

    mm.add(
      {
        desk: "(min-width: 901px) and (prefers-reduced-motion: no-preference)",
        fine: "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
        mob: "(max-width: 900px) and (prefers-reduced-motion: no-preference)",
      },
      (ctx) => {
        const { desk, fine } = ctx.conditions as { desk: boolean; fine: boolean; mob: boolean };
        const off: Array<() => void> = [];
        const hero = heroRef.current;

        /* ── HERO intro: the tunnel flies in, the plane glides in, the title rises ── */
        gsap.from(q("[data-hero] [data-ch]"), { yPercent: 130, duration: 1.1, ease: "power4.out", stagger: 0.04, delay: 0.2 });
        gsap.from(q("[data-hero-fade]"), { opacity: 0, y: 16, duration: 0.9, ease: "power3.out", stagger: 0.12, delay: 0.8 });
        gsap.from(q("[data-intro]"), { z: -1800, duration: 2.4, ease: "power3.out" });
        gsap.from(q("[data-plane]"), { x: -260, y: 90, opacity: 0, duration: 1.8, ease: "power3.out", delay: 0.6 });
        /* NEW: the whole tunnel melts in gently instead of popping in behind the title */
        gsap.from(q("[data-stage]"), { opacity: 0, duration: 1.8, ease: "power2.out", delay: 0.15 });

        /* ── HERO scroll: ONE scrubbed timeline. The camera flies through the tunnel. ── */
        if (desk && hero) {
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: { trigger: hero, start: "top top", end: "+=300%", pin: true, scrub: 0.5, anticipatePin: 1, invalidateOnRefresh: true },
          });

          tl.to(q("[data-world]"), { z: TRAVEL, rotationZ: 26, duration: SCROLL_T }, 0)
            /* the camera banks left / right like a real fly-through (a gentle S-curve) */
            .to(q("[data-world]"), { keyframes: { x: [-110, 150, -90, 0], y: [40, -60, 36, 0], rotationY: [-3, 4, -3, 0], easeEach: "none" }, duration: SCROLL_T }, 0)
            .to(q("[data-l1]"), { xPercent: -90, duration: 1.2 }, 0)
            .to(q("[data-l2]"), { xPercent: 90, duration: 1.2 }, 0)
            .to(q("[data-hero-content]"), { opacity: 0, duration: 0.9 }, 0.2)
            /* NEW: the soft haze behind the title leaves together with the title */
            .to(q("[data-scrim]"), { opacity: 0, duration: 0.9 }, 0.2)
            .to(q("[data-plane-in]"), { x: () => window.innerWidth * 0.34, y: () => -window.innerHeight * 0.32, scale: 0.25, opacity: 0, duration: 2.2 }, 0)
            .to(q("[data-cloud-l]"), { xPercent: -30, duration: 3 }, 0)
            .to(q("[data-cloud-r]"), { xPercent: 30, duration: 3 }, 0)
            .fromTo(q("[data-sun]"), { yPercent: 55, opacity: 0 }, { yPercent: -90, opacity: 1, duration: 2.2 }, 0)
            .to(q("[data-veil]"), { opacity: 1, duration: 0.6 }, 2.4);

          /* each card swings like a door as it reaches the camera, then fades just before it passes through */
          (q("[data-hcard]") as HTMLElement[]).forEach((card, i) => {
            const c = TUNNEL[i];
            if (!c) return;
            const side = c.x >= 0 ? 1 : -1;
            const tReach = (-c.z * SCROLL_T) / TRAVEL; // moment the card crosses the z = 0 plane
            const start = Math.max(0, tReach - 1.1);
            const end = Math.min(SCROLL_T, tReach + 0.45);

            tl.fromTo(
              card,
              { "--ry": c.ry, "--rx": c.rx, "--rz": c.rz },
              {
                "--ry": c.ry * 3 - side * 25,
                "--rx": c.rx * 2,
                "--rz": c.rz * 3 + side * 16,
                duration: Math.max(0.2, end - start),
                ease: "power2.in",
              },
              start
            );

            /* NEW: SOFT FOCUS → each card starts blurred + a bit transparent and sharpens
               as it approaches the camera (a "rack focus" that follows the scroll). */
            const focusEnd = Math.max(0.35, tReach - 0.25);
            tl.fromTo(
              card,
              { "--blur": BLUR_START, opacity: OPACITY_START },
              { "--blur": 0, opacity: 1, duration: focusEnd, ease: "power2.out" },
              0
            );

            const tOut = ((620 - c.z) * SCROLL_T) / TRAVEL;
            if (tOut <= SCROLL_T) tl.to(card, { opacity: 0, duration: 0.22, ease: "power1.in" }, Math.max(0, tOut - 0.22));
          });

          /* the whole tunnel leans toward the pointer */
          const tilt = q("[data-tilt]")[0];
          if (fine && tilt) {
            const ry = gsap.quickTo(tilt, "rotationY", { duration: 1.2, ease: "power3.out" });
            const rx = gsap.quickTo(tilt, "rotationX", { duration: 1.2, ease: "power3.out" });
            const move = (e: PointerEvent) => {
              ry((e.clientX / window.innerWidth - 0.5) * 9);
              rx(-(e.clientY / window.innerHeight - 0.5) * 5);
            };
            hero.addEventListener("pointermove", move);
            off.push(() => hero.removeEventListener("pointermove", move));
          }
        } else {
          /* small screens: no pin, the tunnel drifts on its own
             (cards keep the calm default soft focus from CSS) */
          gsap.fromTo(q("[data-world]"), { z: 0 }, { z: 1100, duration: 16, ease: "sine.inOut", yoyo: true, repeat: -1 });
        }

        /* ── INTRO: words light up (one tween), stats count ── */
        if (introRef.current) {
          gsap.fromTo(q("[data-iword]"), { opacity: 0.18 }, {
            opacity: 1, ease: "none", stagger: 0.12,
            scrollTrigger: { trigger: introRef.current, start: "top 78%", end: "center 45%", scrub: true },
          });
          (q("[data-count]") as HTMLElement[]).forEach((el) => {
            const o = { v: 0 };
            const target = Number(el.dataset.count ?? 0);
            el.textContent = "0";
            gsap.to(o, {
              v: target, duration: 1.4, ease: "power3.out",
              onUpdate: () => { el.textContent = String(Math.round(o.v)); },
              scrollTrigger: { trigger: el, start: "top 92%", once: true },
            });
          });
        }

        /* ── Titles + fades: fire once, transform/opacity only ── */
        q("[data-reveal]").forEach((el) => {
          gsap.from(el.querySelectorAll("[data-ch]"), {
            yPercent: 130, duration: 0.9, ease: "power4.out", stagger: 0.03,
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          });
        });
        q("[data-fade]").forEach((el) => {
          gsap.from(el, { y: 24, opacity: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
        });

        /* ── TILES: rise as a batch ── */
        const ins = q("[data-tile] [data-in]");
        gsap.set(ins, { opacity: 0, y: 56 });
        ScrollTrigger.batch(ins, {
          start: "top 94%",
          once: true,
          onEnter: (b) => gsap.to(b, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: "power3.out", overwrite: true }),
        });

        /* ── CURSOR: a round "View" bubble that follows the mouse over the tiles.
              It uses mix-blend-mode in CSS, so it takes the colour of what is behind it. ── */
        const grid = gridRef.current;
        const cur = cursorRef.current;
        if (desk && fine && grid && cur) {
          const label = cur.firstElementChild as HTMLElement;
          grid.setAttribute("data-cursor", "true");
          gsap.set(cur, { xPercent: -50, yPercent: -50, scale: 0 });
          const mx = gsap.quickTo(cur, "x", { duration: 0.45, ease: "power3" });
          const my = gsap.quickTo(cur, "y", { duration: 0.45, ease: "power3" });
          const move = (e: PointerEvent) => { mx(e.clientX); my(e.clientY); };
          const over = (e: PointerEvent) => {
            const t = (e.target as HTMLElement).closest<HTMLElement>("[data-tile]");
            if (t) label.textContent = t.dataset.kind === "template" ? "Preview" : "View";
            gsap.to(cur, { scale: t ? 1 : 0, duration: t ? 0.45 : 0.25, ease: t ? "back.out(1.7)" : "power2.in", overwrite: "auto" });
          };
          const out = () => gsap.to(cur, { scale: 0, duration: 0.25, overwrite: "auto" });
          grid.addEventListener("pointermove", move);
          grid.addEventListener("pointerover", over);
          grid.addEventListener("pointerleave", out);
          off.push(() => {
            grid.removeEventListener("pointermove", move);
            grid.removeEventListener("pointerover", over);
            grid.removeEventListener("pointerleave", out);
            grid.removeAttribute("data-cursor");
          });
        }

        /* ── CTA: the sun climbs ── */
        if (desk && ctaRef.current) {
          gsap.fromTo(q("[data-cta-sun]"), { yPercent: 40, opacity: 0.3 }, {
            yPercent: 0, opacity: 1, ease: "none",
            scrollTrigger: { trigger: ctaRef.current, start: "top bottom", end: "center center", scrub: true },
          });
        }

        return () => off.forEach((fn) => fn());
      }
    );

    document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch((error: unknown) => {
      console.error("Could not refresh Projects scroll animations after fonts loaded.", error);
    });
    return () => mm.revert();
  }, []);

  const total = PROJECTS.length;
  const nProjects = PROJECTS.filter((p: Project) => p.kind === "project").length;
  const marqItems: string[] = PROJECTS.filter((p: Project) => p.kind === "project").map((p: Project) => p.title);

  return (
    <div ref={rootRef} className={styles.page}>
      {/* ═══════════ HERO: fly through the work ═══════════ */}
      <section ref={heroRef} className={styles.hero} aria-labelledby="projects-title">
        <div className={styles.sunGlow} aria-hidden="true" />
        <div data-sun className={styles.sun} aria-hidden="true" />

        <div data-stage className={styles.stage} aria-hidden="true">
          <div data-tilt className={styles.d3}>
            <div data-intro className={styles.d3}>
              <div data-world className={styles.d3}>
                {TUNNEL.map(({ p, imageSrc, x, y, z, rx, ry, rz }: TunnelCard, i: number) => (
                  <div
                    key={p.slug}
                    data-hcard
                    className={styles.hcard}
                    style={{ "--x": x, "--y": y, "--z": z, "--rx": rx, "--ry": ry, "--rz": rz, "--t": p.hue[2] } as CSSProperties}
                  >
                    <Cover p={p} imageSrc={imageSrc} />
                    <i className={styles.fold} />
                    <span className={styles.hcardLab}>{pad(i + 1)} {p.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.fog} aria-hidden="true" />
        {/* NEW: soft haze right behind the title so the white letters read calmly */}
        <div data-scrim className={styles.heroScrim} aria-hidden="true" />
        <div data-cloud-l className={styles.cloudL} aria-hidden="true"><img src="/cloud3.webp" alt="" /></div>
        <div data-cloud-r className={styles.cloudR} aria-hidden="true"><img src="/cloud-slide.webp" alt="" /></div>

        <div data-plane-in className={styles.planeIn} aria-hidden="true">
          <div data-plane className={styles.plane}><PaperPlane /></div>
        </div>

        <div data-hero-content className={styles.heroContent}>
          <p data-hero-fade className={styles.heroKicker}>projects &amp; templates</p>
          <h1 id="projects-title" data-hero className={styles.heroTitle} aria-label="Our work">
            <span data-l1 className={styles.mask}><Chars text="OUR" /></span>
            <span data-l2 className={styles.mask}><Chars text="WORK" /></span>
          </h1>
          <p data-hero-fade className={styles.heroSub}>
            Delivered projects and ready-to-launch templates, built with the same obsession for craft.
          </p>
        </div>

        <div data-hero-fade className={styles.scrollHint} aria-hidden="true"><span>scroll to fly</span><i /></div>
        <div data-veil className={styles.veil} aria-hidden="true" />
      </section>

      {/* ═══════════ MARQUEE (pure CSS) ═══════════ */}
      <div className={styles.marq} aria-hidden="true">
        {[0, 1].map((r) => (
          <div key={r} className={`${styles.marqRow} ${r === 1 ? styles.marqRev : ""}`}>
            {[0, 1].map((h) => (
              <span key={h} className={styles.marqHalf}>
                {marqItems.map((t: string) => (
                  <span key={t + h} className={`${styles.marqItem} ${r === 1 ? styles.marqFill : ""}`}>
                    {t}<em>✦</em>
                  </span>
                ))}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* ═══════════ INTRO ═══════════ */}
      <section ref={introRef} className={styles.intro} aria-label="Featured works">
        <div className={styles.introInner}>
          <p data-fade className={styles.introNote}>featured works<img src="/arrow2.webp" alt="" draggable={false} /></p>
          <h2 className={styles.introText} aria-label={INTRO}>
            {INTRO.split(" ").map((w, i) => (
              <span key={i} data-iword className={styles.iword} aria-hidden="true">{w}</span>
            ))}
          </h2>
          <div className={styles.stats}>
            {[
              { n: total, l: "works in total" },
              { n: nProjects, l: "delivered projects" },
              { n: total - nProjects, l: "launch-ready templates" },
            ].map((s) => (
              <div key={s.l} className={styles.stat}>
                <strong><span data-count={s.n}>{s.n}</span></strong>
                <span>{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ WORKS ═══════════ */}
      <section id="works" className={styles.works} aria-label="All works">
        <div className={styles.worksInner}>
          <div data-fade className={styles.controls}>
            <div className={styles.seg} role="group" aria-label="Type" style={{ "--i": kindIdx } as CSSProperties}>
              <span className={styles.segInd} aria-hidden="true" />
              {KINDS.map((k) => (
                <button key={k.id} type="button" className={`${styles.segBtn} ${kind === k.id ? styles.segOn : ""}`} aria-pressed={kind === k.id} onClick={() => onKind(k.id)}>
                  {k.label}
                </button>
              ))}
            </div>

            <div className={styles.filterWrap}>
              <span className={styles.filterBy}>filter by</span>
              <div ref={filtersRef} className={styles.filters} role="group" aria-label="Filter by category">
                <span ref={pillRef} className={styles.filterPill} aria-hidden="true" />
                {(["All", ...CATS] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    data-cat={c}
                    className={`${styles.fchip} ${cat === c ? styles.fchipOn : ""}`}
                    aria-pressed={cat === c}
                    onClick={() => onCat(c)}
                  >
                    {c === "All" ? "All works" : c}
                    <sup>{c === "All" ? PROJECTS.filter(inKind).length : catCount(c)}</sup>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className={styles.count} role="status" aria-live="polite">
            {visible.length} {visible.length === 1 ? "work" : "works"}
          </p>

          <div className={styles.gridWrap}>
            <span ref={swoopRef} className={styles.swoop} aria-hidden="true"><PaperPlane /></span>

            <ul ref={gridRef} className={styles.grid}>
              {PROJECTS.map((p: Project) => {
                const idx = visible.indexOf(p);
                const on = idx >= 0;
                const pos = place(on ? idx : 0);
                return (
                  <li
                    key={p.slug}
                    data-tile
                    data-kind={p.kind}
                    className={`${styles.tile} ${SHAPE_CLS[pos.shape]} ${on ? "" : styles.tileHidden}`}
                    style={{ "--gc": pos.gc, "--gr": pos.gr, "--a": p.hue[1], "--t": p.hue[2] } as CSSProperties}
                    onPointerMove={onTileMove}
                    onPointerLeave={onTileLeave}
                  >
                    <Link data-in href={p.href ?? `/projects/${p.slug}`} className={styles.tileLink} aria-label={`${p.title}, ${p.cat}, ${p.year}`}>
                      <span className={styles.tilt}>
                        <span className={styles.frame} aria-hidden="true" />
                        <span className={styles.sheet}>
                          <Cover p={p} />
                          <span className={styles.lens} aria-hidden="true" />
                          <i className={styles.fold} aria-hidden="true" />

                          <span className={styles.tTop}>
                            <span className={styles.tNo}>{on ? pad(idx + 1) : ""}</span>
                            <span className={styles.tCatTag}>{p.cat}</span>
                            {p.kind === "template" && <span className={styles.tPrice}>Template · ${p.price}</span>}
                          </span>

                          <span className={styles.tBottom}>
                            <span className={styles.tRule} aria-hidden="true" />
                            <span className={styles.tRow}>
                              <h3 className={styles.tTitle}>{p.title}</h3>
                              <span className={styles.tYear} aria-hidden="true"><b>{p.year}</b><i>→</i></span>
                            </span>
                          </span>
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {visible.length === 0 && (
            <div className={styles.empty}>
              <p className={styles.emptyNote}>nothing here yet</p>
              <p>No works in this combination. Try another category.</p>
              <button type="button" className={styles.emptyBtn} onClick={() => { capture(); setKind("all"); setCat("All"); }}>
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      <div ref={cursorRef} className={styles.cursor} aria-hidden="true"><span>View</span></div>

      {/* ═══════════ CTA ═══════════ */}
      <section ref={ctaRef} className={styles.cta} aria-labelledby="cta-title">
        <i className={styles.ctaFold} aria-hidden="true" />
        <div className={styles.ctaSky} aria-hidden="true">
          <div className={`${styles.ring} ${styles.ring1}`} />
          <div className={`${styles.ring} ${styles.ring2}`} />
          <div className={`${styles.ring} ${styles.ring3}`} />
          <div data-cta-sun className={styles.ctaSun} />
        </div>

        <div className={styles.ctaInner}>
          <div className={styles.ctaPlane} aria-hidden="true"><PaperPlane /></div>
          <h2 id="cta-title" data-reveal className={styles.ctaTitle} aria-label="Your project is next">
            <span className={styles.mask}><Chars text="YOUR PROJECT" /></span>
            <span className={styles.mask}><Chars text="IS NEXT" /></span>
          </h2>
          <p data-fade className={styles.ctaSub}>
            Pick a template to launch fast, or tell us your idea and we will build something made only for you.
          </p>
          <div data-fade className={styles.ctaRow}>
            <Link className={styles.ctaBtn} href="/contact"><span>Start a project</span><b aria-hidden="true">→</b></Link>
            <Link className={styles.ctaGhost} href="/request">Request a template</Link>
          </div>
        </div>
      </section>
    </div>
  );
}