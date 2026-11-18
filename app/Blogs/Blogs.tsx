"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, FormEvent, MouseEvent as RMouseEvent, PointerEvent as RPointerEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Blogs.module.css";

/* ═══════════════════════════════════════════
   Content: edit stories here
   Each story gets generated cover art (no photos needed).
   ═══════════════════════════════════════════ */
type Block = { t: "p" | "h" | "q"; text: string };
type Art = "sun" | "rings" | "crystal" | "waves" | "lines";

interface Post {
  id: string;
  no: string;
  cat: string;
  title: string;
  excerpt: string;
  date: string;
  read: number;
  accent: string;
  tint: string;
  art: Art;
  body: Block[];
}

const POSTS: Post[] = [
  {
    id: "luxury-is-quiet",
    no: "01",
    cat: "Design",
    title: "Luxury is quiet: designing for the eye",
    excerpt:
      "Most websites shout. Luxury trusts the visitor to lean in. Here is how we decide what to remove until a page feels almost too calm.",
    date: "Nov 12, 2026",
    read: 5,
    accent: "#d99a73",
    tint: "#e6d3bf",
    art: "sun",
    body: [
      { t: "p", text: "Most websites shout. They compete for attention with bigger buttons, brighter colours and motion that never stops. Luxury works the other way around. It trusts the visitor to lean in." },
      { t: "h", text: "Room to breathe" },
      { t: "p", text: "Whitespace is not empty space. It is the part of the design that tells people they are not being rushed. We start every layout by deciding what to remove, and we keep removing until the page feels almost too calm. Then we add back a single detail." },
      { t: "q", text: "If everything is emphasised, nothing is." },
      { t: "p", text: "Colour follows the same rule. We pick soft, slightly desaturated palettes, give each one a quiet accent, and let photography carry the drama. The result converts because it feels trustworthy, not because it pushes." },
    ],
  },
  {
    id: "easing-second-language",
    no: "02",
    cat: "Motion",
    title: "Easing is our second language",
    excerpt:
      "A button that moves at a constant speed feels like a machine. One that eases feels like it has weight. The difference is a single curve.",
    date: "Oct 28, 2026",
    read: 4,
    accent: "#4a90b8",
    tint: "#a7c3d6",
    art: "waves",
    body: [
      { t: "p", text: "A button that moves at a constant speed feels like a machine. A button that eases in and out feels like it has weight. The difference is a single curve, and it changes how the whole brand is read." },
      { t: "h", text: "Tune it by feel" },
      { t: "p", text: "We rarely ship a default easing. We start with a curve, play the animation fifty times, and nudge the handles until it feels inevitable. Entrances want to arrive confidently and settle slowly. Exits want to leave quickly and without drama." },
      { t: "q", text: "Slow down at the end, not at the start." },
      { t: "p", text: "Then we write the motion down so developers inherit the decision instead of guessing it: duration, delay, stagger and curve, named and reused across the whole site." },
    ],
  },
  {
    id: "no-templates3",
    no: "03",
    cat: "Process",
    title: "Why we do not ship templates",
    excerpt:
      "A template is a shortcut for the studio, not for the client. It saves us a week and costs the brand the one thing it came for.",
    date: "Oct 14, 2026",
    read: 4,
    accent: "#3fa89f",
    tint: "#9fcfc8",
    art: "rings",
    body: [
      { t: "p", text: "A template is a shortcut for the studio, not for the client. It saves us a week and costs the brand the thing it came for: a face of its own." },
      { t: "h", text: "Start from the story" },
      { t: "p", text: "Every project begins with questions, not layouts. Who is visiting, what do they need to feel, and what should they do next? The answers decide the structure, the pace of the scroll and where the motion belongs." },
      { t: "q", text: "The layout is the last thing we decide." },
      { t: "p", text: "Custom does not have to mean slow. A shared set of tools, a small senior team and clear decisions let us build from scratch in weeks, not months." },
    ],
  },
  {
    id: "pinning-without-pain",
    no: "04",
    cat: "Engineering",
    title: "Pinning without the pain: ScrollTrigger lessons",
    excerpt:
      "Pinned sections are where scroll animation goes to break. Three habits that keep ours steady when fonts load late and heights change.",
    date: "Sep 30, 2026",
    read: 6,
    accent: "#7f93c9",
    tint: "#b9c3e6",
    art: "lines",
    body: [
      { t: "p", text: "Pinned sections are where scroll animation goes to break. Heights change, fonts load late, and one stray transform can send a whole page jumping." },
      { t: "h", text: "Three habits that help" },
      { t: "p", text: "Create pins before the triggers that depend on them, so positions are calculated in the right order. Refresh once fonts are ready. And keep one animation in charge of each property, because two tweens fighting over the same transform always lose." },
      { t: "q", text: "One element, one owner per property." },
      { t: "p", text: "On small screens we usually drop the pin altogether. A simple stack that reads well beats a clever effect that stutters on a phone." },
    ],
  },
  {
    id: "brief-to-quote2",
    no: "05",
    cat: "Process",
    title: "From a two-minute brief to a real quote",
    excerpt:
      "Our request form is short on purpose. Here is what we read in your seven answers, and why we can reply with a plan instead of more questions.",
    date: "Sep 16, 2026",
    read: 3,
    accent: "#bfa874",
    tint: "#d6c7a3",
    art: "waves",
    body: [
      { t: "p", text: "Our request form takes about two minutes, but it is designed so we can answer within a day with a plan and a number, not a list of follow-up questions." },
      { t: "h", text: "What we actually read" },
      { t: "p", text: "We look at your world, your style, the features you picked, and the budget and timeline you gave us. Those answers tell us the shape of the build, the risks, and who on the team should look at it first." },
      { t: "q", text: "Rough numbers are fine. Honest ones are better." },
      { t: "p", text: "If something does not fit, we say so in the reply and suggest what would. Nothing is sent until you press the button." },
    ],
  },
  {
    id: "the-paid-task2",
    no: "06",
    cat: "Culture",
    title: "How we hire: the paid task",
    excerpt:
      "Portfolios show what someone made. They rarely show how someone thinks. So we pay people to work on a small, real brief with us.",
    date: "Sep 2, 2026",
    read: 4,
    accent: "#6f86b0",
    tint: "#a9b6cf",
    art: "lines",
    body: [
      { t: "p", text: "Portfolios show what someone made. They rarely show how someone thinks. That is why our process includes a small, real brief that we pay for." },
      { t: "h", text: "Honest feedback, both ways" },
      { t: "p", text: "Whatever the outcome, you get honest feedback on the task and a clear answer within 48 hours of the final conversation. No silence, no ghosting." },
      { t: "q", text: "Taste is easier to see in a brief than in a CV." },
      { t: "p", text: "We care about how you explain timing, why you chose one palette over another, and what you would cut. Cover letters can wait." },
    ],
  },
  {
    id: "soft-palettes",
    no: "07",
    cat: "Design",
    title: "Soft palettes that still convert",
    excerpt:
      "Calm colour has a reputation for being timid. In practice, when the background stops competing, the one thing that should stand out finally does.",
    date: "Aug 19, 2026",
    read: 4,
    accent: "#d99a73",
    tint: "#cbb994",
    art: "crystal",
    body: [
      { t: "p", text: "Calm colour has a reputation for being timid. In practice it is the opposite: when the background stops competing, the one thing that should stand out finally does." },
      { t: "h", text: "One accent, used sparingly" },
      { t: "p", text: "We build palettes from three layers: a mist of near-neutrals, a deeper ink for text, and a single accent that appears only where the visitor should act. Everything else stays quiet." },
      { t: "q", text: "Contrast is a budget. Spend it on the button." },
      { t: "p", text: "Then we test the palette in dark mode and on a dim phone screen at midnight, because that is where most visitors actually are." },
    ],
  },
];

