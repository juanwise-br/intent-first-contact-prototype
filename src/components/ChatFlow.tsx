import { useEffect, useRef, useState } from 'react';
import { answerOption, answerText, startFlow, type ChatState } from '../lib/engine';
import { FLOWS } from '../lib/flows';
import type { EntryPoint, FlowData } from '../lib/types';
import { ContactCards, PhoneList, SubmissionSummary } from './Panels';

interface Props {
  entry: EntryPoint;
  baseData: FlowData;
  onState?: (s: ChatState) => void;
}

export function ChatFlow({ entry, baseData, onState }: Props) {
  const [state, setState] = useState<ChatState>(() => startFlow(entry, baseData));
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const tailRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  const step = FLOWS[state.stepId];

  useEffect(() => {
    onState?.(state);
    // Focus the field without letting the browser jump the page, then scroll gently.
    if (step.type === 'text') inputRef.current?.focus({ preventScroll: true });
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    tailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const submitText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setState((s) => answerText(s, draft));
    setDraft('');
  };

  return (
    <div className="chat" aria-live="polite">
      {state.history.map((item, i) => {
        if (item.kind === 'user') {
          return (
            <div key={i} className="msg-user">
              <span>{item.text}</span>
            </div>
          );
        }
        if (item.kind === 'bot') {
          return (
            <p key={i} className="msg-bot">
              {item.text}
            </p>
          );
        }
        return (
          <div key={i} className="panel">
            {item.component === 'SubmissionSummary' && <SubmissionSummary data={state.data} />}
            {item.component === 'PhoneList' && <PhoneList data={state.data} />}
            {item.component === 'ContactCards' && <ContactCards data={state.data} />}
          </div>
        );
      })}

      {step.type === 'options' && (
        <>
          <div className="pills">
            {step.options!.map((o, i) => (
              <button key={o.label} className="pill" onClick={() => setState((s) => answerOption(s, i))}>
                {o.label}
              </button>
            ))}
          </div>
          {step.footnote && <p className="footnote">{step.footnote}</p>}
        </>
      )}

      {step.type === 'text' && (
        <form className="inline-input" onSubmit={submitText}>
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type your answer"
            aria-label="Your answer"
          />
          <button type="submit" className="send" disabled={!draft.trim()}>
            Send
          </button>
        </form>
      )}

      {step.restartable && (
        <div className="pills">
          <button className="pill ghost" onClick={() => setState(startFlow(entry, baseData))}>
            Start over
          </button>
        </div>
      )}
      <div ref={tailRef} />
    </div>
  );
}
