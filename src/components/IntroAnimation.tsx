'use client';

import { useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';

interface Props {
  onComplete: () => void;
}

// Runs before the browser paints on the client (so GSAP's start state and
// first frame land without a flash), but falls back to useEffect during SSR
// to avoid React's "useLayoutEffect on the server" warning.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default function IntroAnimation({ onComplete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tlRef        = useRef<gsap.core.Timeline | null>(null);

  const finish = useCallback(() => {
    tlRef.current?.kill();
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.5,
      ease: 'power2.in',
      onComplete,
    });
  }, [onComplete]);

  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      gsap.set('.rb-box',      { opacity: 0, scale: 0.80, y: 22 });
      gsap.set('.rb-lid',      { rotateX: 0 });
      gsap.set('.rb-glow-int', { opacity: 0 });
      gsap.set('.rb-ring',     { opacity: 0, scale: 0 });
      gsap.set('.rb-glow-bg',  { opacity: 0 });
      gsap.set('.rb-tagline',  { opacity: 0, y: 10 });

      const tl = gsap.timeline();
      tlRef.current = tl;

      tl
        /* Box materialises from dark */
        .to('.rb-box',     { opacity: 1, scale: 1, y: 0, duration: 0.80, ease: 'power3.out' }, 0.25)

        /* Faint ambient glow blooms behind box */
        .to('.rb-glow-bg', { opacity: 0.45, duration: 1.0, ease: 'power2.out' }, 0.35)

        /* Lid slowly opens — 3D CSS perspective */
        .to('.rb-lid',     { rotateX: -132, duration: 0.88, ease: 'power2.inOut' }, 1.05)

        /* Interior gold light floods out as lid clears */
        .to('.rb-glow-int', { opacity: 1, duration: 0.55, ease: 'power1.out' }, 1.48)

        /* Ring jewel pops into view */
        .to('.rb-ring',    { opacity: 1, scale: 1, duration: 0.42, ease: 'back.out(2.4)' }, 1.74)

        /* Background glow expands to full warmth */
        .to('.rb-glow-bg', { opacity: 1, duration: 0.65, ease: 'power2.out' }, 1.80)

        /* Brand wordmark rises in */
        .to('.rb-tagline', { opacity: 1, y: 0, duration: 0.40, ease: 'power2.out' }, 1.96)

        /* Hold — let the moment breathe */
        .to({}, { duration: 0.55 })

        /* Camera plunges INTO the box opening */
        .to('.rb-scene', { scale: 14, y: -210, duration: 0.92, ease: 'power3.in' })

        /* Fade overlay → app revealed underneath */
        .to(container, {
          opacity: 0,
          duration: 0.44,
          ease: 'power1.in',
          onComplete: finish,
        }, '-=0.44');

    }, container);

    return () => ctx.revert();
  }, [finish]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: '#06050d',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Ambient radial glow behind box */}
      <div
        className="rb-glow-bg"
        aria-hidden="true"
        style={{
          opacity: 0,
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse 68% 52% at 50% 46%, rgba(201,151,58,0.26) 0%, rgba(160,90,10,0.12) 44%, transparent 70%)',
        }}
      />

      {/* Scene — the element GSAP zooms */}
      <div
        className="rb-scene"
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* ── Ring box ── */}
        <div
          className="rb-box"
          style={{
            opacity: 0,
            transform: 'scale(0.80) translateY(22px)',
            width: '196px',
            perspective: '820px',
            perspectiveOrigin: '50% 108%',
          }}
        >
          {/* Lid */}
          <div
            className="rb-lid"
            style={{
              height: '54px',
              background: 'linear-gradient(148deg, #1e1c3c 0%, #282550 55%, #322e68 100%)',
              border: '1px solid rgba(201,151,58,0.46)',
              borderBottom: 'none',
              borderRadius: '10px 10px 0 0',
              position: 'relative',
              zIndex: 2,
              transformOrigin: 'top center',
              transformStyle: 'preserve-3d',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 -4px 20px rgba(0,0,0,0.55)',
            }}
          >
            {/* Gold accent line inside lid */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                bottom: '13px',
                left: '24px',
                right: '24px',
                height: '1px',
                background:
                  'linear-gradient(90deg, transparent, rgba(201,151,58,0.68), transparent)',
              }}
            />
            {/* Embossed wordmark on lid face */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) translateY(-4px)',
                fontSize: '8.5px',
                fontWeight: 700,
                letterSpacing: '0.20em',
                color: 'rgba(201,151,58,0.52)',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                userSelect: 'none',
              }}
            >
              Proposal
            </div>
          </div>

          {/* Box base */}
          <div
            style={{
              height: '96px',
              background:
                'linear-gradient(160deg, #0d0b20 0%, #171430 55%, #0f0d1e 100%)',
              border: '1px solid rgba(201,151,58,0.22)',
              borderTop: 'none',
              borderRadius: '0 0 10px 10px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow:
                '0 50px 100px rgba(0,0,0,0.82), 0 20px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.02)',
            }}
          >
            {/* Interior glow — the "open box" light */}
            <div
              className="rb-glow-int"
              aria-hidden="true"
              style={{
                opacity: 0,
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(ellipse 92% 82% at 50% 8%, rgba(255,215,80,1) 0%, rgba(245,158,11,0.62) 28%, rgba(180,83,9,0.18) 58%, transparent 78%)',
              }}
            />

            {/* Ring jewel */}
            <div
              className="rb-ring"
              aria-hidden="true"
              style={{
                opacity: 0,
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) scale(0)',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                border: '3px solid rgba(201,151,58,0.95)',
                boxShadow:
                  '0 0 32px rgba(255,215,80,1), 0 0 14px rgba(255,215,80,0.85), inset 0 0 18px rgba(255,215,80,0.32)',
              }}
            />

            {/* Cushion inner border */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: '9px',
                borderRadius: '4px',
                border: '1px solid rgba(201,151,58,0.09)',
                pointerEvents: 'none',
              }}
            />

            {/* Top gold trim line */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: '1px',
                background:
                  'linear-gradient(90deg, transparent, rgba(201,151,58,0.36), transparent)',
              }}
            />
          </div>

          {/* Diffuse shadow beneath box */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: '-26px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '156px',
              height: '22px',
              background:
                'radial-gradient(ellipse at center, rgba(0,0,0,0.72) 0%, transparent 70%)',
              filter: 'blur(11px)',
              borderRadius: '50%',
            }}
          />
        </div>

        {/* Brand tagline below box */}
        <p
          className="rb-tagline"
          aria-hidden="true"
          style={{
            opacity: 0,
            transform: 'translateY(10px)',
            marginTop: '38px',
            fontSize: '9.5px',
            fontWeight: 600,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'rgba(201,151,58,0.40)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          ProposalAI
        </p>
      </div>

      {/* Skip button */}
      <button
        onClick={finish}
        aria-label="Skip intro"
        style={{
          position: 'absolute',
          top: '20px',
          right: '22px',
          fontSize: '11px',
          fontWeight: 500,
          color: 'rgba(148,163,184,0.42)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px 12px',
          borderRadius: '6px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(203,213,225,0.80)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(148,163,184,0.42)')}
        onFocus={e => (e.currentTarget.style.color = 'rgba(203,213,225,0.80)')}
        onBlur={e => (e.currentTarget.style.color = 'rgba(148,163,184,0.42)')}
      >
        Skip
      </button>
    </div>
  );
}
