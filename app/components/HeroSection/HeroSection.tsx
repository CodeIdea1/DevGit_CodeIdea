"use client";
/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect, useCallback } from "react";
import styles from "./HeroSection.module.css";
import { HERO_PARTICLES } from "./heroParticles";

/* ══════════════════════════════════════════════
   Head component (الراس + الميوزك)
   ══════════════════════════════════════════════ */
type HeadProps = {
  className: string;
  baseRotation?: number;
  upRotation?: number;
  downRotation?: number;
  sensitivity?: number;
};

function Head({
  className,
  baseRotation = 4,
  upRotation = 46,
  downRotation = 6,
  sensitivity = 0.15,
}: HeadProps) {
  const rotateWrapperRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timersRef = useRef<number[]>([]);
  const [playing, setPlaying] = useState(false);
  const [barsVisible, setBarsVisible] = useState(false);
  const [barsExiting, setBarsExiting] = useState(false);
  const [burst, setBurst] = useState(false);

  // الصوت بيتحمّل أول ما اليوزر يدوس فقط (مش مع تحميل الصفحة) → أسرع في الـ loading
  const getAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/music.mp3");
      audioRef.current.loop = true;
    }
    return audioRef.current;
  };

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      audioRef.current?.pause();
      timers.forEach(id => window.clearTimeout(id));
    };
  }, []);

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLImageElement>) => {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      if (e.clientX - rect.left < rect.width * 0.5) return;
      if (!playing) {
        getAudio().play().catch(() => {});
        setPlaying(true);
        setBarsVisible(true);
        setBarsExiting(false);
        setBurst(true);
        later(() => setBurst(false), 700);
      } else {
        audioRef.current?.pause();
        setPlaying(false);
        setBarsExiting(true);
        later(() => {
          setBarsVisible(false);
          setBarsExiting(false);
        }, 600);
      }
    },
    [playing]
  );

  useEffect(() => {
    const rotateEl = rotateWrapperRef.current;
    if (!rotateEl) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      rotateEl.style.transform = `rotate(${baseRotation}deg)`;
      return;
    }
    let frame = 0;
    let target = baseRotation;
    let current = baseRotation;
    let moving = false;
    const onPointerMove = (e: PointerEvent) => {
      const progress = -((e.clientY / window.innerHeight) * 2 - 1);
      target = baseRotation + progress * (progress >= 0 ? downRotation : upRotation);
      if (!moving) {
        moving = true;
        animate();
      }
    };
    const onPointerLeave = () => {
      target = baseRotation;
    };
    const animate = () => {
      current += (target - current) * sensitivity;
      rotateEl.style.transform = `rotate(${current.toFixed(2)}deg)`;
      if (Math.abs(target - current) > 0.01) {
        frame = requestAnimationFrame(animate);
      } else {
        moving = false;
      }
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("mouseleave", onPointerLeave);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("mouseleave", onPointerLeave);
      cancelAnimationFrame(frame);
    };
  }, [baseRotation, upRotation, downRotation, sensitivity]);

  return (
    <div className={styles.headWrapper}>
      {barsVisible && (
        <>
          <span className={`${styles.bar} ${styles.bar1} ${barsExiting ? styles.barExit : styles.barEnter}`} />
          <span className={`${styles.bar} ${styles.bar2} ${barsExiting ? styles.barExit : styles.barEnter}`} />
          <span className={`${styles.bar} ${styles.bar3} ${barsExiting ? styles.barExit : styles.barEnter}`} />
        </>
      )}
      <div ref={rotateWrapperRef} className={styles.rotateWrapper}>
        <div className={`${styles.bobWrapper} ${playing ? styles.active : ""}`}>
          {burst && (
            <>
              <span className={`${styles.wave} ${styles.wave1}`} />
              <span className={`${styles.wave} ${styles.wave2}`} />
              <span className={`${styles.wave} ${styles.wave3}`} />
            </>
          )}
          {playing && <div className={styles.ledDot} />}
          <Image
            src="/head.webp"
            alt="Head"
            title="Click for music"
            width={302}
            height={208}
            placeholder="empty"
            className={className}
            onClick={handleClick}
            style={{ cursor: "pointer", pointerEvents: "all", background: "none" }}
          />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   Data
   ══════════════════════════════════════════════ */
const FIRST_SCREEN = "/first-screen.webp";

const STEPS = [
  { id: "layout", src: "/yy.webp",    nextScreen: "/center-screen-layout.webp",                    label: "Layout"     },
  { id: "texts",  src: "/text.webp",  nextScreen: "/center-screen-layout-text.webp",               label: "Your Text"  },
  { id: "img",    src: "/img.webp",   nextScreen: "/center-screen-layout-text-img2.webp",          label: "Your Image" },
  { id: "logo",   src: "/logo1.webp", nextScreen: "/center-screen-layout-text-img-card-logo1.webp", label: "Your Logo"  },
] as const;

const STEP_POSITIONS: Record<string, { top: number; left: number }> = {
  layout: { top: 57, left: 50 },
  texts:  { top: 40, left: 72 },
  img:    { top: 47, left: 25 },
  logo:   { top: 35, left: 55 },
};

// ملاحظات بخط اليد حوالين الموقع الجاهز — زي markup بيعمله المصمم، ونفس لغة الـ labels اللي في المشهد
const NOTES = [
  // نفس صور الأسهم الأصلية للموقع (arrow2 / arrow-left / arrow-flip) عشان الشكل يبقى متناسق مع باقي الـ labels
  { text: "responsive",   left: 25.1, top: 42.5, dir: "rd", delay: 0.2 }, // سهم ناحية اليمين-تحت → حافة الشاشة الشمال
  { text: "seo-ready",    left: 40.7, top: 26.3, dir: "dl", delay: 0.5 }, // سهم ناحية الشمال-تحت → حافة الشاشة العليا
  { text: "fast loading", left: 24.5, top: 61,   dir: "ru", delay: 0.8 }, // سهم ناحية اليمين-فوق → ركن الشاشة السفلي
] as const;

const NOTE_ARROWS = { rd: "/arrow2.webp", dl: "/arrow-left.webp", ru: "/arrow-flip.webp" } as const;
const stepCls: Record<string, string> = {
  layout: styles.imgLayout,
  texts:  styles.imgTexts,
  img:    styles.imgMain,
  logo:   styles.imgLogo,
};

// غيّر اللينك ده لصفحة التواصل / الطلب عندك
const CTA_HREF = "/contact";

type FlyState = { src: string; x: number; y: number; dx: number; dy: number; lift: number; isLayout: boolean };
type Tilt = { rx: number; ry: number; scale: number };

const NO_TILT: Tilt = { rx: 0, ry: 0, scale: 1 };

function Note({ text, left, top, dir, delay }: (typeof NOTES)[number]) {
  const dirCls = dir === "rd" ? styles.noteRd : dir === "dl" ? styles.noteDl : styles.noteRu;
  return (
    <div
      className={`${styles.note} ${dirCls}`}
      style={{ left: `${left}%`, top: `${top}%`, "--d": `${delay}s` } as React.CSSProperties}
      aria-hidden="true"
    >
      <span className={`${styles.hintText} ${styles.noteText}`}>
        {text.split("").map((ch, i) => (
          <span key={i} className={styles.hintChar} style={{ animationDelay: `${delay + i * 0.05}s` }}>
            {ch === " " ? "\u00A0" : ch}
          </span>
        ))}
      </span>
      <img src={NOTE_ARROWS[dir]} alt="" draggable={false} className={styles.noteArrow} />
    </div>
  );
}

/* ══════════════════════════════════════════════
   Hero
   ══════════════════════════════════════════════ */
export default function HeroSection() {
  const refs: Record<string, React.RefObject<HTMLImageElement | null>> = {
    layout: useRef<HTMLImageElement>(null),
    texts:  useRef<HTMLImageElement>(null),
    img:    useRef<HTMLImageElement>(null),
    logo:   useRef<HTMLImageElement>(null),
  };
  const screenRef  = useRef<HTMLImageElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const cursorRef  = useRef<HTMLImageElement>(null);
  const timersRef  = useRef<number[]>([]);
  const router     = useRouter();

  const [idea,         setIdea]         = useState("");
  const [prevScreen,   setPrevScreen]   = useState<string | null>(null);
  const [screenSrc,    setScreenSrc]    = useState(FIRST_SCREEN);
  const [screenAnim,   setScreenAnim]   = useState(false);
  const [showFlash,    setShowFlash]    = useState(false);
  const [flyState,     setFlyState]     = useState<FlyState | null>(null);
  const [step,         setStep]         = useState(0);
  const [done,         setDone]         = useState<Set<string>>(new Set());
  const [cursorRotate, setCursorRotate] = useState(0);
  const [tilts,        setTilts]        = useState<Record<string, Tilt>>(
    Object.fromEntries(STEPS.map(s => [s.id, NO_TILT]))
  );

  const finished = step >= STEPS.length;
  // الفكرة اللي اليوزر كتبها بتتبعت لصفحة التواصل كـ query (?idea=...)
  const ctaHref = idea.trim() ? `${CTA_HREF}?idea=${encodeURIComponent(idea.trim())}` : CTA_HREF;

  // كل الـ timeouts بتتسجّل هنا وبتتمسح لما الكومبوننت يتشال
  const later = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  }, []);

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach(id => window.clearTimeout(id));
  }, []);

  // تحميل مسبق لكل الشاشات عشان الانتقال بينهم يبقى ناعم من غير وميض
  useEffect(() => {
    STEPS.forEach(st => {
      const im = new window.Image();
      im.src = st.nextScreen;
    });
  }, []);

  // زاوية الـ cursor ناحية العنصر النشط
  const rotateCursorTo = useCallback((nextStep: number) => {
    requestAnimationFrame(() => {
      const activeId = STEPS[nextStep]?.id;
      if (!activeId || !cursorRef.current || !sectionRef.current) return;
      const targetNode = refs[activeId]?.current;
      if (!targetNode) return;
      const section = sectionRef.current.getBoundingClientRect();
      const cursor  = cursorRef.current.getBoundingClientRect();
      const target  = targetNode.getBoundingClientRect();
      const cx = cursor.left + cursor.width / 2 - section.left;
      const cy = cursor.top  + cursor.height / 2 - section.top;
      const tx = target.left + target.width / 2 - section.left;
      const ty = target.top  + target.height / 2 - section.top;
      setCursorRotate(Math.atan2(ty - cy, tx - cx) * (180 / Math.PI));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { rotateCursorTo(0); }, [rotateCursorTo]);

  function calcTilt(e: React.MouseEvent<HTMLImageElement>): Tilt {
    const rect = e.currentTarget.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2);
    const dy = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2);
    return { rx: dy * -12, ry: dx * 12, scale: 1.06 };
  }

  function stepImgStyle(id: string, index: number, flying: boolean): React.CSSProperties {
    const t = tilts[id];
    return {
      transform: `perspective(800px) rotateX(${t.rx}deg) rotateY(${t.ry}deg) scale(${t.scale})`,
      transition: "transform 0.15s ease-out, opacity 0.3s ease",
      opacity: t.scale > 1 ? 1 : 0.9,
      visibility: flying ? "hidden" : "visible",
      animationDelay: `${index * -1.3}s`,
      ...(id === "layout" ? { filter: "brightness(1.05) saturate(0.85)" } : {}),
    };
  }

  // دالة واحدة لكل الخطوات (كانت مكررة مرتين)
  function fly(index: number) {
    const { id, src, nextScreen } = STEPS[index];
    const ref = refs[id];
    if (!ref.current || !screenRef.current || !sectionRef.current) return;

    const section = sectionRef.current.getBoundingClientRect();
    const el      = ref.current.getBoundingClientRect();
    const screen  = screenRef.current.getBoundingClientRect();

    setFlyState({
      src,
      isLayout: id === "layout",
      x:  el.left - section.left + el.width  / 2,
      y:  el.top  - section.top  + el.height / 2,
      dx: screen.left + screen.width  / 2 - (el.left + el.width  / 2),
      dy: screen.top  + screen.height / 2 - (el.top  + el.height / 2),
      // مسار منحني: العنصر بيعلى شوية وبعدين ينزل في الشاشة (أنعم من الخط المستقيم)
      lift: -Math.min(90, Math.hypot(
        screen.left + screen.width / 2 - (el.left + el.width / 2),
        screen.top + screen.height / 2 - (el.top + el.height / 2)
      ) * 0.22),
    });

    // العنصر "بيرسى" على الشاشة، والشاشة الجديدة بتظهر بـ crossfade فوق القديمة
    later(() => {
      setFlyState(null);
      setPrevScreen(screenSrc);
      setScreenSrc(nextScreen);
      setScreenAnim(true);
      setShowFlash(true);
      setDone(prev => new Set(prev).add(id));
      setStep(index + 1);
      later(() => rotateCursorTo(index + 1), 600);
      later(() => {
        setShowFlash(false);
        setScreenAnim(false);
        setPrevScreen(null);
      }, 800);
    }, 850);
  }

  function activate(index: number) {
    if (index !== step || flyState) return;
    setTilts(p => ({ ...p, [STEPS[index].id]: NO_TILT }));
    fly(index);
  }

  function replay() {
    setFlyState(null);
    setShowFlash(false);
    setDone(new Set());
    setStep(0);
    setScreenSrc(FIRST_SCREEN);
    setScreenAnim(true);
    later(() => setScreenAnim(false), 800);
    later(() => rotateCursorTo(0), 100);
  }

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.glassOverlay} />

      <div className={styles.cloudTrack} aria-hidden="true">
        <img src="/cloud-slide.webp" alt="" className={styles.cloudSlide} />
        <img src="/cloud-slide.webp" alt="" className={styles.cloudSlide} />
        <img src="/cloud-slide.webp" alt="" className={styles.cloudSlide} />
        <img src="/cloud-slide.webp" alt="" className={styles.cloudSlide} />
      </div>

      {/* ضوء شمس ناعم جداً (بدون أشعة) */}
      <div className={styles.sunGlow} aria-hidden="true" />

      {/* عنوان للـ SEO وقارئ الشاشة فقط — مش ظاهر */}
      <h1 className={styles.srOnly}>
        Web design and development studio — we turn your idea into a website people remember
      </h1>

      <div className={styles.heroStage}>
        <img src="/cloud3.webp" alt="" className={styles.ccBg} />

        <div className={styles.screenLabel}>
          <span className={styles.hintText}>
            {"your idea".split("").map((char, ci) => (
              <span key={ci} className={styles.hintChar} style={{ animationDelay: `${ci * 0.06}s` }}>
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </span>
          <img src="/arrow2.webp" alt="" className={styles.screenLabelArrow} />
        </div>

        {prevScreen && (
          <img src={prevScreen} alt="" aria-hidden="true" className={`${styles.screenCenter} ${styles.screenPrev}`} />
        )}

        <img
          key={screenSrc}
          ref={screenRef}
          src={screenSrc}
          alt="Website preview"
          className={`${styles.screenCenter}${screenAnim ? " " + styles.screenChanged : ""}`}
        />

        {showFlash && <div className={styles.screenFlash} />}

        <img src="/coding.webp" alt="" className={`${styles.floater} ${styles.imgCoding}`} />

        {/* cursor بيتحرك دايماً ناحية العنصر النشط */}
        {!finished && (() => {
          const activePos = STEP_POSITIONS[STEPS[step].id];
          const isLogo = STEPS[step].id === "logo";
          return (
            <img
              ref={cursorRef}
              src="/cursor.webp"
              alt=""
              className={styles.floater}
              style={{
                top:      `${activePos.top + 8 + (isLogo ? 4 : 0)}%`,
                left:     `${activePos.left + 3 - (isLogo ? 2 : 0)}%`,
                maxWidth: "3%",
                rotate:   `${cursorRotate * (isLogo ? -0.05 : -0.12)}deg`,
                transition:
                  "top 0.7s cubic-bezier(0.34,1.56,0.64,1), left 0.7s cubic-bezier(0.34,1.56,0.64,1), rotate 0.4s ease",
                zIndex: 60,
              }}
            />
          );
        })()}

        {STEPS.map(({ id, src, label }, i) => {
          if (done.has(id)) return null;
          const isActive = i === step;

          const hintVariant =
            id === "layout" || id === "texts" ? styles.hintReverseRight
            : id === "img" ? styles.hintImg
            : styles.hintLogo;

          const arrowSrc =
            id === "layout" || id === "texts" || id === "logo" ? "/arrow-left.webp"
            : "/arrow-flip.webp";

          return (
            <div key={id} className={`${styles.stepWrapper} ${id === "layout" ? styles.stepWrapperBehind : ""} ${stepCls[id]}`}>
              {/* هالة ناعمة بتلفت النظر للعنصر اللي المفروض يدوس عليه */}
              {isActive && !flyState && <span className={styles.glowRing} aria-hidden="true" />}

              <div
                className={`${styles.hint} ${hintVariant} ${id === "layout" && step === 0 ? styles.hintLayoutActive : ""} ${id === "texts" ? styles.hintTexts : ""} ${id === "texts" && step === 1 ? styles.hintTextsActive : ""} ${isActive ? styles.hintActive : styles.hintIdle}`}
                style={id === "layout" ? { left: "76%" } : undefined}
                aria-hidden="true"
              >
                <div
                  style={
                    id === "logo"
                      ? { display: "flex", alignItems: "center", gap: "4px", transform: "rotate(-8deg)" }
                      : { display: "contents" }
                  }
                >
                  <span className={styles.hintText}>
                    {label.split("").map((char, ci) => (
                      <span key={ci} className={styles.hintChar} style={{ animationDelay: `${ci * 0.06}s` }}>
                        {char === " " ? "\u00A0" : char}
                      </span>
                    ))}
                  </span>
                  <span
                    className={styles.hintArrow}
                    style={
                      id === "texts"
                        ? { marginBottom: "1vw", marginRight: ".3vw", transform: "rotate(-15deg)" }
                        : id === "logo"
                        ? { position: "relative", top: "1.5vw", left: "-110px" }
                        : undefined
                    }
                  >
                    <img
                      src={arrowSrc}
                      alt=""
                      className={`${styles.arrowImg} ${isActive ? styles.arrowActive : ""}`}
                    />
                  </span>
                </div>
              </div>

              <img
                ref={refs[id] as React.RefObject<HTMLImageElement>}
                src={src}
                alt={label}
                className={styles.stepImg}
                style={stepImgStyle(id, i, flyState?.src === src)}
                // إمكانية الوصول: كيبورد + قارئ شاشة
                role="button"
                tabIndex={isActive ? 0 : -1}
                aria-label={`${label} — click to add it to your website`}
                aria-disabled={!isActive}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    activate(i);
                  }
                }}
                onMouseMove={
                  isActive
                    ? e => {
                        const t = calcTilt(e); // لازم نحسبها هنا: e.currentTarget بيبقى null جوه setState
                        setTilts(p => ({ ...p, [id]: t }));
                      }
                    : undefined
                }
                onMouseLeave={isActive ? () => setTilts(p => ({ ...p, [id]: NO_TILT })) : undefined}
                onClick={() => activate(i)}
              />
            </div>
          );
        })}

        <Image src="/hero-back-9.webp" alt="" width={0} height={0} sizes="100vw" className={styles.heroBottom} />

        <div className={styles.content}>
          <div className={styles.scene}>
            <Image src="/tree1.webp"  alt="" width={1211} height={1299} className={`${styles.tree} ${styles.tree1}`} />
            <Image src="/tree2.webp"  alt="" width={1422} height={1106} className={`${styles.tree} ${styles.tree2}`} />
            <Image src="/tree3.webp"  alt="" width={1319} height={1193} className={`${styles.tree} ${styles.tree3}`} />
            <Image src="/rock-1.webp" alt="" width={1530} height={1028} className={styles.rockImage} />
            <Image src="/rock22.webp" alt="" width={1530} height={1028} className={styles.rockImage2} />
          </div>
        </div>

        <div className={styles.personWrapper}>
          <Image src="/person.webp" alt="Designer working on a laptop" width={1145} height={1374} className={styles.personImage} priority />
          <Head className={styles.headImage} />
        </div>

        {/* الشكل النهائي: بدون بوكس — ملاحظات بخط اليد حوالين الموقع + شريط واحد لكتابة الفكرة */}
        {finished && !flyState && (
          <>
            {NOTES.map(n => (
              <Note key={n.text} {...n} />
            ))}

            <div className={styles.askWrap}>
              <form
                className={styles.ask}
                onSubmit={e => {
                  e.preventDefault();
                  router.push(ctaHref);
                }}
              >
                <input
                  className={styles.askInput}
                  type="text"
                  value={idea}
                  maxLength={120}
                  placeholder="Tell us your idea…"
                  aria-label="Describe your idea"
                  onChange={e => setIdea(e.target.value)}
                />
                <button type="submit" className={styles.askBtn}>
                  Start your project
                </button>
              </form>
              <button type="button" className={styles.replay} onClick={replay}>
                play again
              </button>
            </div>
          </>
        )}
      </div>

      <div className={styles.particles} aria-hidden="true">
        {HERO_PARTICLES.map((p, i) => (
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

      {/* مؤشر التقدم */}
      {!finished && (
        <div className={styles.progress} role="status" aria-live="polite">
          <span className={styles.dots} aria-hidden="true">
            {STEPS.map((s, i) => (
              <span
                key={s.id}
                className={`${styles.dot} ${i < step ? styles.dotDone : ""} ${i === step ? styles.dotActive : ""}`}
              />
            ))}
          </span>
          <span className={styles.progressLabel}>
            {step === 0 ? "click the glowing piece to build your site" : `${step} of ${STEPS.length} added`}
          </span>
        </div>
      )}

      {flyState && (
        <img
          src={flyState.src}
          alt=""
          className={`${styles.flyer} ${flyState.isLayout ? styles.flyerLayout : ""}`}
          style={
            {
              left: flyState.x,
              top: flyState.y,
              "--dx": `${flyState.dx}px`,
              "--dy": `${flyState.dy}px`,
              "--lift": `${flyState.lift}px`,
            } as React.CSSProperties
          }
        />
      )}
    </section>
  );
}