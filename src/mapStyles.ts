export type LayerStyle = 'dark' | 'satellite' | 'streets';

export type StyleMeta = {
  id: LayerStyle;
  label: string;
  url: string;
  attribution: string;
};

const KEY = import.meta.env.VITE_MAPTILER_KEY as string | undefined;

// Fallback styles work without any API key. Used when VITE_MAPTILER_KEY is missing.
// Satellite uses an inline raster style pointing at ESRI World Imagery (free, no key).
const fallback: Record<LayerStyle, StyleMeta> = {
  dark: {
    id: 'dark',
    label: 'Dark',
    url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    attribution: '© OpenStreetMap contributors © CARTO',
  },
  satellite: {
    id: 'satellite',
    label: 'Satellite',
    url: 'data:application/json,' +
      encodeURIComponent(
        JSON.stringify({
          version: 8,
          sources: {
            esri: {
              type: 'raster',
              tiles: [
                'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
              ],
              tileSize: 256,
              attribution:
                'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
              maxzoom: 19,
            },
          },
          layers: [{ id: 'esri', type: 'raster', source: 'esri' }],
          glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
          sky: {},
        })
      ),
    attribution: '© Esri World Imagery',
  },
  streets: {
    id: 'streets',
    label: 'Streets',
    url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    attribution: '© OpenStreetMap contributors © CARTO',
  },
};

const maptiler = (id: LayerStyle, label: string, slug: string): StyleMeta => ({
  id,
  label,
  url: `https://api.maptiler.com/maps/${slug}/style.json?key=${KEY}`,
  attribution: '© MapTiler © OpenStreetMap contributors',
});

export const MAP_STYLES: Record<LayerStyle, StyleMeta> = KEY
  ? {
      dark: maptiler('dark', 'Dark', 'darkmatter'),
      satellite: maptiler('satellite', 'Satellite', 'hybrid'),
      streets: maptiler('streets', 'Streets', 'streets-v2'),
    }
  : fallback;

export const HAS_MAPTILER_KEY = Boolean(KEY);
