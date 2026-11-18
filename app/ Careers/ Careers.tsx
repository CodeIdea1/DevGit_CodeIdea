"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Careers.module.css";

/* ═══════════════════════════════════════════
   Content — edit copy here
   ═══════════════════════════════════════════ */
const APPLY_EMAIL = "careers@yourstudio.com"; // ← غيّره للإيميل الحقيقي

const mailto = (subject: string) =>
  `mailto:${APPLY_EMAIL}?subject=${encodeURIComponent(subject)}`;

type Role = {
  id: string;
  title: string;
  team: string;
  place: string;
  blurb: string;
  points: string[];
};

const ROLES: Role[] = [
  {
    id: "creative-dev",
    title: "Senior Creative Developer",
    team: "Engineering",
    place: "Cairo · Hybrid",
    blurb:
      "You turn static designs into living scenes. GSAP, Next.js and a sharp eye for easing are your daily tools.",
    points: [
      "Deep GSAP + ScrollTrigger experience, with work we can open",
      "Strong React / Next.js and performance habits",
      "WebGL or Three.js is a big plus",
    ],
  },
  {
    id: "motion",
    title: "Motion Designer",
    team: "Design",
    place: "Remote",
    blurb:
      "You storyboard how a website moves before a line of code exists, and hand developers motion they can build.",
    points: [
      "Fluent in After Effects, Figma and prototyping motion",
      "A reel that shows rhythm, restraint and taste",
      "Comfortable explaining timing and easing to developers",
    ],
  },
  {
    id: "art-director",
    title: "Art Director, Luxury",
    team: "Design",
    place: "Cairo · Hybrid",
    blurb:
      "You set the visual direction for premium brands: palette, type, imagery and the feeling of the whole experience.",
    points: [
      "5+ years leading visual direction for premium brands",
      "A clear point of view on typography and colour",
      "You can present and defend ideas to clients",
    ],
  },
  {
    id: "ui-ux",
    title: "UI / UX Designer",
    team: "Design",
    place: "Remote",
    blurb: "You design calm, clear interfaces that feel expensive and still convert.",
    points: [
      "Portfolio of complete websites, not only screens",
      "Strong Figma systems and responsive thinking",
      "You care about copy as much as layout",
    ],
  },
  {
    id: "producer",
    title: "Project Manager",
    team: "Delivery",
    place: "Cairo · Hybrid",
    blurb:
      "You keep ambitious projects calm, on time and on budget, so the team can stay in flow.",
    points: [
      "Experience running creative or web projects end to end",
      "Clear written and spoken English",
      "You protect the team's focus and the client's trust",
    ],
  },
];

const TEAMS = Array.from(new Set(ROLES.map((r) => r.team)));
const CHIP_POS = [
  { left: 13, top: 64 },
  { left: 68, top: 58 },
  { left: 41, top: 77 },
];

/* The beliefs: chapters of a horizontal conveyor */
const BELIEFS = [
  {
    id: "craft",
    n: "01",
    label: "Craft",
    mega: { value: 100, from: 0, suffix: "%" },
    unit: ["custom", "built"],
    title: ["Every pixel", "is argued over."],
    lead: "Nothing ships just because it was fast. We rework a detail until it feels inevitable.",
  },
  {
    id: "motion",
    n: "02",
    label: "Motion",
    mega: { value: 60, from: 0, suffix: "fps" },
    unit: ["always", "smooth"],
    title: ["Motion is our", "second language."],
    lead: "We write animation with GSAP, WebGL and patience, and tune every easing by feel.",
  },
  {
    id: "calm",
    n: "03",
    label: "Calm",
    mega: { value: 24, from: 0, suffix: "h" },
    unit: ["to reply", "to everyone"],
    title: ["Luxury is quiet.", "So are we."],
    lead: "Soft palettes, slow easings and room to breathe. We design for the eye, never against it.",
  },
  {
    id: "own",
    n: "04",
    label: "Ownership",
    mega: { value: 8, from: 0, suffix: "yrs" },
    unit: ["of craft,", "still learning"],
    title: ["You own it,", "start to launch."],
    lead: "A small senior team. You carry your work from the first sketch to launch day, with people behind you.",
  },
];

const STEPS = [
  { title: "Send your work", text: "A portfolio, a link or a reel. No long cover letter needed." },
  { title: "Have a conversation", text: "Thirty minutes about taste and how you think, not trivia." },
  { title: "Do a paid task", text: "A small, real brief. You are paid for it and get honest feedback." },
  { title: "Get your answer", text: "A clear decision within 48 hours of the final conversation." },
];

const MANIFESTO =
  "We build websites people remember. We look for people who sweat the easing curve, who treat every gradient as a decision, and who know that luxury is a feeling, not a template.";
