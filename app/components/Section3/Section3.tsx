"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./Section3.module.css";

/* ── الصور الخمسة اللي بتتقص جوه طبقة الـ clip ── */
const SIDE_IMAGES = [
  { id: "rt", src: "/web-3.png", cls: "imgRightTop",    dir: "right"        },
  { id: "rb", src: "/cof.png",   cls: "imgRightBottom", dir: "right_bottom" },
  { id: "lt", src: "/web-3.png", cls: "imgLeftTop",     dir: "left"         },
  { id: "lb", src: "/gg.png",    cls: "imgLeftBottom",  dir: "left_bottom"  },
  { id: "tp", src: "/gg.png",    cls: "imgTop",         dir: "top"          },
] as const;

const BOTTOM_SRC = "/ccll.png";

/* نقطة بداية كل صورة (بالنسبة المئوية لحجم الصورة نفسها) */
const ENTER_FROM: Record<string, { xPercent: number; yPercent: number }> = {
  right:        { xPercent: 115,  yPercent: 0    },
  right_bottom: { xPercent: 115,  yPercent: 20   },
  left:         { xPercent: -115, yPercent: 0    },
  left_bottom:  { xPercent: -115, yPercent: 20   },
  top:          { xPercent: 0,    yPercent: -15  },
};

/* ── ضبط دخول الصور (كلهم مع بعض في نفس الوقت) ── */
const ENTER_START    = "top 70%";
const ENTER_END      = "top -30%";
const ENTER_SCRUB    = 1.4;
const ENTER_DURATION = 1;

/* ── حركة الـ parallax مع السكرول بعد الدخول ── */
const SIDE_SHIFT_VW = 4;
const TOP_SHIFT_VW  = 0;

/* ── المشاريع (لكل مشروع ثيم ألوان خاص) ── */
interface Project {
  id: string;
  name: string;
  src: string;
  category: string;
  /** لون التمييز الأساسي */
  accent: string;
  /** لون ثانوي للإضاءة في الخلفية */
  accent2: string;
  /** لون الخلفية الغامقة للمشروع */
  bg: string;
  /** لون النص/الأيقونة فوق لون الـ accent */
  onAccent: string;
  tagline: string;
  variants: { label: string; url: string }[];
}

const PROJECTS: Project[] = [
  {
    id: "coffee",
    name: "Coffee",
    src: "/coffee.webp",
    category: "Food & Beverage",
    accent: "#d9a066",   /* كراميل */
    accent2: "#8a5a3b",  /* بني قهوة */
    bg: "#16100b",       /* إسبريسو غامق */
    onAccent: "#1a0f08",
    tagline: "Warm, tactile storefronts for coffee brands, built to make every scroll smell a little better.",
    variants: [
      { label: "Caffinity",  url: "https://caffinity-omega.vercel.app/"  },
      { label: "VOG Coffee", url: "https://vog-coffee-fef9.vercel.app/" },
    ],
  },
  {
    id: "hoodie",
    name: "Hoodie",
    src: "/hoodie.webp",
    category: "Streetwear",
    accent: "#a58bff",   /* بنفسجي */
    accent2: "#6d3df0",  /* بنفسجي عميق */
    bg: "#0f0a1c",       /* بنفسجي داكن */
    onAccent: "#120828",
    tagline: "A streetwear experience with loud type, fast motion and a checkout that keeps up.",
    variants: [
      { label: "Hype Hood", url: "https://hype-hood.vercel.app/"   },
      { label: "Hoodie",    url: "https://hoodie-theta.vercel.app/" },
    ],
  },
  {
    id: "glasses",
    name: "Glasses",
    src: "/glasses.webp",
    category: "Eyewear",
    accent: "#8fe0f2",   /* سماوي لبني فاتح */
    accent2: "#3aa7c9",  /* سماوي أعمق */
    bg: "#08151c",       /* كحلي مخضر داكن */
    onAccent: "#04212b",
    tagline: "Clean, precise eyewear shopping where every frame gets the spotlight it deserves.",
    variants: [{ label: "Vision Craft", url: "https://vision-craft-pi.vercel.app/" }],
  },
];

/* ── محتوى الأوفرلاي ── */
const TITLE_LINES = ["WE CRAFT DIGITAL", "EXPERIENCES"];

const DESC_LINES = [
  "We design and build fast, modern websites",
  "that tell your story and turn visitors",
  "into loyal customers, from idea to launch.",
];

const STATS = [
  { value: "120+", label: "Projects delivered" },
  { value: "8",    label: "Years of experience" },
  { value: "60+",  label: "Happy clients"       },
  { value: "99%",  label: "Client satisfaction" },
];

