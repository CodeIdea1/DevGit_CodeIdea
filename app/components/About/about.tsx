"use client";

import { useLayoutEffect, useRef } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { Caveat, Cormorant_Garamond, Michroma } from "next/font/google";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./about.module.css";
import heroStyles from "../HeroSection/HeroSection.module.css";
import { HERO_PARTICLES } from "../HeroSection/heroParticles";

gsap.registerPlugin(ScrollTrigger);

const hand = Caveat({ subsets: ["latin"], weight: ["500"] });
const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500"] });
const tech = Michroma({ subsets: ["latin"], weight: "400" });

/* word = the big word of the chapter; from/to = the counter; label = what the number means.
   Edit these freely. */
const SECTIONS = [
  {
    index: "Our Vision",
    title: "Premium web, made lighter",
    text: "We believe a website should feel calm to enter and impossible to forget. Everything we make starts from that feeling.",
    word: "Calm",
    from: 0,
    to: 1,
    label: "feeling behind every site",
  },
  {
    index: "Our Process",
    title: "Slow thinking, fast building",
    text: "A short discovery, a clear direction, then focused design and development sprints with you in the room.",
    word: "Craft",
    from: 0,
    to: 4,
    label: "steps from brief to launch",
  },
  {
    index: "Why Us",
    title: "Small team, full attention",
    text: "You work directly with the people designing and building your site. No hand-offs, no layers.",
    word: "Direct",
    from: 9,
    to: 0,
    label: "hand-offs between you and us",
  },
  {
    index: "Our Team",
    title: "Designers and engineers",
    text: "A tight group of designers, motion specialists and developers who like the details nobody asks about.",
    word: "People",
    from: 0,
    to: 3,
    label: "disciplines, one team",
  },
];

const pad = (n: number) => String(n).padStart(2, "0");

/* timeline units: 4 chapters, then the scene leaves and the dawn opens */
const STEP_T = 2.2;
const CH_END = SECTIONS.length * STEP_T;
const TOTAL = CH_END + 2.4;

