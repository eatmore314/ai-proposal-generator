'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { SECTION_CONFIG, SECTION_ORDER } from '@/lib/sectionConfig';
import type { SectionKey, ProposalSections } from '@/types';

interface Props {
  sections: Partial<ProposalSections>;
  activeSection: SectionKey | null;
  completedCount: number;
}

const listVariants = {
  visible: { transition: { staggerChildren: 0.07 } },
};
const itemVariants = {
  hidden:  { opacity: 0, x: -14 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.32, ease: 'easeOut' as const } },
};

export default function GeneratingProgress({ sections, activeSection, completedCount }: Props) {
  const statusLabel = activeSection
    ? `Writing ${SECTION_CONFIG[activeSection].label.toLowerCase()}…`
    : 'Analysing requirements…';

  const pct = Math.round((completedCount / SECTION_ORDER.length) * 100);

  return (
    <div className="max-w-sm mx-auto space-y-8">
      {/* Spinner + label */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center space-y-3"
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
          style={{
            background: 'var(--c-surface)',
            border: '1px solid var(--c-border)',
            boxShadow: '0 2px 8px rgba(17,17,24,0.06)',
          }}
        >
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--c-text-2)' }} />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight" style={{ color: 'var(--c-text)' }}>
            Generating your proposal
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--c-text-3)' }}>
            {statusLabel}
          </p>
        </div>
      </motion.div>

      {/* Section list with stagger */}
      <motion.div
        className="space-y-2"
        initial="hidden"
        animate="visible"
        variants={listVariants}
      >
        {SECTION_ORDER.map(key => {
          const done   = key in sections;
          const active = activeSection === key;
          const { label, Icon } = SECTION_CONFIG[key];

          return (
            <motion.div
              key={key}
              variants={itemVariants}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{
                border: '1px solid var(--c-border)',
                background: done
                  ? 'var(--c-success-bg)'
                  : active
                    ? 'var(--c-surface)'
                    : 'var(--c-bg)',
                borderColor: done
                  ? 'var(--c-success-border)'
                  : active
                    ? 'var(--c-border-strong)'
                    : 'var(--c-border)',
              }}
              animate={{
                borderColor: done ? 'var(--c-success-border)' : active ? 'var(--c-border-strong)' : 'var(--c-border)',
              }}
              transition={{ duration: 0.3 }}
            >
              {/* State icon */}
              <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
                {done ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                  >
                    <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--c-success)' }} />
                  </motion.div>
                ) : active ? (
                  <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--c-text-2)' }} />
                ) : (
                  <Circle className="w-4 h-4" style={{ color: 'var(--c-border-strong)' }} />
                )}
              </div>

              {/* Section icon */}
              <Icon
                className="w-3.5 h-3.5 flex-shrink-0"
                style={{
                  color: done ? 'var(--c-success)' : active ? 'var(--c-text-2)' : 'var(--c-text-3)',
                }}
              />

              {/* Label */}
              <span
                className="text-sm font-medium flex-1"
                style={{
                  color: done
                    ? 'var(--c-success)'
                    : active
                      ? 'var(--c-text)'
                      : 'var(--c-text-3)',
                }}
              >
                {label}
              </span>

              {done && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wide"
                  style={{
                    color: 'var(--c-success)',
                    background: 'var(--c-success-bg)',
                    border: '1px solid var(--c-success-border)',
                  }}
                >
                  DONE
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-2" style={{ color: 'var(--c-text-3)' }}>
          <span>{completedCount} of {SECTION_ORDER.length} sections</span>
          <span>{pct}%</span>
        </div>
        <div
          className="w-full rounded-full overflow-hidden"
          style={{ height: '3px', background: 'var(--c-surface-2)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--c-primary)' }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}
