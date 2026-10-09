import { describe, expect, it } from 'vitest';
import { answerOption, answerText, startFlow, type ChatState } from './engine';
import { FLOWS, GLOBAL_ENTRIES, PRODUCT_ENTRIES } from './flows';
import type { FlowData } from './types';

const base: FlowData = { region: 'Germany' };
const entry = (key: string) => [...GLOBAL_ENTRIES, ...PRODUCT_ENTRIES].find((e) => e.key === key)!;

function pickOption(s: ChatState, label: string): ChatState {
  const idx = FLOWS[s.stepId].options!.findIndex((o) => o.label === label);
  if (idx < 0) throw new Error(`No option "${label}" at ${s.stepId}`);
  return answerOption(s, idx);
}

describe('conversation engine', () => {
  it('runs the info flow end to end and routes the request', () => {
    let s = startFlow(entry('info'), base);
    s = pickOption(s, 'Yes, I do');
    s = answerText(s, 'Controller X2');
    s = pickOption(s, 'Send a message');
    s = answerText(s, 'Need a datasheet');
    s = answerText(s, 'Alex Morgan');
    s = answerText(s, 'Example Co');
    s = answerText(s, 'alex@example.com');
    s = answerText(s, '+49 30 1234567');
    s = pickOption(s, "Yes, that's right");
    expect(s.stepId).toBe('review_submission');
    s = pickOption(s, 'Yes, send my request');
    expect(s.stepId).toBe('submission_success');
    expect(s.data.ref).toMatch(/^HAL-/);
    expect(s.routing?.team).toBe('Product Information Europe');
  });

  it('re-asks when the email is invalid and keeps the step', () => {
    let s = startFlow(entry('info'), base);
    s = pickOption(s, 'Yes, I do');
    s = answerText(s, 'X2');
    s = pickOption(s, 'Send a message');
    s = answerText(s, 'hello');
    s = answerText(s, 'Alex');
    s = answerText(s, 'Example Co');
    s = answerText(s, 'not-an-email');
    expect(s.stepId).toBe('ask_email');
    const last = s.history[s.history.length - 1];
    expect(last.kind === 'bot' && last.text).toContain('email');
  });

  it('skips known details for a logged in visitor', () => {
    const logged: FlowData = {
      region: 'Germany',
      fullName: 'Alex Morgan',
      company: 'Example Co',
      userEmail: 'alex@example.com',
      userPhone: '+49 30 1234567'
    };
    let s = startFlow(entry('info'), logged);
    s = pickOption(s, 'Yes, I do');
    s = answerText(s, 'X2');
    s = pickOption(s, 'Send a message');
    s = answerText(s, 'Question about specs');
    expect(s.stepId).toBe('confirm_region_info');
  });

  it('product page entry skips the product question', () => {
    const s = startFlow(entry('pdp_purchase'), base);
    expect(s.stepId).toBe('purchase_options');
    expect(s.data.productName).toBe('Halden Controller X2');
  });

  it('auto steps advance on their own', () => {
    const s = startFlow(entry('pdp_info'), base);
    expect(s.stepId).toBe('ask_contact_method');
    expect(s.history.filter((h) => h.kind === 'bot').length).toBe(2);
  });

  it('live chat is unavailable and offers the other options again', () => {
    let s = startFlow(entry('pdp_info'), base);
    s = pickOption(s, 'Live chat');
    expect(s.stepId).toBe('chat_unavailable');
    expect(FLOWS[s.stepId].options!.map((o) => o.label)).toEqual(['Send a message', 'Talk to us']);
  });

  it('callback flow books a callback and uses the callback queue', () => {
    let s = startFlow(entry('support'), base);
    s = answerText(s, 'Drive D5');
    s = pickOption(s, 'Troubleshooting');
    s = pickOption(s, 'Call me back');
    s = answerText(s, 'Alex Morgan');
    s = answerText(s, 'Example Co');
    s = answerText(s, 'alex@example.com');
    s = answerText(s, '+49 30 1234567');
    s = pickOption(s, 'Tuesday');
    s = pickOption(s, '10:00');
    s = pickOption(s, "Yes, that's right");
    s = pickOption(s, 'Yes, book the callback');
    expect(s.stepId).toBe('callback_success');
    expect(s.routing?.queue).toBe('callback');
    expect(s.routing?.team).toBe('Technical Support Europe');
  });

  it('start over clears the conversation and restarts the same flow', () => {
    let s = startFlow(entry('representative'), base);
    s = pickOption(s, 'Sales');
    s = pickOption(s, 'Buildings');
    s = pickOption(s, "Yes, that's right");
    expect(s.stepId).toBe('end_rep');
    expect(FLOWS[s.stepId].restartable).toBe(true);
    const restarted = startFlow(s.entry, s.baseData);
    expect(restarted.stepId).toBe('representative');
    expect(restarted.history.length).toBe(1);
  });

  it('start over from the review step restarts the same flow', () => {
    let s = startFlow(entry('pdp_info'), base);
    s = pickOption(s, 'Send a message');
    s = answerText(s, 'hello');
    s = answerText(s, 'Alex');
    s = answerText(s, 'Example Co');
    s = answerText(s, 'alex@example.com');
    s = answerText(s, '+49 30 1234567');
    s = pickOption(s, "Yes, that's right");
    s = pickOption(s, 'Start over');
    expect(s.stepId).toBe('ask_contact_method');
    expect(s.history.length).toBe(2);
  });
});
