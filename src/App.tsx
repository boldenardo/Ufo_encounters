import { useEffect, useMemo, useRef, useState } from 'react';
import type { MapRef } from 'react-map-gl/maplibre';
import { Map } from './components/Map';
import { SourceFilter } from './components/SourceFilter';
import { TimelineFilter } from './components/TimelineFilter';
import { SightingDetail } from './components/SightingDetail';
import { LayerSwitcher } from './components/LayerSwitcher';
import { RotateToggle } from './components/RotateToggle';
import { StarField } from './components/StarField';
import { LiveFeed } from './components/LiveFeed';
import { ChatDrawer } from './components/ChatDrawer';
import { SOURCES, type Sighting, type SightingSource } from './types';
import { HAS_MAPTILER_KEY, type LayerStyle } from './mapStyles';
import {
  fetchLiveFeed,
  type LiveFeedItem,
  type LiveFeedSource,
} from './liveFeed';

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
  const [liveFeedOpen, setLiveFeedOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(min-width: 768px)').matches;
  });
  const [liveItems, setLiveItems] = useState<LiveFeedItem[]>([]);
  const [liveErrors, setLiveErrors] = useState<string[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveFetched, setLiveFetched] = useState<number | null>(null);
  const [liveSourcesEnabled, setLiveSourcesEnabled] = useState<
    Set<LiveFeedSource>
  >(new Set(['reddit', 'bluesky']));
  const [showLiveOnGlobe, setShowLiveOnGlobe] = useState(true);

  const loadLive = async () => {
    setLiveLoading(true);
    try {
      const { items, errors } = await fetchLiveFeed();
      setLiveItems(items);
      setLiveErrors(errors);
      setLiveFetched(Date.now());
    } finally {
      setLiveLoading(false);
    }
  };

  useEffect(() => {
    if ((liveFeedOpen || showLiveOnGlobe) && liveFetched === null) loadLive();
  }, [liveFeedOpen, showLiveOnGlobe, liveFetched]);

  const liveItemsForMap = useMemo(() => {
    if (!showLiveOnGlobe) return [];
    return liveItems.filter((i) => liveSourcesEnabled.has(i.source));
  }, [liveItems, liveSourcesEnabled, showLiveOnGlobe]);

  const toggleLiveSource = (s: LiveFeedSource) => {
    setLiveSourcesEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

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
    <div className="relative h-full">
      {!sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          className="absolute top-4 left-4 z-40 flex h-10 w-10 items-center justify-center rounded-md border border-zinc-700 bg-zinc-950/85 text-zinc-200 backdrop-blur hover:border-orange-400/50 hover:text-orange-300"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
      )}

      <aside
        className={`absolute top-0 left-0 z-30 flex h-full w-72 max-w-[85vw] flex-col gap-6 overflow-y-auto border-r border-zinc-800 bg-zinc-950/90 p-5 backdrop-blur transition-transform duration-300 md:relative md:max-w-none ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:-translate-x-full md:w-0 md:p-0 md:border-0'
        }`}
      >
        <header className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">UFO Encounters</h1>
            <p className="mt-1 text-xs text-zinc-500">
              Cross-reference of historical UAP sightings and the May 2026 Pentagon
              PURSUE release.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Hide menu"
            title="Hide menu (full globe view)"
            className="shrink-0 rounded border border-zinc-700 px-2 py-1 text-[10px] tracking-widest text-zinc-400 uppercase hover:text-zinc-100"
          >
            ← Hide
          </button>
        </header>

        <div className="space-y-2 rounded-md border border-zinc-800 bg-zinc-900/50 p-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-medium text-zinc-200">
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-400" />
              </span>
              Live Feed
            </span>
            <button
              type="button"
              onClick={() => setLiveFeedOpen((v) => !v)}
              className="rounded border border-zinc-700 px-2 py-0.5 text-[10px] tracking-widest text-zinc-400 uppercase hover:text-zinc-100"
            >
              {liveFeedOpen ? 'Hide' : 'Open'}
            </button>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-[11px] text-zinc-400">
            <input
              type="checkbox"
              checked={showLiveOnGlobe}
              onChange={(e) => setShowLiveOnGlobe(e.target.checked)}
              className="accent-orange-400"
            />
            Show on globe
            {liveItemsForMap.length > 0 && (
              <span className="ml-auto text-zinc-500">
                {liveItemsForMap.length} pin{liveItemsForMap.length === 1 ? '' : 's'}
              </span>
            )}
          </label>

          <div className="flex gap-1">
            {(['reddit', 'bluesky'] as LiveFeedSource[]).map((src) => {
              const on = liveSourcesEnabled.has(src);
              const color = src === 'reddit' ? '#ff4500' : '#1083fe';
              const label = src === 'reddit' ? 'Reddit' : 'Bluesky';
              return (
                <button
                  key={src}
                  type="button"
                  onClick={() => toggleLiveSource(src)}
                  className="flex-1 rounded border px-2 py-1 text-[10px] tracking-wide transition"
                  style={{
                    borderColor: on ? color : '#3f3f46',
                    background: on ? `${color}22` : 'transparent',
                    color: on ? color : '#71717a',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

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

      <main
        className={`relative h-full overflow-hidden bg-black transition-all duration-300 ${
          sidebarOpen ? 'md:ml-72' : 'ml-0'
        }`}
      >
        <StarField count={260} />

        <div className="absolute inset-0">
          <Map
            ref={mapRef}
            sightings={filtered}
            style={layerStyle}
            onSelect={handleSelect}
            autoRotate={autoRotate}
            liveItems={liveItemsForMap}
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
        <ChatDrawer />
      </main>

      <LiveFeed
        open={liveFeedOpen}
        onClose={() => setLiveFeedOpen(false)}
        items={liveItems}
        errors={liveErrors}
        loading={liveLoading}
        lastFetched={liveFetched}
        onRefresh={loadLive}
        enabledSources={liveSourcesEnabled}
      />
    </div>
  );
}

export default App;
