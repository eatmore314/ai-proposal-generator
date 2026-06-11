'use client';

import { motion } from 'framer-motion';
import { Zap, Briefcase, Building2, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProviderType } from '@/types';

interface Option {
  id: ProviderType;
  label: string;
  description: string;
  rateRange: string;
  Icon: LucideIcon;
}

const OPTIONS: Option[] = [
  {
    id: 'independent',
    label: 'Independent Builder',
    description: 'AI-assisted solo freelancer',
    rateRange: '$50–$100/hr',
    Icon: Zap,
  },
  {
    id: 'consultant',
    label: 'Mid-Level Consultant',
    description: 'Experienced freelancer or small firm',
    rateRange: '$100–$175/hr',
    Icon: Briefcase,
  },
  {
    id: 'agency',
    label: 'Agency',
    description: 'Team with PM, QA, and process',
    rateRange: '$175–$300/hr',
    Icon: Building2,
  },
];

interface Props {
  value: ProviderType;
  onChange: (v: ProviderType) => void;
  disabled?: boolean;
}

export default function ProviderSelector({ value, onChange, disabled }: Props) {
  return (
    <div>
      <p
        className="text-xs font-medium mb-2.5"
        style={{ color: 'var(--c-text-3)', letterSpacing: '0.04em' }}
      >
        Who&apos;s building this?
      </p>

      <div
        className="rounded-2xl overflow-hidden divide-y divide-[var(--c-border)]"
        style={{ border: '1px solid var(--c-border)' }}
      >
        {OPTIONS.map(opt => {
          const selected = value === opt.id;

          return (
            <motion.button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(opt.id)}
              className={cn(
                'relative w-full flex items-center gap-4 px-4 py-3.5 text-left outline-none transition-colors',
                disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
              )}
              style={{ background: selected ? 'var(--c-surface)' : 'var(--c-bg)' }}
              whileHover={!disabled ? { backgroundColor: 'var(--c-surface)' } : {}}
              whileTap={!disabled ? { scale: 0.995 } : {}}
              transition={{ duration: 0.15 }}
              aria-pressed={selected}
            >
              {/* Sliding left-border indicator */}
              {selected && (
                <motion.div
                  layoutId="provider-bar"
                  className="absolute left-0 top-0 bottom-0"
                  style={{
                    width: '2.5px',
                    background: 'var(--c-gold)',
                    borderRadius: '0 2px 2px 0',
                  }}
                  transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                />
              )}

              {/* Icon */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
                style={{
                  background: selected ? 'var(--c-gold-light)' : 'var(--c-surface-2)',
                  border: selected
                    ? '1px solid rgba(201,151,58,0.22)'
                    : '1px solid var(--c-border)',
                }}
              >
                <opt.Icon
                  className="w-4 h-4 transition-colors"
                  style={{ color: selected ? 'var(--c-gold)' : 'var(--c-text-2)' }}
                />
              </div>

              {/* Label + description */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-semibold leading-tight transition-colors"
                  style={{ color: selected ? 'var(--c-text)' : 'var(--c-text-2)' }}
                >
                  {opt.label}
                </p>
                <p className="text-xs mt-0.5 leading-tight" style={{ color: 'var(--c-text-3)' }}>
                  {opt.description}
                </p>
              </div>

              {/* Rate + radio */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <span
                  className="text-xs tabular-nums hidden sm:block"
                  style={{ color: 'var(--c-text-3)' }}
                >
                  {opt.rateRange}
                </span>

                <div
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    borderColor: selected ? 'var(--c-primary)' : 'var(--c-border-strong)',
                    background: selected ? 'var(--c-primary)' : 'transparent',
                  }}
                >
                  {selected && (
                    <motion.div
                      className="w-1.5 h-1.5 rounded-full bg-white"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
