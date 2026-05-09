# UFO Encounters

Interactive 3D globe cross-referencing historical UAP sightings with the May 2026 Pentagon **PURSUE** declassification release.

Built in the days after [war.gov/UFO/](https://www.war.gov/UFO/) went live with 162 declassified files from FBI, DoW, NASA, NARA and the State Department.

## Features

- 🌍 **3D globe** (MapLibre GL globe projection) with auto-rotation
- 🛰️ **Three base layers**: dark, satellite, streets
- 🔥 **Heatmap → points** transition based on zoom level
- 🎯 **Animated fly-to** when selecting a sighting (camera tilt + zoom)
- 🖼️ **Per-sighting satellite snapshot** + historical evidence image side by side
- 🗂️ **Source filter**: Wikipedia / PURSUE 2026 / NUFORC (aggregate)
- 📅 **Year-range timeline** filter
- ⚡ **No backend** — static JSON, deploys anywhere

## Stack

- Vite + React 19 + TypeScript
- MapLibre GL v5 (globe projection)
- Tailwind CSS v4
- MapTiler tiles (with no-key fallback to Carto + ESRI)

## Quick start

```bash
git clone https://github.com/<your-username>/ufo-map.git
cd ufo-map
npm install
cp .env.example .env.local
# edit .env.local and add your MapTiler key
npm run dev
```

Open <http://localhost:5173>

> The app **runs without a MapTiler key** — it falls back to Carto (dark) + ESRI (satellite). Get a free key at [maptiler.com](https://cloud.maptiler.com/) for full-quality tiles.

### Restricting your MapTiler key

Before deploying, restrict your key in the MapTiler dashboard under
**API Keys → your key → Allowed HTTP origins**:

```text
http://localhost:5173
http://localhost:*
https://your-domain.vercel.app
```

This prevents the key from working if it leaks.

## Deploy

The app is a static SPA. Any host that serves static files works.

### Vercel (recommended)

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add `VITE_MAPTILER_KEY` as an environment variable
4. Deploy

A `vercel.json` is included with sensible defaults.

### Other hosts

```bash
npm run build
# upload the dist/ folder to Netlify, GitHub Pages, Cloudflare Pages, etc.
```

## Data

Sightings live in [`public/data/sightings.json`](public/data/sightings.json) as a
flat array. Schema:

```ts
type Sighting = {
  id: string;
  date: string;          // ISO when known, free-text for ancient sightings
  year: number | null;
  name: string;
  location: { name: string; lat: number; lon: number; };
  description: string;
  source: 'wikipedia' | 'pursue-2026' | 'nuforc-aggregate';
  sourceUrl?: string;
  pursueFile?: string;   // original government filename for PURSUE entries
  image?: string;
};
```

### Sources used

- **Wikipedia** — historical sightings from the [List of reported UFO sightings](https://en.wikipedia.org/wiki/List_of_reported_UFO_sightings) (CC BY-SA)
- **Pentagon PURSUE 2026** — files from [war.gov/UFO/](https://www.war.gov/UFO/) (US government public domain). Raw mirror at [ckpxgfnksd-max/uap-release-01](https://github.com/ckpxgfnksd-max/uap-release-01)
- **NUFORC** — aggregate counts only. NUFORC's [terms of service](https://nuforc.org/terms/) forbid redistributing raw records, so this project will never include individual NUFORC entries

## Contributing

Contributions welcome — especially:

- **More sightings** with verifiable sources (PRs against `public/data/sightings.json`)
- **PDF extraction pipeline** for the 132 PURSUE files (Phase 3)
- **NUFORC aggregate views** (counts by region/shape/year, no raw records)
- Visual polish, performance, accessibility

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

[MIT](LICENSE) — do whatever you want, just don't claim you made it alone.
