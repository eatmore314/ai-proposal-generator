'use client';

import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Sparkles, ArrowLeft,
  ClipboardList, Layers, Clock, DollarSign, FileText, HelpCircle,
  ChevronDown, Settings,
} from 'lucide-react';
import UploadZone from '@/components/UploadZone';
import GeneratingProgress from '@/components/GeneratingProgress';
import ProposalOutput from '@/components/ProposalOutput';
import IntroAnimation from '@/components/IntroAnimation';
import ProviderCategorySelector from '@/components/ProviderCategorySelector';
import type {
  SectionKey,
  ProposalSections,
  GenerationStatus,
  AdvancedOptions,
  PricingModel,
  Currency,
  Region,
  ProviderCategory,
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
  { icon: ClipboardList, label: 'Project Summary'      },
  { icon: Layers,        label: 'Scope of Work'        },
  { icon: Clock,         label: 'Timeline'             },
  { icon: DollarSign,    label: 'Pricing'               },
  { icon: FileText,      label: 'Agreement Draft'      },
  { icon: HelpCircle,    label: 'Discovery Questions'  },
] as const;

const DEFAULT_ADVANCED: AdvancedOptions = {
  industryOverride:     '',
  pricingModelOverride: 'auto',
  currency:             'auto',
  region:               'auto',
};

