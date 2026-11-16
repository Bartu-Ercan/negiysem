'use client';

import React from 'react';
import type { DecisionItem } from '../types/decision';

interface GlanceableCardsProps {
  items: DecisionItem[];
}

// Precision-crafted bespoke SVG Glyphs (Zero Emojis!)
function CategoryGlyph({ category }: { category: DecisionItem['category'] }) {
  switch (category) {
    case 'outerwear':
      return (
        <svg className="w-4 h-4 text-amber-400/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 3h12l2 6-4 2v10H8V11L4 9l2-6z" />
          <path d="M12 3v18" />
          <path d="M8 3l4 6 4-6" />
        </svg>
      );
    case 'top':
      return (
        <svg className="w-4 h-4 text-text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a2 2 0 001.23 1.54L6 11.5V20a2 2 0 002 2h8a2 2 0 002-2v-8.5l1.91-.8a2 2 0 001.23-1.54l.58-3.47a2 2 0 00-1.34-2.23z" />
        </svg>
      );
    case 'footwear':
      return (
        <svg className="w-4 h-4 text-emerald-400/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 16h18l-1.5-6-4.5-1-4 3H7L3 16z" />
          <path d="M3 16v3a1 1 0 001 1h16a1 1 0 001-1v-3" />
          <path d="M10 12l2-2" />
        </svg>
      );
    case 'umbrella':
      return (
        <svg className="w-4 h-4 text-cyan-400/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 2v2" />
          <path d="M3 12a9 9 0 0118 0c0 .6-.4 1-1 1H4c-.6 0-1-.4-1-1z" />
          <path d="M12 13v6a2 2 0 004 0" />
        </svg>
      );
    case 'sweat':
      return (
        <svg className="w-4 h-4 text-rose-400/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3v13" />
          <path d="M8 8a4 4 0 018 0" />
          <path d="M6 13a6 6 0 0112 0" />
          <circle cx="12" cy="18" r="2.5" />
        </svg>
      );
  }
}

// Clean, quiet status dot & label (No gaudy neon badges!)
function StatusPill({ badge, severity }: { badge: string; severity: DecisionItem['severity'] }) {
  const dotColor =
    severity === 'alert'
      ? 'bg-status-rose'
      : severity === 'warning'
      ? 'bg-status-cobalt'
      : severity === 'caution'
      ? 'bg-accent-amber'
      : 'bg-status-emerald';

  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border-hairline bg-bg-surfaceHover px-2.5 py-0.5 text-xs font-mono font-medium text-text-primary shadow-sm">
      <span className={`w-1.5 h-1.5 shrink-0 rounded-full ${dotColor}`} />
      <span>{badge}</span>
    </span>
  );
}

export function GlanceableCards({ items }: GlanceableCardsProps) {
  // Sort or identify specific items
  const outerwear = items.find((i) => i.category === 'outerwear');
  const top = items.find((i) => i.category === 'top');
  const footwear = items.find((i) => i.category === 'footwear');
  const umbrella = items.find((i) => i.category === 'umbrella');
  const sweat = items.find((i) => i.category === 'sweat');

  return (
    <section aria-label="Giyim ve Konfor Kararları" className="decisions-section">
      <div className="decisions-heading"><h2>Giyimin için net kararlar.</h2><p>Seçili saatten günün sonuna kadar.</p></div>

      {/* Row 1: Primary Clothing Duo (Outerwear & Top) - 2 Generous Columns (Never truncated!) */}
      <div className="grid min-w-0 grid-cols-1 sm:grid-cols-2 gap-3">
        {[outerwear, top].filter((item): item is DecisionItem => Boolean(item)).map((item) => (
          <div
            key={item.category}
            className="decision-primary group relative flex min-w-0 flex-col justify-between gap-3 rounded-xl border border-border-hairline bg-bg-surface p-4 transition-colors duration-150 hover:border-border-hairline backdrop-blur-md shadow-md"
          >
            {/* Header: Glyph + Category + Status Pill */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                  <CategoryGlyph category={item.category} />
                </div>
                <span className="text-xs font-mono uppercase tracking-wider font-semibold text-text-primary">
                  {item.label}
                </span>
              </div>
              <StatusPill badge={item.badge} severity={item.severity} />
            </div>

            {/* Verdict (Comfortable typography, full text, never truncated!) */}
            <div className="flex flex-col gap-1 pt-1">
              <h3 className="[overflow-wrap:anywhere] font-display text-sm sm:text-base font-bold text-text-primary tracking-tight leading-relaxed">
                {item.verdict}
              </h3>
              <p className="[overflow-wrap:anywhere] text-xs text-text-secondary font-normal leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Secondary Essentials Trio (Footwear, Umbrella, Comfort) - 3 Columns with Full Room */}
      <div className="grid min-w-0 grid-cols-1 md:grid-cols-3 gap-3">
        {[footwear, umbrella, sweat].filter((item): item is DecisionItem => Boolean(item)).map((item) => (
          <div
            key={item.category}
            className="decision-secondary group relative flex min-w-0 flex-col justify-between gap-2.5 rounded-xl border border-border-hairline bg-bg-surface p-3.5 transition-colors duration-150 hover:border-border-hairline backdrop-blur-md shadow-md"
          >
            {/* Header: Glyph + Category + Status Pill */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-zinc-900 border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                  <CategoryGlyph category={item.category} />
                </div>
                <span className="text-xs font-mono uppercase tracking-wider font-semibold text-text-secondary">
                  {item.label}
                </span>
              </div>
              <StatusPill badge={item.badge} severity={item.severity} />
            </div>

            {/* Verdict */}
            <div className="flex flex-col gap-0.5 pt-0.5">
              <h3 className="[overflow-wrap:anywhere] font-display text-xs sm:text-sm font-bold text-text-primary tracking-tight leading-relaxed">
                {item.verdict}
              </h3>
              <p className="[overflow-wrap:anywhere] text-xs text-text-secondary leading-normal">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
