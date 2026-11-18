"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Section5.module.css";

/* ═══════════════════════════════════════════
   Content: edit copy, colors and photos here
   ═══════════════════════════════════════════ */
type CatId = "interior" | "estate" | "watch";

interface Category {
  id: CatId;
  name: string;
  accent: string;
  tagline: string;
  cta: string;
  placeholder: string;
  /* Optional hero photo. Drop the file in /public/order/ and it fades into the hero.
     If the file is missing, the animated color mesh is used instead (no broken image). */
  photo: string;
  styles: { label: string; note: string; tint: string; dark?: boolean }[];
  features: string[];
}

/* Colors are intentionally soft and slightly desaturated: easy on the eyes and consistent
   with the airy blue sky of the section. The gold of "Watches" is a calm champagne,
   not a hard yellow. */
const CATEGORIES: Category[] = [
  {
    id: "interior",
    name: "Interior",
    accent: "#d99a73",
    tagline: "Rooms that feel lived in",
    cta: "Book a consultation",
    placeholder: "e.g. Nordic Nest Studio",
    photo: "/order/interior.webp",
    styles: [
      { label: "Minimal", note: "Clean and airy", tint: "#e6e2d9" },
      { label: "Warm classic", note: "Cozy and timeless", tint: "#d4aa88" },
      { label: "Modern dark", note: "Bold and moody", tint: "#7f93a1", dark: true },
    ],
    features: ["3D room viewer", "Product configurator", "Lookbook gallery", "Online store", "Book a consultation", "AR preview"],
  },
  {
    id: "estate",
    name: "Real Estate",
    accent: "#3fa89f",
    tagline: "Find a place to belong",
    cta: "Book a viewing",
    placeholder: "e.g. Skyline Properties",
    photo: "/order/estate.webp",
    styles: [
      { label: "Luxury", note: "Refined and rich", tint: "#cbb994" },
      { label: "Modern", note: "Crisp and bright", tint: "#7aa2c7" },
      { label: "Urban", note: "Edgy and city", tint: "#9aa5b5", dark: true },
    ],
    features: ["Listings and filters", "Virtual tours", "Interactive map", "Agent profiles", "Mortgage calculator", "Lead capture"],
  },
  {
    id: "watch",
    name: "Watches",
    accent: "#bfa874",
    tagline: "Time, perfectly kept",
    cta: "Shop the collection",
    placeholder: "e.g. Meridian Watches",
    photo: "/order/watch.webp",
    styles: [
      { label: "Gold", note: "Warm and classic", tint: "#d6c7a3" },
      { label: "Steel", note: "Sharp and technical", tint: "#a7b4c0" },
      { label: "Midnight", note: "Deep and elegant", tint: "#6f86b0", dark: true },
    ],
    features: ["360° product viewer", "Collection pages", "Limited drop countdown", "Online store", "Strap configurator", "Brand story timeline"],
  },
];

const STEPS = [
  { label: "World", title: "Pick your world", hint: "Choose the kind of website you want, then press Next." },
  { label: "Style", title: "Choose your style", hint: "Pick a look. Your screen updates live." },
  { label: "Brand", title: "Name your brand", hint: "Type it and watch it appear on the screen." },
  { label: "Features", title: "What should it do?", hint: "Choose everything you want. Each pick lands on your page." },
  { label: "Project", title: "New site or a redesign?", hint: "Tell us if you are starting fresh or improving a site you already have." },
  { label: "Budget", title: "Budget and timeline", hint: "Rough numbers are fine. They help us plan the right build." },
  { label: "Contact", title: "Where do we reach you?", hint: "We reply within 24 hours with a plan and a quote." },
];
const TOTAL = STEPS.length;

/* Handwritten notes around the window (y is negative: they float above the screen) */
type Arrow = "dr" | "dl";
interface Note { text: string; x: string; y: string; arrow: Arrow }
const NOTES: Note[][] = [
  [
    { text: "your industry", x: "4%", y: "-9%", arrow: "dr" },
    { text: "your world", x: "58%", y: "-10%", arrow: "dl" },
  ],
  [
    { text: "your look", x: "4%", y: "-9%", arrow: "dr" },
    { text: "your mood", x: "58%", y: "-10%", arrow: "dl" },
  ],
  [
    { text: "your idea", x: "4%", y: "-9%", arrow: "dr" },
    { text: "your logo", x: "58%", y: "-10%", arrow: "dl" },
  ],
  [
    { text: "layout", x: "4%", y: "-9%", arrow: "dr" },
    { text: "your features", x: "54%", y: "-10%", arrow: "dl" },
  ],
  [
    { text: "fresh start", x: "4%", y: "-9%", arrow: "dr" },
    { text: "or a refresh", x: "58%", y: "-10%", arrow: "dl" },
  ],
  [
    { text: "your plan", x: "4%", y: "-9%", arrow: "dr" },
    { text: "your timeline", x: "54%", y: "-10%", arrow: "dl" },
  ],
  [
    { text: "almost there", x: "4%", y: "-9%", arrow: "dr" },
    { text: "ready to fly", x: "58%", y: "-10%", arrow: "dl" },
  ],
];
/* Finale: the notes sit higher, clear of the screen that lifts up */
const NOTES_DONE: Note[] = [
  { text: "it's live!", x: "6%", y: "-84px", arrow: "dr" },
  { text: "see you soon", x: "56%", y: "-90px", arrow: "dl" },
];

