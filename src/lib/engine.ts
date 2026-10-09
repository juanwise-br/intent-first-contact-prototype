import { FLOWS, RESTART } from './flows';
import { routeRequest, toRoutingRequest, type RoutingDecision } from './routing';
import type { EntryPoint, FlowData, FlowStep } from './types';

export type HistoryItem =
  | { kind: 'bot'; stepId: string; text: string }
  | { kind: 'user'; text: string }
  | { kind: 'component'; stepId: string; component: NonNullable<FlowStep['customComponent']> };

export interface ChatState {
  entry: EntryPoint;
  baseData: FlowData;
  stepId: string;
  data: FlowData;
  history: HistoryItem[];
  routing?: RoutingDecision;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+()\d][\d\s().-]{5,}$/;

export function resolveMessage(step: FlowStep, data: FlowData): string {
  return typeof step.message === 'function' ? step.message(data) : step.message;
}

function makeRef(): string {
  return `HAL-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

/** Move the conversation to a step, following any steps that resolve on their own. */
function enter(state: ChatState, firstId: string): ChatState {
  if (firstId === RESTART) return startFlow(state.entry, state.baseData);

  let s: ChatState = { ...state, history: [...state.history] };
  let id = firstId;

  for (let guard = 0; guard < 50; guard++) {
    const step = FLOWS[id];
    if (!step) throw new Error(`Unknown flow step: ${id}`);

    const known = step.inputKey ? s.data[step.inputKey] : undefined;
    if (step.type === 'text' && step.skipWhenKnown && known && step.nextId) {
      id = step.nextId;
      continue;
    }

    if (step.submit && !s.data.ref) {
      s = { ...s, data: { ...s.data, ref: makeRef() } };
      s.routing = routeRequest(toRoutingRequest(s.data));
    }

    s.history.push({ kind: 'bot', stepId: id, text: resolveMessage(step, s.data) });
    if (step.customComponent) {
      s.history.push({ kind: 'component', stepId: id, component: step.customComponent });
    }
    s.stepId = id;

    if ((step.type === 'auto' || step.type === 'custom') && step.nextId) {
      id = step.nextId;
      continue;
    }
    break;
  }
  return s;
}

export function startFlow(entry: EntryPoint, baseData: FlowData): ChatState {
  const data: FlowData = { ...baseData, ...entry.presetData, flow: entry.flow };
  const initial: ChatState = {
    entry,
    baseData,
    stepId: entry.startStepId,
    data,
    history: []
  };
  return enter(initial, entry.startStepId);
}

export function answerOption(state: ChatState, index: number): ChatState {
  const step = FLOWS[state.stepId];
  const option = step.options?.[index];
  if (!option) return state;

  const data = step.inputKey
    ? { ...state.data, [step.inputKey]: option.value ?? option.label }
    : state.data;

  const next: ChatState = {
    ...state,
    data,
    history: [...state.history, { kind: 'user', text: option.label }]
  };
  return enter(next, option.nextId);
}

function isValid(kind: FlowStep['validate'], value: string): boolean {
  if (kind === 'email') return EMAIL.test(value);
  if (kind === 'phone') return PHONE.test(value);
  return true;
}

const VALIDATION_COPY: Record<NonNullable<FlowStep['validate']>, string> = {
  email: 'That email address does not look right. Could you check it and try again?',
  phone: 'That phone number does not look right. Please include the area or country code.'
};

export function answerText(state: ChatState, raw: string): ChatState {
  const step = FLOWS[state.stepId];
  const text = raw.trim();
  if (step.type !== 'text' || !text) return state;

  const withUser: ChatState = {
    ...state,
    history: [...state.history, { kind: 'user', text }]
  };

  if (!isValid(step.validate, text)) {
    return {
      ...withUser,
      history: [
        ...withUser.history,
        { kind: 'bot', stepId: step.id, text: VALIDATION_COPY[step.validate!] }
      ]
    };
  }

  const data = step.inputKey ? { ...withUser.data, [step.inputKey]: text } : withUser.data;
  return enter({ ...withUser, data }, step.nextId!);
}
