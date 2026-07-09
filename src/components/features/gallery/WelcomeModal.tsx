'use client';

import { useEffect, useRef } from 'react';
import { SPOOL_SVG_URL } from './galleryLayout';

export interface WelcomeModalProps {
  /** Coarse-pointer device: show touch wording instead of key glyphs */
  isTouch: boolean;
  onClose: () => void;
}

/** Rendered key glyph (desktop instruction rows). */
function Key({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <kbd className="inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-[#12284C]/25 bg-white/70 px-2 font-sans text-sm text-[#12284C] shadow-[0_1px_0_rgba(18,40,76,0.2)]">
      {children}
    </kbd>
  );
}

function InstructionRow({
  glyphs,
  text,
}: {
  glyphs: React.ReactNode;
  text: string;
}): React.ReactElement {
  return (
    <li className="flex items-center gap-3 text-left">
      <span className="flex w-20 shrink-0 items-center justify-end gap-1">
        {glyphs}
      </span>
      <span className="text-[15px] leading-snug text-[#12284C]/90">{text}</span>
    </li>
  );
}

/**
 * First-visit welcome modal: parchment card on a navy scrim, shown once per
 * session after the loading overlay fades. Esc, scrim click, and the
 * primary button all dismiss it; focus is trapped while open and returned
 * to the canvas wrapper by the parent's onClose.
 */
export default function WelcomeModal({
  isTouch,
  onClose,
}: WelcomeModalProps): React.ReactElement {
  const cardRef = useRef<HTMLDivElement>(null);
  const enterRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    enterRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key !== 'Tab') return;
    const card = cardRef.current;
    if (!card) return;
    const focusables = card.querySelectorAll<HTMLElement>('button, a[href]');
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (!first || !last) return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className="absolute inset-0 z-[70] flex items-center justify-center bg-[#12284C]/70 p-4"
      onKeyDown={handleKeyDown}
      onClick={onClose}
    >
      <style>{`
        @keyframes at-welcome-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .at-welcome-card { animation: none !important; }
        }
      `}</style>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: stopPropagation only — keyboard handling lives on the scrim wrapper */}
      {/* biome-ignore lint/a11y/useSemanticElements: native <dialog> needs imperative showModal()/close() management; this conditionally-rendered ARIA dialog with its own focus trap is simpler and equivalent */}
      <div // biome-ignore lint/a11y/useSemanticElements: see above
        role="dialog"
        ref={cardRef}
        aria-modal="true"
        aria-labelledby="at-welcome-heading"
        onClick={(e) => e.stopPropagation()}
        className="at-welcome-card w-full max-w-[520px] rounded-2xl bg-[#F5EFE0] px-8 py-9 text-center font-serif shadow-[0_12px_48px_rgba(0,0,0,0.45)]"
        style={{ animation: 'at-welcome-rise 200ms ease-out' }}
      >
        {/* Static decorative asset — next/image adds nothing here. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={SPOOL_SVG_URL} alt="" className="mx-auto h-14 w-auto" />
        <h2
          id="at-welcome-heading"
          className="mt-4 font-serif text-[30px] font-semibold leading-tight text-[#12284C]"
        >
          Welcome to Gallery&nbsp;7
        </h2>
        <p className="mt-2 text-[16px] leading-relaxed text-[#12284C]/80">
          Thirteen hand-stitched tapestries — one for each of the original
          colonies — tell the founding story of a nation.
        </p>
        {isTouch ? (
          <ul className="mx-auto mt-6 flex max-w-[380px] flex-col gap-3">
            <InstructionRow
              glyphs={
                <>
                  <Key>‹</Key>
                  <Key>›</Key>
                </>
              }
              text="Tap the chevrons to move between tapestries"
            />
            <InstructionRow
              glyphs={<Key>Tap</Key>}
              text="Tap a tapestry to hear its story"
            />
            <InstructionRow
              glyphs={<Key>Swipe</Key>}
              text="Swipe to look around"
            />
          </ul>
        ) : (
          <ul className="mx-auto mt-6 flex max-w-[380px] flex-col gap-3">
            <InstructionRow
              glyphs={
                <>
                  <Key>←</Key>
                  <Key>→</Key>
                </>
              }
              text="Move between tapestries"
            />
            <InstructionRow
              glyphs={<Key>Click</Key>}
              text="Click a tapestry to hear its story"
            />
            <InstructionRow
              glyphs={<Key>Drag</Key>}
              text="Drag to look around"
            />
          </ul>
        )}
        <button
          ref={enterRef}
          type="button"
          onClick={onClose}
          className="mt-7 inline-flex min-h-[48px] items-center justify-center rounded-full bg-[#12284C] px-8 text-[17px] text-[#F5EFE0] transition-colors hover:bg-[#1B3A66] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#12284C] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5EFE0]"
        >
          Enter the Gallery
        </button>
      </div>
    </div>
  );
}
