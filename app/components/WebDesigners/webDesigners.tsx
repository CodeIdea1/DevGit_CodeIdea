"use client";

import { useLayoutEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Caveat, Michroma } from "next/font/google";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./page.module.css";

gsap.registerPlugin(ScrollTrigger);

const hand = Caveat({ subsets: ["latin"], weight: ["500"] });
const tech = Michroma({ subsets: ["latin"], weight: "400" });

const STEPS = [
  { label: "your idea", title: "It starts with one sentence", text: "Tell us what you want people to feel. We turn it into a clear direction before we draw anything." },
  { label: "layout", title: "Structure before style", text: "We lay out the page on glass first: sections, rhythm and hierarchy, so every choice has a reason." },
  { label: "your image", title: "Images that carry the story", text: "Photography, 3D and motion are chosen to match your brand, then placed where they matter." },
  { label: "clean code", title: "Built to be maintained", text: "Fast, accessible, readable code your team can extend long after launch." },
];

const HERO_LINES = ["Web designers", "who work", "above the noise"];

/* عنوان السيكشن الجديد: كل عنصر = سطر له container بـ overflow hidden */
const SEC_LINES = ["Not just websites.", "We build the", "entire experience."];

/* ---------- كارت الصورة بين الولد والبنت ----------
   x / y / w = نسب مئوية داخل الـ cluster
   r = زاوية الميلان النهائية
   z = ترتيب الطبقة داخل الـ cluster */
type Card = { id: string; src: string; x: number; y: number; w: number; r: number; z: number };

/* Keep one larger card as the focal image. */
const CARDS: Card[] = [
  { id: "c1", src: "/hoodie.png", x: 8, y: 14, w: 88, r: 25, z: 1 },
];

/* تخفيف زاوية الميلان عشان الشكل يبقى أهدى وأنظف */
const TILT = 0.55;