const BUDGETS = ["$1k – 3k", "$3k – 7k", "$7k – 15k", "$15k+"];
const TIMELINES = ["2 – 4 weeks", "1 – 2 months", "Flexible"];

/* How long the section stays pinned (a short, calm hold), as a share of the viewport height.
   0.55 = the page waits for about half a screen of scrolling. Lower = shorter hold. */
const PIN_HOLD = 0.55;

/* Set this to your API route (e.g. "/api/brief"). The brief is sent as JSON via POST.
   When empty, submission is simulated. */
const ENDPOINT = "";
const REQUEST_TIMEOUT_MS = 12000;

/* ═══════════════════════════════════════════
   Form state + validation
   ═══════════════════════════════════════════ */
interface FormState {
  world: CatId | "";
  brand: string;
  kind: "new" | "redesign";
  styleIdx: number;
  features: string[];
  budget: string;
  timeline: string;
  name: string;
  email: string;
  notes: string;
}

const EMPTY: FormState = {
  world: "", brand: "", kind: "new", styleIdx: 0, features: [],
  budget: "", timeline: "", name: "", email: "", notes: "",
};

type Field = "world" | "brand" | "features" | "budget" | "timeline" | "name" | "email";
type Errors = Partial<Record<Field, string>>;

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());

const validate = (step: number, f: FormState): Errors => {
  const e: Errors = {};
  if (step === 1 && !f.world) e.world = "Choose a world to continue.";
  if (step === 3 && f.brand.trim().length < 2) e.brand = "Enter your brand name (at least 2 characters).";
  if (step === 4 && f.features.length === 0) e.features = "Pick at least one feature to continue.";
  if (step === 6) {
    if (!f.budget) e.budget = "Choose a budget range.";
    if (!f.timeline) e.timeline = "Choose a timeline.";
  }
  if (step === 7) {
    if (f.name.trim().length < 2) e.name = "Enter your name.";
    if (!emailOk(f.email)) e.email = "Enter a valid email address, like you@brand.com.";
  }
  return e;
};

const isValid = (step: number, f: FormState) => Object.keys(validate(step, f)).length === 0;

/* Highest step the person is allowed to open: the first incomplete step, or the last one. */
const reachableStep = (f: FormState) => {
  for (let s = 1; s < TOTAL; s++) if (!isValid(s, f)) return s;
  return TOTAL;
};

const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Tiny canvas confetti (no dependency). One loop, many bursts. */
function createConfetti(canvas: HTMLCanvasElement, colors: string[]) {
  const ctx = canvas.getContext("2d");
  const host = canvas.parentElement;
  if (!ctx || !host) return null;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const { width: W, height: H } = host.getBoundingClientRect();
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  interface P { x: number; y: number; vx: number; vy: number; g: number; rot: number; vr: number; w: number; h: number; c: string; life: number; max: number; round: boolean }
  let parts: P[] = [];
  let raf = 0;
  let running = false;

  const tick = () => {
    ctx.clearRect(0, 0, W, H);
    parts = parts.filter((p) => p.life < p.max && p.y < H + 40);
    for (const p of parts) {
      p.vx *= 0.985;
      p.vy = p.vy * 0.985 + p.g;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.life++;
      ctx.save();
      ctx.globalAlpha = Math.min(1, (1 - p.life / p.max) * 1.6);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      if (p.round) {
        ctx.beginPath();
        ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }
      ctx.restore();
    }
    if (parts.length) raf = requestAnimationFrame(tick);
    else { running = false; ctx.clearRect(0, 0, W, H); }
  };

  return {
    W, H,
    burst(x: number, y: number, angle: number, spread: number, count: number, smin: number, smax: number, g = 0.32, life = 90) {
      for (let i = 0; i < count; i++) {
        const a = angle + (Math.random() - 0.5) * spread;
        const sp = smin + Math.random() * (smax - smin);
        parts.push({
          x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g,
          rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
          w: 6 + Math.random() * 8, h: 3 + Math.random() * 5,
          c: colors[i % colors.length], life: 0, max: life + Math.random() * 80,
          round: Math.random() < 0.3,
        });
      }
      if (!running) { running = true; raf = requestAnimationFrame(tick); }
    },
    stop() {
      cancelAnimationFrame(raf);
      running = false;
      parts = [];
      ctx.clearRect(0, 0, W, H);
    },
  };
}

/* ═══════════════════════════════════════════
   Small pieces
   ═══════════════════════════════════════════ */
function ArrowSvg({ dir }: { dir: Arrow }) {
  const d = dir === "dr"
    ? "M4 6 C 30 0, 50 14, 52 34 M43 26 L52 37 L58 24"
    : "M58 6 C 32 0, 12 14, 10 34 M4 24 L10 37 L19 25";
  return (
    <svg viewBox="0 0 62 42" className={`${styles.arrow} ${dir === "dr" ? styles.arrowR : styles.arrowL}`} aria-hidden="true">
      <path data-arrow pathLength={1} d={d} />
    </svg>
  );
}

/* The brand name is "typed" on the screen: every new character pops in.
   Keys are index + char, so characters that already exist do not re-animate. */
function Typed({ text, caret, wave }: { text: string; caret: boolean; wave?: boolean }) {
  return (
    <>
      {Array.from(text).map((ch, i) => (
        <span
          key={`${i}-${ch}`}
          className={styles.ch}
          style={wave ? { animationDelay: `${0.35 + i * 0.06}s` } : undefined}
        >
          {ch === " " ? "\u00a0" : ch}
        </span>
      ))}
      {caret && <span className={styles.caret} aria-hidden="true" />}
    </>
  );
}

