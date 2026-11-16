'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="mx-auto max-w-xl px-6 py-24"><p className="section-eyebrow">KISA BİR MOLA</p><h1 className="mt-5 font-display text-4xl font-medium tracking-tight">Bir şeyler yolunda gitmedi.</h1><p className="mt-5 text-sm leading-relaxed text-text-secondary">Tekrar deneyebilir veya örnek verilerle uygulamayı keşfedebilirsin.</p><div className="mt-8 flex flex-wrap gap-4"><button onClick={reset} className="rounded-xl border border-border-hairline bg-bg-surface px-5 py-3 text-sm">Tekrar dene</button><a href="/?demo=1" className="rounded-xl bg-accent-text px-5 py-3 text-sm text-bg-app">Demoyu aç</a></div></main>;
}
