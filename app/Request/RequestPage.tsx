"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./RequestPage.module.css";

/* ═══════════════════════════════════════════
   Content: edit copy, colors and photos here
   (same worlds / styles / features as Section5)
   ═══════════════════════════════════════════ */
type CatId = "interior" | "estate" | "watch";

interface Category {
  id: CatId;
  name: string;
  accent: string;
  tagline: string;
  cta: string;
  placeholder: string;
  photo: string;
  styles: { label: string; note: string; tint: string; dark?: boolean }[];
  features: string[];
}

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

const SECTIONS = [
  { id: "world", label: "World", title: "Pick your world", hint: "The kind of website you want. The screen on the left changes at once." },
  { id: "style", label: "Style", title: "Choose your style", hint: "Pick a look and a mood. You can change it any time." },
  { id: "brand", label: "Brand", title: "Name your brand", hint: "Type it and see it land in your logo and address." },
  { id: "scope", label: "Scope", title: "Tell us about the project", hint: "New or redesign, how big it is, and which languages it speaks." },
  { id: "features", label: "Features", title: "What should it do?", hint: "Choose everything you want. Each pick lands on your page." },
  { id: "plan", label: "Plan", title: "Budget and timeline", hint: "Rough numbers are fine. They help us plan the right build." },
  { id: "contact", label: "Contact", title: "Where do we reach you?", hint: "We reply within 24 hours with a plan and a quote." },
] as const;

type SecId = (typeof SECTIONS)[number]["id"];

/* Handwritten notes above the screen: they change with the active section */
type Arrow = "dr" | "dl";
interface Note { text: string; x: string; arrow: Arrow }
const NOTES: Record<SecId, Note[]> = {
  world: [{ text: "your industry", x: "4%", arrow: "dr" }, { text: "your world", x: "58%", arrow: "dl" }],
  style: [{ text: "your look", x: "4%", arrow: "dr" }, { text: "your mood", x: "58%", arrow: "dl" }],
  brand: [{ text: "your idea", x: "4%", arrow: "dr" }, { text: "your logo", x: "58%", arrow: "dl" }],
  scope: [{ text: "fresh start", x: "4%", arrow: "dr" }, { text: "or a refresh", x: "58%", arrow: "dl" }],
  features: [{ text: "layout", x: "4%", arrow: "dr" }, { text: "your features", x: "52%", arrow: "dl" }],
  plan: [{ text: "your plan", x: "4%", arrow: "dr" }, { text: "your timeline", x: "52%", arrow: "dl" }],
  contact: [{ text: "almost there", x: "4%", arrow: "dr" }, { text: "ready to fly", x: "58%", arrow: "dl" }],
};
const NOTES_DONE: Note[] = [
  { text: "it's live!", x: "6%", arrow: "dr" },
  { text: "see you soon", x: "56%", arrow: "dl" },
];

const PAGES = ["1 – 3 pages", "4 – 7 pages", "8 – 15 pages", "15+ pages"];
const LANGS = ["English", "Arabic", "French", "Other"];
const BUDGETS = ["$1k – 3k", "$3k – 7k", "$7k – 15k", "$15k+"];
const TIMELINES = ["2 – 4 weeks", "1 – 2 months", "Flexible"];
const CHANNELS = ["Email", "WhatsApp", "Phone call"];

/* Hero stats */
const HERO_STATS = [
  { value: "2 min", label: "to answer" },
  { value: "24 h", label: "to get a quote" },
  { value: "Live", label: "preview as you go" },
];

/* Hero: little four-point stars (x / y / size in px / twinkle delay) */
const HERO_SPARKS = [
  { x: "30%", y: "20%", s: 20, d: "0s" },
  { x: "68%", y: "16%", s: 16, d: "-1.2s" },
  { x: "24%", y: "62%", s: 14, d: "-2.1s" },
  { x: "75%", y: "66%", s: 18, d: "-2.8s" },
  { x: "52%", y: "9%", s: 12, d: "-0.6s" },
];

/* Set this to your API route (e.g. "/api/brief"). The request is sent as JSON via POST.
   When empty, submission is simulated. */
const ENDPOINT = "";
const REQUEST_TIMEOUT_MS = 12000;

/* ═══════════════════════════════════════════
   Form state + validation
   ═══════════════════════════════════════════ */
interface FormState {
  world: CatId | "";
  styleIdx: number;
  brand: string;
  kind: "new" | "redesign";
  site: string;
  pages: string;
  languages: string[];
  features: string[];
  budget: string;
  timeline: string;
  name: string;
  email: string;
  channel: string;
  phone: string;
  notes: string;
}

const EMPTY: FormState = {
  world: "", styleIdx: 0, brand: "", kind: "new", site: "", pages: "", languages: [],
  features: [], budget: "", timeline: "", name: "", email: "", channel: "Email", phone: "", notes: "",
};

type Field =
  | "world" | "brand" | "site" | "pages" | "languages" | "features"
  | "budget" | "timeline" | "name" | "email" | "phone";
type Errors = Partial<Record<Field, string>>;

