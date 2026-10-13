import { useId, useMemo } from 'react';

/**
 * Generative hero art: glassy bubbles drifting on a pale grey field, with
 * depth of field. Seeded so the composition is stable between renders.
 */

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Bubble {
  x: number;
  y: number;
  r: number;
  blur: number;
}

const W = 1200;
const H = 440;

function compose(seed: number) {
  const rand = rng(seed);
  const gauss = () => (rand() + rand() + rand() - 1.5) / 1.5;
  const bubbles: Bubble[] = [];
  const fizz: Bubble[] = [];

  // Bubbles follow a soft arc from upper left, dipping through the middle, rising to the right.
  const along = (t: number) => ({
    x: 120 + t * 900,
    y: 110 + Math.sin(t * Math.PI) * 170 + t * 20
  });

  // Hero bubbles in focus, each sitting in its own cloud of fizz
  const heroes = [
    { t: 0.3, r: 86 },
    { t: 0.5, r: 52 },
    { t: 0.62, r: 40 },
    { t: 0.12, r: 30 },
    { t: 0.78, r: 24 },
    { t: 0.42, r: 18 }
  ];
  for (const h of heroes) {
    const p = along(h.t);
    const b = { x: p.x + gauss() * 30, y: p.y + gauss() * 30, r: h.r, blur: 0 };
    bubbles.push(b);
    const count = Math.round(h.r * 4);
    for (let i = 0; i < count; i++) {
      const a = rand() * Math.PI * 2;
      const d = b.r * (0.9 + Math.abs(gauss()) * 1.6);
      fizz.push({ x: b.x + Math.cos(a) * d, y: b.y + Math.sin(a) * d * 0.85, r: 0.6 + Math.pow(rand(), 4) * 3.5, blur: 0 });
    }
  }

  // Mid bubbles scattered along the arc, some slightly soft
  for (let i = 0; i < 30; i++) {
    const p = along(rand());
    bubbles.push({
      x: p.x + gauss() * 140,
      y: p.y + gauss() * 90,
      r: 4 + Math.pow(rand(), 2) * 16,
      blur: rand() < 0.35 ? 1.5 + rand() * 2 : 0
    });
  }

  // Large out-of-focus foreground bubbles in the corners
  bubbles.push({ x: 40, y: 430, r: 110, blur: 14 }, { x: 230, y: 470, r: 70, blur: 10 }, { x: 1150, y: 40, r: 58, blur: 9 });

  // Fine fizz drifting along the arc
  for (let i = 0; i < 700; i++) {
    const p = along(rand());
    fizz.push({
      x: p.x + gauss() * 120,
      y: p.y + gauss() * 70,
      r: 0.5 + Math.pow(rand(), 4) * 3,
      blur: rand() < 0.35 ? 1.2 : 0
    });
  }

  // Draw the blurred ones first so focused bubbles sit on top.
  bubbles.sort((a, b) => b.blur - a.blur || a.r - b.r);
  return { bubbles, fizz };
}

export function BubblesArt({ seed = 7, className }: { seed?: number; className?: string }) {
  const id = useId().replace(/:/g, '');
  const { bubbles, fizz } = useMemo(() => compose(seed), [seed]);
  const blurLevels = [...new Set(bubbles.map((b) => b.blur).filter(Boolean).map(Math.round))];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label="Abstract illustration of clear bubbles on a light grey background"
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e9ebef" />
          <stop offset="1" stopColor="#f5f6f8" />
        </linearGradient>
        {/* Glass body: clear centre, dark refracted rim, bright edge */}
        <radialGradient id={`${id}-body`} cx="0.5" cy="0.55" r="0.5">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="0.7" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="0.88" stopColor="#9aa1ad" stopOpacity="0.35" />
          <stop offset="0.96" stopColor="#2b2f38" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.9" />
        </radialGradient>
        {/* Dark environment reflection across the top */}
        <radialGradient id={`${id}-dark`} cx="0.5" cy="0.15" r="0.6">
          <stop offset="0" stopColor="#0b0d11" stopOpacity="1" />
          <stop offset="0.6" stopColor="#1b1e25" stopOpacity="0.75" />
          <stop offset="1" stopColor="#1b1e25" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-glow`} cx="0.5" cy="0.75" r="0.5">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        {blurLevels.map((b) => (
          <filter key={b} id={`${id}-blur${b}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={b} />
          </filter>
        ))}
        <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>

      <rect width={W} height={H} fill={`url(#${id}-bg)`} />

      <g>
        {fizz.map((f, i) => (
          <circle
            key={i}
            cx={f.x}
            cy={f.y}
            r={f.r}
            fill="#ffffff"
            fillOpacity={0.55}
            stroke="#8a919c"
            strokeOpacity={0.45}
            strokeWidth={0.6}
            filter={f.blur ? `url(#${id}-soft)` : undefined}
          />
        ))}
      </g>

      {bubbles.map((b, i) => {
        const clip = `${id}-c${i}`;
        return (
          <g key={i} filter={b.blur ? `url(#${id}-blur${Math.round(b.blur)})` : undefined}>
            <clipPath id={clip}>
              <circle cx={b.x} cy={b.y} r={b.r} />
            </clipPath>
            <circle cx={b.x} cy={b.y} r={b.r} fill={`url(#${id}-body)`} />
            <g clipPath={`url(#${clip})`}>
              <ellipse cx={b.x} cy={b.y - b.r * 0.55} rx={b.r * 1.05} ry={b.r * 0.62} fill={`url(#${id}-dark)`} />
              <ellipse cx={b.x} cy={b.y + b.r * 0.45} rx={b.r * 0.7} ry={b.r * 0.45} fill={`url(#${id}-glow)`} />
            </g>
            <ellipse
              cx={b.x - b.r * 0.28}
              cy={b.y - b.r * 0.42}
              rx={b.r * 0.16}
              ry={b.r * 0.09}
              fill="#ffffff"
              fillOpacity={0.9}
              transform={`rotate(-25 ${b.x - b.r * 0.28} ${b.y - b.r * 0.42})`}
            />
            <circle cx={b.x} cy={b.y} r={b.r - 0.6} fill="none" stroke="#ffffff" strokeOpacity={0.7} strokeWidth={1.2} />
          </g>
        );
      })}
    </svg>
  );
}