/* Each selected feature drops into the window and bounces */
function Tile({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    const t = gsap.fromTo(
      el,
      { y: -70, opacity: 0, scale: 0.5, rotate: gsap.utils.random(-14, 14) },
      { y: 0, opacity: 1, scale: 1, rotate: 0, duration: 0.9, ease: "back.out(1.8)" }
    );
    return () => { t.kill(); };
  }, []);
  return (
    <div ref={ref} className={styles.tile}>
      <span className={styles.tileDot} />
      <span>{label}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════ */
export default function Section5() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const camRef = useRef<HTMLDivElement>(null);
  const warmRef = useRef<HTMLDivElement>(null);
  const sunRef = useRef<HTMLDivElement>(null);
  const winRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const publishRef = useRef<HTMLSpanElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const honeyRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const brandRef = useRef<HTMLInputElement>(null);
  const skyBrandRef = useRef<HTMLDivElement>(null);

  /* Scene timeline (a pure function of the current step) */
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const reducedRef = useRef(false);

  const dirRef = useRef(1);
  const userNavRef = useRef(false);
  const firstCatRef = useRef(true);

  const [catId, setCatId] = useState<CatId>("interior");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [entered, setEntered] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});

  const stepRef = useRef(step);
  stepRef.current = step;

  const cat = CATEGORIES.find((c) => c.id === catId) ?? CATEGORIES[0];
  const styleOpt = cat.styles[form.styleIdx];
  const tint = styleOpt.tint;
  const dark = !!styleOpt.dark;
  const done = status === "done";
  const sending = status === "sending";
  const lvl = done ? 7 : step;
  const bodyKey = done ? "done" : String(step);

  const errors = validate(step, form);
  const reach = reachableStep(form);
  const showErr = (k: Field) => (attempted || touched[k] ? errors[k] : undefined);
  const touch = (k: Field) => () => setTouched((t) => ({ ...t, [k]: true }));

  const errMsg = (k: Field) => {
    const m = showErr(k);
    return m ? <p id={`s5-err-${k}`} className={styles.fieldError} role="alert">{m}</p> : null;
  };

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (status === "error") setStatus("idle");
  };

  const toggleFeature = (name: string) =>
    setForm((f) => ({
      ...f,
      features: f.features.includes(name) ? f.features.filter((x) => x !== name) : [...f.features, name],
    }));

  /* Picking a world: the screen changes at once; the person moves on with Next */
  const pickCat = (id: CatId) => {
    const changed = id !== catId;
    if (changed) setCatId(id);
    setForm((f) => ({ ...f, world: id, ...(changed ? { styleIdx: 0, features: [] } : {}) }));
  };

  const changeStep = (t: number) => {
    dirRef.current = t > stepRef.current ? 1 : -1;
    userNavRef.current = true;
    setAttempted(false);
    setTouched({});
    setStep(t);
  };

  const focusFirstInvalid = () => {
    requestAnimationFrame(() => {
      bodyRef.current
        ?.querySelector<HTMLElement>("input[aria-invalid='true'], [data-invalid='true'] button")
        ?.focus();
    });
  };

  /* Stepper + back: you can only jump to steps you have legitimately reached */
  const goTo = (target: number) => {
    const t = Math.min(TOTAL, Math.max(1, target));
    if (t === step || t > reach || done || sending) return;
    changeStep(t);
  };

  const next = () => {
    if (sending || done) return;
    if (!isValid(step, form)) {
      setAttempted(true);
      focusFirstInvalid();
      return;
    }
    if (step < TOTAL) changeStep(step + 1);
    else void submit();
  };

  const restart = () => {
    setStatus("idle");
    setForm(EMPTY);
    setCatId("interior");
    setAttempted(false);
    setTouched({});
    dirRef.current = -1;
    userNavRef.current = true;
    setStep(1);
  };

  const submit = async () => {
    if (sending) return;
    /* Honeypot: bots fill the hidden field, people never see it */
    if (honeyRef.current?.value) {
      setStatus("done");
      return;
    }
    setStatus("sending");
    const payload = {
      category: cat.id,
      ...form,
      style: cat.styles[form.styleIdx].label,
      locale: typeof navigator !== "undefined" ? navigator.language : undefined,
      source: "order-section",
    };
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
    try {
      if (ENDPOINT) {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error("Request failed");
      } else {
        await new Promise((r) => setTimeout(r, 900));
      }
      userNavRef.current = true;
      setStatus("done");
    } catch {
      setStatus("error");
    } finally {
      window.clearTimeout(timer);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    next();
  };

  /* ══════════ Short pin: the section holds still for a moment when it enters ══════════
     - Desktop only, and not for people who prefer reduced motion.
     - v3.4 fix: the old version skipped the pin whenever the section was even a bit taller
       than the screen (which is common, because of the dock). Now:
         • section fits the screen      -> pin when its TOP meets the top of the screen
         • section taller than screen   -> pin when its BOTTOM meets the bottom of the screen,
                                           so the whole section (including the buttons) is visible
       In both cases the page then waits for PIN_HOLD of a screen of scrolling.
     - It is created BEFORE the other triggers so their positions are calculated correctly. */
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const s = sectionRef.current;
    if (!s) return;
    const mm = gsap.matchMedia();

    mm.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
      const taller = () => s.offsetHeight > window.innerHeight + 2;

      const st = ScrollTrigger.create({
        trigger: s,
        start: () => (taller() ? "bottom bottom" : "top top"),
        end: () => `+=${Math.round(window.innerHeight * PIN_HOLD)}`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });
      return () => st.kill();
    });

    return () => mm.revert();
  }, []);

  /* ══════════ Entrances + ambient motion (runs once) ══════════ */
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const s = sectionRef.current;
    const stage = stageRef.current;
    if (!s || !stage) return;
    const reduce = prefersReduced();

    const ctx = gsap.context(() => {
      /* Depth: every [data-z] element gets its z distance */
      s.querySelectorAll<HTMLElement>("[data-z]").forEach((el) => {
        gsap.set(el, { z: Number(el.dataset.z) });
      });

      if (reduce) {
        setEntered(true);
        return;
      }

      /* Ambient floating, paused while the stage is off screen */
      const ambient: gsap.core.Tween[] = [];
      s.querySelectorAll<HTMLElement>("[data-float]").forEach((el) => {
        ambient.push(gsap.to(el, {
          y: gsap.utils.random(6, 12) * (Math.random() < 0.5 ? -1 : 1),
          rotation: gsap.utils.random(-1, 1),
          duration: gsap.utils.random(2.6, 4.2),
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        }));
      });
      const vis = ScrollTrigger.create({
        trigger: stage,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => ambient.forEach((t) => (self.isActive ? t.resume() : t.pause())),
      });
      if (!vis.isActive) ambient.forEach((t) => t.pause());

      /* The screen rises first, then the dock slides up under it */
      gsap.fromTo(
        tiltRef.current,
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.3, ease: "power3.out",
          scrollTrigger: { trigger: stage, start: "top 85%", once: true, onEnter: () => setEntered(true) } }
      );
      gsap.fromTo(
        s.querySelectorAll("[data-copy]"),
        { y: 90, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, delay: 0.35, ease: "power3.out",
          scrollTrigger: { trigger: stage, start: "top 85%", once: true } }
      );
    }, sectionRef);

    /* Web fonts change heights: refresh trigger positions once they load */
    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
    }

    return () => ctx.revert();
  }, []);

  /* Arriving at the brand step on desktop: the cursor is already in the field */
  useEffect(() => {
    if (step !== 3 || typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const id = window.setTimeout(() => brandRef.current?.focus({ preventScroll: true }), 800);
    return () => window.clearTimeout(id);
  }, [step]);

  /* ══════════ Scene timeline: camera angle + sunrise ══════════
     The timeline is paused and driven by the step, never by the scroll position.
     Step n  ->  playhead at (n - 1). Works forward and backward. */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const mm = gsap.matchMedia();

    mm.add(
      { desk: "(min-width: 901px)", reduce: "(prefers-reduced-motion: reduce)", fine: "(pointer: fine)" },
      (context) => {
        const { desk, reduce, fine } = context.conditions as { desk: boolean; reduce: boolean; fine: boolean };
        const cam = camRef.current;
        const warm = warmRef.current;
        const sun = sunRef.current;
        const tilt = tiltRef.current;
        if (!cam || !warm || !sun) return;

        const E = "power1.inOut";
        const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });

        /* Camera: a different angle for every step (flat zoom only on small screens) */
        if (desk) {
          tl.fromTo(cam, { scale: 0.92, rotationY: -12, rotationX: 7, x: 0 },
              { scale: 0.97, rotationY: -6, rotationX: 4, x: -10, duration: 1, ease: E }, 0)
            .to(cam, { scale: 0.95, rotationY: 8, rotationX: 5, x: 10, duration: 1, ease: E }, 1)
            .to(cam, { scale: 0.97, rotationY: -4, rotationX: 3, x: -6, duration: 1, ease: E }, 2)
            .to(cam, { scale: 0.96, rotationY: 5, rotationX: 4, x: 6, duration: 1, ease: E }, 3)
            .to(cam, { scale: 0.97, rotationY: -3, rotationX: 3, x: -4, duration: 1, ease: E }, 4)
            .to(cam, { scale: 1, rotationY: 0, rotationX: 2, x: 0, duration: 1, ease: E }, 5);
        } else {
          tl.fromTo(cam, { scale: 0.96 }, { scale: 1, duration: 6 }, 0);
        }

        /* Sunrise: the sky warms and the sun climbs during the last steps */
        tl.fromTo(warm, { opacity: 0 }, { opacity: 1, duration: 1.2 }, 4.8)
          .fromTo(sun, { y: 70, opacity: 0 }, { y: -50, opacity: 1, duration: 1.4 }, 4.6);

        tlRef.current = tl;
        reducedRef.current = !!reduce;
        tl.time(stepRef.current - 1);

        /* Gentle mouse tilt (desktop + mouse only) */
        let removeTilt: () => void = () => {};
        if (desk && fine && !reduce && tilt) {
          const rx = gsap.quickTo(tilt, "rotationX", { duration: 0.8, ease: "power3.out" });
          const ry = gsap.quickTo(tilt, "rotationY", { duration: 0.8, ease: "power3.out" });
          const move = (e: MouseEvent) => {
            const r = stage.getBoundingClientRect();
            ry(((e.clientX - (r.left + r.width / 2)) / r.width) * 6);
            rx((-(e.clientY - (r.top + r.height / 2)) / r.height) * 4);
          };
          const leave = () => { rx(0); ry(0); };
          stage.addEventListener("mousemove", move);
          stage.addEventListener("mouseleave", leave);
          removeTilt = () => {
            stage.removeEventListener("mousemove", move);
            stage.removeEventListener("mouseleave", leave);
          };
        }

        return () => {
          removeTilt();
          tweenRef.current?.kill();
          tweenRef.current = null;
          tl.kill();
          tlRef.current = null;
        };
      }
    );

    return () => mm.revert();
  }, []);

  /* Move the playhead whenever the step changes */
  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;
    const target = step - 1;
    tweenRef.current?.kill();
    tweenRef.current = null;
    if (reducedRef.current) {
      tl.time(target);
      return;
    }
    const dist = Math.abs(tl.time() - target);
    if (dist < 0.001) return;
    tweenRef.current = tl.tweenTo(target, { duration: 0.7 + dist * 0.7, ease: "power2.inOut" });
  }, [step]);

  /* ── Every step: handwritten notes appear and the arrows draw themselves ── */
  useEffect(() => {
    if (!entered) return;
    const root = notesRef.current;
    if (!root) return;
    const notes = root.querySelectorAll("[data-note]");
    const arrows = root.querySelectorAll("[data-arrow]");
    if (prefersReduced()) {
      gsap.set(notes, { opacity: 1 });
      gsap.set(arrows, { strokeDashoffset: 0 });
      return;
    }
    const tl = gsap.timeline({ delay: 0.2 });
    tl.fromTo(notes, { opacity: 0, y: 12, rotate: -3 },
        { opacity: 1, y: 0, rotate: 0, duration: 0.6, stagger: 0.18, ease: "power3.out" }, 0)
      .fromTo(arrows, { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 0.8, stagger: 0.18, ease: "power2.inOut" }, 0.25);
    return () => { tl.kill(); };
  }, [bodyKey, entered]);

  /* ── Step content enters; focus moves to the new title for keyboard / screen reader users ── */
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const dir = dirRef.current;
    let tl: gsap.core.Timeline | null = null;
    if (!prefersReduced()) {
      tl = gsap.timeline({ delay: 0.05 });
      tl.fromTo(body.querySelectorAll("[data-s='line']"), { yPercent: 110 },
          { yPercent: 0, duration: 0.8, ease: "power4.out" }, 0)
        .fromTo(body.querySelectorAll("[data-s='fade']"), { y: 26 * dir, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.07, ease: "power3.out" }, 0.1);
    }
    if (userNavRef.current) {
      userNavRef.current = false;
      titleRef.current?.focus({ preventScroll: true });
    }
    return () => { tl?.kill(); };
  }, [bodyKey]);

  /* ── Changing world: the window does a small turn (own element, no tween conflicts) ── */
  useEffect(() => {
    if (firstCatRef.current) {
      firstCatRef.current = false;
      return;
    }
    const win = winRef.current;
    if (!win || prefersReduced()) return;
    const t = gsap.fromTo(win,
      { rotationY: -16, scale: 0.95, opacity: 0.4 },
      { rotationY: 0, scale: 1, opacity: 1, duration: 0.9, ease: "power3.out", transformPerspective: 900 });
    return () => { t.kill(); };
  }, [catId]);

  /* ── FINALE (calm): a publish bar sweeps under the address bar, the address turns into
        "live", the screen rises gently, the brand word fills in softly behind it and a light
        rain of confetti drifts down. No circles, no glow, no flashes. ── */
  useEffect(() => {
    const pop = popRef.current;
    const badge = badgeRef.current;
    const pub = publishRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const sky = skyBrandRef.current;
    if (!pop || !badge || !pub || !stage || !canvas || !sky) return;
    const reduce = prefersReduced();

    if (done) {
      if (reduce) {
        gsap.set(pop, { y: -12 });
        gsap.set(badge, { scale: 1 });
        gsap.set(pub, { scaleX: 1, opacity: 1 });
        gsap.set(sky, { opacity: 1 });
        return;
      }
      const fx = createConfetti(canvas, [cat.accent, tint, "#ffffff"]);
      const tl = gsap.timeline();
      /* 1. the screen flips a full turn and springs up, as before */
      tl.fromTo(pop, { rotationY: 0 },
          { rotationY: 360, transformPerspective: 1400, duration: 1.5, ease: "power3.inOut",
            onComplete: () => { gsap.set(pop, { rotationY: 0 }); } }, 0)
        .to(pop, { y: -28, scale: 1.05, duration: 1.1, ease: "elastic.out(1, 0.5)" }, 0.5)
        /* 2. the page "publishes": a line sweeps under the address bar */
        .fromTo(pub, { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 1.0, ease: "power2.inOut" }, 1.4)
        .to(pub, { opacity: 0, duration: 0.6, ease: "power1.out" }, 2.5)
        /* 3. LIVE lands, the brand word fills in softly behind the screen */
        .fromTo(badge, { scale: 0, rotate: -12 }, { scale: 1, rotate: 0, duration: 0.7, ease: "back.out(2)" }, 1.7)
        .fromTo(sky, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.8, ease: "power3.out" }, 1.2);
      if (fx) {
        /* 4. a light rain of confetti */
        tl.call(() => fx.burst(fx.W / 2, -10, Math.PI / 2, 2.8, 110, 1.5, 4.5, 0.05, 140), [], 1.5);
      }
      return () => {
        tl.kill();
        fx?.stop();
      };
    }
    gsap.to(pop, { y: 0, scale: 1, duration: reduce ? 0 : 0.6, ease: "power3.out" });
    gsap.set(badge, { scale: 0 });
    gsap.set(pub, { scaleX: 0, opacity: 0 });
    gsap.set(sky, { clearProps: "transform,opacity" });
  }, [done]);

  /* ═══════════ Render ═══════════ */
  const stepMeta = STEPS[step - 1];
  const first = form.name.trim().split(" ")[0];
  const brand = form.brand.trim();
  const slug = brand.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 16) || "yourbrand";
  const planP = (form.budget ? 0.5 : 0) + (form.timeline ? 0.5 : 0);
  const notes = done ? NOTES_DONE : NOTES[step - 1] ?? [];

  /* The longer the brand, the smaller the hero type, so it always fits */
  const shownBrand = form.brand.slice(0, 26);
  const titleSize = shownBrand.length <= 8 ? "4.6em" : shownBrand.length <= 14 ? "3.5em" : "2.5em";

  const renderBody = () => {
    if (done) {
      return (
        <>
          <div data-s="fade" className={styles.doneBadge} aria-hidden="true">✓</div>
          <div className={styles.intro}>
            <h3 ref={titleRef} tabIndex={-1} className={styles.stepTitle}>
              <span className={styles.mask}>
                <span data-s="line" className={styles.maskInner}>Brief received</span>
              </span>
            </h3>
            <p data-s="fade" className={styles.stepHint}>
              Thanks{first ? `, ${first}` : ""}. We are reviewing your {cat.name.toLowerCase()} brief and will email {form.email.trim()} within 24 hours.
            </p>
          </div>
          <ul data-s="fade" className={styles.summary}>
            <li>{brand}</li>
            <li>{styleOpt.label}</li>
            <li>{form.features.length} features</li>
            <li>{form.budget}</li>
            <li>{form.timeline}</li>
          </ul>
        </>
      );
    }

    return (
      <>
        <div className={styles.intro}>
          <h3 ref={titleRef} tabIndex={-1} className={styles.stepTitle}>
            <span className={styles.mask}>
              <span data-s="line" className={styles.maskInner}>{stepMeta.title}</span>
            </span>
          </h3>
          <p data-s="fade" className={styles.stepHint}>{stepMeta.hint}</p>
        </div>

        {step === 1 && (
          <div className={styles.worldsWrap}>
            <div className={styles.worlds} role="group" aria-label="Your world">
              {CATEGORIES.map((c) => {
                const on = form.world === c.id;
                const dim = !!form.world && !on;
                return (
                  <div key={c.id} data-s="fade">
                    <button
                      type="button"
                      className={`${styles.world} ${on ? styles.worldOn : ""} ${dim ? styles.worldDim : ""}`}
                      style={{ "--c": c.accent } as CSSProperties}
                      aria-pressed={on}
                      onClick={() => pickCat(c.id)}
                    >
                      <span className={styles.worldOrb} />
                      <span className={styles.worldText}>
                        <span className={styles.worldName}>{c.name}</span>
                        <span className={styles.worldTag}>{c.tagline}</span>
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
            {errMsg("world")}
          </div>
        )}

        {step === 2 && (
          <div className={styles.worldsWrap}>
            <div className={styles.worlds} role="group" aria-label="Visual style">
              {cat.styles.map((s, i) => {
                const on = form.styleIdx === i;
                return (
                  <div key={s.label} data-s="fade">
                    <button
                      type="button"
                      className={`${styles.world} ${on ? styles.worldOn : ""}`}
                      style={{ "--c": s.tint } as CSSProperties}
                      aria-pressed={on}
                      onClick={() => set("styleIdx", i)}
                    >
                      <span className={styles.worldOrb} />
                      <span className={styles.worldText}>
                        <span className={styles.worldName}>{s.label}</span>
                        <span className={styles.worldTag}>{s.note}</span>
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div data-s="fade" className={`${styles.field} ${styles.wide}`}>
            <label className={styles.label} htmlFor="s5-brand">Brand name</label>
            <input
              ref={brandRef}
              id="s5-brand"
              className={`${styles.input} ${styles.inputBig} ${showErr("brand") ? styles.inputErr : ""}`}
              value={form.brand}
              onChange={(e) => set("brand", e.target.value)}
              onBlur={touch("brand")}
              placeholder={cat.placeholder}
              autoComplete="organization"
              maxLength={60}
              aria-invalid={showErr("brand") ? true : undefined}
              aria-describedby={showErr("brand") ? "s5-err-brand" : undefined}
            />
            {errMsg("brand")}
          </div>
        )}

        {step === 4 && (
          <div data-s="fade" className={`${styles.field} ${styles.wide}`} data-invalid={showErr("features") ? "true" : undefined}>
            <div className={styles.chips} role="group" aria-label="Features">
              {cat.features.map((ft) => (
                <button
                  key={ft}
                  type="button"
                  className={`${styles.chip} ${form.features.includes(ft) ? styles.chipOn : ""}`}
                  aria-pressed={form.features.includes(ft)}
                  onClick={() => toggleFeature(ft)}
                >
                  {ft}
                </button>
              ))}
            </div>
            {showErr("features") ? (
              errMsg("features")
            ) : (
              <p className={styles.hint} aria-live="polite">
                {form.features.length ? `${form.features.length} selected` : "Pick at least one"}
              </p>
            )}
          </div>
        )}

        {step === 5 && (
          <div className={styles.worldsWrap}>
            <div className={`${styles.worlds} ${styles.worlds2}`} role="group" aria-label="Project type">
              {([
                ["new", "New website", "Start fresh from scratch"],
                ["redesign", "Redesign my site", "Refresh what you already have"],
              ] as const).map(([k, label, note]) => {
                const on = form.kind === k;
                return (
                  <div key={k} data-s="fade">
                    <button
                      type="button"
                      className={`${styles.world} ${on ? styles.worldOn : ""}`}
                      style={{ "--c": cat.accent } as CSSProperties}
                      aria-pressed={on}
                      onClick={() => set("kind", k)}
                    >
                      <span className={styles.worldOrb} />
                      <span className={styles.worldText}>
                        <span className={styles.worldName}>{label}</span>
                        <span className={styles.worldTag}>{note}</span>
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className={styles.scopeRow}>
            <div data-s="fade" className={styles.field} data-invalid={showErr("budget") ? "true" : undefined}>
              <span className={styles.label} id="s5-budget-label">Your budget</span>
              <div className={`${styles.chips} ${styles.chipsRow}`} role="group" aria-labelledby="s5-budget-label">
                {BUDGETS.map((b) => (
                  <button
                    key={b}
                    type="button"
                    className={`${styles.chip} ${form.budget === b ? styles.chipOn : ""}`}
                    aria-pressed={form.budget === b}
                    onClick={() => set("budget", b)}
                  >
                    {b}
                  </button>
                ))}
              </div>
              {errMsg("budget")}
            </div>
            <div data-s="fade" className={styles.field} data-invalid={showErr("timeline") && !showErr("budget") ? "true" : undefined}>
              <span className={styles.label} id="s5-timeline-label">When do you need it?</span>
              <div className={`${styles.chips} ${styles.chipsRow}`} role="group" aria-labelledby="s5-timeline-label">
                {TIMELINES.map((tl) => (
                  <button
                    key={tl}
                    type="button"
                    className={`${styles.chip} ${form.timeline === tl ? styles.chipOn : ""}`}
                    aria-pressed={form.timeline === tl}
                    onClick={() => set("timeline", tl)}
                  >
                    {tl}
                  </button>
                ))}
              </div>
              {errMsg("timeline")}
            </div>
          </div>
        )}

        {step === 7 && (
          <>
            <div data-s="fade" className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="s5-name">Your name</label>
                <input
                  id="s5-name"
                  className={`${styles.input} ${showErr("name") ? styles.inputErr : ""}`}
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  onBlur={touch("name")}
                  placeholder="Full name"
                  autoComplete="name"
                  maxLength={80}
                  aria-invalid={showErr("name") ? true : undefined}
                  aria-describedby={showErr("name") ? "s5-err-name" : undefined}
                />
                {errMsg("name")}
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="s5-email">Email</label>
                <input
                  id="s5-email"
                  className={`${styles.input} ${showErr("email") ? styles.inputErr : ""}`}
                  type="email"
                  inputMode="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  onBlur={touch("email")}
                  placeholder="you@brand.com"
                  autoComplete="email"
                  maxLength={120}
                  aria-invalid={showErr("email") ? true : undefined}
                  aria-describedby={showErr("email") ? "s5-err-email" : undefined}
                />
                {errMsg("email")}
              </div>
            </div>
            <div data-s="fade" className={`${styles.field} ${styles.wide}`}>
              <label className={styles.label} htmlFor="s5-notes">Anything else? (optional)</label>
              <textarea
                id="s5-notes"
                className={`${styles.input} ${styles.textarea}`}
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Links, references, deadlines…"
                maxLength={1000}
              />
            </div>
            {/* Honeypot (hidden from people and assistive tech) */}
            <input
              ref={honeyRef}
              className={styles.hp}
              type="text"
              name="company_website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
          </>
        )}
      </>
    );
  };

  return (
    <section ref={sectionRef} id="contact" className={styles.section} aria-labelledby="section5-title">
      {/* The visible heading was removed on purpose: the steps explain themselves.
          Screen readers and search engines still get a proper h2. */}
      <h2 id="section5-title" className={styles.srOnly}>Order your website</h2>

      <div
        ref={stageRef}
        className={styles.stage}
        style={{ "--accent": cat.accent, "--tint": tint } as CSSProperties}
      >
        {/* Sky: warm light + sun */}
        <div className={styles.sky} aria-hidden="true">
          <div ref={warmRef} className={styles.warm} />
          <div ref={sunRef} className={styles.sun} />
          <div
            ref={skyBrandRef}
            className={`${styles.skyBrand} ${done ? styles.skyBrandLive : ""}`}
            style={{ fontSize: `min(${done ? 10 : 18}vw, ${(92 / Math.max(shownBrand.length || 10, 6) / 0.95).toFixed(1)}vw)` }}
          >
            {shownBrand || "Your brand"}
          </div>
        </div>

        <div className={styles.cloudBig1} aria-hidden="true">
          <Image src="/cloud3.webp" alt="" width={900} height={450} style={{ width: "100%", height: "auto" }} />
        </div>
        <div className={styles.cloudBig2} aria-hidden="true">
          <Image src="/cloud-slide.webp" alt="" width={900} height={450} style={{ width: "100%", height: "auto" }} />
        </div>

        {/* Finale layers */}
        <canvas ref={canvasRef} className={styles.fx} aria-hidden="true" />

        {/* ═══ The live website (top) ═══ */}
        <div className={styles.scene}>
          <div ref={tiltRef} className={styles.tilt}>
            <div ref={camRef} className={styles.cam}>
              <div className={styles.winFloat} data-float data-z="0">
                <div ref={popRef} className={styles.winPop}>
                  <div
                    ref={winRef}
                    className={styles.win}
                    data-lvl={lvl}
                    data-dark={dark ? "true" : "false"}
                    data-done={done ? "true" : "false"}
                    role="img"
                    aria-label={`Live preview of your ${cat.name.toLowerCase()} website`}
                  >
                    <div className={styles.bar}>
                      <span className={styles.dotR} />
                      <span className={styles.dotY} />
                      <span className={styles.dotC} />
                      <span className={styles.url}>{done ? `✓ ${slug}.com is live` : `${slug}.com`}</span>
                    </div>
                    <span ref={publishRef} className={styles.publish} aria-hidden="true" />

                    <div className={styles.mNav}>
                      <span className={styles.mBrand}>
                        <span className={styles.mLogo} />
                        <span className={styles.mBrandName}>{brand.slice(0, 14) || "Brand"}</span>
                      </span>
                      <span className={styles.mLinks}><i /><i /><i /></span>
                    </div>

                    {/* Hero: animated color mesh (+ optional photo), brand typed live */}
                    <div className={styles.hero}>
                      <div className={styles.heroBg} />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        key={cat.photo}
                        className={styles.heroImg}
                        src={cat.photo}
                        alt=""
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                      <p className={styles.mTag}>{cat.tagline}</p>
                      <h4
                        className={`${styles.mTitle} ${shownBrand ? "" : styles.ghostText}`}
                        style={{ fontSize: titleSize }}
                      >
                        {shownBrand ? (
                          <Typed key={done ? "live" : "typing"} text={shownBrand} caret={step === 3 && !done} wave={done} />
                        ) : (
                          <>Your brand<span className={styles.caret} aria-hidden="true" /></>
                        )}
                      </h4>
                      <div className={styles.heroRow}>
                        <span className={styles.mCta}>{cat.cta}</span>
                        <span className={styles.styleTag}>{styleOpt.label}</span>
                      </div>
                    </div>

                    <div className={styles.mGrid}>
                      {Array.from({ length: 6 }, (_, i) => {
                        const ft = form.features[i];
                        return ft ? <Tile key={ft} label={ft} /> : <div key={`s${i}`} className={styles.slot} />;
                      })}
                    </div>

                    <div className={styles.plan}>
                      <div className={styles.planTrack}>
                        <span className={styles.planFill} style={{ transform: `scaleX(${planP})` }} />
                      </div>
                      <div className={styles.planText}>
                        <span>{form.budget || "Budget"}</span>
                        <span>{form.timeline || "Timeline"}</span>
                      </div>
                    </div>
                  </div>

                  <span ref={badgeRef} className={styles.live} aria-hidden="true">LIVE</span>
                </div>
              </div>

              {/* Floating glass chips that mirror the answers */}
              <div className={`${styles.glass} ${styles.gStyle}`} data-float data-z="80" aria-hidden="true">
                <span className={styles.gSwatch} />
                <span>{styleOpt.label}</span>
              </div>
              <div className={`${styles.glass} ${styles.gCount}`} data-float data-z="100" aria-hidden="true">
                <span className={styles.gNum}>{form.features.length}/6</span>
                <span>features</span>
              </div>

              <div key={bodyKey} ref={notesRef} className={styles.notes} aria-hidden="true">
                {notes.map((n) => (
                  <div
                    key={n.text}
                    data-note
                    className={styles.note}
                    style={{ left: n.x, top: n.y }}
                  >
                    <span className={styles.noteText}>{n.text}</span>
                    <ArrowSvg dir={n.arrow} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══ The dock (form) — floats under the screen ═══ */}
        <div data-copy className={styles.copy}>
          <nav className={styles.stepper} aria-label="Brief progress">
            {STEPS.map((s, i) => {
              const n = i + 1;
              const isDone = done || n < step;
              const isCur = !done && n === step;
              return (
                <button
                  key={s.label}
                  type="button"
                  className={`${styles.stepItem} ${isDone ? styles.stepDone : ""} ${isCur ? styles.stepCur : ""}`}
                  onClick={() => goTo(n)}
                  disabled={done || sending || (n > reach && !isCur)}
                  aria-current={isCur ? "step" : undefined}
                  aria-label={`Step ${n}: ${s.label}${isDone ? " (completed)" : ""}`}
                >
                  <span className={styles.stepDot}>{isDone ? "✓" : n}</span>
                  <span className={styles.stepLabel}>{s.label}</span>
                </button>
              );
            })}
          </nav>

          <p className={styles.srOnly} role="status" aria-live="polite">
            {done ? "Brief received." : `Step ${step} of ${TOTAL}: ${stepMeta.title}`}
          </p>

          <form className={styles.form} onSubmit={onSubmit} noValidate aria-label="Website brief">
            <div key={bodyKey} ref={bodyRef} className={styles.body}>
              {renderBody()}
            </div>

            {done ? (
              <div className={styles.actions}>
                <button type="button" className={styles.primary} onClick={restart}>
                  Start another brief
                </button>
              </div>
            ) : (
              <>
                {status === "error" && (
                  <p className={styles.error} role="alert">
                    We could not send your brief. Check your connection and try again.
                  </p>
                )}
                <div className={styles.actions}>
                  <button type="button" className={styles.ghost} onClick={() => goTo(step - 1)} disabled={step === 1 || sending}>
                    ← Back
                  </button>
                  <button type="submit" className={styles.primary} disabled={sending}>
                    {step < TOTAL ? "Next →" : sending ? "Sending…" : status === "error" ? "Try again" : "Send brief"}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}