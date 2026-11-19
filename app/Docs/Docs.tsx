"use client";
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Docs.module.css";

/* ═══════════════════════════════════════════
   Content: edit the docs here
   ═══════════════════════════════════════════ */
type Block =
  | { t: "p"; text: string }
  | { t: "note"; text: string }
  | { t: "steps"; items: { h: string; p: string }[] }
  | { t: "table"; head: string[]; rows: string[][] }
  | { t: "code"; file: string; code: string }
  | { t: "cards"; items: { h: string; p: string }[] }
  | { t: "checks"; items: string[] }
  | { t: "faq"; items: { q: string; a: string }[] };

interface Section {
  id: string;
  no: string;
  title: string;
  lead: string;
  blocks: Block[];
}

const SECTIONS: Section[] = [
  {
    id: "overview",
    no: "01",
    title: "Start here",
    lead: "We design and build luxury websites that feel calm to enter and impossible to forget. This guide explains how we work, what you get and how everything is built.",
    blocks: [
      { t: "p", text: "Every site we ship is custom: no templates, no page builders. We pair art direction with real engineering, so the motion you see in a prototype is the motion that goes live." },
      {
        t: "cards",
        items: [
          { h: "How we work", p: "Six stages, from a two-minute brief to launch day." },
          { h: "Design principles", p: "The rules behind our quiet, paper-folded look." },
          { h: "Motion system", p: "Named easings and durations your team can reuse." },
          { h: "What you receive", p: "Source code, design files and a handoff you can run alone." },
        ],
      },
      { t: "note", text: "short on time? read sections 02 and 07." },
    ],
  },
  {
    id: "process",
    no: "02",
    title: "How we work",
    lead: "A short, honest process. You always know what stage we are in and what comes next.",
    blocks: [
      {
        t: "steps",
        items: [
          { h: "Brief", p: "Seven short questions on the request page. We reply within 24 hours with a plan and a number." },
          { h: "Direction", p: "A moodboard, a palette and one typographic idea. You approve the feeling before we draw a single page." },
          { h: "Design", p: "Full-screen layouts in light and dark, desktop and phone, with every state of the key interactions." },
          { h: "Motion", p: "We prototype the hero and one signature moment first, then write the motion down as a system." },
          { h: "Build", p: "Next.js, TypeScript and GSAP. You get a private preview link that updates with every push." },
          { h: "Launch", p: "Performance pass, accessibility pass, analytics, redirects. Then we go live together." },
        ],
      },
    ],
  },
  {
    id: "principles",
    no: "03",
    title: "Design principles",
    lead: "Luxury is quiet. These rules keep every page calm, even when it moves.",
    blocks: [
      {
        t: "cards",
        items: [
          { h: "Remove until it feels almost too calm", p: "We start by deciding what to take out, then add back one detail." },
          { h: "One accent, used where people should act", p: "Mist for the surface, ink for text, a single accent for the button." },
          { h: "Folded paper, not glass", p: "Square edges, hairline rules and a dog-eared corner on every cover." },
          { h: "Photography carries the drama", p: "Layouts stay simple so hero imagery can do the heavy lifting." },
        ],
      },
      {
        t: "table",
        head: ["Token", "Value", "Used for"],
        rows: [
          ["Ink", "#1d272e", "Text, rules, primary buttons"],
          ["Mist", "#e9eef2", "Page surface"],
          ["Steel", "#2d76a5", "Links, accents, focus rings"],
          ["Sky", "#96c8e6", "Call-to-action fill"],
          ["Bronze", "#8a6f3d", "Handwritten notes"],
        ],
      },
    ],
  },
  {
    id: "motion",
    no: "04",
    title: "Motion system",
    lead: "Motion is part of the brand. We name every curve and duration so developers inherit decisions instead of guessing them.",
    blocks: [
      { t: "p", text: "Entrances arrive confidently and settle slowly. Exits leave quickly and without drama. Only transform and opacity move on scroll, so pages stay smooth on a mid-range phone." },
      {
        t: "table",
        head: ["Name", "Curve", "Duration", "Use"],
        rows: [
          ["reveal", "power4.out", "1.0 s", "Headings, masked characters"],
          ["clip", "power4.inOut", "1.4 s", "Cover images revealed bottom-up"],
          ["settle", "power3.out", "0.9 s", "Text blocks rising into place"],
          ["scrub", "none", "0.5–0.65", "Anything tied to scroll position"],
          ["sunrise", "power3.inOut", "1.15 s", "Opening a story or project"],
        ],
      },
      {
        t: "code",
        file: "motion/tokens.ts",
        code: `export const EASE = {
  reveal: "power4.out",
  clip: "power4.inOut",
  settle: "power3.out",
} as const;

// one element, one owner per property
gsap.from("[data-ch]", {
  yPercent: 145,
  skewY: 8,
  duration: 1,
  ease: EASE.reveal,
  stagger: 0.03,
  scrollTrigger: { trigger: el, start: "top 88%", once: true },
});`,
      },
      { t: "note", text: "slow down at the end, not at the start." },
    ],
  },
  {
    id: "stack",
    no: "05",
    title: "Tech stack",
    lead: "Small, proven tools, chosen so your team can keep building after we hand over.",
    blocks: [
      {
        t: "cards",
        items: [
          { h: "Next.js + TypeScript", p: "App router, server components where they help, typed content." },
          { h: "GSAP + ScrollTrigger", p: "Scrubbed timelines, pinned scenes, Flip for layout changes." },
          { h: "Lenis", p: "Smooth scrolling that stays in sync with every ScrollTrigger." },
          { h: "CSS Modules", p: "Scoped styles, design tokens as CSS variables." },
        ],
      },
      {
        t: "code",
        file: "terminal",
        code: `npm install
npm run dev      # localhost:3000
npm run build    # production build
npm run start    # serve the build`,
      },
    ],
  },
  {
    id: "quality",
    no: "06",
    title: "Performance and access",
    lead: "Beautiful has to be fast and usable. Every launch passes this list.",
    blocks: [
      {
        t: "checks",
        items: [
          "prefers-reduced-motion switches off pins, parallax and loops",
          "No pinned scenes on small screens: a calm stack instead",
          "Fixed seeds for decorative particles, so no hydration mismatch",
          "Images in WebP with explicit sizes; below-the-fold images load lazily",
          "No backdrop-filter and no large blurs on animated layers",
          "Visible keyboard focus and a focus trap inside every dialog",
          "Fonts ready before ScrollTrigger refreshes, so pins never drift",
        ],
      },
    ],
  },
  {
    id: "handoff",
    no: "07",
    title: "What you receive",
    lead: "You own everything we make. Handoff is part of the price, not an extra.",
    blocks: [
      {
        t: "table",
        head: ["Deliverable", "Format"],
        rows: [
          ["Source code", "Private Git repository"],
          ["Design files", "Layouts, components and states"],
          ["Motion guide", "Named tokens and usage notes"],
          ["Content guide", "How to edit stories, projects and pages"],
          ["Walkthrough", "A recorded session with your team"],
        ],
      },
      { t: "note", text: "thirty days of free fixes after launch." },
    ],
  },
  {
    id: "faq",
    no: "08",
    title: "Questions",
    lead: "Short answers to the things people ask before they start.",
    blocks: [
      {
        t: "faq",
        items: [
          { q: "How long does a project take?", a: "Most custom sites take four to eight weeks, depending on the number of signature moments and pages." },
          { q: "Do you use templates?", a: "No. We keep a small set of launch-ready templates for fast starts, but client work is always built from scratch." },
          { q: "Will it run well on phones?", a: "Yes. On small screens we drop pins and heavy effects, and keep the layout, type and imagery." },
          { q: "Can my team edit content later?", a: "Yes. Stories, projects and copy live in plain typed data files, and we document how to change them." },
          { q: "How do we start?", a: "Fill in the request form. It takes about two minutes, and we reply within a day with a plan and a quote." },
        ],
      },
    ],
  },
];

