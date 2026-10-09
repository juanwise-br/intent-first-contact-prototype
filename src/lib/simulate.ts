import { REGIONS, routeRequest, type RoutingDecision, type RoutingRequest } from './routing';

/** Small seeded random number generator so every run with the same seed is identical. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rnd: () => number, items: [T, number][]): T {
  const total = items.reduce((s, [, w]) => s + w, 0);
  let r = rnd() * total;
  for (const [item, weight] of items) {
    r -= weight;
    if (r <= 0) return item;
  }
  return items[items.length - 1][0];
}

const REGION_WEIGHTS: [string, number][] = [
  ...REGIONS.map((r): [string, number] => [
    r.name,
    r.group === 'Europe' ? 9 : r.group === 'North America' ? 8 : r.group === 'Asia Pacific' ? 6 : 3
  ]),
  // Free text the visitor typed that we cannot match to a known country.
  ['Atlantis', 1],
  ['', 1]
];

export interface SimulatedRequest {
  request: RoutingRequest;
  decision: RoutingDecision;
}

export function simulate(count: number, seed: number): SimulatedRequest[] {
  const rnd = mulberry32(seed);
  const out: SimulatedRequest[] = [];

  for (let i = 0; i < count; i++) {
    const flow = pick(rnd, [
      ['info', 30],
      ['purchase', 30],
      ['support', 40]
    ] as [string, number][]);

    const method =
      flow === 'info' ? 'message' : pick(rnd, [['message', 55], ['callback', 45]] as [string, number][]);

    const dealSize =
      flow === 'purchase'
        ? pick(rnd, [['small', 40], ['medium', 38], ['large', 12], ['unknown', 10]] as [string, number][])
        : undefined;

    const request: RoutingRequest = {
      flow,
      method,
      region: pick(rnd, REGION_WEIGHTS),
      dealSize
    };
    out.push({ request, decision: routeRequest(request) });
  }
  return out;
}

export interface Summary {
  total: number;
  priority: number;
  callbacks: number;
  fallbacks: number;
  triage: number;
  unrouted: number;
}

export function summarise(rows: SimulatedRequest[]): Summary {
  return {
    total: rows.length,
    priority: rows.filter((r) => r.decision.queue === 'priority').length,
    callbacks: rows.filter((r) => r.decision.queue === 'callback').length,
    fallbacks: rows.filter((r) => r.decision.fallback !== 'none').length,
    triage: rows.filter((r) => r.decision.fallback === 'global-triage').length,
    unrouted: rows.filter((r) => !r.decision.team).length
  };
}
