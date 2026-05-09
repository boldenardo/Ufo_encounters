import { MAP_STYLES, type LayerStyle } from '../mapStyles';

type Props = {
  current: LayerStyle;
  onChange: (s: LayerStyle) => void;
};

const ORDER: LayerStyle[] = ['dark', 'satellite', 'streets'];

export function LayerSwitcher({ current, onChange }: Props) {
  return (
    <div className="flex overflow-hidden rounded-md border border-zinc-700 bg-zinc-950/80 text-xs backdrop-blur">
      {ORDER.map((id) => {
        const meta = MAP_STYLES[id];
        const active = current === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`px-3 py-1.5 transition ${
              active
                ? 'bg-orange-400/20 text-orange-200'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}