const pad = (n: number) => String(n).padStart(2, "0");
const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const blockText = (b: Block): string => {
  switch (b.t) {
    case "p":
    case "note": return b.text;
    case "code": return b.code;
    case "checks": return b.items.join(" ");
    case "steps":
    case "cards": return b.items.map((i) => `${i.h} ${i.p}`).join(" ");
    case "table": return [...b.head, ...b.rows.flat()].join(" ");
    case "faq": return b.items.map((i) => `${i.q} ${i.a}`).join(" ");
  }
};

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

function CodeBlock({ file, code }: { file: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };
  return (
    <figure data-fade className={styles.code}>
      <figcaption className={styles.codeBar}>
        <span>{file}</span>
        <button type="button" className={styles.copyBtn} onClick={copy} aria-live="polite">
          {copied ? "Copied" : "Copy"}
        </button>
      </figcaption>
      <pre tabIndex={0}><code>{code}</code></pre>
      <i className={styles.fold} aria-hidden="true" />
    </figure>
  );
}

function Faq({ items, base }: { items: { q: string; a: string }[]; base: string }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div data-fade className={styles.faq}>
      {items.map((it, i) => {
        const on = open === i;
        return (
          <div key={it.q} className={`${styles.faqItem} ${on ? styles.faqOn : ""}`}>
            <h4>
              <button
                type="button"
                className={styles.faqBtn}
                aria-expanded={on}
                aria-controls={`${base}-${i}`}
                onClick={() => setOpen(on ? null : i)}
              >
                <span>{it.q}</span>
                <i aria-hidden="true" />
              </button>
            </h4>
            <div id={`${base}-${i}`} className={styles.faqBody} role="region">
              <div><p>{it.a}</p></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BlockView({ b, sid }: { b: Block; sid: string }) {
  switch (b.t) {
    case "p":
      return <p data-fade className={styles.p}>{b.text}</p>;
    case "note":
      return (
        <p data-fade className={styles.note}>
          {b.text}
          <img src="/arrow2.webp" alt="" draggable={false} />
        </p>
      );
    case "steps":
      return (
        <ol data-fade className={styles.steps}>
          {b.items.map((s, i) => (
            <li key={s.h}>
              <span className={styles.stepNo}>{pad(i + 1)}</span>
              <div>
                <h4>{s.h}</h4>
                <p>{s.p}</p>
              </div>
            </li>
          ))}
        </ol>
      );
    case "cards":
      return (
        <div data-fade className={styles.cards}>
          {b.items.map((c) => (
            <article key={c.h} className={styles.cardItem}>
              <span className={styles.cardRule} aria-hidden="true" />
              <h4>{c.h}</h4>
              <p>{c.p}</p>
              <i className={styles.fold} aria-hidden="true" />
            </article>
          ))}
        </div>
      );
    case "table":
      return (
        <div data-fade className={styles.tableWrap} tabIndex={0}>
          <table className={styles.table}>
            <thead>
              <tr>{b.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr>
            </thead>
            <tbody>
              {b.rows.map((r) => (
                <tr key={r.join("|")}>
                  {r.map((c, i) => (i === 0 ? <th key={i} scope="row">{c}</th> : <td key={i}>{c}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "code":
      return <CodeBlock file={b.file} code={b.code} />;
    case "checks":
      return (
        <ul data-fade className={styles.checks}>
          {b.items.map((c) => <li key={c}>{c}</li>)}
        </ul>
      );
    case "faq":
      return <Faq items={b.items} base={`faq-${sid}`} />;
  }
}

/* ═══════════════════════════════════════════
   Page
   ═══════════════════════════════════════════ */
export default function Docs() {
  const rootRef = useRef<HTMLDivElement>(null);
  const progFillRef = useRef<HTMLSpanElement>(null);
  const progPlaneRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(SECTIONS[0].id);
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SECTIONS;
    return SECTIONS.filter((s) =>
      `${s.title} ${s.lead} ${s.blocks.map(blockText).join(" ")}`.toLowerCase().includes(q),
    );
  }, [query]);

  /* hero intro, parallax clouds, reading progress */
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    if (!root) return;
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(q("[data-hero] [data-ch]"), { yPercent: 115, duration: 1.3, ease: "power3.out", stagger: 0.05, delay: 0.2 });
      gsap.from(q("[data-hero-fade]"), { opacity: 0, y: 14, duration: 1.1, ease: "power2.out", stagger: 0.15, delay: 0.8 });
      gsap.from(q("[data-sheet]"), { clipPath: "inset(100% 0% 0% 0%)", duration: 1.5, ease: "power4.inOut", delay: 0.4 });

      const trig = { trigger: q("[data-hero-wrap]")[0], start: "top top", end: "bottom top", scrub: 0.6 };
      gsap.to(q("[data-cloud-l]"), { xPercent: -16, ease: "none", scrollTrigger: trig });
      gsap.to(q("[data-cloud-r]"), { xPercent: 16, ease: "none", scrollTrigger: trig });
      gsap.to(q("[data-hero-title]"), { yPercent: -14, ease: "none", scrollTrigger: trig });
    });

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (progFillRef.current) progFillRef.current.style.transform = `scaleX(${p})`;
      if (progPlaneRef.current) progPlaneRef.current.style.transform = `translate3d(${p * window.innerWidth}px,-50%,0) translateX(-50%)`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => {});

    return () => {
      window.removeEventListener("scroll", onScroll);
      mm.revert();
    };
  }, []);

  /* section reveals (re-run when the search changes the list) */
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    if (!root) return;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray<HTMLElement>("[data-sec]", root).forEach((sec) => {
        const rule = sec.querySelector("[data-rule]");
        const chars = sec.querySelectorAll("[data-sec-ch]");
        const tl = gsap.timeline({ scrollTrigger: { trigger: sec, start: "top 82%", once: true } });
        if (rule) tl.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: "power3.inOut", transformOrigin: "left center" }, 0);
        if (chars.length) tl.from(chars, { yPercent: 130, skewY: 6, duration: 1, ease: "power4.out", stagger: 0.025 }, 0.1);
      });
      gsap.utils.toArray<HTMLElement>("[data-fade]", root).forEach((el) => {
        gsap.from(el, { y: 26, opacity: 0, duration: 0.85, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 92%", once: true } });
      });
    });
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(raf);
      mm.revert();
    };
  }, [shown]);

  /* highlight the section being read */
  useEffect(() => {
    const els = shown.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [shown]);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth", block: "start" });
    setActive(id);
  };

  return (
    <div ref={rootRef} className={styles.page}>
      <div className={styles.progress} aria-hidden="true">
        <span ref={progFillRef} className={styles.progFill} />
        <span ref={progPlaneRef} className={styles.progPlane}><PaperPlane /></span>
      </div>

      {/* ═══════════ HERO ═══════════ */}
      <header data-hero-wrap className={styles.hero}>
        <div className={styles.sunGlow} aria-hidden="true" />
        <div data-cloud-l className={styles.cloudL} aria-hidden="true"><img src="/cloud3.webp" alt="" /></div>
        <div data-cloud-r className={styles.cloudR} aria-hidden="true"><img src="/cloud-slide.webp" alt="" /></div>

        <div data-hero-title className={styles.heroInner}>
          <p data-hero-fade className={styles.heroKicker}>the studio manual</p>
          <h1 data-hero className={styles.heroTitle} aria-label="Docs">
            <span className={styles.mask}><Chars text="DOCS" /></span>
          </h1>
          <p data-hero-fade className={styles.heroSub}>
            How we design, animate and build luxury websites, and how to work with what we hand over.
          </p>
          <button type="button" data-hero-fade className={styles.heroBtn} onClick={() => go(SECTIONS[0].id)}>
            Start reading <span aria-hidden="true">↓</span>
          </button>
        </div>

        <div data-sheet className={styles.heroFade} aria-hidden="true" />
      </header>

      {/* ═══════════ BODY ═══════════ */}
      <div className={styles.shell}>
        <aside className={styles.side} aria-label="Documentation menu">
          <label className={styles.search}>
            <span className={styles.srOnly}>Search the docs</span>
            <input
              type="search"
              value={query}
              placeholder="Search the docs"
              maxLength={60}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <nav>
            <ul className={styles.toc}>
              {shown.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={`${styles.tocLink} ${active === s.id ? styles.tocOn : ""}`}
                    aria-current={active === s.id ? "location" : undefined}
                    onClick={(e) => { e.preventDefault(); go(s.id); }}
                  >
                    <em>{s.no}</em>
                    <span>{s.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className={styles.main}>
          {shown.length === 0 && (
            <div className={styles.empty} role="status">
              <p className={styles.emptyNote}>nothing found</p>
              <p>No section matches “{query}”. Try a shorter word, like “motion” or “launch”.</p>
              <button type="button" className={styles.emptyBtn} onClick={() => setQuery("")}>Clear search</button>
            </div>
          )}

          {shown.map((s) => (
            <section key={s.id} id={s.id} data-sec className={styles.sec} aria-labelledby={`${s.id}-t`}>
              <span data-rule className={styles.secRule} aria-hidden="true" />
              <span className={styles.secNo} aria-hidden="true">{s.no}</span>
              <h2 id={`${s.id}-t`} className={styles.secTitle} aria-label={s.title}>
                <span className={styles.mask}>
                  {Array.from(s.title).map((c, i) => (
                    <span key={i} data-sec-ch className={styles.ch} aria-hidden="true">{c === " " ? "\u00A0" : c}</span>
                  ))}
                </span>
              </h2>
              <p data-fade className={styles.lead}>{s.lead}</p>
              {s.blocks.map((b, i) => <BlockView key={i} b={b} sid={s.id} />)}
            </section>
          ))}
        </main>
      </div>

      {/* ═══════════ CTA ═══════════ */}
      <section className={styles.cta} aria-labelledby="docs-cta">
        <i className={styles.ctaFold} aria-hidden="true" />
        <div className={styles.ctaSky} aria-hidden="true">
          <div className={`${styles.ring} ${styles.ring1}`} />
          <div className={`${styles.ring} ${styles.ring2}`} />
          <div className={styles.ctaSun} />
        </div>
        <div className={styles.ctaInner}>
          <div className={styles.ctaPlane} aria-hidden="true"><PaperPlane /></div>
          <h2 id="docs-cta" className={styles.ctaTitle}>Ready when you are</h2>
          <p className={styles.ctaSub}>Answer seven short questions and we reply within 24 hours with a plan and a quote.</p>
          <div className={styles.ctaRow}>
            <Link className={styles.ctaBtn} href="/request"><span>Request a quote</span><b aria-hidden="true">→</b></Link>
            <Link className={styles.ctaGhost} href="/contact">Talk to us</Link>
          </div>
        </div>
      </section>
    </div>
  );
}