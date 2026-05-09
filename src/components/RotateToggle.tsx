type Props = {
  active: boolean;
  onToggle: () => void;
};

export function RotateToggle({ active, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={active ? 'Stop globe rotation' : 'Start globe rotation'}
      className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs backdrop-blur transition ${
        active
          ? 'border-orange-400/50 bg-orange-400/20 text-orange-200'
          : 'border-zinc-700 bg-zinc-950/80 text-zinc-400 hover:text-zinc-100'
      }`}
    >
      <span
        className={`inline-block ${active ? 'animate-spin' : ''}`}
        style={{ animationDuration: '4s' }}
      >
        ◐
      </span>
      {active ? 'Rotating' : 'Rotate'}
    </button>
  );
}
