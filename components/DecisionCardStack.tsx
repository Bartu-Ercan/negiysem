import React from 'react';
import type { DecisionItem } from '../types/decision';
import { DecisionCard } from './DecisionCard';

interface DecisionCardStackProps {
  items: DecisionItem[];
}

export function DecisionCardStack({ items }: DecisionCardStackProps) {
  return (
    <section aria-label="Giyim ve Konfor Kararları" className="flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-border-hairline pb-2">
        <h2 className="font-sans text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          Karar Kartları ({items.length})
        </h2>
        <span className="font-sans text-[11px] text-zinc-500">
          Deterministik Analiz
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <DecisionCard key={item.category} item={item} />
        ))}
      </div>
    </section>
  );
}
