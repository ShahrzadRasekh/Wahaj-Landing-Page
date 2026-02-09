"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

function useScrollVars() {
  useEffect(() => {
    const root = document.documentElement;

    const onScroll = () => {
      const y = window.scrollY || 0;
      const h = document.body.scrollHeight - window.innerHeight;
      const p = h > 0 ? Math.min(1, Math.max(0, y / h)) : 0;
      root.style.setProperty("--scrollP", p.toFixed(4));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}

export default function ArabicPage() {
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toastTimer = useRef<number | null>(null);

  const stageRefDesktop = useRef<HTMLDivElement | null>(null);
  const trailRef = useRef<HTMLDivElement | null>(null);

  useScrollVars();

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  // Desktop parallax only
  useEffect(() => {
    const el = stageRefDesktop.current;
    if (!el) return;

    let raf = 0;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;

      const rx = (py - 0.5) * -10;
      const ry = (px - 0.5) * 12;

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty("--mx", String(px));
        el.style.setProperty("--my", String(py));
        el.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
        el.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
      });
    };

    const onLeave = () => {
      cancelAnimationFrame(raf);
      el.style.setProperty("--mx", "0.5");
      el.style.setProperty("--my", "0.5");
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    onLeave();

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  // Background mouse trail
  useEffect(() => {
    const wrap = trailRef.current;
    if (!wrap) return;

    let raf = 0;
    let last = 0;

    const spawn = (x: number, y: number) => {
      const dot = document.createElement("span");
      dot.className = "trailStar";

      const jitterX = (Math.random() - 0.5) * 10;
      const jitterY = (Math.random() - 0.5) * 10;

      dot.style.left = `${x + jitterX}px`;
      dot.style.top = `${y + jitterY}px`;

      const size = 2 + Math.random() * 3.2;
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;

      const life = 950 + Math.random() * 950;
      dot.style.setProperty("--life", `${life}ms`);

      wrap.appendChild(dot);
      window.setTimeout(() => dot.remove(), life);
    };

    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - last < 22) return;
      last = now;

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        spawn(e.clientX, e.clientY);
        if (Math.random() > 0.55) spawn(e.clientX, e.clientY);
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmed = email.trim().toLowerCase();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!ok) return showToast("يرجى إدخال بريد إلكتروني صحيح.");

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        showToast(
          data?.error === "MISSING_ENV"
            ? "مشكلة في إعدادات الخادم: متغيرات البيئة غير موجودة."
            : "حدث خطأ. يرجى المحاولة مرة أخرى."
        );
        return;
      }

      setEmail("");
      showToast("تمت إضافتك للقائمة. سنخبرك عند الإطلاق.");
    } catch {
      showToast("مشكلة في الاتصال. حاول مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const ProductStack = ({
    mode,
    stageRef,
  }: {
    mode: "desktop" | "mobile";
    stageRef?: React.RefObject<HTMLDivElement | null>;
  }) => {
    const stageClass =
      mode === "desktop" ? "productStage productStageDesktop" : "productStage productStageMobile";
    const stackClass =
      mode === "desktop" ? "layerStack layerStackDesktop" : "layerStack layerStackMobile";

    return (
      <div className={stageClass} ref={stageRef}>
        <div className="productHalo" />
        <div className="productSweep" />
        <div className="productParticles" />

        <div className={stackClass}>
          <div className="layer l3">
            <Image src="/wahaj3.png" alt="" fill sizes="(max-width: 980px) 320px, 440px" className="layerImg" priority />
          </div>
          <div className="layer l2">
            <Image src="/wahaj2.png" alt="" fill sizes="(max-width: 980px) 320px, 440px" className="layerImg" priority />
          </div>
          <div className="layer l1">
            <Image src="/wahaj1.png" alt="" fill sizes="(max-width: 980px) 320px, 440px" className="layerImg" priority />
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="page rtlPage" dir="rtl">

      <div className="scrollProgress" aria-hidden="true">
        <div className="scrollProgressBar" />
      </div>

      <div className="bg" aria-hidden="true">
        <div className="bgPattern" />
        <div className="bgLights" />
        <div className="bgVignette" />
        <div className="bgGrain" />
      </div>

      <div ref={trailRef} className="trailLayer" aria-hidden="true" />

      <header className="topbar topbarSimple">
        <div className="brand introLine">
          <Image src="/WahajLogo.png" alt="Wahaj" width={220} height={220} priority className="logoNoBox" />
        </div>
      </header>

      <section className="hero">
        <div className="heroShell heroShellNoBorder">
          <div style={{ textAlign: "center", marginBottom: 10 }}>
            <a className="contactLink" href="/" style={{ marginInlineEnd: 8 }}>English</a>
            </div>

          <div className="heroGrid">
            <div className="heroLeft">
              <div className="launchingTopCenter introLine introDelay1">قريبًا الإطلاق</div>

              <div className="ctaPanel ctaPanelTop introLine introDelay2" id="notify">
                <div className="ctaTitle">كن على اطلاع عند إطلاق وهّاج </div>

                <form className="notify" onSubmit={onSubmit}>
                  <input
                    className="input"
                    placeholder="أدخل بريدك الإلكتروني"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    disabled={isSubmitting}
                  />
                  <button className="primaryBtn" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "جارٍ الحفظ..." : "إرسال"}
                  </button>
                </form>

                <div className="ctaMeta rtlMeta">
  <span className="rtlLabel"> أو تواصل معنا :</span>

  <a className="contactLink ltrEmail" href="mailto:info@wahajgold.com" dir="ltr">
    info@wahajgold.com
  </a>

  <a className="contactLink" href="tel:+9647767777200" dir="ltr">
    +964 776 777 7200
  </a>

    <a className="contactLink" href="tel:+9647787777200" dir="ltr">
    +964 778 777 7200
  </a>
</div>
              </div>

              <div className="mobileOnlyProduct" aria-hidden="true" id="mobileImages">
                <ProductStack mode="mobile" />
              </div>

              <div className="copyGroup introLine introDelay2">
                <p className="copyP">
                منصة جديدة لشراء <span className="accentInline">الذهب والفضة المادية المعتمدة</span>،
                مبنية على الشفافية، والالتزام بالمصادر المسؤولة، والتوصيل الآمن
                </p>

                <p className="copyP">
                مصممة للمستثمرين والمشترين الذين يقدّرون <span className="shinyWord">الثقة</span>،
                  <span className="shinyWord"> الجودة</span>، و<span className="shinyWord"> الوضوح</span>.
                </p>
              </div>
            </div>

            <div className="heroRight desktopOnlyProduct" aria-hidden="true">
              <ProductStack mode="desktop" stageRef={stageRefDesktop} />
            </div>
          </div>

          <div className="scrollHint" aria-hidden="true">
            <div className="scrollDot" />
          </div>
        </div>
      </section>

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}
      <a
  href="https://wa.me/9647767777200"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="Chat on WhatsApp"
  className="whatsappFloat whatsappFloatLeft"
>
  <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
    <path
      fill="currentColor"
      d="M19.11 17.19c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.13-.42-2.15-1.34-.79-.7-1.32-1.56-1.48-1.83-.16-.27-.02-.42.12-.56.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.29 0 1.35.98 2.65 1.12 2.83.14.18 1.93 2.95 4.67 4.13.65.28 1.15.45 1.54.57.65.21 1.24.18 1.71.11.52-.08 1.6-.65 1.82-1.28.22-.63.22-1.17.16-1.28-.07-.11-.25-.18-.52-.32zM16.04 3C9.39 3 4 8.38 4 15.01c0 2.63.86 5.05 2.32 7.01L4 29l7.17-2.28a11.94 11.94 0 004.87 1.03h.01c6.65 0 12.04-5.38 12.04-12.01C28.09 8.38 22.7 3 16.04 3z"
    />
  </svg>
</a>
    </main>
  );
}
