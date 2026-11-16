'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { PRESET_LOCATIONS, type LocationPreset } from '../lib/weather/locations';
import { useModalDialog } from '../hooks/useModalDialog';

export interface LocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocation: LocationPreset;
  onSelectLocation: (location: LocationPreset) => void;
}
const normalize = (value: string) => value.toLocaleLowerCase('tr-TR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i');

export function LocationSelector({ isOpen, onClose, selectedLocation, onSelectLocation }: LocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const generation = useRef(0);
  const dialog = useModalDialog(isOpen);
  useEffect(() => {
    setGeoLoading(false); setGeoError(null); setSearchQuery('');
    return () => { generation.current++; };
  }, [isOpen]);
  const filtered = useMemo(() => {
    const query = normalize(searchQuery.trim());
    return PRESET_LOCATIONS.filter(location => normalize(`${location.name} ${location.region} ${location.microclimateNote}`).includes(query));
  }, [searchQuery]);
  const choose = (location: LocationPreset) => { generation.current++; onSelectLocation(location); onClose(); };
  const handleGeoLocation = () => {
    if (!navigator.geolocation) { setGeoError('Konum servisi desteklenmiyor. Aşağıdaki listeden konum seçebilirsin.'); return; }
    const request = ++generation.current;
    setGeoLoading(true); setGeoError(null);
    navigator.geolocation.getCurrentPosition(position => {
      if (generation.current !== request) return;
      setGeoLoading(false);
      // Keep the measured coordinates; never silently snap GPS to a distant preset.
      choose({ id: 'custom-gps', name: 'Mevcut Konumum (GPS)', region: 'Yerel', latitude: position.coords.latitude, longitude: position.coords.longitude, microclimateNote: 'Cihazının GPS koordinatları kullanılıyor.' });
    }, error => {
      if (generation.current !== request) return;
      setGeoLoading(false);
      setGeoError(error.code === 1 ? 'Konum izni reddedildi. Listeden bir konum seçebilir veya tarayıcı iznini değiştirip yeniden deneyebilirsin.' : 'GPS konumu alınamadı. Yeniden dene veya listeden konum seç.');
    }, { timeout: 8000, maximumAge: 60000 });
  };
  if (!isOpen) return null;
  return (
    <dialog ref={dialog} aria-labelledby="location-dialog-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }} className="m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-lg rounded-2xl border border-border-hairline bg-bg-surface p-0 text-text-primary shadow-2xl">
      <div className="flex max-h-[90dvh] min-h-0 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 id="location-dialog-title" className="font-display text-lg font-bold">Konum ve mikro-iklim seç</h2>
          <button type="button" onClick={onClose} aria-label="Konum seçimini kapat" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border-hairline">
            <svg className="h-4 w-4" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg>
          </button>
        </div>
        <button type="button" disabled={geoLoading} onClick={handleGeoLocation} className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-accent-amber bg-bg-app px-3 py-2 text-sm font-semibold text-accent-text disabled:opacity-60">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="7" /><path d="M12 1v5m0 12v5M1 12h5m12 0h5" /></svg>
          {geoLoading ? 'GPS konumu aranıyor' : 'Mevcut konumumu kullan (GPS)'}
        </button>
        {geoError && <p role="alert" className="mt-2 text-sm leading-relaxed">{geoError}</p>}
        <label htmlFor="location-search" className="mb-1 mt-4 text-sm font-medium">İlçe, semt veya şehir ara</label>
        <input id="location-search" autoFocus type="search" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} placeholder="Örneğin Kadıköy" className="mb-4 min-h-11 w-full rounded-xl border border-border-hairline bg-bg-app px-3 py-2 text-base" />
        <p role="status" className="mb-2 text-xs text-text-secondary">{filtered.length} konum bulundu</p>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain p-1">
          {filtered.length === 0 && <p className="py-4 text-sm leading-relaxed">Eşleşen konum yok. Başka bir ad ara veya GPS kullan.</p>}
          {filtered.map(location => <button key={location.id} type="button" aria-pressed={location.id === selectedLocation.id} onClick={() => choose(location)} className={`flex w-full flex-col gap-1 rounded-xl border p-3 text-start transition-colors duration-150 ${location.id === selectedLocation.id ? 'border-accent-amber bg-bg-app' : 'border-border-hairline bg-bg-surfaceHover'}`}>
            <span className="text-sm font-semibold">{location.name}{location.id === selectedLocation.id ? ' · Seçili' : ''}</span>
            <span className="text-xs leading-relaxed text-text-secondary">{location.microclimateNote}</span>
          </button>)}
        </div>
      </div>
    </dialog>
  );
}
