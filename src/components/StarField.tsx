import { useMemo } from 'react';

type Star = {
  left: string;
  top: string;
  size: number;
  delay: number;
  duration: number;
};

const seedRng = (seed: number) => () => {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
};

const buildStars = (count: number): Star[] => {
  const rng = seedRng(42);
  return Array.from({ length: count }, () => ({
    left: `${rng() * 100}%`,
    top: `${rng() * 100}%`,
    size: rng() < 0.85 ? 1 : rng() < 0.97 ? 2 : 3,
    delay: rng() * 5,
    duration: 1.5 + rng() * 4,
  }));
};

export function StarField({ count = 220 }: { count?: number }) {
  const stars = useMemo(() => buildStars(count), [count]);

  return (
    <>
      <style>{`
        @keyframes ufo-twinkle {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 1; }
        }
      `}</style>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse at center, #0a0d18 0%, #04060c 60%, #000000 100%)',
        }}
      >
        {stars.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              animation: `ufo-twinkle ${s.duration}s ease-in-out ${s.delay}s infinite`,
              boxShadow: s.size > 1 ? '0 0 4px rgba(255,255,255,0.8)' : undefined,
            }}
          />
        ))}
      </div>
    </>
  );
}
