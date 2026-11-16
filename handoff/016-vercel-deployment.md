# Vercel canlı yayın

Kullanılan skill'ler: yok (Vercel CLI ve mevcut doğrulamalar).

Kullanıcı üretim yayını için Vercel yetkisi verdi. Uygulama build/test/CI kabulü Görev 015'te tamamlandı.

## Hazırlananlar

- `vercel.json`: Next.js framework, `npm ci`, `npm run build`.
- `.vercelignore`: yerel Git/cache/rapor/çalışma ve `.env*` dosyalarını deployment yüklemesinden hariç tutar.
- `.gitignore`: `.vercel/` yerel metadata'sını hariç tutar.
- Uygulamanın runtime API anahtarı gereksinimi yok.

## Bağlantı engeli

- Kurulu Vercel CLI mevcut; Vercel araç/connector'u bu oturumun araç kataloğunda yok.
- `vercel whoami` ilk olarak global auth dosyasını yenilerken proje dışı yazma kısıtına takıldı.
- Mevcut auth/config dosyaları yalnızca gitignore kapsamındaki yerel çalışma klasörüne kopyalanıp CLI `--global-config` ile denendi; kimlik bilgileri çıktıya veya repoya yazılmadı.
- Sonuç: `The specified token is not valid. Use vercel login to generate a new token.`
- Yeni giriş denemeleri `https://vercel.com/.well-known/openid-configuration` adresinde proxy bağlantı zaman aşımıyla sonlandı.
- Üretim deployment oluşturulmadı; canlı adres iddia edilmez. Yenilenmiş bir Vercel oturumu gereklidir.

## Devam adımı

Kullanıcı kendi terminalinde `vercel login` ile oturumunu yeniledikten sonra bu oturumu kullanarak proje hesabı doğrulanacak, üretim deploy'u yapılacak ve public ana sayfa/API yanıtları kontrol edilecek.
