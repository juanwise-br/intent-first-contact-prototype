import {
  CONTACTS,
  DEAL_LABELS,
  FLOW_LABELS,
  GLOBAL_DESK,
  HOTLINES,
  NEED_LABELS,
  type Contact
} from '../lib/data';
import { marketGroupFor } from '../lib/routing';
import type { FlowData } from '../lib/types';

export function SubmissionSummary({ data }: { data: FlowData }) {
  const rows: [string, string | undefined][] = [
    ['Request', FLOW_LABELS[data.flow]],
    ['Product', data.productName || data.productFamily],
    ['Need', NEED_LABELS[data.purchaseType || data.supportType]],
    ['Opportunity size', data.dealSize ? DEAL_LABELS[data.dealSize] : undefined],
    ['Message', data.userMessage],
    ['Callback', data.callbackDay ? `${data.callbackDay} at ${data.callbackHour}` : undefined],
    ['Name', data.fullName],
    ['Company', data.company],
    ['Email', data.userEmail],
    ['Phone', data.userPhone],
    ['Country', data.region]
  ];
  return (
    <dl className="summary">
      {rows
        .filter(([, v]) => v)
        .map(([k, v]) => (
          <div key={k} className="summary-row">
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
    </dl>
  );
}

export function PhoneList({ data }: { data: FlowData }) {
  const group = marketGroupFor(data.region);
  return (
    <ul className="phones">
      {HOTLINES[group].map((h) => (
        <li key={h.number}>
          <span>{h.label}</span>
          <strong>{h.number}</strong>
        </li>
      ))}
    </ul>
  );
}

/** Closest match first: role, area and market, then role and market, then role anywhere. */
export function findContacts(data: FlowData): { contacts: Contact[]; note?: string } {
  const group = marketGroupFor(data.region);
  const role = data.repRole;
  const area = data.productArea;

  const exact = CONTACTS.filter((c) => c.role === role && c.area === area && c.group === group);
  if (exact.length) return { contacts: exact.slice(0, 6) };

  const roleInMarket = CONTACTS.filter((c) => c.role === role && c.group === group);
  if (roleInMarket.length) {
    return { contacts: roleInMarket.slice(0, 6), note: 'No exact match for that product area, so here are the closest people in your market.' };
  }

  const roleAnywhere = CONTACTS.filter((c) => c.role === role);
  if (roleAnywhere.length) {
    return { contacts: roleAnywhere.slice(0, 6), note: 'We have no one in your market for this role yet. These colleagues cover it globally.' };
  }

  return { contacts: [GLOBAL_DESK], note: 'We could not find a direct match, so our global desk will connect you.' };
}

export function ContactCards({ data }: { data: FlowData }) {
  const { contacts, note } = findContacts(data);
  return (
    <div>
      {note && <p className="muted small">{note}</p>}
      <div className="cards">
        {contacts.map((c) => (
          <article key={c.name} className="card">
            <h4>{c.name}</h4>
            <p>{c.title}</p>
            <p className="muted small">
              {c.role}, {c.area}
            </p>
            <p className="muted small">{c.city}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
