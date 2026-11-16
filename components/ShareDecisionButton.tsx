'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { FullDecisionResult } from '../types/decision';

export interface ShareDecisionButtonProps {
  locationName: string;
  decision: FullDecisionResult;
  selectedHour?: string;
}

export function ShareDecisionButton({
  locationName,
  decision,
  selectedHour,
}: ShareDecisionButtonProps) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const handleShare = async () => {
    setFailed(false);
    const outerwear = decision.items.find((i) => i.category === 'outerwear')?.verdict || 'Ceket';
    const top = decision.items.find((i) => i.category === 'top')?.verdict || 'Tişört';
    const shoe = decision.items.find((i) => i.category === 'footwear')?.verdict || 'Sneaker';
    const umbrella = decision.items.find((i) => i.category === 'umbrella')?.verdict || 'Gerek yok';

    const text = `${locationName} (${selectedHour || 'Bugün'})\n• Dış Giyim: ${outerwear}\n• Üst Giyim: ${top}\n• Ayakkabı: ${shoe}\n• Şemsiye: ${umbrella}\n\nHava durumu değil, karar motoru: Negiysem`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Negiysem — ${locationName} Giyim Kararı`,
          text,
          url: window.location.href,
        });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return;
      }
    }

    try {
      if (!navigator.clipboard?.writeText) throw new Error('Panoya erişilemiyor');
      await navigator.clipboard.writeText(text);
    } catch {
      setFailed(true);
      return;
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2500);
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Kararı Paylaş veya Kopyala"
      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-amber shadow-sm"
    >
      {copied ? (
        <>
          <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-emerald-400 font-semibold">Kopyalandı!</span>
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          <span aria-live="polite">{failed ? 'Kopyalanamadı, tekrar dene' : 'Paylaş'}</span>
        </>
      )}
    </button>
  );
}
