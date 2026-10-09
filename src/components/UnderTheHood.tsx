import type { ChatState } from '../lib/engine';

export function UnderTheHood({ state }: { state: ChatState | null }) {
  if (!state) return null;
  const { ref, ...collected } = state.data;
  return (
    <aside className="hood">
      <h3>Under the hood</h3>
      <p className="muted small">What the engine knows right now. Visible in the prototype only.</p>

      <h4>Current step</h4>
      <code>{state.stepId}</code>

      <h4>Collected data</h4>
      <pre>{JSON.stringify(collected, null, 2)}</pre>

      <h4>Routing decision</h4>
      {state.routing ? (
        <div className="decision">
          <p>
            <strong>{state.routing.team}</strong>
          </p>
          <p className="muted small">
            Queue: {state.routing.queue}. Fallback: {state.routing.fallback}. Ref: {ref}
          </p>
          <ul>
            {state.routing.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="muted small">Not routed yet. Routing runs when the request is submitted.</p>
      )}
    </aside>
  );
}
