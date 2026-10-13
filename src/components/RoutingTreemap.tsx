import { useMemo, useState } from 'react';
import { simulate, summarise } from '../lib/simulate';
import { squarify } from '../lib/treemap';
import { FLOW_LABELS } from '../lib/data';
import type { MarketGroup } from '../lib/routing';

const W = 960;
const H = 460;
const PAD = 3;

// Colour combination 188: one colour per request type, label colours chosen for contrast.
const FLOW_COLORS: Record<string, { fill: string; label: string }> = {
  support: { fill: '#5a6232', label: '#ffffff' },
  purchase: { fill: '#9089af', label: '#1d2029' },
  info: { fill: '#8ebf8a', label: '#2c3117' }
};
const FALLBACK_COLOR = { fill: '#c9ccd3', label: '#1d2029' };

const TEAM_FILL = '#f2f4f7';
const TRIAGE_FILL = '#eeedf3';
const isTriage = (g: MarketGroup) => g === 'Unknown';

export function RoutingTreemap() {
  const [count, setCount] = useState(600);
  const [seed, setSeed] = useState(11);
  const [hover, setHover] = useState<string | null>(null);

  const rows = useMemo(() => simulate(count, seed), [count, seed]);
  const summary = useMemo(() => summarise(rows), [rows]);

  const layout = useMemo(() => {
    const byTeam = new Map<string, { group: MarketGroup; flows: Map<string, number>; total: number }>();
    for (const { request, decision } of rows) {
      const entry = byTeam.get(decision.team) ?? { group: decision.group, flows: new Map(), total: 0 };
      entry.flows.set(request.flow, (entry.flows.get(request.flow) ?? 0) + 1);
      entry.total += 1;
      byTeam.set(decision.team, entry);
    }
    const outer = squarify(
      [...byTeam.entries()].map(([key, v]) => ({ key, value: v.total })),
      0,
      0,
      W,
      H
    );
    return outer.map((o) => {
      const t = byTeam.get(o.key)!;
      const inner = squarify(
        [...t.flows.entries()].map(([key, value]) => ({ key, value })),
        o.x + PAD,
        o.y + PAD + 14,
        Math.max(o.w - PAD * 2, 0),
        Math.max(o.h - PAD * 2 - 14, 0)
      );
      return { outer: o, group: t.group, inner };
    });
  }, [rows]);

  const pct = (n: number) => `${Math.round((n / Math.max(summary.total, 1)) * 100)}%`;

  return (
    <div className="page wide">
      <header className="page-head">
        <h1>Routing treemap</h1>
        <p className="muted">
          Simulated requests sent through the real routing engine. Each block is a team. Inside each team, the blocks show
          the type of request. Size is the number of requests.
        </p>
      </header>

      <div className="chips">
        <span className="chip">
          <strong>{summary.total}</strong> requests
        </span>
        <span className="chip">
          <strong>{summary.unrouted}</strong> unrouted
        </span>
        <span className="chip">
          <strong>{pct(summary.fallbacks)}</strong> used a fallback
        </span>
        <span className="chip">
          <strong>{pct(summary.priority)}</strong> priority lane
        </span>
        <span className="chip">
          <strong>{pct(summary.callbacks)}</strong> callbacks
        </span>
      </div>

      <div className="toolbar">
        <label className="slider">
          Requests: <strong>{count}</strong>
          <input
            type="range"
            min={100}
            max={2000}
            step={100}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
        </label>
        <button className="pill" onClick={() => setSeed((s) => s + 1)}>
          Run again
        </button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="treemap" role="img" aria-label="Treemap of requests by team and type">
        {layout.map(({ outer, group, inner }) => {
          const triage = isTriage(group);
          const isHover = hover === outer.key;
          return (
            <g key={outer.key} onMouseEnter={() => setHover(outer.key)} onMouseLeave={() => setHover(null)}>
              <rect
                x={outer.x}
                y={outer.y}
                width={outer.w}
                height={outer.h}
                fill={triage ? TRIAGE_FILL : TEAM_FILL}
                stroke="#fff"
                strokeWidth={2}
              />
              {triage && (
                <rect
                  x={outer.x + 2}
                  y={outer.y + 2}
                  width={Math.max(outer.w - 4, 0)}
                  height={Math.max(outer.h - 4, 0)}
                  fill="none"
                  stroke="#5a6232"
                  strokeDasharray="4 3"
                />
              )}
              {outer.w > 90 && outer.h > 30 && (
                <text x={outer.x + 6} y={outer.y + 13} className="tm-team">
                  {outer.key} ({outer.value})
                </text>
              )}
              {inner.map((r) => {
                const color = FLOW_COLORS[r.key] ?? FALLBACK_COLOR;
                return (
                  <g key={r.key}>
                    <rect
                      x={r.x}
                      y={r.y}
                      width={Math.max(r.w - 1, 0)}
                      height={Math.max(r.h - 1, 0)}
                      rx={4}
                      fill={color.fill}
                      opacity={hover && !isHover ? 0.45 : 1}
                    >
                      <title>
                        {outer.key}: {FLOW_LABELS[r.key] ?? r.key}, {r.value} requests
                      </title>
                    </rect>
                    {r.w > 70 && r.h > 22 && (
                      <text x={r.x + 6} y={r.y + 15} className="tm-label" fill={color.label}>
                        {FLOW_LABELS[r.key] ?? r.key}: {r.value}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>

      <div className="legend">
        {Object.entries(FLOW_COLORS).map(([key, c]) => (
          <span key={key} className="legend-item">
            <i style={{ background: c.fill }} />
            {FLOW_LABELS[key] ?? key}
          </span>
        ))}
        <span className="legend-item">
          <i className="legend-triage" />
          Country not recognised (triage)
        </span>
      </div>

      <p className="muted small">
        Why this view: it shows where demand lands, which markets lean on global desks because no regional team exists,
        and how many requests need human triage because the country could not be placed. The unrouted count is the one
        number that must always be zero.
      </p>
    </div>
  );
}