/* ── Page ── */
export default function Home() {
  const [file,             setFile]             = useState<File | null>(null);
  const [providerCategory, setProviderCategory] = useState<ProviderCategory>('freelancer');
  const [advancedOptions,  setAdvancedOptions]  = useState<AdvancedOptions>(DEFAULT_ADVANCED);
  const [showAdvanced,     setShowAdvanced]     = useState(false);
  const [status,          setStatus]          = useState<GenerationStatus>('idle');
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
    formData.append('providerCategory',    providerCategory);
    formData.append('industryOverride',    advancedOptions.industryOverride);
    formData.append('pricingModelOverride', advancedOptions.pricingModelOverride);
    formData.append('currency',            advancedOptions.currency);
    formData.append('region',              advancedOptions.region);

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
          backgroundImage: [
            'radial-gradient(ellipse 85% 55% at 70% -3%, rgba(201,151,58,0.11) 0%, transparent 55%)',
            'radial-gradient(ellipse 55% 35% at 8% 78%, rgba(201,151,58,0.05) 0%, transparent 50%)',
          ].join(', '),
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
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[54px] flex items-center justify-between">
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
        <main className="max-w-6xl mx-auto px-4 sm:px-6">
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

                    {/* Left — appears below upload on mobile */}
                    <div className="flex flex-col gap-7 order-2 lg:order-1">

                      {/* Hero */}
                      <div>
                        <div
                          className="inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 mb-6"
                          style={{
                            color: 'var(--c-text-2)',
                            background: 'linear-gradient(var(--c-surface), var(--c-surface)) padding-box, linear-gradient(120deg, rgba(201,151,58,0.55) 0%, rgba(201,151,58,0.15) 50%, rgba(201,151,58,0.55) 100%) border-box',
                            border: '1px solid transparent',
                          }}
                        >
                          <Sparkles className="w-3 h-3" style={{ color: 'var(--c-gold)' }} />
                          Any industry · Powered by Claude AI
                        </div>

                        <h1
                          className="font-bold"
                          style={{
                            fontSize: 'clamp(1.75rem, 6vw, 2.9rem)',
                            lineHeight: 1.1,
                            letterSpacing: '-0.032em',
                            color: 'var(--c-text)',
                          }}
                        >
                          Upload any client brief.
                          {/* Forced breaks only on larger screens; on mobile the
                              text wraps naturally to avoid awkward double-wraps. */}
                          <br className="hidden sm:inline" />
                          {' '}Get a complete
                          <br className="hidden sm:inline" />
                          {' '}<span style={{
                            background: 'linear-gradient(135deg, #c9973a 0%, #e0b55a 45%, #c9973a 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                          }}>project proposal.</span>
                        </h1>

                        <p
                          className="mt-4 leading-relaxed"
                          style={{
                            color: 'var(--c-text-2)',
                            fontSize: '1rem',
                            lineHeight: 1.65,
                            maxWidth: '420px',
                          }}
                        >
                          Select your provider type, upload a client requirements
                          PDF, and get a complete proposal — scope, timeline,
                          estimate, and agreement — auto-calibrated for your
                          industry and pricing category.
                        </p>
                      </div>

                      {/* Separator */}
                      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--c-border) 15%, var(--c-border) 85%, transparent)' }} aria-hidden="true" />

                      {/* How it works */}
                      <div>
                        <div className="mb-3.5" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div aria-hidden="true" style={{ width: '14px', height: '2px', borderRadius: '2px', background: 'var(--c-gold)', flexShrink: 0 }} />
                          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--c-text-3)', margin: 0 }}>
                            How it works
                          </p>
                        </div>
                        <div className="space-y-2.5">
                          {[
                            'Select your provider category — Freelancer, Small Business, or Agency',
                            'Upload your client\'s requirements PDF',
                            'Download a complete proposal calibrated to your pricing category',
                          ].map((text, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                              <span
                                style={{
                                  fontSize: '9.5px',
                                  fontWeight: 700,
                                  color: '#92400e',
                                  letterSpacing: '0.04em',
                                  flexShrink: 0,
                                  fontVariantNumeric: 'tabular-nums',
                                  background: 'rgba(201,151,58,0.13)',
                                  border: '1px solid rgba(201,151,58,0.30)',
                                  borderRadius: '6px',
                                  padding: '2px 7px',
                                  lineHeight: 1.6,
                                  marginTop: '1px',
                                }}
                              >
                                {String(i + 1).padStart(2, '0')}
                              </span>
                              <span style={{ fontSize: '13px', color: 'var(--c-text-2)', lineHeight: 1.55 }}>
                                {text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Separator */}
                      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--c-border) 15%, var(--c-border) 85%, transparent)' }} aria-hidden="true" />

                      {/* Deliverables grid — 6 items, 3 clean rows */}
                      <div>
                        <div className="mb-3.5" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div aria-hidden="true" style={{ width: '14px', height: '2px', borderRadius: '2px', background: 'var(--c-gold)', flexShrink: 0 }} />
                          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--c-text-3)', margin: 0 }}>
                            What you&rsquo;ll receive
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {DELIVERABLES.map(({ icon: Icon, label }) => (
                            <div
                              key={label}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '10px 12px',
                                borderRadius: '10px',
                                border: '1px solid var(--c-border)',
                                background: 'var(--c-surface)',
                                boxShadow: '0 1px 4px rgba(17,17,24,0.045)',
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
                                  background: 'linear-gradient(135deg, rgba(201,151,58,0.18) 0%, rgba(201,151,58,0.07) 100%)',
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

                    {/* Right — upload card, appears first on mobile */}
                    <div className="order-1 lg:order-2 lg:sticky lg:top-[78px]">
                      <div
                        style={{
                          borderRadius: '20px',
                          padding: '20px',
                          border: '1px solid rgba(201,151,58,0.16)',
                          background: 'linear-gradient(175deg, #ffffff 0%, #fdfcf8 100%)',
                          boxShadow: '0 8px 40px rgba(17,17,24,0.09), 0 2px 8px rgba(17,17,24,0.05), inset 0 1px 0 rgba(255,255,255,0.95)',
                          position: 'relative',
                        }}
                      >
                        {/* Gold shimmer line at top edge of card */}
                        <div
                          aria-hidden="true"
                          style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0,
                            height: '2px',
                            borderRadius: '20px 20px 0 0',
                            background: 'linear-gradient(90deg, transparent 8%, rgba(201,151,58,0.45) 30%, rgba(201,151,58,0.75) 50%, rgba(201,151,58,0.45) 70%, transparent 92%)',
                          }}
                        />
                        {/* Provider category selector */}
                        <p
                          style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: 'var(--c-text-3)',
                            marginBottom: '8px',
                          }}
                        >
                          Who is creating this proposal?
                        </p>
                        <ProviderCategorySelector
                          value={providerCategory}
                          onChange={setProviderCategory}
                          disabled={isGenerating}
                        />

                        {/* Divider */}
                        <div style={{ height: '1px', background: 'var(--c-border)', margin: '14px 0' }} aria-hidden="true" />

                        <p
                          style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                            color: 'var(--c-text-3)',
                            marginBottom: '8px',
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
                              background: file
                                ? 'linear-gradient(150deg, #1e1b2e 0%, #111118 55%, #0f0e1d 100%)'
                                : '#9ca3af',
                              cursor: file ? 'pointer' : 'not-allowed',
                              boxShadow: file
                                ? '0 4px 20px rgba(17,17,24,0.32), 0 1px 3px rgba(17,17,24,0.20), inset 0 1px 0 rgba(255,255,255,0.06)'
                                : 'none',
                              transition: 'background 0.2s, box-shadow 0.2s',
                            }}
                            aria-label="Generate proposal"
                          >
                            <Sparkles className="w-4 h-4" style={{ color: file ? 'var(--c-gold)' : 'rgba(255,255,255,0.5)' }} />
                            Generate Proposal
                          </motion.button>

                          {/* Advanced Options */}
                          <div style={{ borderTop: '1px solid var(--c-border)', paddingTop: '12px' }}>
                            <button
                              onClick={() => setShowAdvanced(v => !v)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                fontSize: '11px',
                                fontWeight: 500,
                                color: 'var(--c-text-3)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '8px 0',
                                minHeight: '36px',
                                transition: 'color 0.15s',
                              }}
                              onMouseEnter={e => (e.currentTarget.style.color = 'var(--c-text-2)')}
                              onMouseLeave={e => (e.currentTarget.style.color = 'var(--c-text-3)')}
                              aria-expanded={showAdvanced}
                            >
                              <Settings style={{ width: '11px', height: '11px' }} />
                              Advanced Options
                              <ChevronDown
                                style={{
                                  width: '11px',
                                  height: '11px',
                                  transform: showAdvanced ? 'rotate(180deg)' : 'none',
                                  transition: 'transform 0.2s ease',
                                }}
                              />
                            </button>

                            <AnimatePresence>
                              {showAdvanced && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.24, ease: [0.25, 0.46, 0.45, 0.94] }}
                                  style={{ overflow: 'hidden' }}
                                >
                                  <div className="space-y-3 pt-3">

                                    {/* Industry text input */}
                                    <div>
                                      <label
                                        style={{
                                          display: 'block',
                                          fontSize: '10.5px',
                                          fontWeight: 500,
                                          color: 'var(--c-text-3)',
                                          marginBottom: '4px',
                                        }}
                                      >
                                        Industry override
                                      </label>
                                      <input
                                        type="text"
                                        placeholder="Auto Detect"
                                        value={advancedOptions.industryOverride}
                                        onChange={e =>
                                          setAdvancedOptions(p => ({ ...p, industryOverride: e.target.value }))
                                        }
                                        disabled={isGenerating}
                                        style={{
                                          width: '100%',
                                          boxSizing: 'border-box',
                                          padding: '7px 10px',
                                          fontSize: '12.5px',
                                          borderRadius: '8px',
                                          border: '1px solid var(--c-border)',
                                          background: 'var(--c-surface)',
                                          color: 'var(--c-text)',
                                          outline: 'none',
                                        }}
                                        onFocus={e => (e.target.style.borderColor = 'var(--c-border-strong)')}
                                        onBlur={e => (e.target.style.borderColor = 'var(--c-border)')}
                                      />
                                    </div>

                                    {/* Pricing model, Currency, Region in a 3-col grid */}
                                    <div className="grid grid-cols-3 gap-2">
                                      {([
                                        {
                                          label: 'Pricing model',
                                          key: 'pricingModelOverride' as const,
                                          options: [
                                            { value: 'auto',      label: 'Auto'       },
                                            { value: 'fixed',     label: 'Fixed'      },
                                            { value: 'hourly',    label: 'Hourly'     },
                                            { value: 'retainer',  label: 'Retainer'   },
                                            { value: 'milestone', label: 'Milestones' },
                                            { value: 'package',   label: 'Package'    },
                                          ],
                                        },
                                        {
                                          label: 'Currency',
                                          key: 'currency' as const,
                                          options: [
                                            { value: 'auto', label: 'Auto' },
                                            { value: 'USD',  label: 'USD'  },
                                            { value: 'EUR',  label: 'EUR'  },
                                            { value: 'GBP',  label: 'GBP'  },
                                            { value: 'CAD',  label: 'CAD'  },
                                            { value: 'AUD',  label: 'AUD'  },
                                          ],
                                        },
                                        {
                                          label: 'Region',
                                          key: 'region' as const,
                                          options: [
                                            { value: 'auto', label: 'Auto'  },
                                            { value: 'us',   label: 'US'    },
                                            { value: 'uk',   label: 'UK'    },
                                            { value: 'eu',   label: 'EU'    },
                                            { value: 'ca',   label: 'Canada'},
                                            { value: 'au',   label: 'AU/NZ' },
                                          ],
                                        },
                                      ] as const).map(({ label, key, options }) => (
                                        <div key={key}>
                                          <label
                                            style={{
                                              display: 'block',
                                              fontSize: '10.5px',
                                              fontWeight: 500,
                                              color: 'var(--c-text-3)',
                                              marginBottom: '4px',
                                            }}
                                          >
                                            {label}
                                          </label>
                                          <select
                                            value={advancedOptions[key]}
                                            onChange={e =>
                                              setAdvancedOptions(p => ({
                                                ...p,
                                                [key]: e.target.value as PricingModel | Currency | Region,
                                              }))
                                            }
                                            disabled={isGenerating}
                                            style={{
                                              width: '100%',
                                              boxSizing: 'border-box',
                                              padding: '6px 8px',
                                              fontSize: '12px',
                                              borderRadius: '8px',
                                              border: '1px solid var(--c-border)',
                                              background: 'var(--c-surface)',
                                              color: 'var(--c-text)',
                                              outline: 'none',
                                              cursor: 'pointer',
                                            }}
                                          >
                                            {options.map(o => (
                                              <option key={o.value} value={o.value}>{o.label}</option>
                                            ))}
                                          </select>
                                        </div>
                                      ))}
                                    </div>

                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <p
                            className="text-center"
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
