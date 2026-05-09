# Contributing to UFO Encounters

Thanks for the interest. The fastest way to help is adding well-sourced
sightings, but code, design, and data-pipeline contributions are all welcome.

## Adding a sighting

1. Open `public/data/sightings.json`
2. Add a new entry following the existing schema
3. **Required fields:**
   - `id` — kebab-case, prefixed with the source (`wiki-`, `pursue-2026-`)
   - `date` — ISO 8601 when known, otherwise descriptive (e.g. `"c. 1450 BC"`)
   - `year` — numeric year, or `null` if not applicable
   - `name` — short title
   - `location` — `{ name, lat, lon }`. Lat/lon must be real coordinates
   - `description` — 2-4 sentences, neutral tone
   - `source` — `"wikipedia"`, `"pursue-2026"`, or `"nuforc-aggregate"`
4. **Strongly preferred:**
   - `sourceUrl` — direct link to the primary source
   - `image` — public-domain or fair-use image URL
   - For PURSUE entries: `pursueFile` — the original gov filename

### Quality bar

- **Verifiable sources only.** Random Reddit posts don't qualify. Wikipedia,
  declassified government documents, peer-reviewed analyses, mainstream news
  with primary-source citations.
- **Neutral tone.** Describe what was reported, not whether it's real.
- **No NUFORC raw records.** Their ToS forbids redistribution. Aggregates only.

## Code contributions

- Run `npm run build` before submitting — TypeScript must pass
- Match the existing code style (Tailwind utility-first, no MUI, no inline
  styles except for dynamic colors)
- Keep the bundle lean — heavy deps need a discussion first

## PDF extraction (PURSUE files)

The 132 PURSUE PDFs need to be turned into structured records. This is
non-trivial:

- ~64 PDFs are scanned without OCR
- Locations and dates need extraction with vision/LLM
- Geocoding required

If you want to tackle this, open an issue first to coordinate.

## Code of conduct

Be a decent person. No harassment, no aliens-are-real-vs-fake flame wars in
the issue tracker. We're cataloging reports, not adjudicating them.
