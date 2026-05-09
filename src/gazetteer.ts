// Lightweight gazetteer for matching place names in live-feed posts to coordinates.
// First match wins. More-specific entries (e.g. "Mount Rainier") should appear
// before generic ones (e.g. "Washington").

type GazetteerEntry = {
  name: string;
  aliases?: string[];
  lat: number;
  lon: number;
};

const ENTRIES: GazetteerEntry[] = [
  // UFO hot spots (most specific first)
  { name: 'Roswell', aliases: ['roswell, new mexico', 'roswell nm'], lat: 33.3943, lon: -104.523 },
  { name: 'Rendlesham', aliases: ['rendlesham forest'], lat: 52.0892, lon: 1.4419 },
  { name: 'Area 51', aliases: ['groom lake', 'dreamland'], lat: 37.2431, lon: -115.7930 },
  { name: 'Skinwalker Ranch', aliases: ['skinwalker'], lat: 40.2496, lon: -109.8889 },
  { name: 'Mount Rainier', aliases: ['mt rainier', 'mt. rainier'], lat: 46.8523, lon: -121.7603 },
  { name: 'Trindade Island', aliases: ['trindade'], lat: -20.5108, lon: -29.3158 },
  { name: 'Falcon Lake', lat: 49.7018, lon: -95.2423 },
  { name: 'Shag Harbour', aliases: ['shag harbor'], lat: 43.5028, lon: -65.7239 },
  { name: 'Varginha', lat: -21.5556, lon: -45.4306 },
  { name: 'Colares', aliases: ['operação prato', 'operacao prato'], lat: -0.9389, lon: -48.2864 },
  { name: 'Calvine', lat: 56.7833, lon: -3.9333 },
  { name: 'Lubbock', lat: 33.5779, lon: -101.8552 },
  { name: 'McMinnville', aliases: ['trent farm'], lat: 45.0993, lon: -123.3948 },
  { name: 'Great Falls', aliases: ['mariana ufo'], lat: 47.42, lon: -111.26 },
  { name: 'Manises', lat: 39.4699, lon: -0.3763 },
  { name: 'Kaikoura', lat: -42.4, lon: 173.68 },
  { name: 'Petrozavodsk', lat: 61.7849, lon: 34.3469 },
  { name: 'Stephenville', aliases: ['stephenville texas'], lat: 32.2207, lon: -98.2023 },
  { name: 'Aguadilla', lat: 18.4275, lon: -67.1541 },
  { name: 'Hessdalen', lat: 62.7833, lon: 11.2 },

  // Major cities — UFO-relevant
  { name: 'Phoenix', aliases: ['phoenix, arizona', 'phoenix az'], lat: 33.4484, lon: -112.074 },
  { name: 'Tehran', aliases: ['teheran'], lat: 35.6892, lon: 51.389 },
  { name: 'Chicago', aliases: ["o'hare", 'ohare'], lat: 41.8781, lon: -87.6298 },
  { name: 'San Diego', lat: 32.7157, lon: -117.1611 },
  { name: 'Los Angeles', aliases: ['la,', 'la area'], lat: 34.0522, lon: -118.2437 },
  { name: 'New York', aliases: ['nyc', 'new york city'], lat: 40.7128, lon: -74.006 },
  { name: 'Hudson Valley', lat: 41.3954, lon: -73.6187 },
  { name: 'Washington DC', aliases: ['washington d.c.', 'washington, dc'], lat: 38.8512, lon: -77.0402 },
  { name: 'Las Vegas', aliases: ['vegas'], lat: 36.1699, lon: -115.1398 },
  { name: 'Houston', lat: 29.7604, lon: -95.3698 },
  { name: 'Miami', lat: 25.7617, lon: -80.1918 },
  { name: 'Seattle', lat: 47.6062, lon: -122.3321 },
  { name: 'Denver', lat: 39.7392, lon: -104.9903 },
  { name: 'Dallas', lat: 32.7767, lon: -96.797 },
  { name: 'São Paulo', aliases: ['sao paulo'], lat: -23.5505, lon: -46.6333 },
  { name: 'Rio de Janeiro', aliases: ['rio'], lat: -22.9068, lon: -43.1729 },
  { name: 'Brasília', aliases: ['brasilia'], lat: -15.794, lon: -47.8825 },
  { name: 'Buenos Aires', lat: -34.6037, lon: -58.3816 },
  { name: 'Mexico City', aliases: ['cdmx'], lat: 19.4326, lon: -99.1332 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'Paris', lat: 48.8566, lon: 2.3522 },
  { name: 'Berlin', lat: 52.52, lon: 13.405 },
  { name: 'Madrid', lat: 40.4168, lon: -3.7038 },
  { name: 'Rome', aliases: ['roma'], lat: 41.9028, lon: 12.4964 },
  { name: 'Moscow', aliases: ['moscow russia'], lat: 55.7558, lon: 37.6173 },
  { name: 'Beijing', lat: 39.9042, lon: 116.4074 },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503 },
  { name: 'Seoul', lat: 37.5665, lon: 126.978 },
  { name: 'Sydney', lat: -33.8688, lon: 151.2093 },
  { name: 'Melbourne', lat: -37.8136, lon: 144.9631 },
  { name: 'Auckland', lat: -36.8485, lon: 174.7633 },
  { name: 'Toronto', lat: 43.6532, lon: -79.3832 },
  { name: 'Vancouver', lat: 49.2827, lon: -123.1207 },

  // US states (last resort, less specific)
  { name: 'Texas', lat: 31.0, lon: -100.0 },
  { name: 'Florida', lat: 27.9944, lon: -81.7603 },
  { name: 'California', lat: 36.7783, lon: -119.4179 },
  { name: 'Arizona', lat: 34.0489, lon: -111.0937 },
  { name: 'New Mexico', lat: 34.5199, lon: -105.8701 },
  { name: 'Nevada', lat: 38.8026, lon: -116.4194 },
  { name: 'Oregon', lat: 43.8041, lon: -120.5542 },
  { name: 'Montana', lat: 46.8797, lon: -110.3626 },
  { name: 'Alaska', lat: 64.2008, lon: -149.4937 },
];

export type GazetteerHit = {
  name: string;
  lat: number;
  lon: number;
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function findLocation(text: string): GazetteerHit | null {
  if (!text) return null;
  const haystack = text.toLowerCase();
  for (const entry of ENTRIES) {
    const candidates = [entry.name, ...(entry.aliases ?? [])];
    for (const c of candidates) {
      const pattern = new RegExp(`\\b${escapeRegex(c.toLowerCase())}\\b`);
      if (pattern.test(haystack)) {
        return { name: entry.name, lat: entry.lat, lon: entry.lon };
      }
    }
  }
  return null;
}
