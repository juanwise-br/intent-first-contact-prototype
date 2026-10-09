import { useMemo, useState } from 'react';
import { buildTree, treeStats, treeToText, type TreeNode } from '../lib/flowTree';

function Node({ node, depth, version }: { node: TreeNode; depth: number; version: number }) {
  const label =
    node.kind === 'restart' ? 'Start over' : node.kind === 'ref' ? `see ${node.stepId}` : node.stepId;
  const via = node.via ? <span className="via">{node.via}</span> : null;
  const end = node.type === 'end' ? <span className="tag">end</span> : null;

  if (node.children.length === 0) {
    return (
      <li className="leaf">
        {via}
        <span className={`step ${node.kind}`}>{label}</span>
        {end}
      </li>
    );
  }

  return (
    <li>
      <details open={version === 1 ? true : version === 2 ? false : depth < 2} key={version}>
        <summary>
          {via}
          <span className="step">{label}</span>
          <span className="count">{node.children.length}</span>
        </summary>
        <ul>
          {node.children.map((c, i) => (
            <Node key={`${c.stepId}-${i}`} node={c} depth={depth + 1} version={version} />
          ))}
        </ul>
      </details>
    </li>
  );
}

export function FlowMap() {
  const tree = useMemo(() => buildTree('main_menu'), []);
  const stats = useMemo(() => treeStats(tree), [tree]);
  const [version, setVersion] = useState(0);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(treeToText(tree));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="page">
      <header className="page-head">
        <h1>Flow map</h1>
        <p className="muted">
          Every path a visitor can take from the main menu, generated from the same config the chat runs on. Change a
          step in <code>flows.ts</code> and this map changes with it.
        </p>
      </header>

      <div className="chips">
        <span className="chip">
          <strong>{stats.steps}</strong> steps
        </span>
        <span className="chip">
          <strong>{stats.questions}</strong> questions
        </span>
        <span className="chip">
          <strong>{stats.endings}</strong> endings
        </span>
      </div>

      <div className="toolbar">
        <button className="pill" onClick={() => setVersion(1)}>
          Expand all
        </button>
        <button className="pill" onClick={() => setVersion(2)}>
          Collapse
        </button>
        <button className="pill" onClick={copy}>
          {copied ? 'Copied' : 'Copy as text'}
        </button>
      </div>

      <ul className="tree root">
        <Node node={tree} depth={0} version={version} />
      </ul>
    </div>
  );
}
