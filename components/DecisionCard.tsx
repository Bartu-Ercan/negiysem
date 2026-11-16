import React from 'react';
import type { DecisionItem, DecisionSeverity } from '../types/decision';

interface DecisionCardProps {
  item: DecisionItem;
}

const CATEGORY_ICONS: Record<DecisionItem['category'], string> = {
  top: 'T',
  outerwear: 'C',
  footwear: 'A',
  umbrella: 'S',
  sweat: 'K',
};

const SEVERITY_BADGE_STYLES: Record<DecisionSeverity, string> = {
  safe: 'bg-status-emerald/15 text-emerald-400 border-status-emerald/30',
  caution: 'bg-accent-amber/15 text-amber-400 border-accent-amber/30',
  warning: 'bg-status-cobalt/15 text-blue-400 border-status-cobalt/30',
  alert: 'bg-status-rose/15 text-rose-400 border-status-rose/30',
};

const SEVERITY_BORDER_HOVER: Record<DecisionSeverity, string> = {
  safe: 'hover:border-status-emerald/40',
  caution: 'hover:border-accent-amber/40',
  warning: 'hover:border-status-cobalt/40',
  alert: 'hover:border-status-rose/40',
};

export function DecisionCard({ item }: DecisionCardProps) {
  const icon = CATEGORY_ICONS[item.category] ?? '';
  const badgeStyle = SEVERITY_BADGE_STYLES[item.severity];
  const borderHover = SEVERITY_BORDER_HOVER[item.severity];

  return (
    <article
      className={`group relative flex flex-col justify-between gap-2 rounded-xl border border-border-hairline bg-bg-surface p-4 transition-all duration-200 ${borderHover}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm select-none" aria-hidden="true">
            {icon}
          </span>
          <span className="font-sans text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
            {item.label}
          </span>
        </div>

        <span
          className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-semibold tracking-wide ${badgeStyle}`}
        >
          {item.badge}
        </span>
      </div>

      {/* Main Verdict */}
      <div className="flex flex-col gap-1">
        <h2 className="font-display text-base font-semibold text-text-primary group-hover:text-white transition-colors">
          {item.verdict}
        </h2>
        <p className="font-sans text-xs leading-relaxed text-text-secondary">
          {item.description}
        </p>
      </div>
    </article>
  );
}