export default function WebDesignersPage() {
  const root = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        /* ---------- Hero intro: one orchestrated entrance ---------- */
        const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
        intro
          .from("[data-line]", { yPercent: 110, duration: 1.1, stagger: 0.12 })
          .from("[data-hero-sub]", { autoAlpha: 0, y: 16, duration: 0.8 }, "-=0.5")
          .from("[data-float]", { autoAlpha: 0, y: 36, scale: 0.9, duration: 1.2, stagger: 0.15 }, "-=1")
          .from("[data-hero-arrow]", { strokeDashoffset: 1, duration: 1, stagger: 0.2 }, "-=0.6")
          .from("[data-hero-note]", { autoAlpha: 0, duration: 0.6, stagger: 0.2 }, "<");

        /* ---------- Parallax: clouds and glass drift at different speeds ---------- */
        gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
          const trigger = el.closest(`.${styles.imgSection}`) ? `.${styles.imgSection}` : `.${styles.hero}`;
          gsap.to(el, {
            yPercent: parseFloat(el.dataset.speed || "0") * 100,
            ease: "none",
            scrollTrigger: { trigger, start: "top top", end: "bottom top", scrub: true },
          });
        });

        /* ---------- Image section: عنوان يدخل من الأسفل للأعلى سطر بسطر ---------- */
        gsap
          .timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: {
              trigger: `.${styles.layerSec}`,
              start: "top 70%",
              toggleActions: "play none none reverse",
            },
          })
          .from("[data-sec-line]", { yPercent: 110, duration: 1.1, stagger: 0.14 })
          .from("[data-sec-sub]", { autoAlpha: 0, y: 16, duration: 0.8 }, "-=0.5");

        /* ---------- كروت الصور: ظهور هادي — fade + حركة صغيرة لأعلى ---------- */
        const cards = gsap.utils.toArray<HTMLElement>("[data-card]");
        const floats = gsap.utils.toArray<HTMLElement>("[data-card-float]");

        if (cards.length) {
          // الزاوية النهائية لكل كارت (بنحطها بـ GSAP عشان ما يحصلش تعارض مع الـ transform)
          cards.forEach((el, i) => gsap.set(el, { rotation: CARDS[i].r * TILT, transformOrigin: "50% 50%" }));
          gsap.set(cards[0], { y: 0, scale: 1, autoAlpha: 1 });

          gsap
            .timeline({
              scrollTrigger: {
                trigger: `.${styles.cluster}`,
                start: "top 85%",
                toggleActions: "play none none reverse",
              },
            })
            .from(cards.slice(1), {
              // حركة قصيرة وناعمة، بدون سقوط ولا لفّ
              y: 28,
              scale: 0.96,
              autoAlpha: 0,
              duration: 1.1,
              ease: "power2.out",
              stagger: { each: 0.09, from: "start" },
            });

          // طفو هادي جداً وبطيء على الغلاف الداخلي (حركة رأسية صغيرة فقط)
          floats.forEach((el, i) => {
            gsap.to(el, {
              y: i % 2 ? -5 : 5,
              duration: 3.6 + (i % 4) * 0.5,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
              delay: i * 0.25,
            });
          });
        }

        /* ---------- Signature: pinned scroll builds the page layer by layer ---------- */
        const texts = gsap.utils.toArray<HTMLElement>("[data-step-text]");
        const layers = gsap.utils.toArray<HTMLElement>("[data-layer]");
        const notes = gsap.utils.toArray<HTMLElement>("[data-note]");
        const arrows = gsap.utils.toArray<SVGPathElement>("[data-arrow]");

        gsap.set(texts, { autoAlpha: 0, y: 30 });
        gsap.set(notes, { autoAlpha: 0 });
        gsap.set(layers, { autoAlpha: 0, y: 40, scale: 0.94 });
        gsap.set(arrows, { strokeDashoffset: 1 });

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: `.${styles.pin}`,
            start: "top top",
            end: () => `+=${STEPS.length * 78}%`,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            snap: { snapTo: "labels", duration: { min: 0.2, max: 0.5 }, ease: "power1.inOut" },
          },
        });

        STEPS.forEach((_, i) => {
          tl.addLabel(`s${i}`);
          if (i > 0) {
            tl.to(texts[i - 1], { autoAlpha: 0, y: -30, duration: 0.4 }, `s${i}`)
              .to(notes[i - 1], { autoAlpha: 0, duration: 0.3 }, `s${i}`);
          }
          tl.to(texts[i], { autoAlpha: 1, y: 0, duration: 0.5 }, `s${i}+=${i ? 0.2 : 0}`)
            .to(layers[i], { autoAlpha: 1, y: 0, scale: 1, duration: 0.6 }, `s${i}`)
            .to(notes[i], { autoAlpha: 1, duration: 0.3 }, `s${i}+=0.2`)
            .to(arrows[i], { strokeDashoffset: 0, duration: 0.5 }, `s${i}+=0.2`)
            .to(`.${styles.progress}`, { scaleX: (i + 1) / STEPS.length, duration: 0.6 }, `s${i}`)
            .to({}, { duration: 0.6 }); // dwell so each step can be read
        });
        tl.addLabel("end");

        /* ---------- CTA: glass panel rises into place ---------- */
        gsap.from(`.${styles.ctaPanel}`, {
          y: 80, autoAlpha: 0, duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: `.${styles.cta}`, start: "top 75%" },
        });
      });

      /* Reduced motion: show everything statically */
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-layer], [data-note]", { autoAlpha: 1 });
        gsap.set("[data-arrow], [data-hero-arrow]", { strokeDashoffset: 0 });
        gsap.set("[data-step-text]:not(:last-child)", { autoAlpha: 0 });
        gsap.set("[data-step-text]:last-child", { autoAlpha: 1 });
        gsap.utils.toArray<HTMLElement>("[data-card]").forEach((el, i) => gsap.set(el, { rotation: CARDS[i].r * TILT }));
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className={styles.page}>
      {/* ================= HERO ================= */}
      <section className={styles.hero}>
        <div className={styles.cloudBack} data-speed="0.12" aria-hidden />
        <div className={`${styles.glass} ${styles.floatA}`} data-float data-speed="-0.1" aria-hidden />
        <div className={`${styles.glass} ${styles.floatB}`} data-float data-speed="-0.2" aria-hidden />

        <h1 className={styles.title}>
          {HERO_LINES.map((l) => (
            <span key={l} className={styles.lineMask}>
              <span data-line className={styles.line}>{l}</span>
            </span>
          ))}
        </h1>
        <p data-hero-sub className={styles.sub}>
          A small team of designers building premium websites for brands that want to be remembered.
        </p>

        <span data-hero-note className={`${styles.note} ${styles.noteHero1} ${hand.className}`}>your brand</span>
        <svg className={styles.arrowHero1} viewBox="0 0 70 60" aria-hidden>
          <path data-hero-arrow pathLength={1} d="M4 6 C40 0, 62 18, 60 52 M60 52 l-8 -9 M60 52 l8 -8" />
        </svg>

        <div className={styles.cloudFront} data-speed="-0.06" aria-hidden />
        <Link href="/request" className={`${styles.pill} ${tech.className}`}>Start a project</Link>
      </section>

      {/* ================= IMAGE SECTION ================= */}
      <section className={styles.imgSection}>
        {/* طبقة 0: الخلفية */}
        <img
          src="/d-background.webp"
          alt=""
          className={styles.layerBack}
          aria-hidden="true"
        />

        <Image
          src="/d-tree2.webp"
          alt=""
          width={1349}
          height={1166}
          sizes="(max-width: 768px) 90vw, 52vw"
          className={styles.layerTree}
          aria-hidden="true"
        />

        {/* طبقة 2: سيكشن العنوان — وسط (بدل صورة WebDesigners-sec.png) */}
        <div className={styles.layerSec}>
          <div className={styles.secContent}>
            <h2 className={styles.secTitle}>
              {SEC_LINES.map((l) => (
                <span key={l} className={styles.secMask}>
                  <span data-sec-line className={styles.secLine}>{l}</span>
                </span>
              ))}
            </h2>
            <p data-sec-sub className={styles.secSub}>
              Strategy, design, motion and code, under one roof and one vision.
            </p>
          </div>
        </div>

        {/* طبقة 3: girl — أسفل وسط */}
        <img src="/girl-2.webp" alt="" className={styles.layerGirl} aria-hidden="true" />
        <img src="/girl-2-hand.webp" alt="" className={styles.layerGirlHand} aria-hidden="true" />

        {/* طبقة 5: مجموعة الصور بين الولد والبنت */}
        <div className={styles.cluster} aria-hidden="true">
          {CARDS.map((c) => (
            <div
              key={c.id}
              data-card
              className={styles.card}
              style={{ left: `${c.x}%`, top: `${c.y}%`, width: `${c.w * 0.75}%`, zIndex: c.z }}
            >
              <div data-card-float className={styles.cardInner}>
                <img src={c.src} alt="" draggable={false} />
              </div>
            </div>
          ))}
        </div>

        {/* طبقة 10: boy + hand — كونتينر واحد */}
        <div className={styles.boyWrap}>
          <img src="/boy.webp" alt="" className={styles.layerBoy} aria-hidden="true" />
        </div>

        {/* طبقة 20: hand — فوق كل شيء */}
        <img src="/hand.webp" alt="" className={styles.layerHand} aria-hidden="true" />
      </section>

      {/* ================= PINNED PROCESS ================= */}
      <section className={styles.pin}>
        <div className={styles.pinInner}>
          <div className={styles.copy}>
            {STEPS.map((s) => (
              <div key={s.title} data-step-text className={styles.step}>
                <h2>{s.title}</h2>
                <p>{s.text}</p>
              </div>
            ))}
            <div className={styles.track} aria-hidden>
              <div className={styles.progress} />
            </div>
          </div>

          <div className={styles.stage}>
            <div className={`${styles.glass} ${styles.window}`}>
              <div className={styles.dots} aria-hidden><i /><i /><i /></div>
              <div data-layer className={`${styles.layer} ${styles.lWire}`} />
              <div data-layer className={`${styles.layer} ${styles.lGrid}`}><b /><b /><b /></div>
              <div data-layer className={`${styles.layer} ${styles.lImage}`} />
              <div data-layer className={`${styles.layer} ${styles.lCode} ${tech.className}`}>
                <span>&lt;Hero /&gt;</span><span>&lt;Projects /&gt;</span><span>&lt;Contact /&gt;</span>
              </div>
            </div>

            {STEPS.map((s) => (
              <div key={s.label} data-note className={styles.noteWrap}>
                <span className={`${styles.note} ${hand.className}`}>{s.label}</span>
                <svg viewBox="0 0 70 60" aria-hidden>
                  <path data-arrow pathLength={1} d="M4 6 C40 0, 62 18, 60 52 M60 52 l-8 -9 M60 52 l8 -8" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className={styles.cta}>
        <div className={`${styles.glass} ${styles.ctaPanel}`}>
          <h2>Ready when you are.</h2>
          <p>Send us the idea. We will reply within two working days.</p>
          <Link href="/request" className={`${styles.pillDark} ${tech.className}`}>Request a project</Link>
        </div>
      </section>
    </div>
  );
}