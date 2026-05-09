import { SOURCES, type Sighting } from '../types';

const KEY = import.meta.env.VITE_MAPTILER_KEY as string | undefined;

const satelliteThumb = (lon: number, lat: number) => {
  if (KEY) {
    return `https://api.maptiler.com/maps/hybrid/static/${lon},${lat},10/600x300.png?key=${KEY}`;
  }
  return `https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/export?bbox=${
    lon - 0.4
  },${lat - 0.2},${lon + 0.4},${lat + 0.2}&bboxSR=4326&size=600,300&format=png&transparent=false&f=image`;
};

const googleMapsEmbedUrl = (lon: number, lat: number) =>
  `https://maps.google.com/maps?q=${lat},${lon}&t=k&z=12&output=embed`;

const googleMapsLink = (lon: number, lat: number) =>
  `https://www.google.com/maps/@${lat},${lon},15z/data=!3m1!1e3`;

type Props = {
  sighting: Sighting | null;
  onClose: () => void;
};

export function SightingDetail({ sighting, onClose }: Props) {
  if (!sighting) return null;
  const meta = SOURCES.find((s) => s.id === sighting.source);

  return (
    <aside className="absolute top-0 right-0 z-10 flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-zinc-800 bg-zinc-950/95 p-6 backdrop-blur">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <span
            className="inline-block rounded px-2 py-0.5 text-xs font-medium"
            style={{
              background: `${meta?.color}22`,
              color: meta?.color,
              border: `1px solid ${meta?.color}55`,
            }}
          >
            {meta?.label}
          </span>
          <h2 className="mt-2 text-xl font-semibold text-zinc-100">
            {sighting.name}
          </h2>
          <p className="text-sm text-zinc-400">
            {sighting.date} · {sighting.location.name}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-2xl leading-none text-zinc-500 hover:text-zinc-200"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="mb-4 overflow-hidden rounded border border-zinc-800">
        <p className="bg-zinc-900 px-3 py-1 text-[10px] tracking-widest text-zinc-500 uppercase">
          Google Maps — site exato
        </p>
        <iframe
          src={googleMapsEmbedUrl(sighting.location.lon, sighting.location.lat)}
          className="block h-64 w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Google Maps view of ${sighting.location.name}`}
        />
        <a
          href={googleMapsLink(sighting.location.lon, sighting.location.lat)}
          target="_blank"
          rel="noreferrer"
          className="block bg-zinc-900 px-3 py-1 text-[10px] text-orange-300 hover:text-orange-200"
        >
          → Open in Google Maps · {sighting.location.lat.toFixed(4)}°,{' '}
          {sighting.location.lon.toFixed(4)}°
        </a>
      </div>

      <div className="mb-4 overflow-hidden rounded border border-zinc-800">
        <p className="bg-zinc-900 px-3 py-1 text-[10px] tracking-widest text-zinc-500 uppercase">
          Satellite snapshot
        </p>
        <img
          src={satelliteThumb(sighting.location.lon, sighting.location.lat)}
          alt={`Satellite view of ${sighting.location.name}`}
          className="block w-full"
          loading="lazy"
        />
      </div>

      {sighting.image && (
        <div className="mb-4 overflow-hidden rounded border border-zinc-800">
          <p className="bg-zinc-900 px-3 py-1 text-[10px] tracking-widest text-zinc-500 uppercase">
            Historical evidence
          </p>
          <img src={sighting.image} alt="" className="block w-full" />
          {sighting.imageLicense && (
            <p className="bg-zinc-900 px-3 py-1 text-[10px] text-zinc-500">
              License: {sighting.imageLicense}
            </p>
          )}
        </div>
      )}

      <p className="text-sm leading-relaxed text-zinc-200">
        {sighting.description}
      </p>

      {sighting.aaroMention && (
        <div className="mt-4 rounded border border-orange-400/30 bg-orange-400/10 p-3">
          <p className="mb-1 text-[10px] tracking-widest text-orange-300 uppercase">
            AARO / DoD reference
          </p>
          <p className="text-xs leading-relaxed text-orange-100">
            {sighting.aaroMention}
          </p>
        </div>
      )}

      <div className="mt-6 space-y-2 border-t border-zinc-800 pt-4 text-xs">
        {sighting.sourceUrl && (
          <a
            href={sighting.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="block text-orange-300 hover:text-orange-200"
          >
            → Wikipedia / primary source
          </a>
        )}
        {sighting.foiaUrl && (
          <a
            href={sighting.foiaUrl}
            target="_blank"
            rel="noreferrer"
            className="block text-orange-300 hover:text-orange-200"
          >
            → Declassified / FOIA document
          </a>
        )}
        {sighting.academicUrl && (
          <a
            href={sighting.academicUrl}
            target="_blank"
            rel="noreferrer"
            className="block text-orange-300 hover:text-orange-200"
          >
            → Academic / official analysis
          </a>
        )}
        {sighting.pursueFile && (
          <p className="text-zinc-500">
            PURSUE file: <code className="text-zinc-400">{sighting.pursueFile}</code>
          </p>
        )}
      </div>
    </aside>
  );
}
