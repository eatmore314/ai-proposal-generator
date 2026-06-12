'use client';

import { User, Users, Building2 } from 'lucide-react';
import type { ProviderCategory } from '@/types';

interface Props {
  value:    ProviderCategory;
  onChange: (v: ProviderCategory) => void;
  disabled?: boolean;
}

const OPTIONS = [
  {
    value: 'freelancer'     as const,
    Icon:  User,
    label: 'Freelancer',
    desc:  'Solo provider, independent contractor',
  },
  {
    value: 'small-business' as const,
    Icon:  Users,
    label: 'Small Business',
    desc:  'Small team, boutique firm, local agency',
  },
  {
    value: 'agency'         as const,
    Icon:  Building2,
    label: 'Corporation / Agency',
    desc:  'Larger company, established firm',
  },
];

export default function ProviderCategorySelector({ value, onChange, disabled }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {OPTIONS.map(({ value: optVal, Icon, label, desc }) => {
        const selected = value === optVal;
        return (
          <button
            key={optVal}
            type="button"
            onClick={() => !disabled && onChange(optVal)}
            disabled={disabled}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '9px 12px',
              borderRadius: '10px',
              border: `1.5px solid ${selected ? 'rgba(201,151,58,0.55)' : 'var(--c-border)'}`,
              background: selected ? 'rgba(201,151,58,0.06)' : 'var(--c-surface)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              textAlign: 'left',
              opacity: disabled ? 0.5 : 1,
              transition: 'border-color 0.15s, background 0.15s',
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: selected ? 'rgba(201,151,58,0.14)' : 'var(--c-bg)',
              border: `1px solid ${selected ? 'rgba(201,151,58,0.30)' : 'var(--c-border)'}`,
              transition: 'background 0.15s, border-color 0.15s',
            }}>
              <Icon style={{ width: '13px', height: '13px', color: selected ? 'var(--c-gold)' : 'var(--c-text-3)' }} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '12.5px', fontWeight: 600, color: selected ? 'var(--c-text)' : 'var(--c-text-2)', lineHeight: 1, margin: 0 }}>
                {label}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--c-text-3)', marginTop: '2px', lineHeight: 1.3, margin: '2px 0 0 0' }}>
                {desc}
              </p>
            </div>

            <div style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              border: `2px solid ${selected ? 'var(--c-gold)' : 'var(--c-border)'}`,
              background: selected ? 'var(--c-gold)' : 'transparent',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'border-color 0.15s, background 0.15s',
            }}>
              {selected && (
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'white' }} />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
