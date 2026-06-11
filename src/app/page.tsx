'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Sparkles, ArrowLeft, FileText, Clock, DollarSign, FileCheck, HelpCircle } from 'lucide-react';
import UploadZone from '@/components/UploadZone';
import GeneratingProgress from '@/components/GeneratingProgress';
import ProposalOutput from '@/components/ProposalOutput';
import ProviderSelector from '@/components/ProviderSelector';
import IntroAnimation from '@/components/IntroAnimation';
import type {
  SectionKey,
  ProposalSections,
  GenerationStatus,
  ProviderType,
} from '@/types';
import { SECTION_ORDER } from '@/lib/sectionConfig';

/* ── Streaming helpers (unchanged) ── */
function parseCompletedSections(buffer: string): Partial<ProposalSections> {
  const result: Partial<ProposalSections> = {};
  for (const key of SECTION_ORDER) {
    const open  = `<${key}>`;
    const close = `</${key}>`;
    const start = buffer.indexOf(open);
    const end   = buffer.indexOf(close);
    if (start !== -1 && end !== -1)
      result[key] = buffer.slice(start + open.length, end).trim();
  }
  return result;
}

function getActiveSection(buffer: string): SectionKey | null {
  for (const key of SECTION_ORDER)
    if (buffer.includes(`<${key}>`) && !buffer.includes(`</${key}>`)) return key;
  return null;
}

/* ── Shared Framer Motion variants ── */
const pageVariants = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.22, ease: 'easeIn' } },
};

const DELIVERABLES = [
  { icon: FileText,   label: 'Project Scope'       },
  { icon: Clock,      label: 'Timeline'             },
  { icon: DollarSign, label: 'Itemized Quote'       },
  { icon: FileCheck,  label: 'Contract Draft'       },
  { icon: HelpCircle, label: 'Discovery Questions'  },
] as const;

