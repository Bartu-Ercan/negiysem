# Vercel üretim yayını — tamamlandı

> **Sonraki aşama:** Kullanıcı özel repoya kalıcı Vercel erişimini açıkça onayladı. GitHub `main` otomatik yayını 017 aşamasında bağlandı ve gerçek bir Git deployment ile doğrulandı. Bu dosyanın izin engeli bölümü ilk yayın anının tarihsel kaydıdır; güncel durum `handoff/017-final-delivery.md` dosyasındadır.

Kullanılan skill'ler: yok (Vercel CLI, GitHub CLI, canlı HTTP doğrulaması).

## Canlı adresler

- **Üretim:** https://negiysem-bice.vercel.app
- **Demo:** https://negiysem-bice.vercel.app/?demo=1
- Vercel proje: `bartuercan488-1901s-projects/negiysem`
- Deployment: `dpl_3AYThEuwFrJdGXLkLaE3HqoFjvJP`
- Inspector: https://vercel.com/bartuercan488-1901s-projects/negiysem/3AYThEuwFrJdGXLkLaE3HqoFjvJP
- Kaynak: https://github.com/Bartu-Ercan/negiysem — özel kalır.

## Yetki ve uygulama

Kullanıcı Vercel'de canlı üretim yayını için açık yetki verdi. İlk denemede eski CLI token'ı geçersizdi; kullanıcı kendi terminalinde `vercel login` ile oturumunu yeniledi. Ardından doğru hesap `bartuercan488-1901` ve kişisel proje kapsamı doğrulandı.

Yerel global oturum dosyasının yenilenmesi ortam yazma kısıtına takıldığı için CLI yapılandırması yalnızca gitignore kapsamındaki çalışma alanında kullanıldı. Token'lar çıktıya, GitHub'a veya deployment'a dahil edilmedi. Orijinal oturum dosyasına müdahale edilmedi.

- `vercel.json`: Next.js, `npm ci`, `npm run build`.
- `.vercelignore`: Git, cache, yerel çalışma/rapor, `.env*` ve gereksiz dokümanları yüklemeden dışlar.
- `.gitignore`: `.vercel/` proje metadata'sını dışlar.
- `vercel project add negiysem` ile küçük harfli proje oluşturuldu; explicit project link kullanıldı.
- `vercel deploy --prod --yes` ile üretim yüklemesi yapıldı. `--public` kaynak görünürlüğü bayrağı kullanılmadı.
- Sonuç **READY**, target **production**; kalıcı alias `negiysem-bice.vercel.app`.
- GitHub About homepage ve README canlı bağlantılarla güncellendi.

## Dağıtım kanıtı

```text
Uploading 362.1KB
npm ci: added 109 packages; found 0 vulnerabilities
Detected Next.js version: 16.4.6
Compiled successfully in 8.0s
Finished TypeScript in 3.7s
Build Completed in /vercel/output [36s]
Aliased: https://negiysem-bice.vercel.app [52s]
readyState: READY
target: production
```

Build sırasında engine `>=22` otomatik yükseltme ve Vercel npm `cache-dir` uyarıları görüldü; bunlar derlemeyi durdurmadı. Uygulamanın iş kuralları değiştirilmedi. Önceki doğrulama: 104 birim testi, 8 headless Chromium testi ve temiz GitHub CI build'i.

## Public HTTP kabulü — GEÇTİ

Doğrulama, Vercel token'ı/cookie'si gönderilmeden standart Node fetch ile kalıcı alias üzerinden yapıldı:

| Yol | Sonuç |
| --- | --- |
| `/` | **200**; marka mevcut, `Open-Meteo ile güncel tahmin` metni mevcut — örnek veri yerine gerçek tahmin |
| `/?demo=1` | **200** |
| `/api/weather?lat=41.0428&lon=29.0077` | **200**, **168** saatlik nokta |
| `/api/decision?lat=41.0428&lon=29.0077` | **200**, **5** karar kategorisi |
| `/api/weather?lat=91&lon=29` | **400**, anlamlı geçersiz koordinat hatası |
| `/this-page-does-not-exist` | **404** |

Yerel tarayıcı engelini aşmak için masaüstünde pencere açılmadı. Üretim sonrasında yeni ekran görüntüsü iddiası yok; duyarlı UI kanıtı önceki GitHub Actions Chromium koşusuna aittir.

## Otomatik Git entegrasyonu sınırı

Vercel projesini özel GitHub reposuna kalıcı bağlayan `vercel git connect` işlemi **otomatik güvenlik incelemesi tarafından reddedildi**. Gerekçe: açıkça izin verilen üretim dağıtımına kıyasla daha geniş, kalıcı üçüncü taraf repo erişimi oluşturması. Bu ret farklı bir API veya dolaylı yöntemle aşılmadı.

**Manuel Vercel üretim yayını tamamlandı ve çalışıyor.** GitHub push'larının otomatik Vercel deployment tetiklemesi bu teslimde kurulmadı. Kullanıcı ayrıca özel repoya kalıcı Vercel erişimini onaylarsa bu ayrı adım ele alınabilir.

## Karar

Canlı üretim yayını ve gerçek hava/API kabulü **GEÇTİ**. Otomatik GitHub bağlantısı yukarıdaki izin sınırıyla ayrı kalır; uygulamanın canlı çalışmasını engellemez.
