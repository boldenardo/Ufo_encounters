import { useState } from 'react';
import { SOURCES, type Sighting } from '../types';

// Satellite snapshot uses ESRI World Imagery (free, no key, no domain restriction).
const satelliteThumb = (lon: number, lat: number) =>
  `https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/export?bbox=${
    lon - 0.4
  },${lat - 0.2},${lon + 0.4},${lat + 0.2}&bboxSR=4326&size=600,300&format=png&transparent=false&f=image`;

// Google Maps satellite embed (no key, "?output=embed" works as standard share)
const mapEmbedUrl = (lon: number, lat: number) =>
  `https://maps.google.com/maps?q=${lat},${lon}&t=k&z=12&output=embed`;

// External viewer URLs (open in new tab) — guaranteed to work, even when embed coverage is missing
const googleMapsLink = (lon: number, lat: number) =>
  `https://www.google.com/maps/@${lat},${lon},18z/data=!3m1!1e3`;

const streetViewLink = (lon: number, lat: number) =>
  `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lon}`;

const mapillaryLink = (lon: number, lat: number) =>
  `https://www.mapillary.com/app/?lat=${lat}&lng=${lon}&z=17&panos=true`;

const osmLink = (lon: number, lat: number) =>
  `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=14`;

type Props = {
  sighting: Sighting | null;
  onClose: () => void;
};

export function SightingDetail({ sighting, onClose }: Props) {
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
    <aside className="fixed inset-0 z-30 flex flex-col overflow-y-auto border-l border-zinc-800 bg-zinc-950/95 p-4 backdrop-blur sm:absolute sm:left-auto sm:max-w-md sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span
            className="inline-block rounded px-2 py-0.5 text-[10px] font-medium sm:text-xs"
            style={{
              background: `${meta?.color}22`,
              color: meta?.color,
              border: `1px solid ${meta?.color}55`,
            }}
          >
            {meta?.label}
          </span>
          <h2 className="mt-2 text-lg leading-tight font-semibold text-zinc-100 sm:text-xl">
            {sighting.name}
          </h2>
          <p className="mt-1 text-xs text-zinc-400 sm:text-sm">
            {sighting.date} · {sighting.location.name}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="-mt-2 -mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded text-2xl leading-none text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="mb-3 flex items-center gap-2 rounded border border-zinc-800 bg-zinc-900 p-1.5">
        <code className="flex-1 truncate px-2 text-xs text-zinc-300">
          {coordsString}
        </code>
        <button
          type="button"
          onClick={handleCopy}
          className={`shrink-0 rounded px-2.5 py-1.5 text-[10px] tracking-wide uppercase transition ${
            copied
              ? 'bg-green-400/20 text-green-300'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-100'
          }`}
        >
          {copied ? '✓ Copied' : '📋 Copy'}
        </button>
      </div>

      <div className="mb-4 overflow-hidden rounded border border-zinc-800">
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-3 py-2">
          <span className="text-[10px] tracking-widest text-zinc-500 uppercase">
            Map · Satellite
          </span>
          <a
            href={googleMapsLink(lon, lat)}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] text-orange-300 hover:text-orange-200"
          >
            Fullscreen ↗
          </a>
        </div>
        <iframe
          key={`map-${sighting.id}`}
          src={mapEmbedUrl(lon, lat)}
          className="block h-56 w-full sm:h-64"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map view of ${sighting.location.name}`}
        />
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <a
          href={streetViewLink(lon, lat)}
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center gap-1 rounded border border-zinc-800 bg-zinc-900 p-3 text-center transition hover:border-orange-400/50 hover:bg-zinc-800"
        >
          <span className="text-lg">🚶</span>
          <span className="text-[10px] font-medium text-zinc-200">
            Street View
          </span>
          <span className="text-[9px] text-zinc-500">Google</span>
        </a>
        <a
          href={mapillaryLink(lon, lat)}
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center gap-1 rounded border border-zinc-800 bg-zinc-900 p-3 text-center transition hover:border-orange-400/50 hover:bg-zinc-800"
        >
          <span className="text-lg">📷</span>
          <span className="text-[10px] font-medium text-zinc-200">
            Mapillary
          </span>
          <span className="text-[9px] text-zinc-500">Open photos</span>
        </a>
        <a
          href={osmLink(lon, lat)}
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center gap-1 rounded border border-zinc-800 bg-zinc-900 p-3 text-center transition hover:border-orange-400/50 hover:bg-zinc-800"
        >
          <span className="text-lg">🗺️</span>
          <span className="text-[10px] font-medium text-zinc-200">OSM</span>
          <span className="text-[9px] text-zinc-500">OpenStreetMap</span>
        </a>
      </div>

      <div className="mb-4 overflow-hidden rounded border border-zinc-800">
        <p className="bg-zinc-900 px-3 py-1.5 text-[10px] tracking-widest text-zinc-500 uppercase">
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
          <p className="bg-zinc-900 px-3 py-1.5 text-[10px] tracking-widest text-zinc-500 uppercase">
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
            className="block py-1 text-orange-300 hover:text-orange-200"
          >
            → Wikipedia / primary source
          </a>
        )}
        {sighting.foiaUrl && (
          <a
            href={sighting.foiaUrl}
            target="_blank"
            rel="noreferrer"
            className="block py-1 text-orange-300 hover:text-orange-200"
          >
            → Declassified / FOIA document
          </a>
        )}
        {sighting.academicUrl && (
          <a
            href={sighting.academicUrl}
            target="_blank"
            rel="noreferrer"
            className="block py-1 text-orange-300 hover:text-orange-200"
          >
            → Academic / official analysis
          </a>
        )}
        {sighting.pursueFile && (
          <p className="text-zinc-500">
            PURSUE file:{' '}
            <code className="break-all text-zinc-400">
              {sighting.pursueFile}
            </code>
          </p>
        )}
      </div>
    </aside>
  );
}
