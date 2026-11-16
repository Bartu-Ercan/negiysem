'use client';

import { useState } from 'react';
import type { UserPreferences } from '../types/decision';

export interface AdaptiveFeedbackWidgetProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
}
export function AdaptiveFeedbackWidget({ preferences, onUpdatePreferences }: AdaptiveFeedbackWidgetProps) {
  const [message, setMessage] = useState<string | null>(null);
  const adjust = (direction: -1 | 0 | 1) => {
    const previous = preferences.temperatureSensitivity;
    const next = Math.max(-2, Math.min(2, previous + direction)) as UserPreferences['temperatureSensitivity'];
    if (next !== previous) onUpdatePreferences({ temperatureSensitivity: next });
    setMessage(direction === 0 ? 'Tam oldu: termal tercihin korundu.' : next === previous ? 'Hassasiyet sınırına ulaştın; mevcut tercihin korundu.' : `${direction < 0 ? 'Daha sıcak tutan katmanlar' : 'Daha hafif katmanlar'} önerilecek. Yeni hassasiyet: ${next > 0 ? '+' : ''}${next}°C.`);
  };
  return (
    <section aria-label="Kişisel Termal Geri Bildirim" className="surface-panel flex flex-wrap items-center justify-between gap-4 p-4">
      <div className="min-w-0 flex-1 basis-56">
        <h2 className="text-sm font-semibold">Bu tavsiye senin için nasıldı?</h2>
        <p className="mt-1 text-xs leading-relaxed text-text-secondary">Yanıtın bu cihazdaki kişisel sıcaklık hassasiyetini günceller.</p>
      </div>
      <div className="flex max-w-full flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={Boolean(message)} onClick={() => adjust(-1)} className="rounded-lg border border-border-hairline bg-bg-app px-3 py-2 text-sm disabled:opacity-60">Üşüdüm</button>
          <button type="button" disabled={Boolean(message)} onClick={() => adjust(0)} className="rounded-lg border border-border-hairline bg-bg-app px-3 py-2 text-sm disabled:opacity-60">Tam oldu</button>
          <button type="button" disabled={Boolean(message)} onClick={() => adjust(1)} className="rounded-lg border border-border-hairline bg-bg-app px-3 py-2 text-sm disabled:opacity-60">Terledim</button>
        </div>
        <p role="status" aria-live="polite" className="max-w-prose text-xs leading-relaxed text-text-secondary">{message}</p>
        {message && <button type="button" onClick={() => setMessage(null)} className="self-start text-xs underline underline-offset-4">Yeniden değerlendir</button>}
      </div>
    </section>
  );
}
