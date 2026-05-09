export type LayerStyle = 'dark' | 'satellite' | 'streets';

export type StyleMeta = {
  id: LayerStyle;
  label: string;
  url: string;
  attribution: string;
};

const KEY = import.meta.env.VITE_MAPTILER_KEY as string | undefined;

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
    url: 'https://api.maptiler.com/maps/hybrid/style.json?key=public',
    attribution: '© MapTiler © OpenStreetMap contributors',
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
