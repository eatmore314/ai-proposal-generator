'use client';

import { useRef, useState, useEffect, DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  file: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}

const MAX_BYTES = 10 * 1024 * 1024;
const CARD_HEIGHT = 240;

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function UploadZone({ file, onChange, disabled }: Props) {
  const inputRef   = useRef<HTMLInputElement>(null);
  const [dragging,     setDragging]     = useState(false);
  const [sizeError,    setSizeError]    = useState(false);
  const [justUploaded, setJustUploaded] = useState(false);

  function accept(f: File) {
    setSizeError(false);
    if (f.size > MAX_BYTES) { setSizeError(true); return; }
    if (!f.name.endsWith('.pdf') && f.type !== 'application/pdf') return;
    onChange(f);
    setJustUploaded(true);
  }

  // Glow flash: reset justUploaded after animation window
  useEffect(() => {
    if (!justUploaded) return;
    const id = setTimeout(() => setJustUploaded(false), 1200);
    return () => clearTimeout(id);
  }, [justUploaded]);

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) accept(f);
  }

  function onClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(null);
    setSizeError(false);
    setJustUploaded(false);
    if (inputRef.current) inputRef.current.value = '';
  }

  function onReplace(e: React.MouseEvent) {
    e.stopPropagation();
    inputRef.current?.click();
  }

  return (
    <div className="space-y-2">
      {/*
        Fixed-height card — height never changes regardless of inner state.
        Both empty and file-ready states are absolutely positioned inside,
        so AnimatePresence crossfades without any container resize.
      */}
      <motion.div
        role={file ? 'region' : 'button'}
        tabIndex={disabled || !!file ? -1 : 0}
        aria-label={file ? `Selected file: ${file.name}` : 'Upload PDF requirements'}
        onClick={() => { if (!file && !disabled) inputRef.current?.click(); }}
        onKeyDown={e => { if (e.key === 'Enter' && !file && !disabled) inputRef.current?.click(); }}
        onDragOver={e => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={disabled ? undefined : onDrop}
        className={cn(
          'relative rounded-2xl overflow-hidden outline-none',
          !file && !disabled && 'cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        )}
        style={{
          height: `${CARD_HEIGHT}px`,
          border: `2px ${file ? 'solid' : 'dashed'} ${
            file
              ? justUploaded ? 'rgba(201,151,58,0.56)' : 'var(--c-border-strong)'
              : dragging    ? 'var(--c-primary)'       : 'var(--c-border)'
          }`,
          background: dragging && !file ? 'var(--c-surface-2)' : 'var(--c-surface)',
          transition: 'border-color 0.45s ease, background-color 0.2s ease',
        }}
        whileHover={!file && !disabled ? { borderColor: 'var(--c-border-strong)' } : {}}
        whileTap={!file && !disabled ? { scale: 0.998 } : {}}
        animate={{ scale: dragging ? 1.01 : 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      >
        {/* Ambient glow that flashes in on successful upload, then fades */}
        <AnimatePresence>
          {justUploaded && (
            <motion.div
              key="glow"
              variants={{
                show: { opacity: 1, transition: { duration: 0.25 } },
                hide: { opacity: 0, transition: { duration: 0.70 } },
              }}
              initial={{ opacity: 0 }}
              animate="show"
              exit="hide"
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 0,
                background:
                  'radial-gradient(ellipse 75% 65% at 50% 42%, rgba(201,151,58,0.11) 0%, transparent 70%)',
              }}
            />
          )}
        </AnimatePresence>

        {/* Both states share absolute inset-0 so the card height never changes */}
        <AnimatePresence mode="wait">
          {file ? (
            /* ── File ready state ── */
            <motion.div
              key="file"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.26, ease: [0.25, 0.46, 0.45, 0.94] }}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px 24px 20px',
              }}
            >
              {/* Remove button — top-right corner */}
              <button
                onClick={onClear}
                aria-label="Remove file"
                tabIndex={0}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '14px',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: 'none',
                  background: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--c-text-3)',
                  transition: 'color 0.15s, background 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--c-text)';
                  e.currentTarget.style.background = 'var(--c-surface-2)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--c-text-3)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <X width={14} height={14} />
              </button>

              {/* Icon + check badge */}
              <div style={{ position: 'relative', marginBottom: '14px' }}>
                <motion.div
                  initial={{ scale: 0.80, opacity: 0 }}
                  animate={{ scale: 1,    opacity: 1 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    border: '1px solid var(--c-border)',
                    background: 'var(--c-bg)',
                    boxShadow: '0 1px 4px rgba(17,17,24,0.07)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileText width={22} height={22} style={{ color: 'var(--c-gold)' }} />
                </motion.div>

                {/* Animated check badge */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 480, damping: 26, delay: 0.16 }}
                  style={{
                    position: 'absolute',
                    bottom: '-6px',
                    right: '-6px',
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'var(--c-success)',
                    border: '2.5px solid var(--c-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none" aria-hidden="true">
                    <motion.path
                      d="M1 3.5L3.2 5.7L8 1"
                      stroke="white"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.26, delay: 0.30, ease: 'easeOut' }}
                    />
                  </svg>
                </motion.div>
              </div>

              {/* File name
                  width:100% + box-sizing:border-box is explicit and reliable —
                  align-self:stretch was collapsing to intrinsic width inside
                  Framer Motion's animated opacity context, causing overflow:hidden
                  to clip the text before the ellipsis could trigger. */}
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.08 }}
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--c-text)',
                  width: '100%',
                  boxSizing: 'border-box',
                  textAlign: 'center',
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                  lineHeight: 1.45,
                  marginBottom: '4px',
                  padding: '0 36px',
                }}
                title={file.name}
              >
                {file.name}
              </motion.p>

              {/* File size */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.20, delay: 0.12 }}
                style={{ fontSize: '12px', color: 'var(--c-text-3)', marginBottom: '10px' }}
              >
                {formatBytes(file.size)}
              </motion.p>

              {/* Ready badge */}
              <motion.div
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: 0.20 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '11px',
                  fontWeight: 500,
                  color: 'var(--c-success)',
                  background: 'var(--c-success-bg)',
                  border: '1px solid var(--c-success-border)',
                  borderRadius: '999px',
                  padding: '3px 10px',
                  marginBottom: '14px',
                }}
              >
                <span
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    background: 'var(--c-success)',
                    flexShrink: 0,
                  }}
                />
                Ready to generate
              </motion.div>

              {/* Replace file link */}
              <motion.button
                onClick={onReplace}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.20, delay: 0.28 }}
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
                  padding: '4px 8px',
                  borderRadius: '6px',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--c-text-2)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--c-text-3)')}
                aria-label="Replace file"
                tabIndex={0}
              >
                <RefreshCw width={11} height={11} />
                Replace file
              </motion.button>
            </motion.div>
          ) : (
            /* ── Empty / drag-over state ── */
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '24px',
              }}
            >
              <motion.div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  border: '1px solid var(--c-border)',
                  background: dragging ? 'var(--c-primary)' : 'var(--c-bg)',
                  boxShadow: '0 1px 3px rgba(17,17,24,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
                animate={{ scale: dragging ? 1.08 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              >
                <Upload
                  width={20}
                  height={20}
                  style={{ color: dragging ? 'white' : 'var(--c-text-3)' }}
                />
              </motion.div>

              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--c-text)', marginBottom: '6px' }}>
                {dragging ? 'Drop to upload' : 'Drop your requirements PDF here'}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--c-text-3)', marginBottom: '16px' }}>
                or click to browse
              </p>
              <p style={{ fontSize: '11px', color: 'var(--c-text-3)', opacity: 0.65, letterSpacing: '0.02em' }}>
                PDF only · Max 10 MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Validation error */}
      <AnimatePresence>
        {sizeError && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs pl-1 overflow-hidden"
            style={{ color: 'var(--c-error)' }}
          >
            File exceeds the 10 MB limit. Please upload a smaller PDF.
          </motion.p>
        )}
      </AnimatePresence>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        disabled={disabled}
        onChange={e => {
          const f = e.target.files?.[0];
          if (f) accept(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}
