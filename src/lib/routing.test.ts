import { describe, expect, it } from 'vitest';
import { marketGroupFor, routeRequest } from './routing';
import { simulate, summarise } from './simulate';
import { squarify } from './treemap';

describe('routing engine', () => {
  it('sends a request to the regional team when one exists', () => {
    const d = routeRequest({ flow: 'purchase', region: 'Colombia', method: 'message', dealSize: 'small' });
    expect(d.team).toBe('Sales Latin America');
    expect(d.fallback).toBe('none');
    expect(d.queue).toBe('standard');
  });

  it('falls back to the global desk when a region has no dedicated team', () => {
    const d = routeRequest({ flow: 'purchase', region: 'South Africa', method: 'message' });
    expect(d.team).toBe('Global Sales Desk');
    expect(d.fallback).toBe('global-function');
  });

  it('falls back to the triage desk for regions it cannot place', () => {
    const d = routeRequest({ flow: 'support', region: 'Atlantis' });
    expect(d.team).toBe('Global Triage Desk');
    expect(d.fallback).toBe('global-triage');
    expect(routeRequest({ flow: 'support', region: undefined }).team).toBe('Global Triage Desk');
  });

  it('sends large opportunities to the priority lane, ahead of callback handling', () => {
    const d = routeRequest({ flow: 'purchase', region: 'Germany', method: 'callback', dealSize: 'large' });
    expect(d.queue).toBe('priority');
    expect(d.team).toBe('Sales Europe (Priority Lane)');
  });

  it('marks callback requests', () => {
    expect(routeRequest({ flow: 'support', region: 'India', method: 'callback' }).queue).toBe('callback');
  });

  it('region matching ignores case and spaces', () => {
    expect(marketGroupFor('  germany ')).toBe('Europe');
  });

  it('never leaves a simulated request unrouted', () => {
    const rows = simulate(2000, 7);
    const summary = summarise(rows);
    expect(summary.total).toBe(2000);
    expect(summary.unrouted).toBe(0);
    expect(rows.every((r) => r.decision.team.length > 0)).toBe(true);
  });

  it('is repeatable for the same seed', () => {
    expect(simulate(50, 3).map((r) => r.decision.team)).toEqual(
      simulate(50, 3).map((r) => r.decision.team)
    );
  });
});

describe('treemap layout', () => {
  it('fills the area and stays inside the bounds', () => {
    const items = [
      { key: 'a', value: 50 },
      { key: 'b', value: 30 },
      { key: 'c', value: 12 },
      { key: 'd', value: 5 },
      { key: 'e', value: 3 }
    ];
    const rects = squarify(items, 0, 0, 800, 400);
    const area = rects.reduce((s, r) => s + r.w * r.h, 0);
    expect(Math.abs(area - 800 * 400)).toBeLessThan(1);
    for (const r of rects) {
      expect(r.x).toBeGreaterThanOrEqual(-0.001);
      expect(r.y).toBeGreaterThanOrEqual(-0.001);
      expect(r.x + r.w).toBeLessThanOrEqual(800.001);
      expect(r.y + r.h).toBeLessThanOrEqual(400.001);
    }
  });

  it('sizes rectangles in proportion to value', () => {
    const [big, small] = squarify([{ key: 'big', value: 75 }, { key: 'small', value: 25 }], 0, 0, 100, 100);
    expect((big.w * big.h) / (small.w * small.h)).toBeCloseTo(3, 1);
  });

  it('handles empty input', () => {
    expect(squarify([], 0, 0, 100, 100)).toEqual([]);
  });
});