const FEATURED = POSTS[0];
const LIST = POSTS.slice(1);
const CATS = ["All", ...Array.from(new Set(LIST.map((p) => p.cat)))];
const N = POSTS.length;
const STEP = 360 / N;
const pad = (n: number) => String(n).padStart(2, "0");

/* Fixed positions (not random) so there is no hydration mismatch */
const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  top: (i * 53 + 7) % 78,
  size: 3 + (i % 4) * 2,
  delay: -((i % 7) * 1.7),
  dur: 9 + (i % 5) * 2,
}));

/* The hero uses only half of them: fewer floating dots = a calmer sky */
const HERO_PARTICLES = PARTICLES.filter((_, i) => i % 2 === 0);

/* Set this to your API route (e.g. "/api/newsletter"). When empty, the signup is simulated. */
const ENDPOINT = "";
const REQUEST_TIMEOUT_MS = 12000;

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());
const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

/* A folded paper plane, built from shaded facets so it reads as 3D when it banks and yaws */
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
      <path d="M30 29 L86 26" stroke="rgba(45,118,165,.5)" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/* Generated cover art: tinted mesh + one SVG scene per story. The scene drifts with the pointer. */
function Cover({ post }: { post: Post }) {
  const uid = useId().replace(/:/g, "");
  /* Real work photo: /public/blog/<story-id>.webp. If the file is missing, the drawn art below is used. */
  const photoSrc = `/blog/${post.id}.webp`;
  const [hasPhoto, setHasPhoto] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setHasPhoto(false);
  }, []);
  const g = `g${uid}`;
  const scene = (() => {
    switch (post.art) {
      case "sun":
        return (
          <>
            <defs>
              <radialGradient id={g}>
                <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
                <stop offset="0.45" stopColor="#fff" stopOpacity="0.35" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="270" cy="120" r="130" fill={`url(#${g})`} />
            <circle cx="270" cy="120" r="36" fill="#fff" opacity="0.92" />
            <rect x="-20" y="190" width="300" height="26" rx="13" fill="#fff" opacity="0.42" />
            <rect x="120" y="226" width="320" height="30" rx="15" fill="#fff" opacity="0.3" />
            <rect x="30" y="262" width="260" height="24" rx="12" fill="#fff" opacity="0.22" />
          </>
        );
      case "rings":
        return (
          <>
            {[40, 80, 120, 160, 200].map((r, i) => (
              <circle key={r} cx="200" cy="300" r={r} fill="none" stroke="#fff" strokeOpacity={0.6 - i * 0.09} strokeWidth="1.6" />
            ))}
            <circle cx="200" cy="300" r="22" fill="#fff" opacity="0.92" />
            <circle cx="318" cy="68" r="5" fill="#fff" opacity="0.9" />
            <circle cx="72" cy="104" r="3" fill="#fff" opacity="0.7" />
          </>
        );
      case "crystal":
        return (
          <>
            <polygon points="200,28 264,120 200,252 136,120" fill="#fff" opacity="0.4" />
            <polygon points="200,28 264,120 200,132" fill="#fff" opacity="0.6" />
            <polygon points="200,28 136,120 200,132" fill="#fff" opacity="0.28" />
            <polygon points="264,120 200,252 200,132" fill="#fff" opacity="0.18" />
            <polygon points="92,172 128,216 92,264 60,216" fill="#fff" opacity="0.28" />
            <polygon points="322,150 346,186 322,226 298,186" fill="#fff" opacity="0.24" />
          </>
        );
      case "waves":
        return (
          <>
            {[0, 1, 2, 3, 4].map((i) => (
              <path
                key={i}
                d={`M-10 ${150 + i * 26} C 60 ${120 + i * 26}, 120 ${180 + i * 26}, 200 ${150 + i * 26} S 340 ${120 + i * 26}, 420 ${150 + i * 26}`}
                fill="none" stroke="#fff" strokeOpacity={0.75 - i * 0.12} strokeWidth="2.2" strokeLinecap="round"
              />
            ))}
            <circle cx="92" cy="72" r="18" fill="#fff" opacity="0.88" />
          </>
        );
      default:
        return (
          <>
            {[
              [60, 70, 170], [60, 100, 230], [96, 130, 140], [96, 160, 200], [60, 190, 110], [60, 220, 190],
            ].map(([x, y, w], i) => (
              <rect key={i} x={x} y={y} width={w} height="14" rx="7" fill="#fff" opacity={i % 2 ? 0.34 : 0.7} />
            ))}
            <circle cx="326" cy="84" r="9" fill="#fff" opacity="0.9" />
          </>
        );
    }
  })();

  return (
    <div className={styles.cover} style={{ "--a": post.accent, "--t": post.tint } as CSSProperties} aria-hidden="true">
      <div className={styles.coverBg} />
      {hasPhoto ? (
        <>
          <img
            ref={imgRef}
            src={photoSrc}
            alt=""
            draggable={false}
            decoding="async"
            className={styles.coverPhoto}
            onError={() => setHasPhoto(false)}
          />
          <span className={styles.coverTint} />
        </>
      ) : (
        <div className={styles.coverArt}>
          <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">{scene}</svg>
        </div>
      )}
      {!hasPhoto && <span className={styles.coverNum}>{post.no}</span>}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Page
   ═══════════════════════════════════════════ */
export default function Blogs() {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const capNoRef = useRef<HTMLSpanElement>(null);
  const capCatRef = useRef<HTMLSpanElement>(null);
  const capTitleRef = useRef<HTMLParagraphElement>(null);
  const activeIdRef = useRef<string>(POSTS[0].id);

  const listRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const flyRef = useRef<HTMLSpanElement>(null);
  const ctaRef = useRef<HTMLElement>(null);
  const launchRef = useRef<HTMLDivElement>(null);

  const readerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const progFillRef = useRef<HTMLSpanElement>(null);
  const progPlaneRef = useRef<HTMLSpanElement>(null);
  const originRef = useRef({ x: 0, y: 0 });
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const shownRef = useRef(false);
  const closingRef = useRef(false);
  const switchingRef = useRef(false);
  const pillFirstRef = useRef(true);

  const [filter, setFilter] = useState("All");
  const [openId, setOpenId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [nl, setNl] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [nlError, setNlError] = useState("");

  const shown = filter === "All" ? LIST : LIST.filter((p) => p.cat === filter);
  const openPostData = POSTS.find((p) => p.id === openId) ?? null;
  const nextPost = openPostData ? POSTS[(POSTS.indexOf(openPostData) + 1) % POSTS.length] : null;

  /* ══════════ Hero (3D story ring), reveals, featured, newsletter sunrise ══════════ */
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    if (!root) return;
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();

    /* caption + highlighted cover follow whichever story is at the front of the ring */
    let last = -1;
    let captionTween: gsap.core.Timeline | null = null;
    const captionItems = [capNoRef.current, capCatRef.current, capTitleRef.current].filter(
      (el): el is HTMLElement => el !== null,
    );
    const setActive = (raw: number) => {
      const i = Math.min(N - 1, Math.max(0, raw));
      if (i === last) return;
      const animateCaption = last !== -1;
      last = i;
      const p = POSTS[i];
      activeIdRef.current = p.id;
      const updateCaption = () => {
        if (capNoRef.current) capNoRef.current.textContent = p.no;
        if (capCatRef.current) capCatRef.current.textContent = p.cat;
        if (capTitleRef.current) capTitleRef.current.textContent = p.title;
      };
      if (animateCaption && captionItems.length) {
        captionTween?.kill();
        gsap.killTweensOf(captionItems);
        gsap.set(captionItems, { autoAlpha: 1, yPercent: 0, filter: "blur(0px)" });
        captionTween = gsap.timeline()
          .to(captionItems, {
            autoAlpha: 0,
            yPercent: -30,
            filter: "blur(5px)",
            duration: 0.2,
            ease: "power2.in",
            stagger: 0.035,
          })
          .call(() => {
            if (last !== i) return;
            updateCaption();
            gsap.fromTo(
              captionItems,
              { autoAlpha: 0, yPercent: 30, filter: "blur(5px)" },
              {
                autoAlpha: 1,
                yPercent: 0,
                filter: "blur(0px)",
                duration: 0.5,
                ease: "power3.out",
                stagger: 0.04,
                clearProps: "transform,opacity,filter",
              },
            );
          });
      } else {
        updateCaption();
      }
      q("[data-panel]").forEach((el, k) => {
        (el as HTMLElement).dataset.on = String(k === i);
      });
    };
    setActive(0);

    mm.add(
      {
        desk: "(min-width: 901px) and (prefers-reduced-motion: no-preference)",
        mob: "(max-width: 900px) and (prefers-reduced-motion: no-preference)",
      },
      (ctx) => {
        const { desk } = ctx.conditions as { desk: boolean; mob: boolean };
        const cleanups: Array<() => void> = [];
        const ring = ringRef.current;
        const tilt = tiltRef.current;
        const intro = introRef.current;
        const hero = heroRef.current;

        /* intro: a gentler, slower arrival */
        gsap.from(q("[data-hero] [data-ch]"), { yPercent: 110, duration: 1.4, ease: "power3.out", stagger: 0.04, delay: 0.2 });
        gsap.from(q("[data-hero-fade]"), { opacity: 0, y: 14, duration: 1.2, ease: "power2.out", stagger: 0.15, delay: 0.9 });
        gsap.from(q("[data-cap]"), { opacity: 0, y: 18, duration: 1.2, ease: "power2.out", stagger: 0.15, delay: 1.3 });
        if (intro) gsap.from(intro, { rotationY: -60, scale: 0.82, duration: 2.2, ease: "power3.out" });
        gsap.from(q("[data-panel]"), { opacity: 0, duration: 1.3, stagger: 0.1, delay: 0.15, ease: "power2.out" });
        if (tilt) gsap.set(tilt, { rotationX: 0 });

        if (desk && hero && ring) {
          /* scroll turns the ring; the title drifts apart softly and the sun rises */
          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "+=600%",
              pin: true,
              scrub: 0.65,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => setActive(Math.round(self.progress * (N - 1))),
            },
          });
          tl.to(ring, { rotationY: -(N - 1) * STEP, duration: 3 }, 0)
            .to(q("[data-line-a]"), { xPercent: -8, duration: 3 }, 0)
            .to(q("[data-line-b]"), { xPercent: 6, duration: 3 }, 0)
            .to(q("[data-cloud-l]"), { xPercent: -18, duration: 3 }, 0)
            .to(q("[data-cloud-r]"), { xPercent: 18, duration: 3 }, 0)
            .fromTo(q("[data-sun]"), { yPercent: 50, scale: 0.6, opacity: 0 }, { yPercent: -70, scale: 1, opacity: 1, ease: "power2.out", duration: 2 }, 0)
            .to(q("[data-warm]"), { opacity: 1, duration: 3 }, 0)
            .to(q("[data-hint]"), { opacity: 0, duration: 0.5 }, 0.2);

          /* the whole ring leans very slightly toward the pointer */
          if (tilt && window.matchMedia("(pointer: fine)").matches) {
            const rx = gsap.quickTo(tilt, "rotationX", { duration: 1.1, ease: "power3.out" });
            const ry = gsap.quickTo(tilt, "rotationY", { duration: 1.1, ease: "power3.out" });
            const move = (e: PointerEvent) => {
              ry((e.clientX / window.innerWidth - 0.5) * 8);
              rx(-(e.clientY / window.innerHeight - 0.5) * 2.5);
            };
            hero.addEventListener("pointermove", move);
            cleanups.push(() => hero.removeEventListener("pointermove", move));
          }
        } else if (ring) {
          /* small screens: no pin, the ring just turns slowly on its own */
          gsap.to(ring, {
            rotationY: "-=360",
            duration: 60,
            ease: "none",
            repeat: -1,
            onUpdate: () => {
              const r = gsap.getProperty(ring, "rotationY") as number;
              setActive(((Math.round(-r / STEP) % N) + N) % N);
            },
          });
        }

        /* headings */
        q("[data-reveal]").forEach((el) => {
          gsap.from(el.querySelectorAll("[data-ch]"), {
            yPercent: 145, skewY: 8, duration: 1, ease: "power4.out", stagger: 0.03,
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        });
        q("[data-fade]").forEach((el) => {
          gsap.from(el, { y: 30, opacity: 0, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%", once: true } });
        });

        /* featured story: the cover is revealed from the bottom up, then the text follows */
        const featArt = q("[data-feat-art]")[0];
        const featZoom = q("[data-feat-zoom]")[0];
        const featUps = q("[data-feat-up]");
        const featRule = q("[data-feat-rule]")[0];
        if (featArt) {
          const ft = gsap.timeline({ scrollTrigger: { trigger: featArt, start: "top 82%", once: true } });
          if (featRule) ft.fromTo(featRule, { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: "power3.inOut", transformOrigin: "left center" }, 0);
          ft.fromTo(featArt, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "power4.inOut" }, 0.1);
          if (featZoom) ft.fromTo(featZoom, { scale: 1.4, yPercent: 12 }, { scale: 1, yPercent: 0, duration: 1.9, ease: "power3.out" }, 0.1);
          if (featUps.length) ft.from(featUps, { y: 40, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.12 }, 0.7);
        }

        /* newsletter: the sun climbs behind the rings as you arrive */
        const cta = ctaRef.current;
        if (desk && cta) {
          const trig = { trigger: cta, start: "top bottom", end: "center center", scrub: true };
          gsap.fromTo(q("[data-cta-sun]"), { yPercent: 40, opacity: 0.3 }, { yPercent: 0, opacity: 1, ease: "none", scrollTrigger: trig });
          gsap.fromTo(q("[data-cta-ring]"), { scale: 0.75, opacity: 0 }, { scale: 1, opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: trig });
        }

        return () => {
          captionTween?.kill();
          gsap.killTweensOf(captionItems);
          cleanups.forEach((fn) => fn());
        };
      }
    );

    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
    }
    return () => mm.revert();
  }, []);

  /* ══════════ The paper plane: banks, yaws and pitches as it dives down the list ══════════ */
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const list = listRef.current;
    const path = pathRef.current;
    const plane = flyRef.current;
    if (!list || !path || !plane) return;
    const body = plane.querySelector("[data-fly-body]");
    const shadow = plane.querySelector("[data-fly-shadow]");
    if (!body || !shadow) return;
    const mm = gsap.matchMedia();

    mm.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.set(plane, { xPercent: -50, yPercent: -50 });
      const len = path.getTotalLength();
      const clamp = gsap.utils.clamp;
    let listWidth = list.offsetWidth;
    let listHeight = list.offsetHeight;
    const measure = () => {
      listWidth = list.offsetWidth;
      listHeight = list.offsetHeight;
    };

      const angleAt = (p: number) => {
        const at = clamp(0, 1, p) * len;
        const a = path.getPointAtLength(Math.max(0, at - 1));
        const b = path.getPointAtLength(Math.min(len, at + 1));
      return (Math.atan2((b.y - a.y) * (listHeight / 1000), (b.x - a.x) * (listWidth / 100)) * 180) / Math.PI;
      };

      const place = (p: number) => {
        const pt = path.getPointAtLength(p * len);
        const ang = angleAt(p);
        /* how sharply the path is turning decides how far the plane banks */
        const curv = angleAt(p + 0.015) - angleAt(p - 0.015);
        const roll = clamp(-62, 62, curv * 1.8);
        const pitch = Math.sin(p * Math.PI * 9) * 9;
        const yaw = Math.cos(p * Math.PI * 6) * 16;
        const sc = 1 + Math.sin(p * Math.PI * 4) * 0.12;

        gsap.set(plane, { left: `${pt.x}%`, top: `${pt.y / 10}%`, rotation: ang, scale: sc });
        gsap.set(body, {
          transformPerspective: 700,
          rotationX: roll,
          rotationY: yaw + pitch,
          skewX: clamp(-14, 14, curv * 0.5),
        });

        /* the ground shadow stays below the plane in screen space, not in plane space */
        const rad = (ang * Math.PI) / 180;
        const dx = -10;
        const dy = 40 + Math.abs(roll) * 0.45;
        gsap.set(shadow, {
          x: dx * Math.cos(rad) + dy * Math.sin(rad),
          y: -dx * Math.sin(rad) + dy * Math.cos(rad),
          scaleX: 0.9 - Math.abs(roll) * 0.004,
          scaleY: 0.34,
          opacity: 0.34 - Math.abs(roll) * 0.003,
        });
      };

      const proxy = { p: 0 };
      place(0);
      const tween = gsap.to(proxy, {
        p: 1,
        ease: "none",
        onUpdate: () => place(proxy.p),
        scrollTrigger: {
          trigger: list,
          start: "top 70%",
          end: "bottom 45%",
          scrub: 0.6,
          invalidateOnRefresh: true,
          onRefresh: measure,
        },
      });
      return () => { tween.scrollTrigger?.kill(); tween.kill(); };
    });
    return () => mm.revert();
  }, [filter]);

  /* ══════════ Story cards: clip reveal (alternating bottom-up / top-down) + depth parallax ══════════ */
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = listRef.current;
    if (!root) return;
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const deep = window.innerWidth > 900;
      gsap.utils.toArray<HTMLElement>("[data-wrap]", root).forEach((wrap, i) => {
        const fromBottom = i % 2 === 0;
        const box = wrap.querySelector("[data-box]");
        const zoom = wrap.querySelector("[data-zoom]");
        const rule = wrap.querySelector("[data-rule]");
        const ups = wrap.querySelectorAll("[data-up]");

        const tl = gsap.timeline({ scrollTrigger: { trigger: wrap, start: "top 88%", once: true } });
        if (rule) tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "power3.inOut", transformOrigin: "left center" }, 0);
        if (box) {
          tl.fromTo(
            box,
            { clipPath: fromBottom ? "inset(100% 0% 0% 0%)" : "inset(0% 0% 100% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "power4.inOut" },
            0.1
          );
        }
        if (zoom) {
          tl.fromTo(
            zoom,
            { scale: 1.45, yPercent: fromBottom ? 14 : -14 },
            { scale: 1, yPercent: 0, duration: 1.8, ease: "power3.out" },
            0.1
          );
        }
        if (ups.length) tl.from(ups, { y: 34, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.1 }, 0.75);

        if (deep) {
          gsap.fromTo(wrap, { y: i % 2 ? 50 : 30 }, {
            y: i % 2 ? -50 : -30, ease: "none",
            scrollTrigger: { trigger: wrap, start: "top bottom", end: "bottom top", scrub: true },
          });
        }
      });
    });

    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(raf);
      mm.revert();
    };
  }, [filter]);

  /* ══════════ Filter pill: slides between the tabs ══════════ */
  useEffect(() => {
    const place = (instant: boolean) => {
      const wrap = filtersRef.current;
      const pill = pillRef.current;
      if (!wrap || !pill) return;
      const btn = Array.from(wrap.querySelectorAll<HTMLElement>("[data-cat]")).find((b) => b.dataset.cat === filter);
      if (!btn) return;
      const dur = instant || prefersReduced() ? 0 : 0.6;
      gsap.to(pill, { x: btn.offsetLeft, y: btn.offsetTop, width: btn.offsetWidth, height: btn.offsetHeight, duration: dur, ease: "power3.out", overwrite: true });
    };
    place(pillFirstRef.current);
    pillFirstRef.current = false;
    const onResize = () => place(true);
    window.addEventListener("resize", onResize);
    if (document.fonts?.ready) document.fonts.ready.then(() => place(true)).catch(() => {});
    return () => window.removeEventListener("resize", onResize);
  }, [filter]);

  const changeFilter = (c: string) => {
    if (c === filter || switchingRef.current) return;
    const cards = listRef.current?.querySelectorAll("[data-card]");
    if (!cards || !cards.length || prefersReduced()) {
      setFilter(c);
      return;
    }
    switchingRef.current = true;
    gsap.to(cards, {
      clipPath: "inset(0% 0% 100% 0%)", duration: 0.55, stagger: 0.06, ease: "power3.in",
      onComplete: () => {
        setFilter(c);
        switchingRef.current = false;
      },
    });
  };

  /* ══════════ Reader: opens like a sunrise from the exact spot you clicked ══════════ */
  const openPost = (id: string, e: RMouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    lastFocusRef.current = el;
    const r = el.getBoundingClientRect();
    originRef.current = e.detail === 0 ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: e.clientX, y: e.clientY };
    setOpenId(id);
  };

  const closeReader = () => {
    const el = readerRef.current;
    if (!el || closingRef.current) return;
    closingRef.current = true;
    const { x, y } = originRef.current;
    const finish = () => {
      setOpenId(null);
      closingRef.current = false;
      shownRef.current = false;
      lastFocusRef.current?.focus({ preventScroll: true });
    };
    if (prefersReduced()) { finish(); return; }
    const R = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 24;
    gsap.set(el, { clipPath: `circle(${R}px at ${x}px ${y}px)` });
    gsap.to(el, { clipPath: `circle(0px at ${x}px ${y}px)`, duration: 0.85, ease: "power3.inOut", onComplete: finish });
  };

  useEffect(() => {
    if (!openId) return;
    const el = readerRef.current;
    const sc = scrollRef.current;
    if (!el || !sc) return;
    sc.scrollTop = 0;
    if (progFillRef.current) progFillRef.current.style.transform = "scaleX(0)";
    if (progPlaneRef.current) progPlaneRef.current.style.left = "0%";
    const reduce = prefersReduced();

    if (!shownRef.current) {
      shownRef.current = true;
      const { x, y } = originRef.current;
      const R = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 24;
      if (reduce) {
        gsap.set(el, { clipPath: "none" });
        closeBtnRef.current?.focus({ preventScroll: true });
      } else {
        gsap.set(el, { clipPath: `circle(0px at ${x}px ${y}px)` });
        gsap.to(el, {
          clipPath: `circle(${R}px at ${x}px ${y}px)`, duration: 1.15, ease: "power3.inOut",
          onComplete: () => {
            gsap.set(el, { clipPath: "none" });
            closeBtnRef.current?.focus({ preventScroll: true });
          },
        });
      }
    }

    const ctx = gsap.context(() => {
      if (reduce) return;
      const head = el.querySelector("[data-r-head]");
      gsap.from("[data-r-word]", { yPercent: 115, duration: 1.1, ease: "power4.out", stagger: 0.06, delay: 0.55 });
      gsap.from("[data-r-meta]", { opacity: 0, y: 18, duration: 0.9, ease: "power3.out", stagger: 0.12, delay: 0.9 });
      gsap.from("[data-r-no]", { opacity: 0, xPercent: 8, duration: 1.8, ease: "power3.out", delay: 0.6 });
      gsap.fromTo("[data-r-art]", { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "power4.inOut", delay: 0.55 });
      gsap.fromTo("[data-r-zoom]", { scale: 1.4, yPercent: 10 }, { scale: 1, yPercent: 0, duration: 2, ease: "power3.out", delay: 0.55 });
      if (head) {
        gsap.to("[data-r-art]", {
          yPercent: -6, ease: "none",
          scrollTrigger: { trigger: head, scroller: sc, start: "top top", end: "bottom top", scrub: true },
        });
      }
      gsap.utils.toArray<HTMLElement>("[data-r-fade]", el).forEach((node) => {
        gsap.from(node, {
          y: 34, opacity: 0, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: node, scroller: sc, start: "top 92%", once: true },
        });
      });
    }, el);
    return () => ctx.revert();
  }, [openId]);

  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { closeReader(); return; }
      if (e.key !== "Tab" || !readerRef.current) return;
      const f = Array.from(readerRef.current.querySelectorAll<HTMLElement>("button, a[href], [tabindex]:not([tabindex='-1'])")).filter((n) => !n.hasAttribute("disabled"));
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId]);

  const onReaderScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const max = el.scrollHeight - el.clientHeight;
    const p = max > 0 ? Math.min(1, el.scrollTop / max) : 0;
    if (progFillRef.current) progFillRef.current.style.transform = `scaleX(${p})`;
    if (progPlaneRef.current) progPlaneRef.current.style.left = `${p * 100}%`;
  };

  /* cover drift follows the pointer (CSS variables, no re-render) */
  const onCardMove = (e: RPointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", String((x - 0.5) * 2));
    el.style.setProperty("--my", String((y - 0.5) * 2));
  };
  const onCardLeave = (e: RPointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    el.style.setProperty("--mx", "0");
    el.style.setProperty("--my", "0");
  };

  /* ══════════ Newsletter: the plane folds and flies away ══════════ */
  const launch = () => {
    const plane = launchRef.current;
    if (!plane) return;
    if (prefersReduced()) { gsap.set(plane, { opacity: 0 }); return; }
    gsap.timeline()
      .to(plane, { scaleX: 0.8, rotation: -8, duration: 0.25, ease: "power2.out" })
      .to(plane, { x: window.innerWidth * 0.55, y: -window.innerHeight * 0.45, rotation: -24, scale: 0.35, opacity: 0, duration: 1.5, ease: "power2.in" });
  };

  const submitNl = async (e: FormEvent) => {
    e.preventDefault();
    if (nl === "sending") return;
    if (!emailOk(email)) {
      setNl("error");
      setNlError("Enter a valid email address, like you@brand.com.");
      return;
    }
    setNl("sending");
    setNlError("");
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
    try {
      if (ENDPOINT) {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), source: "blog-journal" }),
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error("Request failed");
      } else {
        await new Promise((r) => setTimeout(r, 700));
      }
      setNl("done");
      launch();
    } catch {
      setNl("error");
      setNlError("We could not sign you up. Check your connection and try again.");
    } finally {
      window.clearTimeout(timer);
    }
  };

  const resetNl = () => {
    setNl("idle");
    setEmail("");
    setNlError("");
    const plane = launchRef.current;
    if (plane) {
      gsap.set(plane, { clearProps: "all" });
      gsap.from(plane, { opacity: 0, y: 30, duration: 0.8, ease: "power3.out" });
    }
  };

  const panelKey = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.currentTarget.click();
    }
  };

  /* ═══════════ Render ═══════════ */
  return (
    <div ref={rootRef} className={styles.page}>
      {/* ═══════════ HERO: a 3D ring of stories ═══════════ */}
      <section ref={heroRef} className={styles.hero} aria-labelledby="journal-title">
        <div className={styles.sunGlow} aria-hidden="true" />
        <div data-warm className={styles.warm} aria-hidden="true" />
        <div data-sun className={styles.sun} aria-hidden="true" />

        <div data-cloud-l className={styles.cloudL} aria-hidden="true"><img src="/cloud3.webp" alt="" /></div>
        <div data-cloud-r className={styles.cloudR} aria-hidden="true"><img src="/cloud-slide.webp" alt="" /></div>

        <div className={styles.particles} aria-hidden="true">
          {HERO_PARTICLES.map((p, i) => (
            <span
              key={i}
              className={styles.particle}
              style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size, "--dur": `${p.dur}s`, "--delay": `${p.delay}s` } as CSSProperties}
            />
          ))}
        </div>

        <div className={styles.heroTop}>
          <p data-hero-fade className={styles.heroKicker}>notes from the studio</p>
        </div>

        <h1 id="journal-title" data-hero className={styles.heroTitle} aria-label="The Journal">
          <span data-line-a className={`${styles.mask} ${styles.lineA}`}><Chars text="THE" /></span>
          <span data-line-b className={`${styles.mask} ${styles.lineB}`}><Chars text="JOURNAL" /></span>
        </h1>

        <div className={styles.stage}>
          <div className={styles.floor} aria-hidden="true" />
          <div ref={tiltRef} className={styles.tilt}>
            <div ref={introRef} className={styles.intro}>
              <div ref={ringRef} className={styles.carousel} role="group" aria-label="All stories">
                {POSTS.map((p, i) => (
                  <div
                    key={p.id}
                    data-panel
                    data-on={i === 0 ? "true" : "false"}
                    className={styles.panel}
                    role="button"
                    tabIndex={0}
                    aria-label={`Read: ${p.title}`}
                    style={{ "--ang": `${i * STEP}deg`, "--a": p.accent, "--t": p.tint } as CSSProperties}
                    onClick={(e) => openPost(p.id, e)}
                    onKeyDown={panelKey}
                  >
                    <span className={styles.panelZoom}><Cover post={p} /></span>
                    <span className={styles.panelCat}>{p.cat}</span>
                    <i className={styles.fold} aria-hidden="true" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div data-cap className={styles.caption}>
          <p className={styles.capLine}>
            <span ref={capNoRef} className={styles.capNo}>{POSTS[0].no}</span>
            <span className={styles.capOf}>/ {pad(N)}</span>
            <span ref={capCatRef} className={styles.capCat}>{POSTS[0].cat}</span>
          </p>
          <p ref={capTitleRef} className={styles.capTitle} aria-live="off">{POSTS[0].title}</p>
          <button type="button" className={styles.capBtn} onClick={(e) => openPost(activeIdRef.current, e)}>
            Read this story <span aria-hidden="true">→</span>
          </button>
        </div>

        <p data-cap data-hint className={styles.capHint} aria-hidden="true">scroll to turn the ring</p>

        <div className={styles.heroFade} aria-hidden="true" />
      </section>

      {/* ═══════════ FEATURED: an editorial spread, no card ═══════════ */}
      <section className={styles.featured} aria-labelledby="feat-label">
        <div className={styles.featInner}>
          <div className={styles.featHead}>
            <p id="feat-label" data-fade className={styles.sectionNote}>
              the latest story
              <img src="/arrow2.webp" alt="" draggable={false} />
            </p>
            <span data-fade className={styles.featHeadNo} aria-hidden="true">{FEATURED.no} / {pad(N)}</span>
          </div>

          <article className={styles.feat} style={{ "--a": FEATURED.accent, "--t": FEATURED.tint } as CSSProperties}>
            <span data-feat-rule className={styles.featRule} aria-hidden="true" />

            <div className={styles.featArtWrap} onPointerMove={onCardMove} onPointerLeave={onCardLeave}>
              <span className={styles.featOutline} aria-hidden="true" />
              <div data-feat-art className={styles.featReveal}>
                <div className={styles.featFrame}>
                  <div data-feat-zoom className={styles.zoom}><Cover post={FEATURED} /></div>
                  <i className={styles.fold} aria-hidden="true" />
                </div>
              </div>
              <span className={styles.featSide} aria-hidden="true">latest story</span>
            </div>

            <div className={styles.featText}>
              <span data-feat-up className={styles.featNo} aria-hidden="true">{FEATURED.no}</span>
              <dl data-feat-up className={styles.metaList}>
                <div><dt>Topic</dt><dd>{FEATURED.cat}</dd></div>
                <div><dt>Published</dt><dd>{FEATURED.date}</dd></div>
                <div><dt>Reading</dt><dd>{FEATURED.read} min</dd></div>
              </dl>
              <h2 data-feat-up className={styles.featTitle}>{FEATURED.title}</h2>
              <p data-feat-up className={styles.featExcerpt}>{FEATURED.excerpt}</p>
              <button data-feat-up type="button" className={styles.readBtn} onClick={(e) => openPost(FEATURED.id, e)}>
                <span className={styles.readLabel}>Read the story</span>
                <span className={styles.readIcon} aria-hidden="true">→</span>
              </button>
            </div>
          </article>
        </div>
      </section>

      {/* ═══════════ ALL STORIES ═══════════ */}
      <section id="stories" className={styles.stories} aria-labelledby="stories-title">
        <div className={styles.storiesInner}>
          <div className={styles.storiesHead}>
            <p data-fade className={styles.sectionNote}>more to read</p>
            <h2 id="stories-title" data-reveal className={styles.storiesTitle} aria-label="Keep reading">
              <span className={styles.mask}><Chars text="Keep reading" /></span>
            </h2>
            <div ref={filtersRef} className={styles.filters} role="group" aria-label="Filter stories by topic">
              <span ref={pillRef} className={styles.filterPill} aria-hidden="true" />
              {CATS.map((c) => {
                const count = c === "All" ? LIST.length : LIST.filter((p) => p.cat === c).length;
                return (
                  <button
                    key={c}
                    type="button"
                    data-cat={c}
                    className={`${styles.filterBtn} ${filter === c ? styles.filterOn : ""}`}
                    aria-pressed={filter === c}
                    onClick={() => changeFilter(c)}
                  >
                    {c}
                    <sup>{count}</sup>
                  </button>
                );
              })}
            </div>
          </div>

          <div ref={listRef} className={styles.list}>
            <svg className={styles.flight} viewBox="0 0 100 1000" preserveAspectRatio="none" aria-hidden="true">
              <path
                ref={pathRef}
                d="M 14 0 C 60 60, 92 120, 72 200 S 8 330, 40 420 S 96 560, 62 650 S 6 780, 50 860 S 88 950, 56 1000"
                className={styles.flightPath}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <span ref={flyRef} className={styles.fly} aria-hidden="true">
              <span data-fly-shadow className={styles.flyShadow} />
              <span data-fly-body className={styles.flyBody}><PaperPlane /></span>
            </span>

            <div className={styles.grid}>
              {shown.map((p) => (
                <div key={`${filter}-${p.id}`} data-wrap className={styles.wrap}>
                  <article
                    data-card
                    className={styles.card}
                    style={{ "--a": p.accent, "--t": p.tint } as CSSProperties}
                    onPointerMove={onCardMove}
                    onPointerLeave={onCardLeave}
                  >
                    <span data-rule className={styles.cardRule} aria-hidden="true" />
                    <div data-up className={styles.cardTop}>
                      <span className={styles.cardNo}>{p.no}</span>
                      <span className={styles.cardCat}>{p.cat}</span>
                      <span className={styles.cardDate}>{p.date}</span>
                    </div>

                    <div data-box className={styles.reveal}>
                      <div className={styles.artFrame}>
                        <div data-zoom className={styles.zoom}><Cover post={p} /></div>
                        <i className={styles.fold} aria-hidden="true" />
                      </div>
                    </div>

                    <div className={styles.cardBody}>
                      <h3 data-up className={styles.cardTitle}>
                        <button type="button" className={styles.cardLink} onClick={(e) => openPost(p.id, e)}>
                          {p.title}
                        </button>
                      </h3>
                      <p data-up className={styles.excerpt}>{p.excerpt}</p>
                      <span data-up className={styles.more} aria-hidden="true">
                        <i />Read the story · {p.read} min <b>→</b>
                      </span>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ NEWSLETTER ═══════════ */}
      <section ref={ctaRef} className={styles.cta} aria-labelledby="nl-title">
        <div className={styles.ctaSky} aria-hidden="true">
          <div data-cta-ring className={`${styles.ring} ${styles.ring1}`} />
          <div data-cta-ring className={`${styles.ring} ${styles.ring2}`} />
          <div data-cta-ring className={`${styles.ring} ${styles.ring3}`} />
          <div data-cta-sun className={styles.ctaSun} />
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className={styles.star}
              style={{ left: `${p.left}%`, top: `${p.top * 0.7}%`, width: p.size - 1, height: p.size - 1, "--dur": `${p.dur}s`, "--delay": `${p.delay}s` } as CSSProperties}
            />
          ))}
        </div>

        <div className={styles.ctaInner}>
          <div ref={launchRef} className={styles.launch} aria-hidden="true">
            <div className={styles.launchBob}><PaperPlane /></div>
          </div>

          <h2 id="nl-title" data-reveal className={styles.ctaTitle} aria-label="The next story, in your inbox">
            <span className={styles.mask}><Chars text="THE NEXT STORY" /></span>
            <span className={styles.mask}><Chars text="IN YOUR INBOX" /></span>
          </h2>
          <p data-fade className={styles.ctaSub}>
            One short email when we publish. Easing, palettes, process and the odd lesson learned the hard way.
          </p>

          {nl === "done" ? (
            <div className={styles.nlDone} role="status">
              <p>On its way. Check your inbox for the first note.</p>
              <button type="button" className={styles.nlLink} onClick={resetNl}>Use another email</button>
            </div>
          ) : (
            <form data-fade className={styles.nlForm} onSubmit={submitNl} noValidate aria-label="Subscribe to the journal">
              <div className={styles.nlField}>
                <input
                  className={styles.nlInput}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@brand.com"
                  aria-label="Email address"
                  value={email}
                  maxLength={120}
                  onChange={(e) => { setEmail(e.target.value); if (nl === "error") setNl("idle"); }}
                  aria-invalid={nl === "error" && nlError ? true : undefined}
                  aria-describedby={nlError ? "nl-err" : undefined}
                />
                <button type="submit" className={styles.nlBtn} disabled={nl === "sending"}>
                  {nl === "sending" ? "Sending…" : "Send me stories"}
                </button>
              </div>
              {nlError && <p id="nl-err" className={styles.nlError} role="alert">{nlError}</p>}
            </form>
          )}

          <a data-fade className={styles.ctaLink} href="/contact">
            Have a project in mind? Start one with us
          </a>
        </div>
      </section>

      {/* ═══════════ READER (opens from the clicked card) ═══════════ */}
      {openPostData && nextPost && (
        <div
          ref={readerRef}
          className={styles.reader}
          role="dialog"
          aria-modal="true"
          aria-label={openPostData.title}
          style={{ clipPath: "circle(0px at 50% 50%)", "--a": openPostData.accent, "--t": openPostData.tint } as CSSProperties}
        >
          <div className={styles.progress} aria-hidden="true">
            <span ref={progFillRef} className={styles.progFill} />
            <span ref={progPlaneRef} className={styles.progPlane}><PaperPlane /></span>
          </div>

          <button ref={closeBtnRef} type="button" className={styles.close} onClick={closeReader} aria-label="Close story">
            <span /><span />
          </button>

          <div ref={scrollRef} className={styles.readerScroll} data-lenis-prevent onScroll={onReaderScroll}>
            <div key={openPostData.id}>
              <header data-r-head className={styles.rHead}>
                <span data-r-no className={styles.rBigNo} aria-hidden="true">{openPostData.no}</span>

                <div className={styles.rHeadGrid}>
                  <div className={styles.rHeadText}>
                    <p data-r-meta className={styles.rMeta}>
                      <span className={styles.rCat}>{openPostData.cat}</span>
                      <span>{openPostData.date}</span>
                      <span>{openPostData.read} min read</span>
                    </p>
                    <h2 className={styles.rTitle}>
                      {openPostData.title.split(" ").map((w, i) => (
                        <span key={i}>
                          <span className={styles.rWordMask}>
                            <span data-r-word className={styles.rWord}>{w}</span>
                          </span>{" "}
                        </span>
                      ))}
                    </h2>
                    <p data-r-meta className={styles.rLead}>{openPostData.excerpt}</p>
                    <p data-r-meta className={styles.rCue} aria-hidden="true">
                      <i />
                      keep scrolling
                    </p>
                  </div>

                  <div className={styles.rArtCol}>
                    <div data-r-art className={styles.rArt}>
                      <div className={styles.rFrame}>
                        <div data-r-zoom className={styles.zoom}><Cover post={openPostData} /></div>
                        <i className={styles.fold} aria-hidden="true" />
                      </div>
                    </div>
                    <span data-r-meta className={styles.rCap} aria-hidden="true">fig. {openPostData.no} · cover</span>
                  </div>
                </div>
              </header>

              <div className={styles.rBodyWrap}>
                <aside className={styles.rRail} aria-hidden="true">
                  <p><b>{openPostData.no}</b> / {pad(N)}</p>
                  <p>{openPostData.cat}</p>
                  <p>{openPostData.date}</p>
                  <p>{openPostData.read} min read</p>
                </aside>

                <div className={styles.rBody}>
                  {openPostData.body.map((b, i) => {
                    if (b.t === "h") return <h3 key={i} data-r-fade className={styles.rH}>{b.text}</h3>;
                    if (b.t === "q")
                      return (
                        <blockquote key={i} data-r-fade className={styles.rQuote}>
                          <p>{b.text}</p>
                          <span className={styles.rQuoteNote}>
                            remember this
                            <img src="/arrow-left.webp" alt="" draggable={false} />
                          </span>
                        </blockquote>
                      );
                    return <p key={i} data-r-fade className={styles.rP}>{b.text}</p>;
                  })}
                </div>
              </div>

              <footer className={styles.rNext}>
                <p className={styles.rNextNote}>up next</p>
                <button type="button" className={styles.rNextBtn} onClick={() => setOpenId(nextPost.id)}>
                  <em aria-hidden="true">{nextPost.no}</em>
                  <span>{nextPost.title}</span>
                  <i aria-hidden="true">→</i>
                </button>
              </footer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}