const EMPHASIS = new Set(["remember.", "easing", "decision,", "feeling,"]);

const NOTE_ARROWS = {
  rd: "/arrow2.webp",
  dl: "/arrow-left.webp",
  ru: "/arrow-flip.webp",
} as const;

// أماكن ثابتة (مش random) عشان ميحصلش hydration mismatch
const PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  top: (i * 53 + 7) % 80,
  size: 3 + (i % 4) * 2,
  delay: -((i % 7) * 1.7),
  dur: 9 + (i % 5) * 2,
}));

/* Light → dark flood for the beliefs section */
const LIGHT = {
  backgroundColor: "rgb(219,230,238)",
  color: "rgb(29,39,46)",
  "--accent": "rgb(63,101,128)",
  "--gold": "rgb(166,134,74)",
};
const DARK = {
  backgroundColor: "rgb(29,39,46)",
  color: "rgb(233,238,242)",
  "--accent": "rgb(143,186,212)",
  "--gold": "rgb(214,186,126)",
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

/** A line that slides up from inside its own mask */
function Line({ children }: { children: React.ReactNode }) {
  return (
    <span className={styles.lineMask}>
      <span data-c-line className={styles.line}>
        {children}
      </span>
    </span>
  );
}

function Note({
  text,
  left,
  top,
  dir,
  rot,
}: {
  text: string;
  left: number;
  top: number;
  dir: keyof typeof NOTE_ARROWS;
  rot: number;
}) {
  const layout =
    dir === "dl" ? styles.noteCol : dir === "ru" ? styles.noteRowEnd : styles.noteRow;
  return (
    <div data-note className={styles.note} style={{ left: `${left}%`, top: `${top}%` }} aria-hidden="true">
      <div className={`${styles.noteIn} ${layout}`} style={{ transform: `rotate(${rot}deg)` }}>
        <span className={styles.noteText}>{text}</span>
        <img src={NOTE_ARROWS[dir]} alt="" draggable={false} className={styles.noteArrow} />
      </div>
    </div>
  );
}

/** Curly doodle arrow (draws itself) */
function CurlArrow({ flip = false }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 170 150" aria-hidden="true" style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <path
        data-c-draw
        pathLength={1}
        className={styles.doodle}
        d="M12 18 C 70 -6, 128 38, 86 66 C 48 88, 30 44, 82 44 C 120 44, 132 84, 128 112"
      />
      <path data-c-draw pathLength={1} className={styles.doodle} d="M108 96 L128 120 L150 98" />
    </svg>
  );
}

/** Starburst sticker with text */
function Burst({ top, bottom }: { top: string; bottom: string }) {
  const pts: string[] = [];
  const n = 14;
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? 96 : 78;
    const a = (Math.PI * i) / n - Math.PI / 2;
    pts.push(`${(100 + r * Math.cos(a)).toFixed(1)},${(100 + r * Math.sin(a)).toFixed(1)}`);
  }
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true">
      <polygon className={styles.burstFill} points={pts.join(" ")} />
      <text className={styles.burstText} x="100" y="94" fontSize="24">
        {top}
      </text>
      <text className={styles.burstText} x="100" y="136" fontSize="42">
        {bottom}
      </text>
    </svg>
  );
}

/** Positioned decoration: float (scroll parallax) > pop (entrance) > bob (idle) */
function Deco({
  className,
  float,
  tilt = 0,
  children,
}: {
  className: string;
  float?: number;
  tilt?: number;
  children: React.ReactNode;
}) {
  return (
    <div className={`${styles.deco} ${className}`} aria-hidden="true">
      <div data-c-float={float ?? 0}>
        <div data-c-pop style={{ transform: tilt ? `rotate(${tilt}deg)` : undefined }}>
          <div className={styles.bob}>{children}</div>
        </div>
      </div>
    </div>
  );
}

/** Manifesto words (used twice: inside the hero on desktop, standalone on mobile) */
function ManifestoText({ attr }: { attr: "data-word" | "data-lword" }) {
  return (
    <>
      {MANIFESTO.split(" ").map((w, i) => {
        const em = EMPHASIS.has(w);
        const extra: Record<string, string> = { [attr]: "" };
        if (em) extra["data-em"] = "";
        return (
          <span key={i} {...extra} className={`${styles.word} ${em ? styles.wordEm : ""}`}>
            {w}
          </span>
        );
      })}
    </>
  );
}

