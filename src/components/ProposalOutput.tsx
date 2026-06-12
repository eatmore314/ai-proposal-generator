'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, FileDown } from 'lucide-react';
import ProposalSection from './ProposalSection';
import { SECTION_CONFIG, SECTION_ORDER } from '@/lib/sectionConfig';
import type { SectionKey, ProposalSections } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  sections: ProposalSections;
  fileName: string;
}

// Tabs only show non-hidden sections that were actually generated
const VISIBLE_KEYS = SECTION_ORDER.filter(k => !SECTION_CONFIG[k].hidden);

export default function ProposalOutput({ sections, fileName }: Props) {
  const availableKeys = VISIBLE_KEYS.filter(k => k in sections);
  const [activeTab, setActiveTab] = useState<SectionKey>(availableKeys[0] ?? 'summary');

  const activeMeta = SECTION_CONFIG[activeTab];

  function downloadMarkdown() {
    const content = VISIBLE_KEYS
      .filter(k => k in sections)
      .map(k => `# ${SECTION_CONFIG[k].label}\n\n${sections[k as keyof ProposalSections]}`)
      .join('\n\n---\n\n');
    const blob = new Blob([content], { type: 'text/markdown' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'proposal.md';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>

      {/* ── Toolbar ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6 no-print">
        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight" style={{ color: 'var(--c-text)' }}>
            Proposal ready
          </h2>
          <p className="text-xs mt-0.5 truncate max-w-full sm:max-w-xs" style={{ color: 'var(--c-text-3)' }}>
            {fileName}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <motion.button
            onClick={downloadMarkdown}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors"
            style={{
              color: 'var(--c-text-2)',
              border: '1px solid var(--c-border)',
              background: 'var(--c-bg)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-surface)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--c-bg)')}
          >
            <FileDown className="w-3.5 h-3.5" />
            Markdown
          </motion.button>

          <motion.button
            onClick={() => window.print()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg text-white"
            style={{ background: 'var(--c-primary)' }}
          >
            <Printer className="w-3.5 h-3.5" />
            Export PDF
          </motion.button>
        </div>
      </div>

      {/* ── Tab navigation ── */}
      <div className="no-print" style={{ borderBottom: '1px solid var(--c-border)', marginBottom: 0 }}>
        <div className="flex overflow-x-auto" role="tablist">
          {availableKeys.map(key => {
            const { label, Icon } = SECTION_CONFIG[key];
            const active = activeTab === key;

            return (
              <button
                key={key}
                role="tab"
                aria-selected={active}
                aria-controls={`panel-${key}`}
                id={`tab-${key}`}
                onClick={() => setActiveTab(key)}
                className={cn(
                  'relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors outline-none',
                  'focus-visible:ring-2 focus-visible:ring-inset',
                )}
                style={{
                  color: active ? 'var(--c-text)' : 'var(--c-text-3)',
                  borderBottom: '2px solid transparent',
                  marginBottom: '-1px',
                }}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{label.split(' ')[0]}</span>

                {active && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0"
                    style={{ height: '2px', background: 'var(--c-text)', marginBottom: '-1px' }}
                    transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Section panel ── */}
      <div
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="no-print rounded-b-2xl rounded-tr-2xl p-5 sm:p-8"
        style={{
          border: '1px solid var(--c-border)',
          borderTop: 'none',
          background: 'var(--c-bg)',
          boxShadow: '0 2px 8px rgba(17,17,24,0.04)',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <ProposalSection
              title={activeMeta.label}
              content={sections[activeTab as keyof ProposalSections]}
              Icon={activeMeta.Icon}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Print layout ── */}
      <div className="print-only">
        <div className="mb-10">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--c-text)' }}>
            Project Proposal
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--c-text-2)' }}>
            Generated by ProposalAI · {fileName}
          </p>
          <hr className="mt-4" style={{ borderColor: 'var(--c-border)' }} />
        </div>
        {availableKeys.map((key, i) => (
          <div key={key} className={i > 0 ? 'print-section mt-10' : 'mt-0'}>
            <ProposalSection
              title={SECTION_CONFIG[key].label}
              content={sections[key as keyof ProposalSections]}
              Icon={SECTION_CONFIG[key].Icon}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
