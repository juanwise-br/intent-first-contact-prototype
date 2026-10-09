import { describe, expect, it } from 'vitest';
import { ALL_ENTRIES, FLOWS, RESTART } from './flows';
import { buildTree, treeStats, treeToText } from './flowTree';
import { resolveMessage } from './engine';

describe('flow config integrity', () => {
  it('every nextId points at a real step', () => {
    for (const step of Object.values(FLOWS)) {
      const targets = [step.nextId, ...(step.options ?? []).map((o) => o.nextId)].filter(
        (t): t is string => Boolean(t)
      );
      for (const t of targets) {
        expect(t === RESTART || FLOWS[t], `${step.id} -> ${t}`).toBeTruthy();
      }
    }
  });

  it('every step type has what it needs', () => {
    for (const step of Object.values(FLOWS)) {
      if (step.type === 'options') expect(step.options?.length, step.id).toBeGreaterThan(0);
      if (step.type === 'text') {
        expect(step.inputKey, step.id).toBeTruthy();
        expect(step.nextId, step.id).toBeTruthy();
      }
      if (step.type === 'end') expect(step.options, step.id).toBeUndefined();
      if (step.type === 'auto' || step.type === 'custom') expect(step.nextId, step.id).toBeTruthy();
    }
  });

  it('every step is reachable from an entry point or the main menu', () => {
    const reached = new Set<string>(['main_menu']);
    const queue = [...ALL_ENTRIES.map((e) => e.startStepId), 'main_menu'];
    while (queue.length) {
      const id = queue.pop()!;
      if (id === RESTART || reached.has(id) && id !== 'main_menu') continue;
      reached.add(id);
      const step = FLOWS[id];
      const next = [step.nextId, ...(step.options ?? []).map((o) => o.nextId)].filter(
        (t): t is string => Boolean(t)
      );
      for (const n of next) if (n !== RESTART && !reached.has(n)) queue.push(n);
    }
    const orphans = Object.keys(FLOWS).filter((id) => !reached.has(id));
    expect(orphans).toEqual([]);
  });

  it('copy never uses long dashes', () => {
    const sample = { productName: 'X', productFamily: 'Y', region: 'Z', ref: 'R', userEmail: 'e@x.co', callbackDay: 'Monday', callbackHour: '09:00' };
    for (const step of Object.values(FLOWS)) {
      const text = [resolveMessage(step, sample), step.footnote ?? '', ...(step.options ?? []).map((o) => o.label)].join(' ');
      expect(text, step.id).not.toMatch(/[\u2013\u2014]/);
    }
  });
});

describe('flow tree', () => {
  it('maps the main menu and reports stats', () => {
    const tree = buildTree('main_menu');
    const stats = treeStats(tree);
    expect(stats.steps).toBeGreaterThan(20);
    expect(stats.endings).toBeGreaterThan(2);
    const text = treeToText(tree);
    expect(text).toContain('[main_menu]');
    expect(text).toContain('[submission_success] (END)');
  });
});
