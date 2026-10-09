import { FLOWS, RESTART } from './flows';
import type { StepType } from './types';

export interface TreeNode {
  stepId: string;
  /** The option the visitor picked to get here, or a hint for text input. */
  via?: string;
  kind: 'step' | 'ref' | 'restart';
  type?: StepType;
  children: TreeNode[];
}

/**
 * Builds the decision tree straight from the flow config, so the map can never
 * drift from the real behaviour. Only options are mapped, no prompts.
 * A step that was already expanded elsewhere shows as a reference.
 */
export function buildTree(rootId = 'main_menu'): TreeNode {
  const seen = new Set<string>();

  const walk = (id: string, via?: string): TreeNode => {
    if (id === RESTART) return { stepId: id, via, kind: 'restart', children: [] };
    const step = FLOWS[id];
    if (seen.has(id)) return { stepId: id, via, kind: 'ref', type: step.type, children: [] };
    seen.add(id);

    const node: TreeNode = { stepId: id, via, kind: 'step', type: step.type, children: [] };
    if (step.options) {
      node.children = step.options.map((o) => walk(o.nextId, o.label));
    } else if (step.nextId) {
      node.children = [walk(step.nextId, step.type === 'text' ? '(visitor types an answer)' : undefined)];
    }
    return node;
  };

  return walk(rootId);
}

export interface TreeStats {
  steps: number;
  endings: number;
  questions: number;
}

export function treeStats(root: TreeNode): TreeStats {
  const stats: TreeStats = { steps: 0, endings: 0, questions: 0 };
  const visit = (n: TreeNode) => {
    if (n.kind === 'step') {
      stats.steps += 1;
      if (n.type === 'end') stats.endings += 1;
      if (n.type === 'options' || n.type === 'text') stats.questions += 1;
    }
    n.children.forEach(visit);
  };
  visit(root);
  return stats;
}

export function treeToText(root: TreeNode): string {
  const lines: string[] = [];
  const visit = (n: TreeNode, prefix: string, last: boolean, top: boolean) => {
    const label =
      n.kind === 'restart'
        ? 'Start over (restarts this flow)'
        : n.kind === 'ref'
          ? `see [${n.stepId}] above`
          : `[${n.stepId}]${n.type === 'end' ? ' (END)' : ''}`;
    const text = n.via ? `"${n.via}" -> ${label}` : label;
    if (top) {
      lines.push(text);
    } else {
      lines.push(`${prefix}${last ? '`-- ' : '+-- '}${text}`);
    }
    const childPrefix = top ? '' : prefix + (last ? '    ' : '|   ');
    n.children.forEach((c, i) => visit(c, childPrefix, i === n.children.length - 1, false));
  };
  visit(root, '', true, true);
  return lines.join('\n');
}
