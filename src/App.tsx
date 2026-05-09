import { useEffect, useMemo, useRef, useState } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import { Map } from './components/Map';
import { SourceFilter } from './components/SourceFilter';
import { TimelineFilter } from './components/TimelineFilter';
import { SightingDetail } from './components/SightingDetail';
import { LayerSwitcher } from './components/LayerSwitcher';
import { RotateToggle } from './components/RotateToggle';
import { StarField } from './components/StarField';
import { SOURCES, type Sighting, type SightingSource } from './types';
import { HAS_MAPTILER_KEY, type LayerStyle } from './mapStyles';

function App() {
  const mapRef = useRef<MapRef | null>(null);
  const [all, setAll] = useState<Sighting[]>([]);
  const [enabled, setEnabled] = useState<Set<SightingSource>>(
    new Set(SOURCES.map((s) => s.id))
  );
  const [range, setRange] = useState<[number, number] | null>(null);
  const [selected, setSelected] = useState<Sighting | null>(null);
  const [layerStyle, setLayerStyle] = useState<LayerStyle>('satellite');
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    fetch('/data/sightings.json')
      .then((r) => r.json())
      .then((data: Sighting[]) => {
        setAll(data);
        const years = data.map((d) => d.year).filter((y): y is number => y !== null);
        if (years.length) setRange([Math.min(...years), Math.max(...years)]);
      });
  }, []);

  const yearBounds = useMemo(() => {
    const years = all.map((d) => d.year).filter((y): y is number => y !== null);
    if (!years.length) return [1900, 2026] as const;
    return [Math.min(...years), Math.max(...years)] as const;
  }, [all]);

  const filtered = useMemo(() => {
    if (!range) return all.filter((s) => enabled.has(s.source));
    const [from, to] = range;
    return all.filter(
      (s) =>
        enabled.has(s.source) &&
        (s.year === null || (s.year >= from && s.year <= to))
    );
  }, [all, enabled, range]);

  const counts = useMemo(() => {
    const c: Record<SightingSource, number> = {
      'wikipedia': 0,
      'pursue-2026': 0,
      'nuforc-aggregate': 0,
    };
    for (const s of all) c[s.source]++;
    return c;
  }, [all]);

  const toggle = (src: SightingSource) => {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(src)) next.delete(src);
      else next.add(src);
      return next;
    });
  };

  const handleSelect = (s: Sighting) => {
    setSelected(s);
    setAutoRotate(false);
    mapRef.current?.flyTo({
      center: [s.location.lon, s.location.lat],
      zoom: 6,
      pitch: 50,
      duration: 2200,
      essential: true,
    });
  };

  const handleClose = () => {
    setSelected(null);
    mapRef.current?.flyTo({
      center: [-30, 20],
      zoom: 1.4,
      pitch: 0,
      duration: 1500,
    });
  };

  return (
    <div className="relative flex h-full">
      <aside className="z-20 flex w-72 shrink-0 flex-col gap-6 border-r border-zinc-800 bg-zinc-950/80 p-5 backdrop-blur">
        <header>
          <h1 className="text-lg font-semibold text-zinc-100">UFO Encounters</h1>
          <p className="mt-1 text-xs text-zinc-500">
            Cross-reference of historical UAP sightings and the May 2026 Pentagon
            PURSUE release.
          </p>
        </header>

        <SourceFilter enabled={enabled} onToggle={toggle} counts={counts} />

        {range && (
          <TimelineFilter
            min={yearBounds[0]}
            max={yearBounds[1]}
            from={range[0]}
            to={range[1]}
            onChange={setRange}
          />
        )}

        <div className="mt-auto space-y-2 text-xs text-zinc-500">
          <p>
            Showing <span className="text-zinc-200">{filtered.length}</span> of{' '}
            {all.length} sightings
          </p>
          {!HAS_MAPTILER_KEY && (
            <p className="rounded border border-zinc-800 bg-zinc-900 p-2 text-[10px] text-zinc-500">
              Running without MapTiler key — using fallback tiles. Add{' '}
              <code>VITE_MAPTILER_KEY</code> to <code>.env.local</code> for full
              quality.
            </p>
          )}
        </div>
      </aside>

      <main className="relative flex-1 overflow-hidden bg-black">
        <StarField count={260} />

        <div className="absolute inset-0">
          <Map
            ref={mapRef}
            sightings={filtered}
            style={layerStyle}
            onSelect={handleSelect}
            autoRotate={autoRotate}
          />
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[5]"
          style={{
            background:
              'radial-gradient(circle at 30% 35%, rgba(195,244,255,0.06) 0%, rgba(0,0,0,0) 35%), radial-gradient(circle at 75% 70%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 50%)',
            mixBlendMode: 'screen',
          }}
        />

        <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2">
          <LayerSwitcher current={layerStyle} onChange={setLayerStyle} />
          <RotateToggle
            active={autoRotate}
            onToggle={() => setAutoRotate((v) => !v)}
          />
        </div>

        <SightingDetail sighting={selected} onClose={handleClose} />
      </main>
    </div>
  );
}

export default App;