/* ── ضبط الكونتينر السفلي ── */
const IMG_WIDTH_RATIO = 0.36;
const IMG_TOP_START = 0.36;
const IMG_TOP_END   = 0.66;
const CONTAINER_SCRUB = 0.4;
const BLEED = 2;

/* ── Pin وتبديل المشاريع ── */
const PIN_VH_PER_PROJECT = 0.8;
const TRANSITION = 0.5;

/* ── تحميل المواقع مسبقًا ── */
const WARM_IDLE_DELAY = 700;   /* بعد ما المشروع يثبت في السكرول */
const LOADER_FALLBACK = 3000;  /* أقصى وقت للـ poster */

const hostOf = (url: string) => {
  try { return new URL(url).host; } catch { return url; }
};

const keyOf = (p: number, v: number) => `${p}-${v}`;
const keysOfProject = (p: number) => PROJECTS[p].variants.map((_, v) => keyOf(p, v));

export default function Section3() {
  const sectionRef   = useRef<HTMLElement>(null);
  const clipLayerRef = useRef<HTMLDivElement>(null);
  const contentRef   = useRef<HTMLDivElement>(null);
  const growWrapRef  = useRef<HTMLDivElement>(null);
  const pinLayerRef  = useRef<HTMLDivElement>(null);
  const projLayerRef = useRef<HTMLDivElement>(null);
  const overlayRef   = useRef<HTMLDivElement>(null);
  const badgeRef     = useRef<HTMLDivElement>(null);
  const badgeNameRef = useRef<HTMLSpanElement>(null);

  /* ── عرض المشروع (Viewer) ── */
  const viewerRef     = useRef<HTMLDivElement>(null);
  const stageRef      = useRef<HTMLDivElement>(null);
  const screenRef     = useRef<HTMLDivElement>(null);
  const originRef     = useRef({ x: 0, y: 0 });
  const shownRef      = useRef(false);
  const closingRef    = useRef(false);
  const viewerOpenRef = useRef(false);
  const clickCountRef = useRef<Record<string, number>>({});
  const lastPRef      = useRef(0);
  const [viewer, setViewer] = useState<{ p: number; v: number } | null>(null);

  /* المواقع اللي اتعمل لها preload (بتفضل موجودة) + اللي خلصت تحميل */
  const [warm, setWarm]               = useState<string[]>([]);
  const [loadedKeys, setLoadedKeys]   = useState<string[]>([]);

  const viewerStateRef = useRef(viewer);
  viewerStateRef.current = viewer;

  const warmKeys = (keys: string[]) =>
    setWarm((prev) => {
      const add = Array.from(new Set(keys)).filter((k) => !prev.includes(k));
      return add.length ? [...prev, ...add] : prev;
    });

  const markLoaded = (k: string) =>
    setLoadedKeys((prev) => (prev.includes(k) ? prev : [...prev, k]));

  const closeViewer = () => {
    const root  = viewerRef.current;
    const stage = stageRef.current;
    if (!root || !stage || closingRef.current) return;
    closingRef.current = true;
    const { x, y } = originRef.current;
    const hide = `circle(0px at ${x}px ${y}px)`;

    gsap
      .timeline({
        onComplete: () => {
          closingRef.current = false;
          shownRef.current = false;
          setViewer(null);
        },
      })
      .to(
        root.querySelectorAll("[data-v='fade'], [data-v='chrome']"),
        { opacity: 0, y: -18, duration: 0.3, stagger: 0.03, ease: "power2.in" },
        0
      )
      .to(stage, { clipPath: hide, duration: 0.75, ease: "power3.inOut" }, 0.1)
      .to(root,  { clipPath: hide, duration: 0.75, ease: "power3.inOut" }, 0.26);
  };

  const selectVariant = (v: number) => {
    const s = viewerStateRef.current;
    if (!s || s.v === v) return;
    warmKeys([keyOf(s.p, v)]);
    setViewer({ ...s, v });
  };

  const cycleVariant = (d: number) => {
    const s = viewerStateRef.current;
    if (!s) return;
    const n = PROJECTS[s.p].variants.length;
    if (n < 2) return;
    selectVariant((s.v + d + n) % n);
  };

  /* preconnect لدومينات المواقع عشان الاتصال يبدأ بدري */
  useEffect(() => {
    const added: HTMLLinkElement[] = [];
    const hosts = new Set<string>();
    PROJECTS.forEach((p) =>
      p.variants.forEach((vr) => {
        try { hosts.add(new URL(vr.url).origin); } catch { /* ignore */ }
      })
    );
    hosts.forEach((origin) => {
      const l = document.createElement("link");
      l.rel = "preconnect";
      l.href = origin;
      l.crossOrigin = "anonymous";
      document.head.appendChild(l);
      added.push(l);
    });
    return () => added.forEach((l) => l.remove());
  }, []);

  /* حساب حجم/scale الـ iframe حسب عرض الإطار (ديسكتوب 1280 / موبايل 430) */
  useEffect(() => {
    const el = screenRef.current;
    if (!el) return;
    const apply = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      const fw = w < 560 ? 430 : 1280;
      const s = w / fw;
      el.style.setProperty("--fw", `${fw}px`);
      el.style.setProperty("--fh", `${h / s}px`);
      el.style.setProperty("--fs", String(s));
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* لو الموقع اتأخر، نشيل الـ poster بعد وقت قصير */
  useEffect(() => {
    if (!viewer) return;
    const k = keyOf(viewer.p, viewer.v);
    const t = window.setTimeout(() => markLoaded(k), LOADER_FALLBACK);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer?.p, viewer?.v]);

  /* قفل السكرول + أزرار الكيبورد أثناء فتح العرض */
  useEffect(() => {
    viewerOpenRef.current = viewer !== null;
    if (viewer === null) return;

    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape")     closeViewer();
      if (e.key === "ArrowRight") cycleVariant(1);
      if (e.key === "ArrowLeft")  cycleVariant(-1);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer === null]);

  /* أنيميشن فتح العرض + دخول المحتوى */
  useEffect(() => {
    if (!viewer) return;
    const root  = viewerRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;

    const q = (sel: string) => root.querySelectorAll<HTMLElement>(sel);
    let t = 0;

    if (!shownRef.current) {
      shownRef.current = true;
      const { x, y } = originRef.current;
      const r = Math.hypot(window.innerWidth, window.innerHeight) * 1.05;
      const from = `circle(0px at ${x}px ${y}px)`;
      const to   = `circle(${r}px at ${x}px ${y}px)`;

      gsap.fromTo(root,  { clipPath: from }, { clipPath: to, duration: 0.85, ease: "power3.inOut" });
      gsap.fromTo(stage, { clipPath: from }, { clipPath: to, duration: 0.85, ease: "power3.inOut", delay: 0.12 });

      gsap.fromTo(
        q("[data-v='chrome']"),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power3.out", delay: 0.6 }
      );
      t = 0.5;
    }

    const tl = gsap.timeline();
    tl
      .fromTo(
        q("[data-v='char']"),
        { yPercent: 115, rotate: 6 },
        { yPercent: 0, rotate: 0, duration: 0.8, stagger: 0.045, ease: "power4.out" },
        t
      )
      .fromTo(
        q("[data-v='fade']"),
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.65, stagger: 0.07, ease: "power3.out" },
        t + 0.1
      )
      .fromTo(
        q("[data-v='frame']"),
        { y: 80, rotateX: 12, scale: 0.94, opacity: 0, transformPerspective: 1200 },
        { y: 0, rotateX: 0, scale: 1, opacity: 1, duration: 0.95, ease: "expo.out" },
        t
      )
      .fromTo(
        q("[data-v='ghost']"),
        { xPercent: -8, opacity: 0 },
        { xPercent: 0, opacity: 1, duration: 1.2, ease: "power3.out" },
        t
      );

    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewer?.p, viewer === null]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    let warmTimer: number | undefined;

    const ctx = gsap.context(() => {
      const section   = sectionRef.current;
      const clipLayer = clipLayerRef.current;
      const growWrap  = growWrapRef.current;
      const projLayer = projLayerRef.current;
      const overlay   = overlayRef.current;
      const badge     = badgeRef.current;
      const badgeName = badgeNameRef.current;
      const pinLayer  = pinLayerRef.current;
      if (!section || !growWrap || !projLayer) return;

      /* ════════════════════════════════════════════
         1) دخول الصور الخمسة + parallax
         ════════════════════════════════════════════ */
      if (clipLayer) {
        const els = Array.from(clipLayer.querySelectorAll<HTMLElement>("[data-dir]"));

        const enter = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: {
            trigger: section,
            start: ENTER_START,
            end: ENTER_END,
            scrub: ENTER_SCRUB,
            invalidateOnRefresh: true,
          },
        });

        els.forEach((el) => {
          const from = ENTER_FROM[el.dataset.dir ?? "right"] ?? ENTER_FROM.right;
          enter.fromTo(
            el,
            { xPercent: from.xPercent, yPercent: from.yPercent },
            { xPercent: 0, yPercent: 0, duration: ENTER_DURATION },
            0
          );
        });

        els.forEach((el) => {
          const dir = el.dataset.dir ?? "";
          const isRight = dir === "right" || dir === "right_bottom";
          const isLeft  = dir === "left"  || dir === "left_bottom";
          const isTop   = dir === "top";

          gsap.fromTo(
            el,
            { x: 0, y: 0 },
            {
              x: () => {
                const vw = window.innerWidth / 100;
                if (isRight) return -SIDE_SHIFT_VW * vw;
                if (isLeft)  return  SIDE_SHIFT_VW * vw;
                return 0;
              },
              y: () => (isTop ? TOP_SHIFT_VW * (window.innerWidth / 100) : 0),
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: ENTER_START,
                end: "bottom top",
                scrub: 1,
                invalidateOnRefresh: true,
              },
            }
          );
        });
      }

      /* ════════════════════════════════════════════
         2) العنوان يظهر
         ════════════════════════════════════════════ */
      gsap.fromTo(
        contentRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 60%",
            end: "top 20%",
            scrub: 1,
          },
        }
      );

      /* ════════════════════════════════════════════
         3) الكونتينر السفلي + صور المشاريع
         ════════════════════════════════════════════ */
      const nextSection = section.nextElementSibling;
      const s4 =
        nextSection instanceof HTMLElement && nextSection.id === "section4"
          ? nextSection
          : null;

      const items    = Array.from(projLayer.querySelectorAll<HTMLElement>("[data-item]"));
      const imgs     = Array.from(projLayer.querySelectorAll<HTMLElement>("[data-img]"));
      const backdrop = growWrap.querySelector<HTMLElement>(`.${styles.containerTrack}`);
      const n        = PROJECTS.length;

      gsap.set(items, { opacity: 0, yPercent: 40, scale: 0.9 });
      if (items[0]) {
        gsap.set(items[0], { opacity: 1, yPercent: 0, scale: 1 });
        items[0].setAttribute("data-active", "true");
      }

      const dims = { w0: 1, h0: 1, w1: 1, h1: 1, l0: 0, t0: 0, x: 0, y: 0 };
      const st = { scroll: 0, hover: 0 };
      let lastP = 0;
      let projectIndex = 0;

      const measure = () => {
        const prev = growWrap.style.transform;
        growWrap.style.transform = "none";
        dims.w0 = growWrap.offsetWidth  || 1;
        dims.h0 = growWrap.offsetHeight || 1;
        dims.l0 = growWrap.offsetLeft;
        dims.t0 = growWrap.offsetTop;

        if (s4) {
          const wr = growWrap.getBoundingClientRect();
          const tr = s4.getBoundingClientRect();
          dims.w1 = Math.max(s4.offsetWidth,  document.documentElement.clientWidth) + BLEED * 2;
          dims.h1 = Math.max(s4.offsetHeight, window.innerHeight) + BLEED * 2;
          dims.x  = tr.left - wr.left - BLEED;
          dims.y  = tr.top  - wr.top  - BLEED;
        } else {
          dims.w1 = dims.w0;
          dims.h1 = dims.h0;
          dims.x = 0;
          dims.y = 0;
        }

        growWrap.style.transform = prev;
        projLayer.style.setProperty("--proj-w", `${dims.w1 * IMG_WIDTH_RATIO}px`);
      };

      const render = (p: number) => {
        lastP = p;
        const w  = dims.w0 + (dims.w1 - dims.w0) * p;
        const h  = dims.h0 + (dims.h1 - dims.h0) * p;
        const sx = w / dims.w0;
        const sy = h / dims.h0;

        growWrap.style.transform =
          `translate3d(${dims.x * p}px, ${dims.y * p}px, 0) scale(${sx}, ${sy})`;
        if (backdrop) backdrop.style.transform = `scaleY(${sx / sy})`;

        const t = Math.min(1, Math.max(0, (p - 0.45) / 0.45));
        st.scroll = t * t * (3 - 2 * t);
        const e = Math.max(st.scroll, st.hover);

        const size = dims.w1 * IMG_WIDTH_RATIO;
        const cx = dims.l0 + dims.x * p + w / 2;
        const cy =
          dims.t0 + dims.y * p +
          h * (IMG_TOP_START + (IMG_TOP_END - IMG_TOP_START) * p);
        const scale = (w / dims.w1) * (0.9 + 0.1 * e);
        const rise  = (1 - e) * 26;

        projLayer.style.opacity = String(e);
        projLayer.style.transform =
          `translate3d(${cx - size / 2}px, ${cy - size / 2 + rise}px, 0) scale(${scale})`;
      };

      measure();
      render(0);

      if (s4) {
        const proxy = { p: 0 };
        gsap.to(proxy, {
          p: 1,
          ease: "none",
          onUpdate: () => render(proxy.p),
          scrollTrigger: {
            trigger: section,
            start: "top top",
            endTrigger: s4,
            end: "top top",
            scrub: CONTAINER_SCRUB,
            invalidateOnRefresh: true,
            onRefreshInit: measure,
            onRefresh: () => render(proxy.p),
          },
        });
      }

      /* ── تحميل مسبق ذكي: بعد ما المشروع يثبت شوية ── */
      const scheduleWarm = (i: number, delay = WARM_IDLE_DELAY) => {
        window.clearTimeout(warmTimer);
        warmTimer = window.setTimeout(() => warmKeys(keysOfProject(i)), delay);
      };

      /* ── الأوفرلاي ── */
      let setOverlayVisibility: (show: boolean) => void = () => {};
      let overlayIsVisible = false;
      let overlayTimeline: gsap.core.Timeline | null = null;

      if (overlay) {
        const lines = overlay.querySelectorAll<HTMLElement>(
          '[data-anim="title-line"], [data-anim="desc-line"], [data-anim="cta"], [data-anim="stat-text"]'
        );
        const rules = overlay.querySelectorAll<HTMLElement>(
          '[data-anim="line"], [data-anim="stat-line"]'
        );

        gsap.set(lines, { yPercent: 110 });
        gsap.set(rules, { scaleX: 0 });
        overlay.style.visibility = "hidden";

        setOverlayVisibility = (show: boolean) => {
          if (show === overlayIsVisible) return;
          overlayIsVisible = show;
          overlay.style.visibility = show ? "visible" : "hidden";
          if (show) {
            scheduleWarm(projectIndex, 900);
            overlayTimeline = gsap
              .timeline()
              .to(lines, { yPercent: 0, duration: 0.8, stagger: 0.045, ease: "power3.out" })
              .to(rules, { scaleX: 1, duration: 0.65, stagger: 0.1, ease: "power2.out" }, "<0.15");
          } else {
            window.clearTimeout(warmTimer);
            overlayTimeline?.kill();
            gsap.set(lines, { yPercent: 110 });
            gsap.set(rules, { scaleX: 0 });
          }
        };
      }

      /* ════════════════════════════════════════════
         4) البادج + Hover + الضغط (على صور المشاريع نفسها)
         ════════════════════════════════════════════ */
      const applyBadgeText = (i: number) => {
        if (badgeName) badgeName.textContent = `${PROJECTS[i].name} project`;
        if (badge) {
          badge.style.setProperty("--badge-bg", PROJECTS[i].accent);
          badge.style.setProperty("--badge-fg", PROJECTS[i].onAccent);
        }
      };

      const setIndex = (i: number) => {
        if (i === projectIndex) return;
        projectIndex = i;
        items.forEach((it, k) => it.setAttribute("data-active", String(k === i)));
        applyBadgeText(i);
        if (overlayIsVisible) scheduleWarm(i);
      };

      const BADGE_OFFSET = 78;
      let moveBadgeX: ((v: number) => void) | null = null;
      let moveBadgeY: ((v: number) => void) | null = null;
      let badgeShown = false;
      let mouseX = -9999;
      let mouseY = -9999;

      if (badge) {
        gsap.set(badge, { xPercent: -50, yPercent: -50, scale: 0, autoAlpha: 0 });
        moveBadgeX = gsap.quickTo(badge, "x", { duration: 0.55, ease: "power3.out" });
        moveBadgeY = gsap.quickTo(badge, "y", { duration: 0.55, ease: "power3.out" });
      }

      const showBadge = () => {
        if (!badge || badgeShown || viewerOpenRef.current) return;
        badgeShown = true;
        applyBadgeText(projectIndex);
        gsap.set(badge, { x: mouseX + BADGE_OFFSET, y: mouseY + BADGE_OFFSET });
        gsap.to(badge, {
          scale: 1,
          autoAlpha: 1,
          duration: 0.5,
          ease: "back.out(2)",
          overwrite: "auto",
        });
      };

      const hideBadge = () => {
        if (!badge || !badgeShown) return;
        badgeShown = false;
        gsap.to(badge, {
          scale: 0,
          autoAlpha: 0,
          duration: 0.25,
          ease: "power2.in",
          overwrite: "auto",
        });
      };

      let overBox = false;
      let overImg = false;
      const syncHover = () => {
        const target = overBox || overImg ? 1 : 0;
        gsap.to(st, {
          hover: target,
          duration: target ? 0.5 : 0.35,
          ease: "power2.out",
          overwrite: "auto",
          onUpdate: () => render(lastP),
        });
      };

      const onBoxEnter = () => { overBox = true;  syncHover(); };
      const onBoxLeave = () => { overBox = false; syncHover(); };
      const onImgEnter = () => {
        overImg = true;
        syncHover();
        showBadge();
        /* أول ما الماوس يقف على الصورة نبدأ نحمّل مواقع المشروع فورًا */
        window.clearTimeout(warmTimer);
        warmKeys(keysOfProject(projectIndex));
      };
      const onImgLeave = () => { overImg = false; syncHover(); hideBadge(); };

      const onDocMove = (e: MouseEvent) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (badgeShown) {
          moveBadgeX?.(mouseX + BADGE_OFFSET);
          moveBadgeY?.(mouseY + BADGE_OFFSET);
        }
      };

      const onDocLeave = () => {
        overBox = false;
        overImg = false;
        syncHover();
        hideBadge();
      };

      /* على الموبايل مفيش hover: أول لمسة تبدأ التحميل */
      const onImgTouch = () => warmKeys(keysOfProject(projectIndex));

      const onImgClick = (e: MouseEvent) => {
        if (viewerOpenRef.current) return;
        if (Math.max(st.scroll, st.hover) < 0.5) return;

        const p  = projectIndex;
        const pr = PROJECTS[p];
        const c  = clickCountRef.current[pr.id] ?? 0;
        clickCountRef.current[pr.id] = c + 1;
        const v = c % pr.variants.length;

        /* الموقع اللي هيتفتح الأول بياخد الأولوية */
        warmKeys([keyOf(p, v), ...keysOfProject(p)]);

        originRef.current = { x: e.clientX, y: e.clientY };
        viewerOpenRef.current = true;
        setViewer({ p, v });
        hideBadge();
      };

      document.addEventListener("mousemove", onDocMove, { passive: true });
      document.documentElement.addEventListener("mouseleave", onDocLeave);
      growWrap.addEventListener("mouseenter", onBoxEnter);
      growWrap.addEventListener("mouseleave", onBoxLeave);
      imgs.forEach((im) => {
        im.addEventListener("mouseenter", onImgEnter);
        im.addEventListener("mouseleave", onImgLeave);
        im.addEventListener("click", onImgClick);
        im.addEventListener("touchstart", onImgTouch, { passive: true });
      });

      /* ════════════════════════════════════════════
         5) Pin + تبديل المشاريع مع السكرول (scrub)
         ════════════════════════════════════════════ */
      if (s4) {
        const pinLen = () => window.innerHeight * PIN_VH_PER_PROJECT * n;

        const projTl: gsap.core.Timeline = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          onUpdate: () =>
            setIndex(Math.min(n - 1, Math.floor(projTl.progress() * n + 1e-6))),
        });

        const half = TRANSITION / 2;
        for (let i = 0; i < n - 1; i++) {
          const at = i + 1 - half;
          projTl.to(items[i],     { opacity: 0, yPercent: -40, scale: 0.9, duration: TRANSITION }, at);
          projTl.to(items[i + 1], { opacity: 1, yPercent: 0,   scale: 1,   duration: TRANSITION }, at);
        }
        projTl.to({}, { duration: 0 }, n);

        ScrollTrigger.create({
          trigger: s4,
          start: "top top",
          end: () => `+=${pinLen()}`,
          animation: projTl,
          scrub: 0.6,
          invalidateOnRefresh: true,
        });

        if (pinLayer) {
          ScrollTrigger.create({
            trigger: s4,
            start: "top top",
            end: () => `+=${pinLen()}`,
            pin: pinLayer,
            pinSpacing: false,
            invalidateOnRefresh: true,
          });
        }

        const sync = (self: ScrollTrigger) => setOverlayVisibility(self.isActive);

        ScrollTrigger.create({
          trigger: s4,
          start: "top top",
          end: () => `+=${pinLen()}`,
          pin: true,
          pinSpacing: true,
          invalidateOnRefresh: true,
          onToggle: sync,
          onRefresh: sync,
        });
      }

      return () => {
        document.removeEventListener("mousemove", onDocMove);
        document.documentElement.removeEventListener("mouseleave", onDocLeave);
        growWrap.removeEventListener("mouseenter", onBoxEnter);
        growWrap.removeEventListener("mouseleave", onBoxLeave);
        imgs.forEach((im) => {
          im.removeEventListener("mouseenter", onImgEnter);
          im.removeEventListener("mouseleave", onImgLeave);
          im.removeEventListener("click", onImgClick);
          im.removeEventListener("touchstart", onImgTouch);
        });
      };
    }, sectionRef);

    return () => {
      window.clearTimeout(warmTimer);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* الثيم بيفضل ثابت أثناء أنيميشن الإغلاق */
  const themeP = viewer ? viewer.p : lastPRef.current;
  lastPRef.current = themeP;
  const theme = PROJECTS[themeP];

  const current = viewer ? PROJECTS[viewer.p] : null;
  const currentVariant = current && viewer ? current.variants[viewer.v] : null;
  const activeKey = viewer ? keyOf(viewer.p, viewer.v) : "";
  const activeLoaded = loadedKeys.includes(activeKey);

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="section3-title">
      {/* ── طبقة القص: الصور الخمسة فقط ── */}
      <div ref={clipLayerRef} className={styles.clipLayer} aria-hidden="true">
        {SIDE_IMAGES.map((img) => (
          <div
            key={img.id}
            data-dir={img.dir}
            className={`${styles.imgWrap} ${styles[img.cls]} ${
              img.dir === "top" ? "" : styles.sideBox
            }`}
          >
            <Image
              src={img.src}
              alt=""
              width={800}
              height={800}
              quality={100}
              sizes="40vw"
              className={styles.img}
            />
          </div>
        ))}
      </div>

      {/* ── الكونتينر السفلي + صور المشاريع + الأوفرلاي ── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 50 }}>
        <div
          ref={pinLayerRef}
          style={{ position: "relative", width: "100%", height: "100%", pointerEvents: "none" }}
        >
          <div ref={growWrapRef} className={`${styles.imgWrap} ${styles.imgBottom}`}>
            <div className={styles.containerTrack} aria-hidden="true">
              <div className={styles.containerTrackInner}>
                <Image
                  src={BOTTOM_SRC}
                  alt=""
                  width={2118}
                  height={742}
                  quality={100}
                  unoptimized
                  sizes="200vw"
                  className={styles.containerImage}
                />
                <Image
                  src={BOTTOM_SRC}
                  alt=""
                  width={2118}
                  height={742}
                  quality={100}
                  unoptimized
                  sizes="200vw"
                  className={styles.containerImage}
                />
              </div>
            </div>
          </div>

          {/* طبقة صور المشاريع */}
          <div ref={projLayerRef} className={styles.projLayer}>
            {PROJECTS.map((p) => (
              <div key={p.id} data-item className={styles.projItem}>
                <Image
                  data-img
                  src={p.src}
                  alt=""
                  fill
                  unoptimized
                  loading="eager"
                  draggable={false}
                  sizes="40vw"
                  className={styles.projImg}
                />
              </div>
            ))}
          </div>
        </div>

        <div ref={overlayRef} className={styles.overlay}>
          <div className={styles.overlayLeft}>
            <h3 className={styles.ovTitle}>
              {TITLE_LINES.map((line) => (
                <span key={line} className={styles.mask}>
                  <span data-anim="title-line" className={styles.maskInner}>
                    {line}
                  </span>
                </span>
              ))}
            </h3>

            <p className={styles.ovDesc}>
              {DESC_LINES.map((line) => (
                <span key={line} className={styles.mask}>
                  <span data-anim="desc-line" className={styles.maskInner}>
                    {line}
                  </span>
                </span>
              ))}
            </p>

            <div className={styles.ctaWrap}>
              <span className={styles.mask} style={{ padding: "6px 0", margin: "-6px 0" }}>
                <span data-anim="cta" className={styles.maskInner}>
                  <a href="#contact" className={styles.cta} style={{ display: "inline-block" }}>
                    Start a project
                  </a>
                </span>
              </span>
              <span data-anim="line" className={styles.ctaLine} />
            </div>
          </div>

          <ul className={styles.stats}>
            {STATS.map((s) => (
              <li key={s.label} className={styles.stat}>
                <span className={styles.mask}>
                  <span data-anim="stat-text" className={`${styles.maskInner} ${styles.statValue}`}>
                    {s.value}
                  </span>
                </span>
                <span className={styles.mask}>
                  <span data-anim="stat-text" className={`${styles.maskInner} ${styles.statLabel}`}>
                    {s.label}
                  </span>
                </span>
                <span data-anim="stat-line" className={styles.statLine} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div ref={contentRef} className={styles.content}>
        <h2 id="section3-title" className={styles.title}>
          LET&apos;S BUILD SOMETHING GREAT TOGETHER
        </h2>
        <p className={styles.subtitle}>your idea, our craft</p>
      </div>

      {/* ── بادج ── */}
      <div
        ref={badgeRef}
        className={styles.hoverBadge}
        style={{ visibility: "hidden", opacity: 0, zIndex: 60 }}
        aria-hidden="true"
      >
        <span className={styles.badgeSmall}>Our work</span>
        <span ref={badgeNameRef} className={styles.badgeMain}>
          {PROJECTS[0].name} project
        </span>
        <span className={styles.badgeArrow}>↗</span>
      </div>

      {/* ══════════ عرض المشروع (دايمًا موجود في الـ DOM عشان الـ iframes تفضل محمّلة) ══════════ */}
      <div
        ref={viewerRef}
        className={styles.viewer}
        style={
          {
            clipPath: "circle(0px at 50% 50%)",
            pointerEvents: viewer ? "auto" : "none",
            "--accent": theme.accent,
            "--accent-2": theme.accent2,
            "--bg": theme.bg,
            "--on-accent": theme.onAccent,
          } as React.CSSProperties
        }
        role="dialog"
        aria-modal="true"
        aria-hidden={!viewer}
        aria-label={`${theme.name} project`}
      >
        <div
          ref={stageRef}
          className={styles.vStage}
          style={{ clipPath: "circle(0px at 50% 50%)" }}
        >
          {current && (
            <span data-v="ghost" className={styles.vGhost} aria-hidden="true">
              {current.name.charAt(0)}
            </span>
          )}

          {/* الهيدر */}
          <div data-v="chrome" className={styles.vTop}>
            <span className={styles.vBrand}>
              <span className={styles.vBrandDot} />
              Our work
            </span>
            {viewer && (
              <span className={styles.vCount}>
                <b>0{viewer.p + 1}</b>
                <i>/</i>
                0{PROJECTS.length}
              </span>
            )}
            <button type="button" className={styles.vClose} onClick={closeViewer}>
              Close <span aria-hidden="true">✕</span>
            </button>
          </div>

          <div className={styles.vGrid}>
            {current && viewer && currentVariant && (
              <div key={current.id} className={styles.vInfo}>
                <p data-v="fade" className={styles.vKicker}>
                  Selected work
                  {current.variants.length > 1
                    ? ` · ${viewer.v + 1} / ${current.variants.length}`
                    : ""}
                </p>

                <h3 className={styles.vTitle} aria-label={current.name}>
                  {current.name.split("").map((c, i) => (
                    <span key={i} className={styles.vMask} aria-hidden="true">
                      <span data-v="char" className={styles.vChar}>
                        {c}
                      </span>
                    </span>
                  ))}
                </h3>

                <div data-v="fade" className={styles.vMeta}>
                  <div>
                    <span>Category</span>
                    <strong>{current.category}</strong>
                  </div>
                  <div>
                    <span>Live builds</span>
                    <strong>0{current.variants.length}</strong>
                  </div>
                </div>

                <p data-v="fade" className={styles.vDesc}>
                  {current.tagline}
                </p>

                {current.variants.length > 1 && (
                  <div data-v="fade" className={styles.vChips}>
                    {current.variants.map((vr, i) => (
                      <button
                        key={vr.url}
                        type="button"
                        className={`${styles.vChip} ${i === viewer.v ? styles.vChipActive : ""}`}
                        onClick={() => selectVariant(i)}
                      >
                        {vr.label}
                      </button>
                    ))}
                  </div>
                )}

                <a
                  data-v="fade"
                  className={styles.vVisit}
                  href={currentVariant.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit live site <span aria-hidden="true">↗</span>
                </a>

                <p data-v="fade" className={styles.vHint}>
                  Live preview — scroll inside the frame.
                </p>
              </div>
            )}

            <div data-v="frame" className={styles.vFrame}>
              <div className={styles.vBar}>
                <i /><i /><i />
                <span className={styles.vUrl}>
                  {currentVariant ? hostOf(currentVariant.url) : ""}
                </span>
              </div>

              <div ref={screenRef} className={styles.vScreen}>
                {/* poster لحد ما الموقع يجهز */}
                <div
                  className={`${styles.vPoster} ${
                    !viewer || activeLoaded ? styles.vPosterDone : ""
                  }`}
                  style={
                    {
                      "--poster": current ? `url(${current.src})` : "none",
                    } as React.CSSProperties
                  }
                  aria-hidden="true"
                >
                  <span className={styles.vProg} />
                  <p>Loading live preview</p>
                </div>

                {/* كل المواقع المحمّلة مسبقًا — اللي نشط بس هو اللي ظاهر */}
                {warm.map((k) => {
                  const [p, v] = k.split("-").map(Number);
                  const vr = PROJECTS[p].variants[v];
                  const active = k === activeKey;
                  return (
                    <iframe
                      key={k}
                      src={vr.url}
                      title={`${PROJECTS[p].name} — ${vr.label}`}
                      className={`${styles.vIframe} ${active ? styles.vIframeActive : ""}`}
                      referrerPolicy="strict-origin-when-cross-origin"
                      tabIndex={active ? 0 : -1}
                      aria-hidden={!active}
                      onLoad={() => markLoaded(k)}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {current && viewer && current.variants.length > 1 && (
            <div data-v="chrome" className={styles.vNav}>
              <button
                type="button"
                className={styles.vArrow}
                onClick={() => cycleVariant(-1)}
                aria-label="Previous project"
              >
                ←
              </button>
              <div className={styles.vDots}>
                {current.variants.map((vr, i) => (
                  <button
                    key={vr.url}
                    type="button"
                    aria-label={vr.label}
                    className={`${styles.vDot} ${i === viewer.v ? styles.vDotActive : ""}`}
                    onClick={() => selectVariant(i)}
                  />
                ))}
              </div>
              <button
                type="button"
                className={styles.vArrow}
                onClick={() => cycleVariant(1)}
                aria-label="Next project"
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}