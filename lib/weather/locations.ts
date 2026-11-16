export interface LocationPreset {
  id: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  microclimateNote: string;
}

export const PRESET_LOCATIONS: LocationPreset[] = [
  // İstanbul Mikro-İklimleri
  {
    id: 'istanbul-besiktas',
    name: 'İstanbul / Boğaz & Beşiktaş',
    region: 'İstanbul',
    latitude: 41.0428,
    longitude: 29.0077,
    microclimateNote: 'Boğaz rüzgâr koridoru; poyraz hissedilen sıcaklığı 2-4°C düşürür.',
  },
  {
    id: 'istanbul-kadikoy',
    name: 'İstanbul / Kadıköy & Moda',
    region: 'İstanbul',
    latitude: 40.991,
    longitude: 29.027,
    microclimateNote: 'Marmara kıyısı; güneyden gelen lodos nemi artırır.',
  },
  {
    id: 'istanbul-sariyer',
    name: 'İstanbul / Sarıyer & Kilyos',
    region: 'İstanbul',
    latitude: 41.1685,
    longitude: 29.0573,
    microclimateNote: 'Karadeniz mikro-iklimi; merkeze göre daha serin ve sağanak geçişli.',
  },
  {
    id: 'istanbul-levent',
    name: 'İstanbul / Levent & Maslak',
    region: 'İstanbul',
    latitude: 41.1065,
    longitude: 29.0175,
    microclimateNote: 'Plaza koridorları ve rüzgâr tünelleri; montsuz üşütür.',
  },
  {
    id: 'istanbul-bakirkoy',
    name: 'İstanbul / Bakırköy & Sahil',
    region: 'İstanbul',
    latitude: 40.979,
    longitude: 28.8717,
    microclimateNote: 'Kıyı şeridi; akşam saatlerinde deniz serinliği hissedilir.',
  },
  {
    id: 'istanbul-uskudar',
    name: 'İstanbul / Üsküdar & Çamlıca',
    region: 'İstanbul',
    latitude: 41.0267,
    longitude: 29.0153,
    microclimateNote: 'Yüksek tepe hattı; gece saatlerinde sıcaklık 2-3°C daha düşüktür.',
  },
  {
    id: 'istanbul-beylikduzu',
    name: 'İstanbul / Beylikdüzü',
    region: 'İstanbul',
    latitude: 41.0028,
    longitude: 28.6417,
    microclimateNote: 'Açık ova ve yüksek plato; kış aylarında kar ve fırtına etkisi yüksektir.',
  },

  // Diğer Önemli Merkezler
  {
    id: 'ankara-cankaya',
    name: 'Ankara / Çankaya',
    region: 'İç Anadolu',
    latitude: 39.9208,
    longitude: 32.8541,
    microclimateNote: 'Karasal iklim; gündüz ile gece arasında 12°C+ termal fark.',
  },
  {
    id: 'izmir-alsancak',
    name: 'İzmir / Alsancak & Körfez',
    region: 'Ege',
    latitude: 38.4237,
    longitude: 27.1428,
    microclimateNote: 'İmbat meltemi ve yüksek nem; mont nadiren gerekir.',
  },
  {
    id: 'bursa-nilufer',
    name: 'Bursa / Nilüfer',
    region: 'Marmara',
    latitude: 40.1885,
    longitude: 29.061,
    microclimateNote: 'Uludağ eteği serinliği ve ova nemi; akşam katman şart.',
  },
  {
    id: 'antalya-muratpasa',
    name: 'Antalya / Muratpaşa',
    region: 'Akdeniz',
    latitude: 36.8969,
    longitude: 30.7133,
    microclimateNote: 'Sıcak Akdeniz güneşi ve yüksek nem; hafif pamuklu ve keten tercih et.',
  },
  {
    id: 'trabzon-ortahisar',
    name: 'Trabzon / Ortahisar',
    region: 'Karadeniz',
    latitude: 41.0027,
    longitude: 39.7168,
    microclimateNote: 'Yoğun nem ve ani sağanak geçişleri; su geçirmez ayakkabı vazgeçilmez.',
  },
];

export const DEFAULT_LOCATION = PRESET_LOCATIONS[0];

export function isLocationPreset(value: unknown): value is LocationPreset {
  if (!value || typeof value !== 'object') return false;
  const location = value as Record<string, unknown>;
  return ['id', 'name', 'region', 'microclimateNote'].every(key => typeof location[key] === 'string') &&
    typeof location.latitude === 'number' && Number.isFinite(location.latitude) && Math.abs(location.latitude) <= 90 &&
    typeof location.longitude === 'number' && Number.isFinite(location.longitude) && Math.abs(location.longitude) <= 180;
}
