import { SOURCES, type SightingSource } from '../types';

type Props = {
  enabled: Set<SightingSource>;
  onToggle: (src: SightingSource) => void;
  counts: Record<SightingSource, number>;
};

export function SourceFilter({ enabled, onToggle, counts }: Props) {
  return (
    <div className="space-y-2">
      <h2 className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
        Sources
      </h2>
      {SOURCES.map((src) => {
        const on = enabled.has(src.id);
        return (
          <label
            key={src.id}
            className="flex cursor-pointer items-center gap-3 text-sm"
          >
            <input
              type="checkbox"
              checked={on}
              onChange={() => onToggle(src.id)}
              className="sr-only"
            />
            <span
              className="h-3 w-3 rounded-full ring-2 ring-black/40 transition"
              style={{
                background: on ? src.color : 'transparent',
                borderColor: src.color,
                boxShadow: on ? `0 0 0 1px ${src.color}` : 'none',
              }}
            />
            <span className={on ? 'text-zinc-100' : 'text-zinc-500'}>
              {src.label}
            </span>
            <span className="ml-auto text-xs text-zinc-500">
              {counts[src.id] ?? 0}
            </span>
          </label>
        );
      })}
    </div>
  );
}
