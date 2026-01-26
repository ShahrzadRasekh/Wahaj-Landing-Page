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

export default function Page() {
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toastTimer = useRef<number | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const trailRef = useRef<HTMLDivElement | null>(null);

  useScrollVars();

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  // Product hover parallax
  useEffect(() => {
    const el = stageRef.current;
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

  // Background mouse trail (slightly bigger stars)
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

      // Bigger than before
      const size = 2 + Math.random() * 3.2; // 2px–5.2px
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

  // ✅ UPDATED: sends email to /api/lead (Vercel backend) instead of localStorage
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = email.trim().toLowerCase();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!ok) return showToast("Please enter a valid email address.");
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data?.error === "INVALID_EMAIL") {
          showToast("Please enter a valid email address.");
        } else {
          showToast("Something went wrong. Please try again.");
        }
        return;
      }

      setEmail("");
      showToast("You’re on the list. We’ll notify you at launch.");
    } catch {
      showToast("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page">
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

      {/* Topbar: logo only (bigger, no border box) */}
      <header className="topbar topbarSimple">
        <div className="brand introLine">
          <Image
            src="/WahajLogo.png"
            alt="Wahaj"
            width={220}
            height={220}
            priority
            className="logoNoBox"
          />
        </div>
      </header>

      <section className="hero">
        <div className="heroShell heroShellNoBorder">
          <div className="heroGrid">
            <div className="heroLeft">
              {/* LAUNCHING SOON centered, one line */}
              <div className="launchingTopCenter introLine introDelay1">
                LAUNCHING SOON
              </div>

              {/* Email box moved directly under LAUNCHING SOON */}
              <div className="ctaPanel ctaPanelTop introLine introDelay2" id="notify">
                <div className="ctaTitle">Be notified when Wahaj launches.</div>

                <form className="notify" onSubmit={onSubmit}>
                  <input
                    className="input"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    disabled={isSubmitting}
                  />
                  <button className="primaryBtn" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Get Notified"}
                  </button>
                </form>

                <div className="ctaMeta">
                  Or email us:{" "}
                  <a className="contactLink" href="mailto:info@wahajgold.com">
                    info@wahajgold.com
                  </a>
                </div>
              </div>

              {/* Paragraphs moved under the email section */}
              <div className="copyGroup introLine introDelay2">
                <p className="copyP">
                  A new platform for buying{" "}
                  <span className="accentInline">certified physical gold and silver</span>, built on transparency,
                  responsible sourcing, and secure delivery.
                </p>

                <p className="copyP">
                  Designed for investors and buyers who value{" "}
                  <span className="shinyWord">trust</span>,{" "}
                  <span className="shinyWord">quality</span>, and{" "}
                  <span className="shinyWord">clarity</span>.
                </p>
              </div>
            </div>

            <div className="heroRight" aria-hidden="true">
              <div className="productStage" ref={stageRef}>
                <div className="productHalo" />
                <div className="productSweep" />
                <div className="productParticles" />

                <div className="layerStack">
                  <div className="layer l3">
                    <Image
                      src="/wahaj3.png"
                      alt=""
                      fill
                      sizes="(max-width: 980px) 320px, 440px"
                      className="layerImg"
                      priority
                    />
                  </div>
                  <div className="layer l2">
                    <Image
                      src="/wahaj2.png"
                      alt=""
                      fill
                      sizes="(max-width: 980px) 320px, 440px"
                      className="layerImg"
                      priority
                    />
                  </div>
                  <div className="layer l1">
                    <Image
                      src="/wahaj1.png"
                      alt=""
                      fill
                      sizes="(max-width: 980px) 320px, 440px"
                      className="layerImg"
                      priority
                    />
                  </div>
                </div>
              </div>
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
    </main>
  );
}
