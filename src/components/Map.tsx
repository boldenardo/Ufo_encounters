import {
  Map as MapLibre,
  Source,
  Layer,
  type MapRef,
  type MapLayerMouseEvent,
} from 'react-map-gl/maplibre';
import { forwardRef, useCallback, useEffect, useMemo, useRef } from 'react';
import { SOURCES, type Sighting } from '../types';
import { MAP_STYLES, type LayerStyle } from '../mapStyles';
import type { LiveFeedItem } from '../liveFeed';

const HEATMAP_MAX_ZOOM = 4;

const buildGeoJson = (sightings: Sighting[]) => ({
  type: 'FeatureCollection' as const,
  features: sightings.map((s) => ({
    type: 'Feature' as const,
    properties: { id: s.id, source: s.source, name: s.name },
    geometry: {
      type: 'Point' as const,
      coordinates: [s.location.lon, s.location.lat],
    },
  })),
});

const SOURCE_COLOR_EXPRESSION = [
  'match',
  ['get', 'source'],
  ...SOURCES.flatMap((s) => [s.id, s.color]),
  '#ffffff',
] as unknown as maplibregl.ExpressionSpecification;

const buildLiveGeoJson = (items: LiveFeedItem[]) => ({
  type: 'FeatureCollection' as const,
  features: items
    .filter((i) => i.location)
    .map((i) => ({
      type: 'Feature' as const,
      properties: { id: i.id, source: i.source, title: i.title, url: i.url },
      geometry: {
        type: 'Point' as const,
        coordinates: [i.location!.lon, i.location!.lat],
      },
    })),
});

type Props = {
  sightings: Sighting[];
  style: LayerStyle;
  onSelect: (s: Sighting) => void;
  autoRotate: boolean;
  liveItems?: LiveFeedItem[];
};

export const Map = forwardRef<MapRef, Props>(function Map(
  { sightings, style, onSelect, autoRotate, liveItems = [] },
  ref
) {
  const innerRef = useRef<MapRef | null>(null);
  const userInteracting = useRef(false);

  const setRefs = (node: MapRef | null) => {
    innerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  const data = useMemo(() => buildGeoJson(sightings), [sightings]);
  const liveData = useMemo(() => buildLiveGeoJson(liveItems), [liveItems]);
  const sightingsById = useMemo(() => {
    const m: Record<string, Sighting> = {};
    sightings.forEach((s) => {
      m[s.id] = s;
    });
    return m;
  }, [sightings]);

  // Apply atmospheric sky (halo) once map is loaded and on style changes
  useEffect(() => {
    const map = innerRef.current?.getMap();
    if (!map) return;
    const applySky = () => {
      try {
        map.setSky({
          'sky-color': '#000000',
          'sky-horizon-blend': 0.85,
          'horizon-color': '#7ab8ff',
          'horizon-fog-blend': 0.7,
          'fog-color': '#04060c',
          'fog-ground-blend': 0.7,
          'atmosphere-blend': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0,
            1,
            6,
            0.6,
            12,
            0,
          ],
        });
      } catch {
        // older versions of MapLibre may not support setSky
      }
    };
    if (map.isStyleLoaded()) applySky();
    else map.once('style.load', applySky);
    map.on('style.load', applySky);
    return () => {
      map.off('style.load', applySky);
    };
  }, [style]);

  useEffect(() => {
    if (!autoRotate) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const map = innerRef.current?.getMap();
      if (map && !userInteracting.current && !map.isMoving()) {
        const dt = (now - last) / 1000;
        const center = map.getCenter();
        map.jumpTo({ center: [(center.lng + dt * 4) % 360, center.lat] });
      }
      last = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [autoRotate]);

  const handleClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature) return;
      const layerId = feature.layer?.id;
      const id = feature.properties?.id as string | undefined;
      if (!id) return;
      if (layerId === 'live-points') {
        const url = feature.properties?.url as string | undefined;
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }
      const sighting = sightingsById[id];
      if (sighting) onSelect(sighting);
    },
    [sightingsById, onSelect]
  );

  const handleMouseEnter = useCallback(() => {
    const map = innerRef.current?.getMap();
    if (map) map.getCanvas().style.cursor = 'pointer';
  }, []);

  const handleMouseLeave = useCallback(() => {
    const map = innerRef.current?.getMap();
    if (map) map.getCanvas().style.cursor = '';
  }, []);

  return (
    <MapLibre
      ref={setRefs}
      initialViewState={{ longitude: -30, latitude: 20, zoom: 1.4 }}
      mapStyle={MAP_STYLES[style].url}
      projection="globe"
      style={{ width: '100%', height: '100%' }}
      attributionControl={{ compact: true }}
      interactiveLayerIds={['sightings-points', 'live-points']}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={() => {
        userInteracting.current = true;
      }}
      onMouseUp={() => {
        userInteracting.current = false;
      }}
      onTouchStart={() => {
        userInteracting.current = true;
      }}
      onTouchEnd={() => {
        userInteracting.current = false;
      }}
    >
      <Source id="sightings" type="geojson" data={data}>
        <Layer
          id="sightings-heat"
          type="heatmap"
          maxzoom={HEATMAP_MAX_ZOOM}
          paint={{
            'heatmap-weight': 1,
            'heatmap-intensity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0,
              0.7,
              HEATMAP_MAX_ZOOM,
              2,
            ],
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0,
              'rgba(0,0,0,0)',
              0.2,
              'rgba(125,211,252,0.5)',
              0.5,
              'rgba(251,146,60,0.85)',
              1,
              'rgba(248,113,113,0.98)',
            ],
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0,
              16,
              HEATMAP_MAX_ZOOM,
              40,
            ],
            'heatmap-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              HEATMAP_MAX_ZOOM - 1,
              0.85,
              HEATMAP_MAX_ZOOM,
              0,
            ],
          }}
        />
        <Layer
          id="sightings-glow"
          type="circle"
          paint={{
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0,
              8,
              4,
              14,
              10,
              28,
            ],
            'circle-color': SOURCE_COLOR_EXPRESSION,
            'circle-opacity': 0.35,
            'circle-blur': 1,
          }}
        />
        <Layer
          id="sightings-points"
          type="circle"
          paint={{
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0,
              5,
              4,
              7,
              10,
              12,
            ],
            'circle-color': SOURCE_COLOR_EXPRESSION,
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 1.5,
            'circle-stroke-opacity': 0.9,
            'circle-opacity': 1,
          }}
        />
      </Source>

      <Source id="live" type="geojson" data={liveData}>
        <Layer
          id="live-glow"
          type="circle"
          paint={{
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0,
              14,
              4,
              22,
              10,
              40,
            ],
            'circle-color': [
              'match',
              ['get', 'source'],
              'reddit',
              '#ff4500',
              'bluesky',
              '#1083fe',
              '#22d3ee',
            ] as unknown as maplibregl.ExpressionSpecification,
            'circle-opacity': 0.45,
            'circle-blur': 1,
          }}
        />
        <Layer
          id="live-points"
          type="circle"
          paint={{
            'circle-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              0,
              7,
              4,
              10,
              10,
              16,
            ],
            'circle-color': [
              'match',
              ['get', 'source'],
              'reddit',
              '#ff4500',
              'bluesky',
              '#1083fe',
              '#22d3ee',
            ] as unknown as maplibregl.ExpressionSpecification,
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 2,
            'circle-opacity': 1,
          }}
        />
      </Source>
    </MapLibre>
  );
});
