"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import styles from "./Footer.module.css";

/* ══════════════════════════════════════════════
   المحتوى — غيّر كل البيانات دي ببياناتك الحقيقية
   ══════════════════════════════════════════════ */
const BRAND = "STUDIO";
const EMAIL = "hello@yourstudio.com";
const WHATSAPP = "201092849631";          // بالكود الدولي من غير +
const WHATSAPP_LABEL = "+20 1092849631";
const LOCATION = "Cairo, Egypt";
const TIMEZONE = "Africa/Cairo";

/* ── الجملة التفاعلية: العميل يضغط على الكلمات المميزة ويغيّرها ── */
const TYPES = ["a luxury online store", "a brand website", "a portfolio", "a landing page", "a web app"];
const VIBES = ["bold and cinematic", "calm and minimal", "playful and creative", "clean and corporate"];
const WHEN  = ["this month", "within two weeks", "in two to three months", "whenever it feels right"];

const TRUST = [
  { n: 24,  suffix: "h",    label: "to reply to every inquiry" },
  { n: 3,   suffix: " wks", label: "average time to launch"    },
  { n: 100, suffix: "%",    label: "custom built, no templates" },
];

const NAV = [
  { label: "Work",     href: "#work"     },
  { label: "Services", href: "#services" },
  { label: "About",    href: "#about"    },
  { label: "Contact",  href: "#contact"  },
];

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com/" },
  { label: "Behance",   href: "https://behance.net/"   },
  { label: "LinkedIn",  href: "https://linkedin.com/"  },
  { label: "Dribbble",  href: "https://dribbble.com/"  },
];

const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const measureChipTextWidth = (element: HTMLElement) =>
  Math.ceil(element.getBoundingClientRect().width) + 4;

