# Roller
- Codex: Ana kodlayıcı (Primary Coder). Tüm backend, frontend, bileşenler, stil, API ve test kodlarını Codex yazar.
- Antigravity: Planlama, SPEC, görev/prompt yazımı, UI/UX tasarımı, mimari rehberlik ve review.
# İletişim
Yalnızca dosyalar ve promptlar: tasks/ (Antigravity->Codex), handoff/ (Codex->Antigravity), reviews/.
Antigravity, her görev için `tasks/` dosyasını oluşturur ve kullanıcının Codex'e doğrudan vereceği hazır promptu sunar. Codex kodu yazar, `handoff/` dosyasını üretir; Antigravity işi test edip review eder.
# Kurallar
- Minimum diff.
- Belirsizlikte dur, kullanıcıya sor.
- Görev dosyası dışına çıkma.
- Karar eşikleri yalnızca docs/SPEC.md tablosundan gelir.
- Global "proaktif skill seç" kuralı bu projede GEÇERSİZ. Skill seçimi yalnızca görev dosyasındaki "Zorunlu skill'ler" ve bu dosyadaki listelerle sınırlı.
- Skill ve eklenti kaynaklarını (~/.codex/skill-sources, unity:*, documents, presentations, spreadsheets, sites, visualize, pets, onboarding-*, answers-*) bu projede kullanma.
- Tarayıcı testleri headless. Kullanıcının masaüstünde pencere açma.
- Proje dışına dosya yazma.
# Skill listeleri
Antigravity: yukarıdaki SKILL İŞ AKIŞI (A-H). Yerleşik swarm/run-workflow/plugin kullanılmaz.
Codex: yalnızca görev dosyasında adı geçen skill'ler. Varsayılan: playwright-cli (e2e testi gerekiyorsa).
# Bitirme kriteri
handoff dosyası + "Kullanılan skill'ler" satırı + kanıtlı kabul kriterleri. Biri eksikse görev reddedilir.
