import React, { useEffect, useState } from 'react';

interface PageLoaderProps {
  /** Minimum display time in ms. Defaults to 1800 */
  minDuration?: number;
  /** Called when loader finishes and fade-out is complete */
  onDone?: () => void;
}

const PageLoader: React.FC<PageLoaderProps> = ({
  minDuration = 1800,
  onDone,
}) => {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Simulate loading progress
    const intervals: ReturnType<typeof setInterval>[] = [];

    // Phase 1: 0→60% fast
    const p1 = setInterval(() => {
      setProgress(p => {
        if (p >= 60) { clearInterval(p1); return p; }
        return p + 3;
      });
    }, 40);
    intervals.push(p1);

    // Phase 2: 60→90% slower (after 800ms)
    const t2 = setTimeout(() => {
      const p2 = setInterval(() => {
        setProgress(p => {
          if (p >= 90) { clearInterval(p2); return p; }
          return p + 1;
        });
      }, 60);
      intervals.push(p2);
    }, 800);

    // Phase 3: snap to 100% and exit
    const t3 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setExiting(true);
        setTimeout(() => onDone?.(), 600);
      }, 200);
    }, minDuration);

    return () => {
      intervals.forEach(clearInterval);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [minDuration, onDone]);

  return (
    <>
      <style>{`
        @keyframes rp-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes rp-spin-reverse {
          to { transform: rotate(-360deg); }
        }
        @keyframes rp-pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50%       { transform: scale(1.12); opacity: 1; }
        }
        @keyframes rp-float-dot {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.7; }
          50%       { transform: translateY(-8px) scale(1.2); opacity: 1; }
        }
        @keyframes rp-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes rp-fade-in-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes rp-ashoka-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .rp-loader-root {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--bg-body, #FAFAFA);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .rp-loader-root.exiting {
          opacity: 0;
          transform: scale(1.03);
          pointer-events: none;
        }

        /* ── Tricolor ambient blobs ── */
        .rp-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
        }
        .rp-blob-saffron {
          width: 420px; height: 420px;
          top: -80px; left: -80px;
          background: radial-gradient(circle, rgba(255,153,51,0.18) 0%, transparent 70%);
          animation: rp-pulse-ring 4s ease-in-out infinite;
        }
        .rp-blob-green {
          width: 380px; height: 380px;
          bottom: -60px; right: -60px;
          background: radial-gradient(circle, rgba(19,136,8,0.14) 0%, transparent 70%);
          animation: rp-pulse-ring 4s ease-in-out infinite 2s;
        }
        .rp-blob-navy {
          width: 300px; height: 300px;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(13,37,89,0.07) 0%, transparent 70%);
        }

        /* ── Center stage ── */
        .rp-center {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
          animation: rp-fade-in-up 0.5s ease both;
        }

        /* ── Spinner rings ── */
        .rp-rings {
          position: relative;
          width: 120px; height: 120px;
          display: flex; align-items: center; justify-content: center;
        }
        .rp-ring {
          position: absolute;
          border-radius: 50%;
          border-style: solid;
          border-color: transparent;
        }
        .rp-ring-outer {
          width: 120px; height: 120px;
          border-width: 3px;
          border-top-color: var(--saffron, #FF9933);
          border-right-color: var(--saffron-light, #FFB566);
          animation: rp-spin 1.4s linear infinite;
        }
        .rp-ring-mid {
          width: 90px; height: 90px;
          border-width: 2.5px;
          border-top-color: var(--navy, #0D2559);
          border-left-color: rgba(13,37,89,0.4);
          animation: rp-spin-reverse 1.8s linear infinite;
        }
        .rp-ring-inner {
          width: 62px; height: 62px;
          border-width: 2px;
          border-top-color: var(--green, #138808);
          border-right-color: var(--green-light, #22C55E);
          animation: rp-spin 2.2s linear infinite;
        }

        /* ── Ashoka chakra in center ── */
        .rp-chakra-wrap {
          position: absolute;
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
        }
        .rp-chakra {
          font-size: 28px;
          animation: rp-ashoka-spin 6s linear infinite;
          user-select: none;
          filter: drop-shadow(0 0 6px rgba(13,37,89,0.4));
        }

        /* ── Orbit dots ── */
        .rp-dots-orbit {
          position: absolute;
          width: 148px; height: 148px;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation: rp-spin 3s linear infinite;
        }
        .rp-orbit-dot {
          position: absolute;
          width: 8px; height: 8px;
          border-radius: 50%;
          top: 0; left: 50%;
          transform: translateX(-50%);
        }
        .rp-orbit-dot:nth-child(1) { background: var(--saffron); top: 0; left: calc(50% - 4px); }
        .rp-orbit-dot:nth-child(2) { background: var(--green);   top: calc(50% - 4px); right: 0; left: auto; }
        .rp-orbit-dot:nth-child(3) { background: var(--navy);    bottom: 0; top: auto; left: calc(50% - 4px); }

        /* ── Name & tagline ── */
        .rp-name {
          font-family: var(--font-display, 'Playfair Display', Georgia, serif);
          font-size: clamp(1.5rem, 4vw, 2.2rem);
          font-weight: 800;
          letter-spacing: -0.02em;
          background: linear-gradient(
            135deg,
            var(--saffron-deep, #E8821A) 0%,
            var(--saffron, #FF9933) 35%,
            var(--navy, #0D2559) 55%,
            var(--green, #138808) 80%,
            var(--green-light, #22C55E) 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: rp-shimmer 3s linear infinite;
          text-align: center;
          line-height: 1.2;
        }
        .rp-tagline {
          font-family: var(--font-sans, 'Outfit', sans-serif);
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--text-muted, #6B7280);
          text-align: center;
          margin-top: 4px;
        }

        /* ── Progress bar ── */
        .rp-progress-wrap {
          width: min(320px, 80vw);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .rp-progress-track {
          width: 100%;
          height: 3px;
          background: var(--border-color, #E5E7EB);
          border-radius: 999px;
          overflow: hidden;
          position: relative;
        }
        .rp-progress-fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            var(--saffron, #FF9933) 0%,
            var(--navy, #0D2559) 50%,
            var(--green, #138808) 100%
          );
          background-size: 200% 100%;
          animation: rp-shimmer 1.5s linear infinite;
          transition: width 0.3s ease;
          position: relative;
        }
        .rp-progress-fill::after {
          content: '';
          position: absolute;
          top: -1px; right: 0;
          width: 12px; height: 5px;
          border-radius: 999px;
          background: white;
          filter: blur(2px);
          opacity: 0.8;
        }
        .rp-progress-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .rp-progress-label {
          font-family: var(--font-sans, 'Outfit', sans-serif);
          font-size: 0.7rem;
          font-weight: 500;
          color: var(--text-light, #9CA3AF);
          letter-spacing: 0.06em;
        }
        .rp-progress-pct {
          font-family: var(--font-sans, 'Outfit', sans-serif);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--saffron, #FF9933);
          min-width: 38px;
          text-align: right;
          font-variant-numeric: tabular-nums;
        }

        /* ── Bottom tricolor strip ── */
        .rp-tricolor-strip {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 4px;
          display: flex;
          overflow: hidden;
        }
        .rp-strip-seg {
          flex: 1;
          height: 100%;
          animation: rp-shimmer 2s linear infinite;
          background-size: 300% 100%;
        }
        .rp-strip-seg:nth-child(1) { background: linear-gradient(90deg, var(--saffron-deep), var(--saffron), var(--saffron-deep)); }
        .rp-strip-seg:nth-child(2) { background: linear-gradient(90deg, #e8e8e8, #ffffff, #e8e8e8); }
        .rp-strip-seg:nth-child(3) { background: linear-gradient(90deg, var(--green-deep), var(--green), var(--green-deep)); }
      `}</style>

      <div className={`rp-loader-root${exiting ? ' exiting' : ''}`}>
        {/* Ambient blobs */}
        <div className="rp-blob rp-blob-saffron" />
        <div className="rp-blob rp-blob-green" />
        <div className="rp-blob rp-blob-navy" />

        <div className="rp-center">
          {/* Spinner */}
          <div className="rp-rings">
            <div className="rp-ring rp-ring-outer" />
            <div className="rp-ring rp-ring-mid" />
            <div className="rp-ring rp-ring-inner" />

            {/* Orbit dots */}
            <div className="rp-dots-orbit">
              <div className="rp-orbit-dot" />
              <div className="rp-orbit-dot" />
              <div className="rp-orbit-dot" />
            </div>

            {/* Ashoka Chakra */}
            <div className="rp-chakra-wrap">
              <span className="rp-chakra" role="img" aria-label="Ashoka Chakra">⚙</span>
            </div>
          </div>

          {/* Name */}
          <div>
            <div className="rp-name">Rakeshwar Pandey</div>
            <div className="rp-tagline">President &middot; INTUC Jharkhand</div>
          </div>

          {/* Progress bar */}
          <div className="rp-progress-wrap">
            <div className="rp-progress-track">
              <div className="rp-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="rp-progress-meta">
              <span className="rp-progress-label">Loading portfolio...</span>
              <span className="rp-progress-pct">{progress}%</span>
            </div>
          </div>
        </div>

        {/* Tricolor bottom strip */}
        <div className="rp-tricolor-strip">
          <div className="rp-strip-seg" />
          <div className="rp-strip-seg" />
          <div className="rp-strip-seg" />
        </div>
      </div>
    </>
  );
};

export default PageLoader;