/* One open-role row */
function RoleRow({
  role,
  index,
  isOpen,
  onToggle,
}: {
  role: Role;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const lines = Array.from(panel.querySelectorAll("[data-rl]"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.killTweensOf([panel, ...lines]);

    if (isOpen) {
      gsap.set(panel, { visibility: "visible" });
      if (reduce) {
        gsap.set(panel, { height: "auto" });
        gsap.set(lines, { yPercent: 0 });
        ScrollTrigger.refresh();
        return;
      }
      gsap.set(lines, { yPercent: 145 });
      gsap.to(panel, {
        height: "auto",
        duration: 1,
        ease: "power3.inOut",
        onComplete: () => ScrollTrigger.refresh(),
      });
      gsap.to(lines, { yPercent: 0, duration: 1.1, ease: "power4.out", stagger: 0.09, delay: 0.3 });
    } else {
      if (reduce) {
        gsap.set(panel, { height: 0, visibility: "hidden" });
        ScrollTrigger.refresh();
        return;
      }
      gsap.to(lines, { yPercent: 145, duration: 0.45, ease: "power2.in", stagger: { each: 0.04, from: "end" } });
      gsap.to(panel, {
        height: 0,
        duration: 0.9,
        ease: "power3.inOut",
        delay: 0.12,
        onComplete: () => {
          gsap.set(panel, { visibility: "hidden" });
          ScrollTrigger.refresh();
        },
      });
    }
  }, [isOpen]);

  return (
    <li data-role className={`${styles.role} ${isOpen ? styles.roleOpen : ""}`}>
      <button
        type="button"
        className={styles.roleHead}
        aria-expanded={isOpen}
        aria-controls={`role-${role.id}`}
        onClick={onToggle}
      >
        <span className={styles.roleIdx}>{String(index + 1).padStart(2, "0")}</span>
        <span className={styles.roleTitle}>{role.title}</span>
        <span className={styles.roleMeta}>
          {role.team} · {role.place}
        </span>
        <span className={styles.plus} aria-hidden="true" />
      </button>

      <div id={`role-${role.id}`} ref={panelRef} className={styles.panel} role="region" aria-hidden={!isOpen}>
        <div className={styles.panelBody}>
          <div className={styles.pCol}>
            <div className={styles.rlMask}>
              <p data-rl className={`${styles.rlIn} ${styles.roleBlurb}`}>
                {role.blurb}
              </p>
            </div>
            <div className={styles.rlMask}>
              <a
                data-rl
                className={`${styles.rlIn} ${styles.apply}`}
                href={mailto(`Application — ${role.title}`)}
                tabIndex={isOpen ? 0 : -1}
              >
                Apply for this role
              </a>
            </div>
          </div>
          <ul className={styles.rolePoints}>
            {role.points.map((p) => (
              <li key={p}>
                <div className={styles.rlMask}>
                  <span data-rl className={`${styles.rlIn} ${styles.pt}`}>
                    {p}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}

/* ═══════════════════════════════════════════
   BELIEFS — pinned horizontal conveyor (clean rebuild)
   Returns a cleanup function.
   ═══════════════════════════════════════════ */
function initBeliefs(section: HTMLElement): () => void {
  const sq = gsap.utils.selector(section);

  const stage = sq("[data-hzstage]")[0] as HTMLElement | undefined;
  const track = sq("[data-hztrack]")[0] as HTMLElement | undefined;
  const fill = sq("[data-rfill]")[0] as HTMLElement | undefined;
  const dot = sq("[data-rdot]")[0] as HTMLElement | undefined;
  const chapters = sq("[data-chapter]") as HTMLElement[];
  const labels = sq("[data-rlabel]") as HTMLElement[];
  if (!stage || !track || !fill || !dot || !chapters.length) return () => {};

  // 1) switch the section into "motion" layout first
  section.setAttribute("data-motion", "true");

  const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

  // 2) initial states
  gsap.set(stage, LIGHT);
  chapters.forEach((ch) => {
    const cq = gsap.utils.selector(ch);
    gsap.set(cq("[data-c-line]"), { yPercent: 145 });
    gsap.set(cq("[data-c-reveal]"), { opacity: 0, y: 24 });
    gsap.set(cq("[data-c-pop]"), { scale: 0.4, rotation: -12, opacity: 0, transformOrigin: "50% 50%" });
    gsap.set(cq("[data-c-draw]"), { strokeDasharray: 1, strokeDashoffset: 1 });
    (cq("[data-c-count]") as HTMLElement[]).forEach((el) => {
      el.textContent = el.dataset.from ?? "0";
    });
  });

  // 3) horizontal scroll
  const scroll = gsap.to(track, {
    x: () => -distance(),
    ease: "none",
    scrollTrigger: {
      trigger: stage,
      start: "top top",
      end: () => `+=${distance()}`,
      pin: true,
      pinSpacing: true,
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        gsap.set(fill, { scaleX: self.progress });
        gsap.set(dot, { left: `${self.progress * 100}%` });
      },
    },
  });

  // 4) per-chapter entrance timeline (plays when the chapter enters, reverses when it leaves back)
  chapters.forEach((ch, i) => {
    const cq = gsap.utils.selector(ch);
    const tl = gsap.timeline({ paused: true });

    tl.to(cq("[data-c-line]"), { yPercent: 0, duration: 1, stagger: 0.09, ease: "power4.out" }, 0)
      .to(cq("[data-c-reveal]"), { opacity: 1, y: 0, duration: 1, stagger: 0.12, ease: "power3.out" }, 0.45)
      .to(
        cq("[data-c-pop]"),
        { scale: 1, rotation: 0, opacity: 1, duration: 0.9, stagger: 0.14, ease: "back.out(1.3)" },
        0.5
      )
      .to(cq("[data-c-draw]"), { strokeDashoffset: 0, duration: 1.3, stagger: 0.25, ease: "power2.inOut" }, 0.9);

    (cq("[data-c-count]") as HTMLElement[]).forEach((el, k) => {
      const counter = { v: Number(el.dataset.from ?? 0) };
      tl.to(
        counter,
        {
          v: Number(el.dataset.cCount),
          duration: 1.8,
          ease: "power3.out",
          onUpdate: () => {
            el.textContent = String(Math.round(counter.v));
          },
        },
        0.35 + k * 0.15
      );
    });

    ScrollTrigger.create(
      i === 0
        ? { trigger: stage, start: "top 65%", onEnter: () => tl.play(), onLeaveBack: () => tl.reverse() }
        : {
            trigger: ch,
            containerAnimation: scroll,
            start: "left 85%",
            onEnter: () => tl.play(),
            onLeaveBack: () => tl.reverse(),
          }
    );

    // parallax for decorations
    (cq("[data-c-float]") as HTMLElement[]).forEach((el) => {
      const speed = Number(el.dataset.cFloat ?? 0);
      if (!speed) return;
      gsap.fromTo(
        el,
        { x: 160 * speed },
        {
          x: -160 * speed,
          ease: "none",
          scrollTrigger: {
            trigger: ch,
            containerAnimation: scroll,
            start: "left right",
            end: "right left",
            scrub: true,
          },
        }
      );
    });

    // active label in the rail
    ScrollTrigger.create({
      trigger: ch,
      containerAnimation: scroll,
      start: "left 60%",
      end: "right 60%",
      onToggle: (self) => {
        if (self.isActive) labels.forEach((l, k) => l.toggleAttribute("data-active", k === i));
      },
    });
  });
  labels[0]?.setAttribute("data-active", "");

  // 5) light → dark flood on the last chapter
  gsap.to(stage, {
    ...DARK,
    ease: "none",
    scrollTrigger: {
      trigger: chapters[chapters.length - 1],
      containerAnimation: scroll,
      start: "left 100%",
      end: "left 45%",
      scrub: true,
    },
  });

  const frame = window.requestAnimationFrame(() => ScrollTrigger.refresh());

  return () => {
    window.cancelAnimationFrame(frame);
    section.removeAttribute("data-motion");
  };
}

/* ═══════════════════════════════════════════
   Page
   ═══════════════════════════════════════════ */
export default function Careers() {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const manRef = useRef<HTMLElement>(null);
  const marqRef = useRef<HTMLDivElement>(null);
  const hzRef = useRef<HTMLElement>(null);
  const procRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);

  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    if (!root) return;
    const q = gsap.utils.selector(root);
    const mm = gsap.matchMedia();

    mm.add(
      {
        desk: "(min-width: 901px) and (prefers-reduced-motion: no-preference)",
        mob: "(max-width: 900px) and (prefers-reduced-motion: no-preference)",
      },
      (ctx) => {
        const { desk } = ctx.conditions as { desk: boolean; mob: boolean };
        const cleanups: Array<() => void> = [];

        /* ───────── 1. HERO: intro + pinned sunrise → manifesto emerges from inside the sun ───────── */
        gsap.from(q("[data-hero] [data-ch]"), {
          yPercent: 145,
          rotate: 6,
          opacity: 0,
          duration: 1.2,
          ease: "power4.out",
          stagger: 0.04,
          delay: 0.2,
        });
        gsap.from(q("[data-hero-fade]"), {
          opacity: 0,
          y: 20,
          duration: 1,
          ease: "power3.out",
          stagger: 0.15,
          delay: 0.9,
        });
        gsap.from(q("[data-note]"), {
          opacity: 0,
          y: 14,
          rotate: -3,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.25,
          delay: 1.3,
        });

        if (desk && heroRef.current) {
          // manifesto lives inside the hero on desktop (the standalone section is hidden via CSS)
          root.setAttribute("data-man-in-hero", "true");
          cleanups.push(() => root.removeAttribute("data-man-in-hero"));

          const layer = q("[data-man-layer]");
          const lwords = q("[data-lword]");
          gsap.set(layer, { autoAlpha: 0, scale: 0.86, transformOrigin: "50% 100%" });
          gsap.set(lwords, { opacity: 0.2 });

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: heroRef.current,
              start: "top top",
              end: "+=480%",
              pin: true,
              scrub: 0.8,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          tl.to(q("[data-l1]"), { xPercent: -80, duration: 1.3 }, 0)
            .to(q("[data-l2]"), { xPercent: 80, duration: 1.3 }, 0)
            .to(q("[data-hero-content]"), { opacity: 0, duration: 1 }, 0.2)
            .to(q("[data-hero-aux]"), { opacity: 0, duration: 0.5 }, 0)
            .to(q("[data-cloud-l]"), { xPercent: -35, duration: 2.6 }, 0)
            .to(q("[data-cloud-r]"), { xPercent: 35, duration: 2.6 }, 0)
            .fromTo(
              q("[data-sun]"),
              { yPercent: 60, scale: 0.5, opacity: 0 },
              { yPercent: -95, scale: 1, opacity: 1, duration: 1.4, ease: "power2.out" },
              0.1
            )
            .fromTo(
              q("[data-chip]"),
              { y: 160, opacity: 0 },
              { y: -30, opacity: 1, duration: 1.2, ease: "power2.out", stagger: 0.15 },
              0.3
            )
            .to(q("[data-chip]"), { opacity: 0, y: -120, duration: 0.6 }, 1.7)
            .to(q("[data-sun]"), { scale: 9, duration: 1.1, ease: "power2.in" }, 1.5)
            .to(q("[data-veil]"), { opacity: 1, duration: 0.7 }, 1.9)
            // the manifesto grows out of the flooded sun, right on top of the hero
            .to(layer, { autoAlpha: 1, scale: 1, duration: 0.9, ease: "power2.out" }, 2.3);

          // words light up one after another, inside the same pin
          lwords.forEach((w, i) => {
            const at = 2.9 + i * 0.07;
            tl.fromTo(w, { opacity: 0.2 }, { opacity: 1, duration: 0.6 }, at);
            if (w.hasAttribute("data-em")) {
              tl.fromTo(
                w,
                { color: "rgba(29,39,46,0)" },
                { color: "rgba(29,39,46,1)", duration: 0.6 },
                at + 0.15
              );
            }
          });
          tl.to({}, { duration: 0.4 }); // small rest at the end
        }

        /* ───────── 2. MANIFESTO (standalone, mobile / reduced layouts only) ───────── */
        if (!desk && manRef.current) {
          const mtl = gsap.timeline({
            scrollTrigger: {
              trigger: manRef.current,
              start: "top 75%",
              end: "bottom 60%",
              scrub: true,
            },
          });
          q("[data-word]").forEach((w, i) => {
            mtl.fromTo(w, { opacity: 0.2 }, { opacity: 1, duration: 1, ease: "none" }, i * 0.12);
            if (w.hasAttribute("data-em")) {
              mtl.fromTo(
                w,
                { color: "rgba(29,39,46,0)" },
                { color: "rgba(29,39,46,1)", duration: 0.9, ease: "none" },
                i * 0.12 + 0.2
              );
            }
          });
        }

        /* ───────── 3. MARQUEE ───────── */
        if (marqRef.current) {
          const marq = marqRef.current;
          q("[data-marq]").forEach((row, i) => {
            const travel = () => window.innerWidth * 0.22;
            gsap.fromTo(
              row,
              { x: () => (i % 2 ? -travel() : 0) },
              {
                x: () => (i % 2 ? 0 : -travel()),
                ease: "none",
                scrollTrigger: {
                  trigger: marq,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 1.2,
                  invalidateOnRefresh: true,
                },
              }
            );
          });
        }

        /* ───────── 4. BELIEFS ───────── */
        if (desk && hzRef.current) {
          cleanups.push(initBeliefs(hzRef.current));
        }

        /* ───────── 5. Section titles + fades ───────── */
        q("[data-reveal]").forEach((el) => {
          gsap.from(el.querySelectorAll("[data-ch]"), {
            yPercent: 145,
            opacity: 0,
            duration: 1,
            ease: "power4.out",
            stagger: 0.03,
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          });
        });
        q("[data-fade]").forEach((el) => {
          gsap.from(el, {
            y: 30,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
          });
        });

        /* ───────── 6. ROLES ───────── */
        const rows = q("[data-role]");
        gsap.set(rows, { opacity: 0, y: 50 });
        ScrollTrigger.batch(rows, {
          start: "top 92%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "power3.out" }),
        });

        /* ───────── 7. PROCESS ───────── */
        if (desk && procRef.current) {
          const steps = q("[data-step]");
          const nums = q("[data-num]");
          const dots = q("[data-dot]");
          gsap.set(steps, { opacity: 0.25, x: 16 });
          gsap.set(steps[0], { opacity: 1, x: 0 });
          gsap.set(nums, { opacity: 0, yPercent: 100 });
          gsap.set(nums[0], { opacity: 1, yPercent: 0 });

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: procRef.current,
              start: "top top",
              end: "+=300%",
              pin: true,
              scrub: 0.6,
              anticipatePin: 1,
            },
          });
          tl.fromTo(q("[data-line]"), { scaleY: 0.08 }, { scaleY: 1, duration: 3 }, 0).to(
            q("[data-warm]"),
            { opacity: 1, duration: 4 },
            0
          );
          dots.forEach((d, i) => {
            tl.to(d, { backgroundColor: "#2d76a5", scale: 1.25, duration: 0.3 }, i);
            if (i > 0) {
              tl.to(steps[i - 1], { opacity: 0.25, x: 16, duration: 0.5 }, i)
                .to(nums[i - 1], { yPercent: -100, opacity: 0, duration: 0.5 }, i)
                .to(steps[i], { opacity: 1, x: 0, duration: 0.5 }, i)
                .fromTo(nums[i], { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5 }, i);
            }
          });
          tl.to({}, { duration: 0.5 }, 3.5);
        }

        /* ───────── 8. CTA ───────── */
        const btn = btnRef.current;
        const cta = ctaRef.current;
        if (desk && cta) {
          const trig = { trigger: cta, start: "top bottom", end: "center center", scrub: true };
          gsap.fromTo(
            q("[data-cta-sun]"),
            { yPercent: 40, opacity: 0.3 },
            { yPercent: 0, opacity: 1, ease: "none", scrollTrigger: trig }
          );
          gsap.fromTo(
            q("[data-cta-ring]"),
            { scale: 0.75, opacity: 0 },
            { scale: 1, opacity: 1, ease: "none", stagger: 0.1, scrollTrigger: trig }
          );
        }
        if (desk && btn && cta) {
          const mx = gsap.quickTo(btn, "x", { duration: 0.5, ease: "power3" });
          const my = gsap.quickTo(btn, "y", { duration: 0.5, ease: "power3" });
          const move = (e: MouseEvent) => {
            const r = btn.getBoundingClientRect();
            mx((e.clientX - (r.left + r.width / 2)) * 0.3);
            my((e.clientY - (r.top + r.height / 2)) * 0.3);
          };
          const leave = () => {
            mx(0);
            my(0);
          };
          cta.addEventListener("mousemove", move);
          cta.addEventListener("mouseleave", leave);
          cleanups.push(() => {
            cta.removeEventListener("mousemove", move);
            cta.removeEventListener("mouseleave", leave);
          });
        }

        return () => cleanups.forEach((fn) => fn());
      }
    );

    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
    }

    return () => mm.revert();
  }, []);

  const marqItems = ROLES.map((r) => r.title);

  return (
    <div ref={rootRef} className={styles.page}>
      {/* ═══════════ HERO ═══════════ */}
      <section ref={heroRef} className={styles.hero} aria-labelledby="careers-title">
        <div className={styles.sunGlow} aria-hidden="true" />
        <div data-sun className={styles.sun} aria-hidden="true" />

        <div data-cloud-l className={styles.cloudL} aria-hidden="true">
          <img src="/cloud3.webp" alt="" />
        </div>
        <div data-cloud-r className={styles.cloudR} aria-hidden="true">
          <img src="/cloud-slide.webp" alt="" />
        </div>

        <div className={styles.particles} aria-hidden="true">
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className={styles.particle}
              style={
                {
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                  width: p.size,
                  height: p.size,
                  "--dur": `${p.dur}s`,
                  "--delay": `${p.delay}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        {/* glass chips: the teams, drifting up with the sun */}
        <div className={styles.chips} aria-hidden="true">
          {TEAMS.map((team, i) => (
            <span
              key={team}
              data-chip
              className={styles.chip}
              style={{ left: `${CHIP_POS[i % CHIP_POS.length].left}%`, top: `${CHIP_POS[i % CHIP_POS.length].top}%` }}
            >
              {team}
              <b>{ROLES.filter((r) => r.team === team).length}</b>
            </span>
          ))}
        </div>

        <div data-hero-content className={styles.heroContent}>
          <p data-hero-fade className={styles.heroKicker}>
            careers
          </p>
          <h1 id="careers-title" data-hero className={styles.heroTitle} aria-label="Join the craft">
            <span data-l1 className={styles.mask}>
              <Chars text="JOIN THE" />
            </span>
            <span data-l2 className={styles.mask}>
              <Chars text="CRAFT" />
            </span>
          </h1>
          <p data-hero-fade className={styles.heroSub}>
            We design luxury websites with motion nobody else dares to ship. If that sounds like
            you, there is a seat for you here.
          </p>
        </div>

        <div data-hero-aux className={styles.heroAux}>
          <Note text="we're hiring" left={13} top={27} dir="rd" rot={-6} />
          <Note text="no templates" left={76} top={24} dir="dl" rot={-8} />
          <Note text="bring your taste" left={17} top={72} dir="ru" rot={-4} />
          <div data-hero-fade className={styles.scrollHint} aria-hidden="true">
            <span>scroll</span>
            <i />
          </div>
        </div>

        <div data-veil className={styles.veil} aria-hidden="true" />

        {/* manifesto layer: emerges from the sun, on top of the hero (desktop only) */}
        <div data-man-layer className={styles.manLayer} aria-hidden="true">
          <div className={styles.orbA} />
          <div className={styles.orbB} />
          <div className={styles.manInner}>
            <p className={styles.manNote}>who we look for</p>
            <p className={styles.manText}>
              <ManifestoText attr="data-lword" />
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════ MANIFESTO (standalone fallback for mobile) ═══════════ */}
      <section ref={manRef} className={styles.man} aria-label="Who we look for">
        <div className={styles.orbA} aria-hidden="true" />
        <div className={styles.orbB} aria-hidden="true" />
        <div className={styles.manInner}>
          <p className={styles.manNote}>who we look for</p>
          <p className={styles.manText}>
            <ManifestoText attr="data-word" />
          </p>
        </div>
      </section>

      {/* ═══════════ MARQUEE ═══════════ */}
      <div ref={marqRef} className={styles.marq} aria-hidden="true">
        {[0, 1].map((r) => (
          <div key={r} data-marq className={`${styles.marqRow} ${r === 1 ? styles.marqFill : ""}`}>
            {[0, 1].map((h) => (
              <span key={h} className={styles.marqHalf}>
                {marqItems.map((t) => (
                  <span key={t + h} className={styles.marqItem}>
                    {t}
                    <em>✦</em>
                  </span>
                ))}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* ═══════════ BELIEFS ═══════════ */}
      <section ref={hzRef} className={styles.hz} aria-label="What we believe">
        <div data-hzstage className={styles.hzStage}>
          <div data-hztrack className={styles.hzTrack}>
            {/* ---- Intro chapter ---- */}
            <article data-chapter className={styles.chap}>
              <Deco className={styles.dBurstA} float={0.5} tilt={8}>
                <Burst top="Our" bottom="Way" />
              </Deco>
              <Deco className={`${styles.dArrow} ${styles.hideSm}`} float={0.25} tilt={-6}>
                <CurlArrow />
              </Deco>

              <div className={styles.chapInner}>
                <p className={styles.kicker}>
                  <span className={styles.kickerText}>
                    <Line>What we believe</Line>
                  </span>
                </p>
                <div className={styles.storyGrid}>
                  <h2 className={styles.bigTitle}>
                    <Line>Four beliefs.</Line>
                    <Line>
                      <em>One way</em>
                    </Line>
                    <Line>
                      of <em className={styles.titleGold}>working.</em>
                    </Line>
                  </h2>
                  <div className={styles.storySide}>
                    <p data-c-reveal className={styles.lead}>
                      These are not wall posters. They are the reasons we say no to some projects, redo others
                      twice, and keep the team small.
                    </p>
                    <div data-c-reveal className={styles.facts}>
                      {BELIEFS.map((b) => (
                        <div key={b.id}>
                          <strong>{b.label}</strong>
                          <span>{b.title.join(" ")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* ---- One chapter per belief ---- */}
            {BELIEFS.map((b, i) => (
              <article key={b.id} data-chapter className={styles.chap}>
                <Deco className={i % 2 === 0 ? styles.dBurstA : styles.dBurstB} float={0.45} tilt={i % 2 ? -8 : 8}>
                  <Burst top="Belief" bottom={b.n} />
                </Deco>
                <Deco className={`${styles.dArrow} ${styles.hideSm}`} float={0.25} tilt={-6}>
                  <CurlArrow flip={i % 2 === 1} />
                </Deco>

                <div className={`${styles.chapInner} ${styles.scaleInner}`}>
                  <div className={styles.megaRow}>
                    <span className={styles.mega}>
                      <span data-c-count={b.mega.value} data-from={b.mega.from}>
                        {b.mega.value}
                      </span>
                      <i>{b.mega.suffix}</i>
                    </span>
                    <span className={styles.megaUnit}>
                      {b.unit.map((u) => (
                        <Line key={u}>{u}</Line>
                      ))}
                    </span>
                  </div>
                  <div className={styles.scaleText}>
                    <h2 className={styles.midTitle}>
                      {b.title.map((t, k) => (
                        <Line key={t}>{k === 1 ? <em>{t}</em> : t}</Line>
                      ))}
                    </h2>
                    <p data-c-reveal className={styles.lead}>
                      {b.lead}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.rail} aria-hidden="true">
            <div className={styles.labels}>
              {["Beliefs", ...BELIEFS.map((b) => b.label)].map((l) => (
                <span key={l} data-rlabel className={styles.label}>
                  {l}
                </span>
              ))}
            </div>
            <span className={styles.railTrack}>
              <span data-rfill className={styles.fill} />
              <span data-rdot className={styles.dot} />
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════ OPEN ROLES ═══════════ */}
      <section id="roles" className={styles.roles} aria-labelledby="roles-title">
        <div className={styles.rolesInner}>
          <p data-fade className={styles.rolesNote}>
            join the team
          </p>
          <h2 id="roles-title" data-reveal className={styles.rolesTitle} aria-label="Open roles">
            <span className={styles.mask}>
              <Chars text="Open roles" />
            </span>
          </h2>

          <ul className={styles.roleList}>
            {ROLES.map((r, i) => (
              <RoleRow
                key={r.id}
                role={r}
                index={i}
                isOpen={open === r.id}
                onToggle={() => setOpen((o) => (o === r.id ? null : r.id))}
              />
            ))}
          </ul>
        </div>
      </section>

      {/* ═══════════ PROCESS ═══════════ */}
      <section ref={procRef} className={styles.proc} aria-labelledby="proc-title">
        <div data-warm className={styles.warm} aria-hidden="true" />
        <div className={styles.procGrid}>
          <div className={styles.procLeft}>
            <p className={styles.procNote}>how we hire</p>
            <h2 id="proc-title" className={styles.srOnly}>
              How we hire
            </h2>
            <div className={styles.bigWrap} aria-hidden="true">
              {STEPS.map((s, i) => (
                <div key={s.title} data-num className={styles.bigNum}>
                  <span className={styles.bigDigit}>{String(i + 1).padStart(2, "0")}</span>
                  <span className={styles.bigLabel}>{s.title}</span>
                </div>
              ))}
            </div>
          </div>

          <ol className={styles.steps}>
            <span className={styles.stepLine} aria-hidden="true" />
            <span data-line className={styles.stepLineFill} aria-hidden="true" />
            {STEPS.map((s) => (
              <li key={s.title} data-step className={styles.step}>
                <span data-dot className={styles.stepDot} aria-hidden="true" />
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepText}>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section ref={ctaRef} className={styles.cta} aria-labelledby="cta-title">
        <div className={styles.ctaSky} aria-hidden="true">
          <div data-cta-ring className={`${styles.ring} ${styles.ring1}`} />
          <div data-cta-ring className={`${styles.ring} ${styles.ring2}`} />
          <div data-cta-ring className={`${styles.ring} ${styles.ring3}`} />
          <div data-cta-sun className={styles.ctaSun} />
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className={styles.star}
              style={
                {
                  left: `${p.left}%`,
                  top: `${p.top * 0.7}%`,
                  width: p.size - 1,
                  height: p.size - 1,
                  "--dur": `${p.dur}s`,
                  "--delay": `${p.delay}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        <div className={styles.ctaInner}>
          <h2 id="cta-title" data-reveal className={styles.ctaTitle} aria-label="Your seat is waiting">
            <span className={styles.mask}>
              <Chars text="YOUR SEAT" />
            </span>
            <span className={styles.mask}>
              <Chars text="IS WAITING" />
            </span>
          </h2>
          <p data-fade className={styles.ctaSub}>
            Don&apos;t see your role? Send us your best work and tell us what you would build.
          </p>
          <div data-fade className={styles.ctaRow}>
            <a ref={btnRef} className={styles.ctaBtn} href={mailto("Open application")}>
              Send your work
            </a>
            <span className={styles.ctaNote}>
              <span>no cover letter needed</span>
              <img src="/arrow-flip.webp" alt="" draggable={false} />
            </span>
          </div>
          <a data-fade className={styles.ctaLink} href="/contact">
            Looking to hire us instead? Start a project
          </a>
        </div>
      </section>
    </div>
  );
}