/* ── Page ── */
export default function Home() {
  const [file,          setFile]          = useState<File | null>(null);
  const [providerType,  setProviderType]  = useState<ProviderType>('independent');
  const [status,        setStatus]        = useState<GenerationStatus>('idle');
  const [sections,      setSections]      = useState<Partial<ProposalSections>>({});
  const [activeSection, setActiveSection] = useState<SectionKey | null>(null);
  const [error,         setError]         = useState<string | null>(null);
  // Start as true so the overlay is in the very first render — no flash of the app UI.
  // The effect below immediately collapses it if the user prefers reduced motion or ?preview.
  const [showIntro,     setShowIntro]     = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  /* Respect system reduced-motion preference */
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const preview = new URLSearchParams(window.location.search).has('preview');
    if (reduced || preview) setShowIntro(false);
    // Otherwise leave true — IntroAnimation runs its timeline then calls handleIntroComplete
  }, []);

  function handleIntroComplete() {
    setShowIntro(false);
  }

  const completedCount = SECTION_ORDER.filter(k => k in sections).length;
  const isGenerating   = status === 'generating';
  const isDone         = status === 'done';

  async function handleGenerate() {
    if (!file) return;
    setStatus('generating');
    setError(null);
    setSections({});
    setActiveSection(null);
    abortRef.current = new AbortController();
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('providerType', providerType);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST', body: formData,
        signal: abortRef.current.signal,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Failed to generate proposal.');
      }
      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer    = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        setSections(parseCompletedSections(buffer));
        setActiveSection(getActiveSection(buffer));
      }
      setStatus('done');
      setActiveSection(null);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setStatus('error');
    }
  }

  function handleReset() {
    abortRef.current?.abort();
    setFile(null);
    setStatus('idle');
    setSections({});
    setActiveSection(null);
    setError(null);
  }

  const mv = prefersReduced ? {} : pageVariants;

  return (
    <>
      {/* Intro animation — mounts only when needed */}
      <AnimatePresence>
        {showIntro && <IntroAnimation onComplete={handleIntroComplete} />}
      </AnimatePresence>

      <div
        className="min-h-screen"
        style={{
          backgroundColor: 'var(--c-bg)',
          backgroundImage: 'radial-gradient(ellipse 80% 50% at 65% -5%, rgba(201,151,58,0.07) 0%, transparent 60%)',
        }}
      >

        {/* ── Header ── */}
        <header
          className="sticky top-0 z-40 no-print"
          style={{
            background: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            borderBottom: '1px solid var(--c-border)',
          }}
        >
          <div className="max-w-6xl mx-auto px-6 h-[54px] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* ProposalAI logo — stacked pages mark */}
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
                <rect width="28" height="28" rx="7" fill="#111118" />
                {/* Back page */}
                <rect x="5" y="9" width="12" height="15" rx="2.5" fill="rgba(201,151,58,0.18)" />
                {/* Mid page */}
                <rect x="7.5" y="6.5" width="12" height="15" rx="2.5" fill="rgba(201,151,58,0.40)" />
                {/* Front page — solid gold */}
                <rect x="10" y="4" width="12" height="15" rx="2.5" fill="#c9973a" />
                {/* Dog-ear fold top-right */}
                <path d="M19 4 L22 7 L19 7 Z" fill="rgba(17,17,24,0.24)" />
                {/* Text rule lines */}
                <rect x="12" y="9.5" width="7" height="1.3" rx="0.65" fill="rgba(17,17,24,0.28)" />
                <rect x="12" y="12.5" width="7.5" height="1" rx="0.5" fill="rgba(17,17,24,0.18)" />
                <rect x="12" y="15" width="5.5" height="1" rx="0.5" fill="rgba(17,17,24,0.18)" />
              </svg>
              <span className="font-semibold text-sm tracking-tight" style={{ color: 'var(--c-text)' }}>
                ProposalAI
              </span>
              <span
                className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-full leading-none tracking-widest uppercase"
                style={{
                  color: '#92400e',
                  background: '#fef3c7',
                  border: '1px solid rgba(146,64,14,0.18)',
                }}
              >
                Beta
              </span>
            </div>

            <AnimatePresence>
              {isDone && (
                <motion.button
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.22 }}
                  onClick={handleReset}
                  className="flex items-center gap-1.5 text-sm transition-colors px-3 py-1.5 rounded-lg"
                  style={{ color: 'var(--c-text-2)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--c-text)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--c-text-2)')}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  New Proposal
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* ── Main content — animated state machine ── */}
        <main className="max-w-6xl mx-auto px-6">
          <AnimatePresence mode="wait">

            {/* IDLE: hero + upload */}
            {!isGenerating && !isDone && (
              <motion.div
                key="idle"
                variants={mv}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="pt-12 lg:pt-16 pb-24">
                  <div className="grid lg:grid-cols-[1fr_420px] gap-10 lg:gap-12 items-start">

                    {/* Left: hero + config — appears below upload on mobile */}
                    <div className="flex flex-col gap-7 order-2 lg:order-1">

                      {/* Hero block */}
                      <div>
                        <div
                          className="inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 mb-6"
                          style={{
                            color: 'var(--c-text-2)',
                            border: '1px solid var(--c-border)',
                            background: 'var(--c-surface)',
                          }}
                        >
                          <Sparkles className="w-3 h-3" style={{ color: 'var(--c-gold)' }} />
                          Powered by Claude AI
                        </div>

                        <h1
                          className="font-bold"
                          style={{
                            fontSize: 'clamp(2.0rem, 4.0vw, 2.9rem)',
                            lineHeight: 1.07,
                            letterSpacing: '-0.032em',
                            color: 'var(--c-text)',
                          }}
                        >
                          Upload a client brief.
                          <br />
                          Get a complete
                          <br />
                          project proposal.
                        </h1>

                        <p
                          className="mt-4 leading-relaxed"
                          style={{
                            color: 'var(--c-text-2)',
                            fontSize: '1rem',
                            lineHeight: 1.65,
                            maxWidth: '410px',
                          }}
                        >
                          Drop in a requirements PDF and ProposalAI writes the
                          full package — project scope, timeline, itemized quote,
                          contract draft, and discovery questions. Ready to send.
                        </p>
                      </div>

                      {/* Separator */}
                      <div style={{ height: '1px', background: 'var(--c-border)' }} aria-hidden="true" />

                      {/* Provider selector */}
                      <div>
                        <p
                          className="mb-3"
                          style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: 'var(--c-text-3)',
                          }}
                        >
                          Who&rsquo;s billing this project?
                        </p>
                        <ProviderSelector
                          value={providerType}
                          onChange={setProviderType}
                          disabled={isGenerating}
                        />
                      </div>

                      {/* Deliverables grid */}
                      <div>
                        <p
                          className="mb-3"
                          style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: 'var(--c-text-3)',
                          }}
                        >
                          What you&rsquo;ll receive
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {DELIVERABLES.map(({ icon: Icon, label }, i) => (
                            <div
                              key={label}
                              className={i === 4 ? 'col-span-2' : ''}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px 12px',
                                borderRadius: '10px',
                                border: '1px solid var(--c-border)',
                                background: 'var(--c-surface)',
                              }}
                            >
                              <div
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '8px',
                                  flexShrink: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: 'var(--c-gold-light)',
                                }}
                              >
                                <Icon style={{ width: '13px', height: '13px', color: 'var(--c-gold)' }} />
                              </div>
                              <span style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--c-text)' }}>
                                {label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: upload card — appears first on mobile */}
                    <div className="order-1 lg:order-2 lg:sticky lg:top-[78px]">
                      <div
                        style={{
                          borderRadius: '20px',
                          padding: '20px',
                          border: '1px solid var(--c-border)',
                          background: 'var(--c-bg)',
                          boxShadow: '0 4px 24px rgba(17,17,24,0.05), 0 1px 3px rgba(17,17,24,0.04)',
                        }}
                      >
                        <p
                          className="mb-3.5"
                          style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: 'var(--c-text-3)',
                          }}
                        >
                          Upload requirements
                        </p>

                        <div className="space-y-3">
                          <UploadZone file={file} onChange={setFile} disabled={isGenerating} />

                          <AnimatePresence>
                            {error && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.22 }}
                                className="text-sm rounded-xl px-4 py-3 overflow-hidden"
                                style={{
                                  color: 'var(--c-error)',
                                  background: 'var(--c-error-bg)',
                                  border: '1px solid var(--c-error-border)',
                                }}
                              >
                                {error}
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <motion.button
                            onClick={handleGenerate}
                            disabled={!file}
                            whileHover={file ? { scale: 1.01, boxShadow: '0 4px 14px rgba(17,17,24,0.25)' } : {}}
                            whileTap={file ? { scale: 0.985 } : {}}
                            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                            className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 text-white"
                            style={{
                              background: file ? 'var(--c-primary)' : '#9ca3af',
                              cursor: file ? 'pointer' : 'not-allowed',
                              boxShadow: '0 1px 2px rgba(17,17,24,0.18)',
                              transition: 'background 0.2s',
                            }}
                            aria-label="Generate proposal"
                          >
                            <Sparkles className="w-4 h-4" style={{ color: file ? 'var(--c-gold)' : 'rgba(255,255,255,0.5)' }} />
                            Generate Proposal
                          </motion.button>

                          <p
                            className="text-center pt-0.5"
                            style={{ fontSize: '11px', color: 'var(--c-text-3)' }}
                          >
                            Powered by Claude AI · Your PDF is never stored
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

            {/* GENERATING */}
            {isGenerating && (
              <motion.div
                key="generating"
                variants={mv}
                initial="initial"
                animate="animate"
                exit="exit"
                className="py-24"
              >
                <GeneratingProgress
                  sections={sections}
                  activeSection={activeSection}
                  completedCount={completedCount}
                />
              </motion.div>
            )}

            {/* DONE */}
            {isDone && completedCount > 0 && (
              <motion.div
                key="done"
                variants={mv}
                initial="initial"
                animate="animate"
                exit="exit"
                className="py-10"
              >
                <ProposalOutput
                  sections={sections as ProposalSections}
                  fileName={file?.name ?? 'requirements.pdf'}
                />
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </>
  );
}
