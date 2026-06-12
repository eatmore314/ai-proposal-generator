'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, type LucideIcon } from 'lucide-react';

interface Props {
  title: string;
  content: string;
  Icon: LucideIcon;
}

export default function ProposalSection({ title, content, Icon }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      {/* Screen header */}
      <div className="flex items-center justify-between mb-7 no-print">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: 'var(--c-surface)',
              border: '1px solid var(--c-border)',
            }}
          >
            <Icon className="w-4 h-4" style={{ color: 'var(--c-text-2)' }} />
          </div>
          <h2
            className="text-xl font-bold tracking-tight"
            style={{ color: 'var(--c-text)' }}
          >
            {title}
          </h2>
        </div>

        <motion.button
          onClick={handleCopy}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.93 }}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--c-text-3)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--c-text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--c-text-3)')}
          aria-label={copied ? 'Copied to clipboard' : 'Copy section to clipboard'}
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.span
                key="check"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" style={{ color: 'var(--c-success)' }} />
                <span style={{ color: 'var(--c-success)' }}>Copied</span>
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Print-only header */}
      <div className="print-only mb-4">
        <h2 className="text-xl font-bold" style={{ color: 'var(--c-text)' }}>{title}</h2>
        <hr className="mt-2" style={{ borderColor: 'var(--c-border)' }} />
      </div>

      {/* Markdown content */}
      <div
        className="
          prose prose-slate max-w-none
          prose-headings:font-bold prose-headings:tracking-tight
          prose-h1:text-2xl prose-h2:text-xl prose-h3:text-base
          prose-p:leading-relaxed
          prose-li:leading-relaxed
          prose-strong:font-semibold
          prose-a:underline prose-a:decoration-slate-300
          hover:prose-a:decoration-slate-600
          prose-table:text-sm prose-table:border-collapse
          prose-th:font-semibold prose-th:py-2.5 prose-th:px-4
          prose-td:py-2.5 prose-td:px-4 prose-td:border-slate-200
          prose-blockquote:not-italic prose-blockquote:border-l-2
          prose-blockquote:py-3 prose-blockquote:rounded-r-lg
          prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[0.85em] prose-code:font-medium
          prose-hr:border-slate-200
        "
        style={{
          '--tw-prose-body':           'var(--c-text-2)',
          '--tw-prose-headings':       'var(--c-text)',
          '--tw-prose-bold':           'var(--c-text)',
          '--tw-prose-bullets':        'var(--c-text-3)',
          '--tw-prose-counters':       'var(--c-text-3)',
          '--tw-prose-quotes':         'var(--c-text-2)',
          '--tw-prose-quote-borders':  'var(--c-border-strong)',
          '--tw-prose-code':           'var(--c-text)',
          '--tw-prose-th-borders':     'var(--c-border)',
          '--tw-prose-td-borders':     'var(--c-border)',
        } as React.CSSProperties}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Wide pricing/calibration tables scroll horizontally on small
            // screens instead of forcing the whole page to overflow.
            table({ node, ...props }) {
              void node;
              return (
                <div className="md-table-scroll">
                  <table {...props} />
                </div>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