export default function AboutPage() {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const texts = gsap.utils.toArray<HTMLElement>("[data-text]");
        const items = gsap.utils.toArray<HTMLElement>("[data-item]");
        const rows = gsap.utils.toArray<HTMLElement>("[data-row]");
        const stats = gsap.utils.toArray<HTMLElement>("[data-stat]");
        const nums = gsap.utils.toArray<HTMLElement>("[data-count]");
        const words = gsap.utils.toArray<HTMLElement>("[data-word]");
        const chars = rows.map((r) => Array.from(r.querySelectorAll<HTMLElement>("[data-ch]")));

        /* ---------- initial state ---------- */
        gsap.set(texts, { autoAlpha: 0, y: 30 });
        gsap.set(texts[0], { autoAlpha: 1, y: 0 });
        gsap.set(items, { opacity: 0.4, x: 0 });
        gsap.set(items[0], { opacity: 1, x: -14 });
        chars.forEach((c, i) => gsap.set(c, { yPercent: i === 0 ? 0 : 115 }));
        gsap.set(stats, { autoAlpha: 0, y: 20 });
        gsap.set(stats[0], { autoAlpha: 1, y: 0 });
        nums.forEach((n, i) => {
          n.textContent = String(i === 0 ? SECTIONS[0].to : SECTIONS[i].from);
        });
        gsap.set("[data-rule]", { scaleX: 1 / SECTIONS.length, transformOrigin: "left center" });
        gsap.set("[data-line]", { scaleY: 0, transformOrigin: "top center" });
        gsap.set("[data-dawn]", { "--dawn-radius": "0vmax" });
        gsap.set("[data-statement]", { autoAlpha: 0 });
        gsap.set("[data-drule]", { scaleX: 0, transformOrigin: "left center" });
        gsap.set("[data-kicker]", { autoAlpha: 0, y: 14 });
        gsap.set(words, { opacity: 0.16 });
        gsap.set("[data-pill]", { autoAlpha: 0, y: 20 });

        /* ---------- entrance ---------- */
        gsap.from(`.${styles.heading} span`, { yPercent: 110, duration: 1.1, stagger: 0.12, ease: "power3.out" });
        gsap.from(chars[0], { yPercent: 115, duration: 1.2, stagger: 0.07, ease: "power4.out", delay: 0.3 });
        gsap.from(stats[0], { autoAlpha: 0, y: 24, duration: 1, ease: "power3.out", delay: 0.7 });
        gsap.from("[data-cue]", { autoAlpha: 0, y: 10, duration: 1, ease: "power2.out", delay: 1.1 });
        const first = { v: 0 };
        nums[0].textContent = "0";
        gsap.to(first, {
          v: SECTIONS[0].to,
          duration: 1.4,
          delay: 0.8,
          ease: "power2.out",
          onUpdate: () => {
            nums[0].textContent = String(Math.round(first.v));
          },
        });

        /* ---------- one pinned scene ---------- */
        const chapterFr = SECTIONS.map((_, i) => (i * STEP_T) / TOTAL);
        const freeFrom = (CH_END - 0.6) / TOTAL;

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: `.${styles.pin}`,
            start: "top top",
            end: () => `+=${TOTAL * 70}%`,
            pin: true,
            scrub: 1.4,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            snap: {
              snapTo: (v: number) => (v > freeFrom ? v : gsap.utils.snap(chapterFr, v)),
              duration: { min: 0.35, max: 0.8 },
              ease: "power1.inOut",
            },
          },
        });

        /* continuous: the stage drifts and the progress line fills */
        tl.fromTo("[data-words]", { yPercent: 4 }, { yPercent: -4, duration: CH_END, ease: "none" }, 0)
          .to("[data-line]", { scaleY: 1, duration: CH_END, ease: "none" }, 0)
          .to("[data-cue]", { autoAlpha: 0, duration: 0.4 }, 0.2);

        /* chapter changes finish the outgoing content before revealing the next chapter */
        SECTIONS.forEach((s, i) => {
          if (i === 0) return;
          const at = i * STEP_T;
          const counter = { v: s.from };

          tl.to(texts[i - 1], { autoAlpha: 0, y: -18, duration: 0.7, ease: "power2.inOut" }, at + 0.12)
            .fromTo(
              texts[i],
              { autoAlpha: 0, y: 18 },
              { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.inOut" },
              at + 1.1
            )
            .to(items[i - 1], { opacity: 0.4, x: 0, duration: 0.3 }, at)
            .to(items[i], { opacity: 1, x: -14, duration: 0.35 }, at + 0.1)
            .to(
              chars[i - 1],
              { yPercent: -115, opacity: 0, duration: 0.75, stagger: 0.035, ease: "power3.inOut" },
              at + 0.12
            )
            .fromTo(
              chars[i],
              { yPercent: 115, opacity: 0 },
              { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.04, ease: "power3.out" },
              at + 1.1
            )
            .to(stats[i - 1], { autoAlpha: 0, y: -16, duration: 0.55, ease: "power2.inOut" }, at + 0.12)
            .fromTo(
              stats[i],
              { autoAlpha: 0, y: 16 },
              { autoAlpha: 1, y: 0, duration: 0.65, ease: "power2.inOut" },
              at + 1.1
            )
            .to(
              counter,
              {
                v: s.to,
                duration: 0.95,
                ease: "power2.inOut",
                onUpdate: () => {
                  nums[i].textContent = String(Math.round(counter.v));
                },
              },
              at + 1.1
            )
            .to("[data-rule]", { scaleX: (i + 1) / SECTIONS.length, duration: 0.8 }, at);
        });

        /* OUTRO — the dawn circle appears after the chapter scroll ends:
           1) the whole scene leaves
           2) one feathered circle grows to reveal the new sky
           3) the closing statement appears inside the circle as it enters */
        const dawnStart = CH_END + 0.15;
        tl.to("[data-outro]", { autoAlpha: 0, y: -30, duration: 0.6, stagger: 0.05, ease: "power2.in" }, CH_END)
          .to("[data-dawn]", { "--dawn-radius": "150vmax", duration: 1.7, ease: "power2.inOut" }, dawnStart)
          .to("[data-statement]", { autoAlpha: 1, duration: 0.2 }, dawnStart)
          .to("[data-drule]", { scaleX: 1, duration: 0.35, ease: "power3.out" }, dawnStart)
          .to("[data-kicker]", { autoAlpha: 1, y: 0, duration: 0.3, ease: "power3.out" }, dawnStart)
          .to(words, { opacity: 1, duration: 0.8, stagger: 0.08, ease: "none" }, dawnStart + 0.2)
          .to("[data-pill]", { autoAlpha: 1, y: 0, duration: 0.3 }, dawnStart);
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        el.dataset.motion = "reduce";
        return () => {
          delete el.dataset.motion;
        };
      });
    }, el);

    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
    }

    return () => ctx.revert();
  }, []);

  const statement = "We build calm, confident websites for ambitious brands, one careful detail at a time.".split(" ");

  return (
    <div ref={root} className={`${styles.page} ${serif.className}`}>
      <section className={styles.pin} aria-label="About us">
        <div className={styles.cols} aria-hidden="true" />

        <div className={heroStyles.particles} aria-hidden="true">
          {HERO_PARTICLES.map((p, i) => (
            <span
              key={i}
              className={heroStyles.particle}
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: p.size,
                height: p.size,
                "--dur": `${p.dur}s`,
                "--delay": `${p.delay}s`,
              } as CSSProperties}
            />
          ))}
        </div>

        <h1 data-outro className={styles.heading}>
          <span>About</span>
          <span>us</span>
        </h1>

        {/* the stage: one big word per chapter, plus a counting number. Pure type, no images. */}
        <div data-outro className={styles.stage} aria-hidden="true">
          <div data-words className={`${styles.words} ${tech.className}`}>
            {SECTIONS.map((s) => (
              <div key={s.word} data-row className={styles.row}>
                <span className={styles.mask}>
                  {Array.from(s.word).map((c, i) => (
                    <span key={i} data-ch className={styles.ch}>
                      {c}
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.ruleTrack}>
            <i data-rule className={styles.rule} />
          </div>

          <div className={styles.stats}>
            {SECTIONS.map((s, i) => (
              <div key={s.word} data-stat className={styles.stat}>
                <span data-count className={`${styles.count} ${tech.className}`}>
                  {s.to}
                </span>
                <span className={`${styles.statLabel} ${tech.className}`}>
                  <b>{pad(i + 1)}</b>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* text on the left, changes with the scroll */}
        <div data-outro className={styles.copy}>
          {SECTIONS.map((s) => (
            <div key={s.title} data-text className={styles.block}>
              <h2 className={styles.blockTitle}>{s.title}</h2>
              <p>{s.text}</p>
            </div>
          ))}
          <Link href="/request" className={`${styles.story} ${hand.className}`}>
            Our story
          </Link>
        </div>

        {/* scroll cue, bottom left */}
        <div data-outro data-cue className={`${styles.cue} ${tech.className}`} aria-hidden="true">
          <i />
          scroll
        </div>

        {/* index on the right with the progress line */}
        <div data-outro className={styles.indexWrap}>
          <ol className={`${styles.index} ${tech.className}`}>
            {SECTIONS.map((s, i) => (
              <li key={s.index} data-item>
                <span>{pad(i + 1)}</span>
                {s.index}
              </li>
            ))}
          </ol>
          <div className={styles.track} aria-hidden="true">
            <i data-line />
          </div>
        </div>

        {/* the dawn: a circle of light opens from the sun and becomes the sky for the closing statement */}
        <div data-dawn className={styles.dawn}>
          <div data-statement className={styles.statement}>
            <i data-drule className={styles.drule} aria-hidden="true" />
            <p data-kicker className={`${styles.kicker} ${hand.className}`}>
              what we believe
            </p>
            <p className={styles.statementText}>
              {statement.map((w, i) => (
                <span key={i} data-word>
                  {w}{" "}
                </span>
              ))}
            </p>
            <Link data-pill href="/careers" className={`${styles.pill} ${tech.className}`}>
              Join the team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}