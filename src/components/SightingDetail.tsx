import { useState } from 'react';
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

const mapEmbedUrl = (lon: number, lat: number) =>
  `https://maps.google.com/maps?q=${lat},${lon}&t=k&z=12&output=embed`;

const streetViewEmbedUrl = (lon: number, lat: number) =>
  `https://maps.google.com/maps?q=&layer=c&cbll=${lat},${lon}&cbp=11,0,0,0,0&output=svembed`;

const mapLink = (lon: number, lat: number) =>
  `https://www.google.com/maps/@${lat},${lon},15z/data=!3m1!1e3`;

const streetViewLink = (lon: number, lat: number) =>
  `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lon}`;

type Tab = 'map' | 'streetview';

type Props = {
  sighting: Sighting | null;
  onClose: () => void;
};

export function SightingDetail({ sighting, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('map');
  const [copied, setCopied] = useState(false);

  if (!sighting) return null;
  const meta = SOURCES.find((s) => s.id === sighting.source);
  const { lat, lon } = sighting.location;
  const coordsString = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coordsString);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Silent fail — older browsers or HTTP context
    }
  };

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

      <div className="mb-2 flex items-center gap-2 rounded border border-zinc-800 bg-zinc-900 p-1.5">
        <code className="flex-1 px-2 text-xs text-zinc-300">{coordsString}</code>
        <button
          type="button"
          onClick={handleCopy}
          className={`rounded px-2 py-1 text-[10px] tracking-wide uppercase transition ${
            copied
              ? 'bg-green-400/20 text-green-300'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100'
          }`}
        >
          {copied ? '✓ Copied' : '📋 Copy'}
        </button>
      </div>

      <div className="mb-4 overflow-hidden rounded border border-zinc-800">
        <div className="flex border-b border-zinc-800 bg-zinc-900">
          <button
            type="button"
            onClick={() => setTab('map')}
            className={`flex-1 px-3 py-2 text-[11px] tracking-widest uppercase transition ${
              tab === 'map'
                ? 'bg-zinc-950 text-orange-300'
                : 'text-zinc-500 hover:text-zinc-200'
            }`}
          >
            Satellite
          </button>
          <button
            type="button"
            onClick={() => setTab('streetview')}
            className={`flex-1 px-3 py-2 text-[11px] tracking-widest uppercase transition ${
              tab === 'streetview'
                ? 'bg-zinc-950 text-orange-300'
                : 'text-zinc-500 hover:text-zinc-200'
            }`}
          >
            Street View
          </button>
        </div>

        {tab === 'map' ? (
          <>
            <iframe
              key={`map-${sighting.id}`}
              src={mapEmbedUrl(lon, lat)}
              className="block h-64 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Map view of ${sighting.location.name}`}
            />
            <a
              href={mapLink(lon, lat)}
              target="_blank"
              rel="noreferrer"
              className="block bg-zinc-900 px-3 py-1.5 text-[10px] text-orange-300 hover:text-orange-200"
            >
              → Open in Google Maps
            </a>
          </>
        ) : (
          <>
            <iframe
              key={`sv-${sighting.id}`}
              src={streetViewEmbedUrl(lon, lat)}
              className="block h-64 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Street View of ${sighting.location.name}`}
            />
            <p className="bg-zinc-900 px-3 py-1.5 text-[10px] text-zinc-500">
              Street View shows the closest pano. Remote/ocean sites may have no
              imagery.
            </p>
            <a
              href={streetViewLink(lon, lat)}
              target="_blank"
              rel="noreferrer"
              className="block bg-zinc-900 px-3 py-1.5 text-[10px] text-orange-300 hover:text-orange-200"
            >
              → Open Street View in Google Maps
            </a>
          </>
        )}
      </div>

      <div className="mb-4 overflow-hidden rounded border border-zinc-800">
        <p className="bg-zinc-900 px-3 py-1 text-[10px] tracking-widest text-zinc-500 uppercase">
          Satellite snapshot
        </p>
        <img
          src={satelliteThumb(lon, lat)}
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
