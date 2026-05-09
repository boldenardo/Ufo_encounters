type Props = {
  min: number;
  max: number;
  from: number;
  to: number;
  onChange: (range: [number, number]) => void;
};

export function TimelineFilter({ min, max, from, to, onChange }: Props) {
  return (
    <div className="space-y-2">
      <h2 className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
        Year range
      </h2>
      <div className="flex items-center justify-between text-xs text-zinc-300">
        <span>{from}</span>
        <span className="text-zinc-500">{max - min} years</span>
        <span>{to}</span>
      </div>
      <div className="flex flex-col gap-2">
        <input
          type="range"
          min={min}
          max={max}
          value={from}
          onChange={(e) =>
            onChange([Math.min(+e.target.value, to), to])
          }
          className="w-full accent-orange-400"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={to}
          onChange={(e) =>
            onChange([from, Math.max(+e.target.value, from)])
          }
          className="w-full accent-orange-400"
        />
      </div>
    </div>
  );
}