/* ── كلمة قابلة للتبديل: الضغطة تطلّع الكلمة لفوق وتدخل اللي بعدها من تحت ── */
function Chip({
  options,
  label,
  onChange,
}: {
  options: string[];
  label: string;
  onChange: (value: string) => void;
}) {
  const [i, setI] = useState(0);
  const textRef  = useRef<HTMLSpanElement>(null);
  const maskRef  = useRef<HTMLSpanElement>(null);
  const ghostRef = useRef<HTMLSpanElement>(null);
  const first    = useRef(true);
  const busy     = useRef(false);
  const [maskW, setMaskW] = useState<number | undefined>(undefined);

  /* بعد أول render نقيس العرض الأولاني ونثبّته */
  useEffect(() => {
    if (textRef.current && maskW === undefined) {
      setMaskW(measureChipTextWidth(textRef.current));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* لما i يتغير: نقيس عرض الكلمة الجديدة من الـ ghost span الخفي */
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const el   = textRef.current;
    const ghost = ghostRef.current;
    if (!el || prefersReduced()) { busy.current = false; return; }

    /* نحدّث العرض للكلمة الجديدة قبل ما تظهر — الـ CSS transition يهتم بالانسياب */
    if (ghost) setMaskW(measureChipTextWidth(ghost));

    gsap.fromTo(
      el,
      { yPercent: 100, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 0.45, ease: "power3.out", onComplete: () => { busy.current = false; } }
    );
  }, [i]);

  const next = () => {
    if (busy.current) return;
    const n = (i + 1) % options.length;
    onChange(options[n]);
    if (prefersReduced() || !textRef.current) { setI(n); return; }
    busy.current = true;
    gsap.to(textRef.current, {
      yPercent: -100,
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => setI(n),
    });
  };

  return (
    <button
      type="button"
      data-f="seg"
      className={styles.chip}
      onClick={next}
      aria-label={`${label}: ${options[i]}. Press to change`}
    >
      {/* ghost: نص الاختيار الحالي، مخفي تماماً، لقياس عرضه */}
      <span
        ref={ghostRef}
        className={styles.chipText}
        aria-hidden="true"
        style={{
          position: "absolute",
          visibility: "hidden",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        {options[i]}
      </span>

      <span
        ref={maskRef}
        className={styles.chipMask}
        style={maskW !== undefined ? { width: maskW } : undefined}
      >
        <span ref={textRef} className={styles.chipText}>{options[i]}</span>
      </span>
      <i aria-hidden="true">↻</i>
    </button>
  );
}

export default function Footer() {
  const footerRef   = useRef<HTMLElement>(null);
  const panelRef    = useRef<HTMLDivElement>(null);
  const spotRef     = useRef<HTMLDivElement>(null);
  const zoneRef     = useRef<HTMLDivElement>(null);
  const ctaRef      = useRef<HTMLAnchorElement>(null);
  const ctaLabelRef = useRef<HTMLSpanElement>(null);
  const [time, setTime] = useState("");
  const [type, setType] = useState(TYPES[0]);
  const [vibe, setVibe] = useState(VIBES[0]);
  const [when, setWhen] = useState(WHEN[0]);
  const [name, setName] = useState("");

  /* نص البريف اللي هيتبعت (واتساب أو إيميل) */
  const brief =
    `Hi! I'd like ${type} with a ${vibe} feel, ready ${when}.` +
    (name.trim() ? ` My name is ${name.trim()}.` : "");

  const waHref   = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(brief)}`;
  const mailHref = `mailto:${EMAIL}?subject=${encodeURIComponent("New project")}&body=${encodeURIComponent(brief)}`;

  /* ساعة القاهرة */
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit", minute: "2-digit", hour12: false, timeZone: TIMEZONE,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 20_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    if (prefersReduced()) return;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanups: (() => void)[] = [];

    const ctx = gsap.context(() => {
      const footer = footerRef.current;
      const panel  = panelRef.current;
      if (!footer || !panel) return;

      const q = <T extends HTMLElement>(sel: string) =>
        Array.from(footer.querySelectorAll<T>(sel));

      /* 1) الفوتر يطلع ككارت بحواف دايرية ويتفرد مع السكرول (حركة هادية) */
      /* الـ panel بدون scale animation — يظهر بشكل طبيعي */
      gsap.set(panel, { borderTopLeftRadius: 0, borderTopRightRadius: 0});

      /* 2) الجملة تدخل كلمة كلمة، وبعدها باقي العناصر تظهر بهدوء */
      const segs = q("[data-f='seg']");
      gsap.set(segs, { y: 22, opacity: 0 });
      gsap.to(segs, {
        y: 0,
        opacity: 1,
        duration: 0.9,
        stagger: 0.09,
        ease: "power3.out",
        scrollTrigger: { trigger: footer, start: "top 55%", toggleActions: "play none none reverse" },
      });

      const fades = q("[data-f='fade']");
      gsap.set(fades, { y: 20, opacity: 0 });
      gsap.to(fades, {
        y: 0,
        opacity: 1,
        duration: 0.9,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: footer, start: "top 45%", toggleActions: "play none none reverse" },
      });

      /* 3) الأرقام تتعد مرة واحدة */
      q("[data-f='count']").forEach((el) => {
        const target = Number(el.dataset.n ?? 0);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.8,
          ease: "power3.out",
          onUpdate: () => { el.textContent = String(Math.round(obj.v)); },
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        });
      });

      q("[data-f='rule']").forEach((el) => {
        gsap.fromTo(
          el,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.2,
            ease: "power3.inOut",
            scrollTrigger: { trigger: el, start: "top 92%", toggleActions: "play none none reverse" },
          }
        );
      });

      /* 4) تفاعل الماوس (ديسكتوب فقط) */
      if (canHover) {
        /* سبوت لايت ناعم بيتبع الماوس */
        const spot = spotRef.current;
        if (spot) {
          gsap.set(spot, { xPercent: -50, yPercent: -50 });
          const sx = gsap.quickTo(spot, "x", { duration: 1.1, ease: "power3.out" });
          const sy = gsap.quickTo(spot, "y", { duration: 1.1, ease: "power3.out" });
          const onMove = (e: MouseEvent) => {
            const r = panel.getBoundingClientRect();
            sx(e.clientX - r.left);
            sy(e.clientY - r.top);
          };
          panel.addEventListener("mousemove", onMove, { passive: true });
          cleanups.push(() => panel.removeEventListener("mousemove", onMove));
        }

        /* زرار الواتساب بيميل ناحية الماوس */
        const zone  = zoneRef.current;
        const cta   = ctaRef.current;
        const label = ctaLabelRef.current;
        if (zone && cta && label) {
          const bx = gsap.quickTo(cta,   "x", { duration: 0.7, ease: "power3.out" });
          const by = gsap.quickTo(cta,   "y", { duration: 0.7, ease: "power3.out" });
          const lx = gsap.quickTo(label, "x", { duration: 0.7, ease: "power3.out" });
          const ly = gsap.quickTo(label, "y", { duration: 0.7, ease: "power3.out" });
          const onMove = (e: MouseEvent) => {
            const r = zone.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            bx(dx * 0.22); by(dy * 0.35);
            lx(dx * 0.08); ly(dy * 0.12);
          };
          const onLeave = () => { bx(0); by(0); lx(0); ly(0); };
          zone.addEventListener("mousemove", onMove);
          zone.addEventListener("mouseleave", onLeave);
          cleanups.push(() => {
            zone.removeEventListener("mousemove", onMove);
            zone.removeEventListener("mouseleave", onLeave);
          });
        }

      }
    }, footerRef);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, []);

  const backToTop = () => {
    gsap.to(window, { scrollTo: 0, duration: prefersReduced() ? 0 : 2, ease: "power4.inOut" });
  };

  const year = new Date().getFullYear();

  return (
    <footer ref={footerRef} id="contact" className={styles.footer}>
      <div ref={panelRef} className={styles.panel}>
        <div ref={spotRef} className={styles.spot} aria-hidden="true" />

        {/* ── الجزء الأساسي: الجملة التفاعلية ── */}
        <div className={styles.hero}>
          <p data-f="fade" className={styles.status}>
            <span className={styles.live} aria-hidden="true" />
            Now booking new projects
          </p>

          <h2 className={styles.sentence}>
            <span data-f="seg" className={styles.seg}>Hi! I&apos;d like</span>{" "}
            <Chip options={TYPES} label="Project type" onChange={setType} />{" "}
            <span data-f="seg" className={styles.seg}>with a</span>{" "}
            <Chip options={VIBES} label="Feel" onChange={setVibe} />{" "}
            <span data-f="seg" className={styles.seg}>feel, ready</span>{" "}
            <Chip options={WHEN} label="Timeline" onChange={setWhen} />
            <span data-f="seg" className={styles.seg}>. My name is</span>{" "}
            <input
              data-f="seg"
              className={styles.nameInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="your name"
              aria-label="Your name"
              maxLength={40}
              autoComplete="given-name"
              style={{ width: `${Math.max(9, name.length + 1)}ch` }}
            />
            <span data-f="seg" className={styles.seg}>.</span>
          </h2>

          <div data-f="fade" className={styles.actions}>
            <div ref={zoneRef} className={styles.zone}>
              <a
                ref={ctaRef}
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.cta}
              >
                <span ref={ctaLabelRef} className={styles.ctaLabel}>
                  Send on WhatsApp <i aria-hidden="true">↗</i>
                </span>
              </a>
            </div>
            <a href={mailHref} className={styles.ghost}>
              Or send by email
            </a>
          </div>

          <p data-f="fade" className={styles.note}>
            Press the highlighted words to shape your brief. Nothing is sent until you
            press the button, and we reply within a day.
          </p>
        </div>

        {/* ── ثقة هادية ── */}
        <ul className={styles.trust}>
          {TRUST.map((t) => (
            <li key={t.label} data-f="fade" className={styles.trustItem}>
              <span className={styles.tNum}>
                <span data-f="count" data-n={t.n}>0</span>
                <small>{t.suffix}</small>
              </span>
              <span className={styles.tLabel}>{t.label}</span>
            </li>
          ))}
        </ul>

        <span data-f="rule" className={styles.rule} />

        {/* ── روابط ── */}
        <div className={styles.grid}>
          <div className={styles.col}>
            <h3 className={styles.colTitle}>Talk to us</h3>
            <a href={`mailto:${EMAIL}`} className={styles.big}>{EMAIL}</a>
            <a
              href={`https://wa.me/${WHATSAPP}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.big}
            >
              {WHATSAPP_LABEL}
            </a>
          </div>

          <div className={styles.col}>
            <h3 className={styles.colTitle}>Explore</h3>
            {NAV.map((n) => (
              <a key={n.label} href={n.href} className={styles.link}>{n.label}</a>
            ))}
          </div>

          <div className={styles.col}>
            <h3 className={styles.colTitle}>Follow</h3>
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className={styles.link}>
                {s.label} <i aria-hidden="true">↗</i>
              </a>
            ))}
          </div>
        </div>

        {/* ── الشريط السفلي ── */}
        <div className={styles.bottom}>
          <span>© {year} {BRAND}</span>
          <span>{LOCATION}{time ? ` · ${time}` : ""}</span>
          <span className={styles.bottomLinks}>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </span>
          <button type="button" className={styles.topBtn} onClick={backToTop}>
            Back to top <i aria-hidden="true">↑</i>
          </button>
        </div>
      </div>
    </footer>
  );
}