const FIELDS: Record<SecId, Field[]> = {
  world: ["world"],
  style: [],
  brand: ["brand"],
  scope: ["site", "pages", "languages"],
  features: ["features"],
  plan: ["budget", "timeline"],
  contact: ["name", "email", "phone"],
};

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());
const siteOk = (s: string) => /^(https?:\/\/)?[^\s./]+(\.[^\s./]+)+(\/\S*)?$/i.test(s.trim());

const validate = (f: FormState): Errors => {
  const e: Errors = {};
  if (!f.world) e.world = "Choose a world to continue.";
  if (f.brand.trim().length < 2) e.brand = "Enter your brand name (at least 2 characters).";
  if (f.kind === "redesign" && !siteOk(f.site)) e.site = "Add your current website, like yourbrand.com.";
  if (!f.pages) e.pages = "Choose a size for the site.";
  if (f.languages.length === 0) e.languages = "Pick at least one language.";
  if (f.features.length === 0) e.features = "Pick at least one feature.";
  if (!f.budget) e.budget = "Choose a budget range.";
  if (!f.timeline) e.timeline = "Choose a timeline.";
  if (f.name.trim().length < 2) e.name = "Enter your name.";
  if (!emailOk(f.email)) e.email = "Enter a valid email address, like you@brand.com.";
  if (f.channel !== "Email" && f.phone.replace(/\D/g, "").length < 6) e.phone = `Add a number so we can reach you on ${f.channel === "WhatsApp" ? "WhatsApp" : "the phone"}.`;
  return e;
};

const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Tiny full-screen canvas confetti (no dependency): a light rain. */
function createConfetti(canvas: HTMLCanvasElement, colors: string[]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const W = window.innerWidth;
  const H = window.innerHeight;
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
      p.vx *= 0.99;
      p.vy = p.vy * 0.99 + p.g;
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
    rain(count: number) {
      for (let i = 0; i < count; i++) {
        parts.push({
          x: Math.random() * W, y: -10 - Math.random() * H * 0.35,
          vx: (Math.random() - 0.5) * 2, vy: 1 + Math.random() * 3, g: 0.05,
          rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
          w: 6 + Math.random() * 8, h: 3 + Math.random() * 5,
          c: colors[i % colors.length], life: 0, max: 160 + Math.random() * 100,
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

/* ── Hero art: a floating rock with moss, flowers and crystals (pure SVG, no image needed) ── */
const MOSS_DOTS = Array.from({ length: 46 }, (_, i) => {
  const t = (i * 0.6180339) % 1;
  return {
    x: 78 + t * 364,
    y: 202 + ((i * 37) % 28),
    r: 5 + ((i * 13) % 9),
    c: ["#6b8f3a", "#86a847", "#4f7a2e", "#9bb957"][i % 4],
  };
});

function Flower({ x, y, r, petal, core, n = 8 }: { x: number; y: number; r: number; petal: string; core: string; n?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: n }, (_, i) => (
        <ellipse key={i} cx={0} cy={-r * 0.62} rx={r * 0.32} ry={r * 0.62} fill={petal} opacity={0.96} transform={`rotate(${(360 / n) * i})`} />
      ))}
      <circle r={r * 0.28} fill={core} />
    </g>
  );
}

function Island() {
  return (
    <svg viewBox="0 0 520 580" className={styles.island} role="presentation" focusable="false">
      <defs>
        <linearGradient id="isl-rock" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c4bfb4" />
          <stop offset="0.45" stopColor="#7f7c76" />
          <stop offset="1" stopColor="#3d3b39" />
        </linearGradient>
        <linearGradient id="isl-crys" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="0.5" stopColor="#f6c9dc" stopOpacity="0.82" />
          <stop offset="1" stopColor="#e39fc2" stopOpacity="0.55" />
        </linearGradient>
        <filter id="isl-rough" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="14" />
        </filter>
      </defs>

      {/* rock + moss (rough edges) */}
      <g filter="url(#isl-rough)">
        <path
          d="M60 250 C50 210 120 190 200 200 C260 185 380 190 440 215 C480 235 470 290 440 340 C420 400 340 450 290 520 C270 545 240 548 225 520 C190 450 110 400 80 340 C60 310 55 275 60 250 Z"
          fill="url(#isl-rock)"
        />
        <path
          d="M62 250 C52 215 125 185 205 196 C265 180 385 186 442 214 C478 234 472 262 440 270 C420 285 400 262 370 280 C340 296 320 270 290 285 C260 300 235 272 205 288 C170 302 150 275 120 288 C90 298 60 280 62 250 Z"
          fill="#5f8433"
        />
        {MOSS_DOTS.map((m, i) => (
          <circle key={i} cx={m.x} cy={m.y} r={m.r} fill={m.c} />
        ))}
      </g>

      {/* rock striations + light edge */}
      <g fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="2.2" strokeLinecap="round">
        <path d="M120 320 C170 340 210 380 232 440" />
        <path d="M200 300 C240 330 270 380 280 450" />
        <path d="M330 300 C350 340 340 390 310 440" />
        <path d="M400 290 C395 320 380 340 362 360" />
      </g>
      <path d="M90 300 C110 360 170 410 215 480 C170 420 110 380 90 300 Z" fill="#fff" opacity="0.16" />

      {/* crystals */}
      <g>
        <polygon points="268,214 280,118 304,92 326,122 336,214" fill="url(#isl-crys)" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.5" />
        <polygon points="304,92 302,214" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="1.5" />
        <polygon points="334,214 350,146 372,152 376,214" fill="url(#isl-crys)" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.5" />
        <polygon points="228,214 240,156 258,144 266,214" fill="url(#isl-crys)" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.5" />
        <path d="M284 130 L292 200" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      </g>

      {/* stems + ferns */}
      <g fill="none" stroke="#4f7a3a" strokeWidth="3" strokeLinecap="round">
        <path d="M150 208 C146 188 150 172 148 156" />
        <path d="M208 204 C214 178 210 152 212 134" />
        <path d="M392 208 C398 192 396 178 396 168" />
        <path d="M426 216 C430 206 430 202 430 198" />
        <path d="M112 210 C110 204 110 200 110 198" />
        <path d="M176 206 C168 180 176 160 190 146" />
        <path d="M360 206 C366 184 380 170 396 164" />
      </g>
      <g fill="#6b8f3a">
        <ellipse cx="186" cy="150" rx="14" ry="5" transform="rotate(-50 186 150)" />
        <ellipse cx="172" cy="166" rx="13" ry="5" transform="rotate(-20 172 166)" />
        <ellipse cx="372" cy="176" rx="14" ry="5" transform="rotate(40 372 176)" />
        <ellipse cx="384" cy="190" rx="12" ry="4.5" transform="rotate(20 384 190)" />
      </g>

      {/* flowers */}
      <Flower x={148} y={152} r={28} petal="#f08fb0" core="#f7d36b" />
      <Flower x={212} y={128} r={23} petal="#f6a9c6" core="#f7d36b" n={9} />
      <Flower x={396} y={162} r={24} petal="#ffffff" core="#f2c94c" n={10} />
      <Flower x={430} y={192} r={15} petal="#b79ae0" core="#f7e08a" n={7} />
      <Flower x={110} y={194} r={13} petal="#f08fb0" core="#f7d36b" n={7} />

      {/* floating debris */}
      <g className={styles.deb1}>
        <path d="M120 490 l20 -12 l18 9 l-7 18 l-24 5 z" fill="#6c6a66" />
        <path d="M120 490 l20 -12 l-4 12 z" fill="#8f8c86" />
      </g>
      <g className={styles.deb2}>
        <path d="M382 470 l14 -9 l14 7 l-5 13 l-18 3 z" fill="#6c6a66" />
        <path d="M382 470 l14 -9 l-3 9 z" fill="#8f8c86" />
      </g>
    </svg>
  );
}

function Sparkle({ x, y, s, d }: { x: string; y: string; s: number; d: string }) {
  return (
    <span className={styles.sparkle} style={{ left: x, top: y, width: s, height: s, "--d": d } as CSSProperties}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 0 C12.6 7 17 11.4 24 12 C17 12.6 12.6 17 12 24 C11.4 17 7 12.6 0 12 C7 11.4 11.4 7 12 0 Z" />
      </svg>
    </span>
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

/* A glass card that holds one question */
function Card(props: { id: SecId; n: number; title: string; hint: string; done: boolean; active: boolean; children: ReactNode }) {
  const { id, n, title, hint, done, active, children } = props;
  return (
    <section
      id={`sec-${id}`}
      data-card={id}
      className={`${styles.card} ${active ? styles.cardActive : ""} ${done ? styles.cardDone : ""}`}
      aria-labelledby={`sec-${id}-title`}
    >
      <div className={styles.cardHead}>
        <span className={styles.cardNum} aria-hidden="true">{done ? "✓" : n}</span>
        <div>
          <h2 id={`sec-${id}-title`} className={styles.cardTitle}>{title}</h2>
          <p className={styles.cardHint}>{hint}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Choice(props: { color: string; title: string; note: string; on: boolean; dim?: boolean; onClick: () => void }) {
  const { color, title, note, on, dim, onClick } = props;
  return (
    <button
      type="button"
      className={`${styles.world} ${on ? styles.worldOn : ""} ${dim ? styles.worldDim : ""}`}
      style={{ "--c": color } as CSSProperties}
      aria-pressed={on}
      onClick={onClick}
    >
      <span className={styles.worldOrb} />
      <span className={styles.worldText}>
        <span className={styles.worldName}>{title}</span>
        <span className={styles.worldTag}>{note}</span>
      </span>
    </button>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={`${styles.chip} ${on ? styles.chipOn : ""}`} aria-pressed={on} onClick={onClick}>
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════ */
export default function RequestPage() {
  const rootRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const layoutRef = useRef<HTMLDivElement>(null);
  const previewColRef = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const winRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const publishRef = useRef<HTMLSpanElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const doneTitleRef = useRef<HTMLHeadingElement>(null);
  const honeyRef = useRef<HTMLInputElement>(null);
  const firstCatRef = useRef(true);

  const [catId, setCatId] = useState<CatId>("interior");
  const [form, setForm] = useState<FormState>(EMPTY);
  const [styleSeen, setStyleSeen] = useState(false);
  const [active, setActive] = useState<SecId>("world");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [entered, setEntered] = useState(false);
  const [rockOk, setRockOk] = useState(true);
  const [attempted, setAttempted] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});

  const cat = CATEGORIES.find((c) => c.id === catId) ?? CATEGORIES[0];
  const styleOpt = cat.styles[form.styleIdx];
  const tint = styleOpt.tint;
  const dark = !!styleOpt.dark;
  const done = status === "done";
  const sending = status === "sending";

  const errors = validate(form);
  const showErr = (k: Field) => (attempted || touched[k] ? errors[k] : undefined);
  const touch = (k: Field) => () => setTouched((t) => ({ ...t, [k]: true }));
  const errMsg = (k: Field) => {
    const m = showErr(k);
    return m ? <p id={`rq-err-${k}`} className={styles.fieldError} role="alert">{m}</p> : null;
  };

  const secDone = (id: SecId) => (id === "style" ? styleSeen && !!form.world : FIELDS[id].every((k) => !errors[k]));
  const doneCount = SECTIONS.filter((s) => secDone(s.id)).length;
  const progress = done ? 1 : doneCount / SECTIONS.length;

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (status === "error") setStatus("idle");
  };

  const toggle = (k: "features" | "languages", name: string) =>
    setForm((f) => ({ ...f, [k]: f[k].includes(name) ? f[k].filter((x) => x !== name) : [...f[k], name] }));

  /* Picking a world changes the screen at once; styles and features belong to the world */
  const pickCat = (id: CatId) => {
    const changed = id !== catId;
    if (changed) setCatId(id);
    setForm((f) => ({ ...f, world: id, ...(changed ? { styleIdx: 0, features: [] } : {}) }));
    if (changed) setStyleSeen(false);
  };

  const jump = (id: SecId) => {
    document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth", block: "center" });
  };

  const focusFirstInvalid = (id: SecId) => {
    document
      .getElementById(`sec-${id}`)
      ?.querySelector<HTMLElement>("input[aria-invalid='true'], [data-invalid='true'] button, button[aria-pressed]")
      ?.focus({ preventScroll: true });
  };

  const restart = () => {
    setStatus("idle");
    setForm(EMPTY);
    setCatId("interior");
    setStyleSeen(false);
    setAttempted(false);
    setTouched({});
    setActive("world");
    window.scrollTo({ top: 0, behavior: prefersReduced() ? "auto" : "smooth" });
  };

  const submit = async () => {
    if (sending) return;
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setAttempted(true);
      const first = SECTIONS.find((s) => FIELDS[s.id].some((k) => errs[k]));
      if (first) {
        jump(first.id);
        window.setTimeout(() => focusFirstInvalid(first.id), 500);
      }
      return;
    }
    /* Honeypot: bots fill the hidden field, people never see it */
    if (honeyRef.current?.value) {
      setStatus("done");
      return;
    }
    setStatus("sending");
    const payload = {
      category: cat.id,
      ...form,
      style: styleOpt.label,
      locale: typeof navigator !== "undefined" ? navigator.language : undefined,
      source: "request-page",
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
      setStatus("done");
    } catch {
      setStatus("error");
    } finally {
      window.clearTimeout(timer);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void submit();
  };

  /* ══════════ Entrance: one orchestrated moment (hero), then the cards settle in ══════════ */
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    if (!root) return;
    const reduce = prefersReduced();

    const ctx = gsap.context(() => {
      const arrows = heroRef.current?.querySelectorAll("[data-arrow]") ?? [];

      if (reduce) {
        gsap.set(arrows, { strokeDashoffset: 0 });
        setEntered(true);
        return;
      }

      gsap.timeline({ defaults: { ease: "power4.out" } })
        .fromTo("[data-hl]", { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.14 })
        .fromTo("[data-hf]", { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }, 0.45)
        /* The rock rises from below */
        .fromTo("[data-hart]", { y: 150, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 1.6, ease: "power3.out" }, 0.2)
        .fromTo(arrows, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" }, 1.4)
        .add(() => setEntered(true), 0.9);

      gsap.fromTo(
        previewRef.current,
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power3.out",
          scrollTrigger: { trigger: layoutRef.current, start: "top 85%", once: true } }
      );

      const cards = gsap.utils.toArray<HTMLElement>("[data-card]");
      gsap.set(cards, { opacity: 0, y: 60 });
      ScrollTrigger.batch(cards, {
        start: "top 92%",
        once: true,
        onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "power3.out" }),
      });

      /* Hero content drifts up and fades as you leave it; the island lags behind */
      gsap.to("[data-hero-inner]", {
        y: -60, opacity: 0.25, ease: "none",
        scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to("[data-hero-art]", {
        y: 90, ease: "none",
        scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: true },
      });

      /* Clouds drift at different speeds while you scroll */
      gsap.to("[data-par='1']", { y: -140, ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: true } });
      gsap.to("[data-par='2']", { y: -260, ease: "none",
        scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: true } });
    }, rootRef);

    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
    }
    return () => ctx.revert();
  }, []);

  /* ══════════ Hero: the rings, the rock and the sparkles follow the mouse at different depths ══════════ */
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || prefersReduced() || !window.matchMedia("(pointer: fine)").matches || !window.matchMedia("(min-width: 1001px)").matches) return;
    const layers = Array.from(hero.querySelectorAll<HTMLElement>("[data-depth]")).map((el) => ({
      d: Number(el.dataset.depth) || 0,
      x: gsap.quickTo(el, "x", { duration: 1.1, ease: "power3.out" }),
      y: gsap.quickTo(el, "y", { duration: 1.1, ease: "power3.out" }),
    }));
    const move = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      layers.forEach((l) => { l.x(-nx * l.d); l.y(-ny * l.d); });
    };
    const leave = () => layers.forEach((l) => { l.x(0); l.y(0); });
    hero.addEventListener("mousemove", move);
    hero.addEventListener("mouseleave", leave);
    return () => {
      hero.removeEventListener("mousemove", move);
      hero.removeEventListener("mouseleave", leave);
    };
  }, []);

  /* ══════════ Which card is in the middle of the screen drives the notes + rail ══════════ */
  useEffect(() => {
    if (done) return;
    gsap.registerPlugin(ScrollTrigger);
    const cards = gsap.utils.toArray<HTMLElement>("[data-card]", rootRef.current);
    const sts = cards.map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: "top 58%",
        end: "bottom 58%",
        onToggle: (self) => { if (self.isActive) setActive(el.dataset.card as SecId); },
      })
    );
    return () => sts.forEach((s) => s.kill());
  }, [done]);

  /* ══════════ Gentle mouse tilt on the screen (desktop + mouse only) ══════════ */
  useEffect(() => {
    const el = tiltRef.current;
    const col = previewColRef.current;
    if (!el || !col || prefersReduced() || !window.matchMedia("(pointer: fine)").matches || !window.matchMedia("(min-width: 1001px)").matches) return;
    gsap.set(el, { transformPerspective: 1200 });
    const rx = gsap.quickTo(el, "rotationX", { duration: 0.8, ease: "power3.out" });
    const ry = gsap.quickTo(el, "rotationY", { duration: 0.8, ease: "power3.out" });
    const move = (e: MouseEvent) => {
      const r = col.getBoundingClientRect();
      ry(((e.clientX - (r.left + r.width / 2)) / r.width) * 10);
      rx((-(e.clientY - (r.top + r.height / 2)) / r.height) * 6);
    };
    const leave = () => { rx(0); ry(0); };
    col.addEventListener("mousemove", move);
    col.addEventListener("mouseleave", leave);
    return () => {
      col.removeEventListener("mousemove", move);
      col.removeEventListener("mouseleave", leave);
    };
  }, []);

  /* ── Handwritten notes appear and the arrows draw themselves, every time the section changes ── */
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
    const tl = gsap.timeline({ delay: 0.15 });
    tl.fromTo(notes, { opacity: 0, y: 12, rotate: -3 },
        { opacity: 1, y: 0, rotate: 0, duration: 0.6, stagger: 0.18, ease: "power3.out" }, 0)
      .fromTo(arrows, { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 0.8, stagger: 0.18, ease: "power2.inOut" }, 0.25);
    return () => { tl.kill(); };
  }, [active, done, entered]);

  /* ── Changing world: the window does a small turn ── */
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

  /* ── FINALE (calm): the screen turns once, a publish bar sweeps under the address bar,
        LIVE lands and a light rain of confetti drifts down. ── */
  useEffect(() => {
    const pop = popRef.current;
    const badge = badgeRef.current;
    const pub = publishRef.current;
    const canvas = canvasRef.current;
    if (!pop || !badge || !pub || !canvas) return;
    const reduce = prefersReduced();

    if (done) {
      layoutRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      window.setTimeout(() => doneTitleRef.current?.focus({ preventScroll: true }), 50);
      if (reduce) {
        gsap.set(badge, { scale: 1 });
        gsap.set(pub, { scaleX: 1, opacity: 1 });
        return;
      }
      const fx = createConfetti(canvas, [cat.accent, tint, "#ffffff"]);
      const tl = gsap.timeline();
      tl.fromTo(pop, { rotationY: 0 },
          { rotationY: 360, transformPerspective: 1400, duration: 1.5, ease: "power3.inOut",
            onComplete: () => { gsap.set(pop, { rotationY: 0 }); } }, 0)
        .to(pop, { y: -16, scale: 1.03, duration: 1.1, ease: "elastic.out(1, 0.5)" }, 0.5)
        .fromTo(pub, { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: 1.0, ease: "power2.inOut" }, 1.4)
        .to(pub, { opacity: 0, duration: 0.6, ease: "power1.out" }, 2.5)
        .fromTo(badge, { scale: 0, rotate: -12 }, { scale: 1, rotate: 0, duration: 0.7, ease: "back.out(2)" }, 1.7);
      if (fx) tl.call(() => fx.rain(120), [], 1.5);
      return () => {
        tl.kill();
        fx?.stop();
      };
    }
    gsap.to(pop, { y: 0, scale: 1, duration: reduce ? 0 : 0.6, ease: "power3.out" });
    gsap.set(badge, { scale: 0 });
    gsap.set(pub, { scaleX: 0, opacity: 0 });
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ═══════════ Render ═══════════ */
  const first = form.name.trim().split(" ")[0];
  const brand = form.brand.trim();
  const slug = brand.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 16) || "yourbrand";
  const planP = (form.budget ? 0.5 : 0) + (form.timeline ? 0.5 : 0);
  const notes = done ? NOTES_DONE : NOTES[active];
  const secMeta = (id: SecId) => SECTIONS.find((s) => s.id === id)!;
  const num = (id: SecId) => SECTIONS.findIndex((s) => s.id === id) + 1;

  const card = (id: SecId, children: ReactNode) => (
    <Card id={id} n={num(id)} title={secMeta(id).title} hint={secMeta(id).hint} done={secDone(id)} active={active === id}>
      {children}
    </Card>
  );

  return (
    <main
      ref={rootRef}
      className={styles.page}
      style={{ "--accent": cat.accent, "--tint": tint } as CSSProperties}
    >
      <div className={styles.cloud1} data-par="1" aria-hidden="true">
        <Image src="/cloud3.webp" alt="" width={900} height={450} style={{ width: "100%", height: "auto" }} />
      </div>
      <div className={styles.cloud2} data-par="2" aria-hidden="true">
        <Image src="/cloud-slide.webp" alt="" width={900} height={450} style={{ width: "100%", height: "auto" }} />
      </div>
      <div className={styles.cloud3} data-par="1" aria-hidden="true">
        <Image src="/cloud3.webp" alt="" width={900} height={450} style={{ width: "100%", height: "auto" }} />
      </div>

      <canvas ref={canvasRef} className={styles.fx} aria-hidden="true" />

      {/* ═══ Hero: a big rock in the middle, the title on the left, quiet stats on the right ═══ */}
      {!done && (
        <header ref={heroRef} className={styles.hero}>
          {/* Decoration only */}
          <div data-hero-art className={styles.heroStage} aria-hidden="true">
            <div className={styles.rockDepth} data-depth="18">
              <div data-hart className={styles.rockWrap}>
                <div className={styles.glow} />
                <div className={styles.rockFloat}>
                  {rockOk ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className={styles.rockImg}
                      src="/request-rock2.webp"
                      alt=""
                      draggable={false}
                      onError={() => setRockOk(false)}
                    />
                  ) : (
                    <Island />
                  )}
                </div>
              </div>
            </div>

            <div className={styles.sparkLayer} data-depth="30">
              {HERO_SPARKS.map((s, i) => (
                <Sparkle key={i} {...s} />
              ))}
            </div>

            <div className={styles.mist} />
          </div>

          <div data-hero-inner className={styles.heroInner}>
            <h1 className={`${styles.title} ${styles.heroTitle}`}>
              <span className={styles.mask}><span data-hl className={`${styles.maskInner} ${styles.heroRequestTitle}`}>Request</span></span>
            </h1>

            <p data-hf className={styles.heroLead}>
              Answer seven short questions and watch your site take shape on the screen, live.
              We reply within 24 hours with a clear plan and a quote.
            </p>

            <div data-hf className={styles.heroActions}>
              <div className={styles.heroNote} aria-hidden="true">
                <span className={styles.heroNoteText}>it builds as you answer</span>
                <ArrowSvg dir="dr" />
              </div>
            </div>
          </div>

          <ul data-hf className={styles.heroStats} aria-label="What to expect">
            {HERO_STATS.map((s) => (
              <li key={s.label} className={styles.stat}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </li>
            ))}
          </ul>

          <span data-hf className={styles.scrollCue} aria-hidden="true">
            <span className={styles.scrollLine} />
            Scroll
          </span>
        </header>
      )}

      <div ref={layoutRef} className={`${styles.layout} ${done ? "" : styles.layoutAfterHero}`}>
        {/* ═══ The live website (sticky) ═══ */}
        <aside ref={previewColRef} className={styles.previewCol} aria-label="Live preview">
          <div className={styles.previewStick}>
            <div ref={previewRef} className={styles.previewStage}>
              <div ref={tiltRef} className={styles.tilt}>
                <div className={styles.winFloat}>
                  <div ref={popRef} className={styles.winPop}>
                    <div
                      ref={winRef}
                      className={styles.win}
                      data-dark={dark ? "true" : "false"}
                      data-done={done ? "true" : "false"}
                      data-live={done ? "true" : "false"}
                      role="img"
                      aria-label={`Live preview of your ${cat.name.toLowerCase()} website`}
                    >
                      <div className={styles.addrBar}>
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

                      <div className={styles.mHero}>
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
                        <div className={styles.mSkel} aria-hidden="true">
                          <i />
                          <i />
                        </div>
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

                      <div className={styles.metaRow}>
                        <span className={styles.metaChip}>{form.kind === "new" ? "New website" : "Redesign"}</span>
                        <span className={styles.metaChip}>{form.pages || "Pages"}</span>
                        <span className={styles.metaChip}>{form.languages.length ? form.languages.join(" · ") : "Languages"}</span>
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

                    <div key={`${active}-${done}`} ref={notesRef} className={styles.notes} aria-hidden="true">
                      {notes.map((n) => (
                        <div key={n.text} data-note className={styles.note} style={{ left: n.x }}>
                          <span className={styles.noteText}>{n.text}</span>
                          <ArrowSvg dir={n.arrow} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress: dots jump to a question, the bar fills as you answer */}
            {!done && (
              <>
                <nav className={styles.rail} aria-label="Request progress">
                  {SECTIONS.map((s, i) => {
                    const d = secDone(s.id);
                    const cur = active === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        className={`${styles.railItem} ${d ? styles.railDone : ""} ${cur ? styles.railCur : ""}`}
                        onClick={() => jump(s.id)}
                        aria-current={cur ? "step" : undefined}
                        aria-label={`Question ${i + 1}: ${s.label}${d ? " (answered)" : ""}`}
                      >
                        <span className={styles.railDot}>{d ? "✓" : i + 1}</span>
                        <span className={styles.railLabel}>{s.label}</span>
                      </button>
                    );
                  })}
                </nav>
                <div className={styles.track} aria-hidden="true">
                  <span className={styles.fill} style={{ transform: `scaleX(${progress})` }} />
                </div>
                <p className={styles.progressText} role="status" aria-live="polite">
                  {doneCount} of {SECTIONS.length} answered
                </p>
              </>
            )}
          </div>
        </aside>

        {/* ═══ The questions ═══ */}
        <div className={styles.formCol}>
          {done ? (
            <div className={`${styles.card} ${styles.doneCard}`}>
              <div className={styles.doneBadge} aria-hidden="true">✓</div>
              <h2 ref={doneTitleRef} tabIndex={-1} className={styles.doneTitle}>Request received</h2>
              <p className={styles.cardHint}>
                Thanks{first ? `, ${first}` : ""}. We are reviewing your {cat.name.toLowerCase()} request and will
                reach you at {form.channel === "Email" ? form.email.trim() : `${form.phone.trim()} (${form.channel})`} within 24 hours.
              </p>
              <ul className={styles.summary}>
                <li>{brand}</li>
                <li>{styleOpt.label}</li>
                <li>{form.pages}</li>
                <li>{form.features.length} features</li>
                <li>{form.budget}</li>
                <li>{form.timeline}</li>
              </ul>
              <div className={styles.doneActions}>
                <Link href="/" className={styles.ghostBtn}>Back to home</Link>
                <button type="button" className={styles.primary} onClick={restart}>Start another request</button>
              </div>
            </div>
          ) : (
            <form className={styles.form} onSubmit={onSubmit} noValidate aria-label="Website request">
              {/* 1 · World */}
              {card("world", (
                <div data-invalid={showErr("world") ? "true" : undefined}>
                  <div className={styles.worlds} role="group" aria-label="Your world">
                    {CATEGORIES.map((c) => (
                      <Choice
                        key={c.id}
                        color={c.accent}
                        title={c.name}
                        note={c.tagline}
                        on={form.world === c.id}
                        dim={!!form.world && form.world !== c.id}
                        onClick={() => pickCat(c.id)}
                      />
                    ))}
                  </div>
                  {errMsg("world")}
                </div>
              ))}

              {/* 2 · Style */}
              {card("style", (
                <div className={styles.worlds} role="group" aria-label="Visual style">
                  {cat.styles.map((s, i) => (
                    <Choice
                      key={s.label}
                      color={s.tint}
                      title={s.label}
                      note={s.note}
                      on={form.styleIdx === i}
                      onClick={() => { set("styleIdx", i); setStyleSeen(true); }}
                    />
                  ))}
                </div>
              ))}

              {/* 3 · Brand */}
              {card("brand", (
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="rq-brand">Brand name</label>
                  <input
                    id="rq-brand"
                    className={`${styles.input} ${styles.inputBig} ${showErr("brand") ? styles.inputErr : ""}`}
                    value={form.brand}
                    onChange={(e) => set("brand", e.target.value)}
                    onBlur={touch("brand")}
                    onFocus={() => setActive("brand")}
                    placeholder={cat.placeholder}
                    autoComplete="organization"
                    maxLength={60}
                    aria-invalid={showErr("brand") ? true : undefined}
                    aria-describedby={showErr("brand") ? "rq-err-brand" : undefined}
                  />
                  {errMsg("brand")}
                </div>
              ))}

              {/* 4 · Scope */}
              {card("scope", (
                <div className={styles.stack}>
                  <div className={styles.worlds2 + " " + styles.worlds} role="group" aria-label="Project type">
                    <Choice color={cat.accent} title="New website" note="Start fresh from scratch" on={form.kind === "new"} onClick={() => set("kind", "new")} />
                    <Choice color={cat.accent} title="Redesign my site" note="Refresh what you already have" on={form.kind === "redesign"} onClick={() => set("kind", "redesign")} />
                  </div>

                  {form.kind === "redesign" && (
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="rq-site">Your current website</label>
                      <input
                        id="rq-site"
                        className={`${styles.input} ${showErr("site") ? styles.inputErr : ""}`}
                        value={form.site}
                        onChange={(e) => set("site", e.target.value)}
                        onBlur={touch("site")}
                        placeholder="yourbrand.com"
                        inputMode="url"
                        autoComplete="url"
                        maxLength={120}
                        aria-invalid={showErr("site") ? true : undefined}
                        aria-describedby={showErr("site") ? "rq-err-site" : undefined}
                      />
                      {errMsg("site")}
                    </div>
                  )}

                  <div className={styles.field} data-invalid={showErr("pages") ? "true" : undefined}>
                    <span className={styles.label} id="rq-pages-label">How big is the site?</span>
                    <div className={styles.chips} role="group" aria-labelledby="rq-pages-label">
                      {PAGES.map((p) => (
                        <Chip key={p} on={form.pages === p} onClick={() => set("pages", p)}>{p}</Chip>
                      ))}
                    </div>
                    {errMsg("pages")}
                  </div>

                  <div className={styles.field} data-invalid={showErr("languages") ? "true" : undefined}>
                    <span className={styles.label} id="rq-lang-label">Languages</span>
                    <div className={styles.chips} role="group" aria-labelledby="rq-lang-label">
                      {LANGS.map((l) => (
                        <Chip key={l} on={form.languages.includes(l)} onClick={() => toggle("languages", l)}>{l}</Chip>
                      ))}
                    </div>
                    {errMsg("languages")}
                  </div>
                </div>
              ))}

              {/* 5 · Features */}
              {card("features", (
                <div className={styles.field} data-invalid={showErr("features") ? "true" : undefined}>
                  <div className={styles.chips} role="group" aria-label="Features">
                    {cat.features.map((ft) => (
                      <Chip key={ft} on={form.features.includes(ft)} onClick={() => toggle("features", ft)}>{ft}</Chip>
                    ))}
                  </div>
                  {showErr("features") ? errMsg("features") : (
                    <p className={styles.hint} aria-live="polite">
                      {form.features.length ? `${form.features.length} of ${cat.features.length} selected` : "Pick at least one"}
                    </p>
                  )}
                </div>
              ))}

              {/* 6 · Plan */}
              {card("plan", (
                <div className={styles.stack}>
                  <div className={styles.field} data-invalid={showErr("budget") ? "true" : undefined}>
                    <span className={styles.label} id="rq-budget-label">Your budget</span>
                    <div className={styles.chips} role="group" aria-labelledby="rq-budget-label">
                      {BUDGETS.map((b) => (
                        <Chip key={b} on={form.budget === b} onClick={() => set("budget", b)}>{b}</Chip>
                      ))}
                    </div>
                    {errMsg("budget")}
                  </div>
                  <div className={styles.field} data-invalid={showErr("timeline") && !showErr("budget") ? "true" : undefined}>
                    <span className={styles.label} id="rq-timeline-label">When do you need it?</span>
                    <div className={styles.chips} role="group" aria-labelledby="rq-timeline-label">
                      {TIMELINES.map((t) => (
                        <Chip key={t} on={form.timeline === t} onClick={() => set("timeline", t)}>{t}</Chip>
                      ))}
                    </div>
                    {errMsg("timeline")}
                  </div>
                </div>
              ))}

              {/* 7 · Contact */}
              {card("contact", (
                <div className={styles.stack}>
                  <div className={styles.row2}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="rq-name">Your name</label>
                      <input
                        id="rq-name"
                        className={`${styles.input} ${showErr("name") ? styles.inputErr : ""}`}
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                        onBlur={touch("name")}
                        placeholder="Full name"
                        autoComplete="name"
                        maxLength={80}
                        aria-invalid={showErr("name") ? true : undefined}
                        aria-describedby={showErr("name") ? "rq-err-name" : undefined}
                      />
                      {errMsg("name")}
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="rq-email">Email</label>
                      <input
                        id="rq-email"
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
                        aria-describedby={showErr("email") ? "rq-err-email" : undefined}
                      />
                      {errMsg("email")}
                    </div>
                  </div>

                  <div className={styles.row2}>
                    <div className={styles.field}>
                      <span className={styles.label} id="rq-channel-label">Best way to reach you</span>
                      <div className={styles.chips} role="group" aria-labelledby="rq-channel-label">
                        {CHANNELS.map((c) => (
                          <Chip key={c} on={form.channel === c} onClick={() => set("channel", c)}>{c}</Chip>
                        ))}
                      </div>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="rq-phone">
                        Phone / WhatsApp{form.channel === "Email" ? " (optional)" : ""}
                      </label>
                      <input
                        id="rq-phone"
                        className={`${styles.input} ${showErr("phone") ? styles.inputErr : ""}`}
                        type="tel"
                        inputMode="tel"
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        onBlur={touch("phone")}
                        placeholder="+20 100 000 0000"
                        autoComplete="tel"
                        maxLength={24}
                        aria-invalid={showErr("phone") ? true : undefined}
                        aria-describedby={showErr("phone") ? "rq-err-phone" : undefined}
                      />
                      {errMsg("phone")}
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="rq-notes">Anything else? (optional)</label>
                    <textarea
                      id="rq-notes"
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
                </div>
              ))}

              <div className={styles.submitRow}>
                {status === "error" && (
                  <p className={styles.error} role="alert">
                    We could not send your request. Check your connection and try again.
                  </p>
                )}
                <button type="submit" className={styles.primary} disabled={sending}>
                  {sending ? "Sending…" : status === "error" ? "Try again" : "Send request"}
                </button>
                <p className={styles.hint}>No spam. We only use your details to reply to this request.</p>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}