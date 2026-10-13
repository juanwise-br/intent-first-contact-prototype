import { useMemo, useState } from 'react';
import { GLOBAL_ENTRIES } from '../lib/flows';
import { HOTLINES, OTHER_CATEGORIES } from '../lib/data';
import { marketGroupFor } from '../lib/routing';
import type { ChatState } from '../lib/engine';
import type { EntryPoint, FlowData, User } from '../lib/types';
import { ChatFlow } from './ChatFlow';
import { BubblesArt } from './BubblesArt';
import { ArrowUpRight, Chat, ChevronLeft, Info, LifeBuoy, MapPin, Phone, Tag } from './Icons';

const ICONS: Record<string, (p: { size?: number }) => JSX.Element> = {
  info: Info,
  purchase: Tag,
  support: LifeBuoy,
  representative: MapPin,
  pdp_info: Info,
  pdp_purchase: Tag,
  pdp_support: LifeBuoy
};

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="back-btn" onClick={onClick}>
      <span className="circle-icon">
        <ChevronLeft size={18} />
      </span>
      Back to all options
    </button>
  );
}

export function buildBaseData(region: string, user: User | null): FlowData {
  const data: FlowData = { region };
  if (user) {
    data.fullName = user.name;
    data.company = user.company;
    data.userEmail = user.email;
    data.userPhone = user.phone;
  }
  return data;
}

export function Tiles({ entries, onPick }: { entries: EntryPoint[]; onPick: (e: EntryPoint) => void }) {
  return (
    <div className="tiles">
      {entries.map((e) => {
        const Icon = ICONS[e.key] ?? Info;
        return (
          <button key={e.key} className="tile" onClick={() => onPick(e)}>
            <span className="tile-top">
              <span className="tile-icon">
                <Icon size={22} />
              </span>
              <ArrowUpRight size={20} className="tile-arrow" />
            </span>
            <span>{e.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** A reusable "Looking for more support?" block that starts a conversation in place. */
export function ContactSection({
  entries,
  region,
  user,
  title,
  onState
}: {
  entries: EntryPoint[];
  region: string;
  user: User | null;
  title: string;
  onState?: (s: ChatState) => void;
}) {
  const [entry, setEntry] = useState<EntryPoint | null>(null);
  const baseData = useMemo(() => buildBaseData(region, user), [region, user]);

  return (
    <section className="contact-section">
      <h2>{title}</h2>
      {!entry && <Tiles entries={entries} onPick={setEntry} />}
      {entry && (
        <>
          <div className="back-row">
            <BackButton onClick={() => setEntry(null)} />
            <span className="muted small">{entry.label}</span>
          </div>
          <ChatFlow
            key={`${entry.key}-${region}-${user?.email ?? 'anon'}`}
            entry={entry}
            baseData={baseData}
            onState={onState}
          />
        </>
      )}
    </section>
  );
}

function OtherOptions() {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <section className="other">
      <h2>
        <span className="tile-icon small">
          <Chat size={15} />
        </span>
        I have a different request
      </h2>
      <div className="categories">
        {OTHER_CATEGORIES.map((c) => (
          <div key={c.title}>
            <h3>{c.title}</h3>
            <div className="pills left">
              {c.items.map((item) => (
                <button key={item} className="pill white" onClick={() => setPicked(item)}>
                  {item}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {picked && (
        <p className="notice">
          You chose "{picked}". In the live site this opens the dedicated page for that request. Here it is a placeholder.
        </p>
      )}
    </section>
  );
}

function Hotline({ region }: { region: string }) {
  const group = marketGroupFor(region);
  const numbers = HOTLINES[group];
  return (
    <section className="hotline">
      <h2>
        <span className="tile-icon small">
          <Phone size={15} />
        </span>
        Hotline
      </h2>
      <p className="muted">Numbers for {group === 'Unknown' ? 'all regions' : group}</p>
      <ul className="phones">
        {numbers.map((n) => (
          <li key={n.number}>
            <span>{n.label}</span>
            <strong>{n.number}</strong>
          </li>
        ))}
      </ul>
      <p className="footnote">Fictional numbers for this prototype. Charges would vary by provider and country.</p>
    </section>
  );
}

export function ContactPage({
  region,
  user,
  onState
}: {
  region: string;
  user: User | null;
  onState: (s: ChatState | null) => void;
}) {
  const [entry, setEntry] = useState<EntryPoint | null>(null);
  const baseData = useMemo(() => buildBaseData(region, user), [region, user]);

  const pick = (e: EntryPoint | null) => {
    setEntry(e);
    if (!e) onState(null);
  };

  return (
    <div className="page">
      <header className="page-head">
        <span className="tag-pill">Contact</span>
        <h1>Get in touch</h1>
        <p className="muted">{entry ? entry.label : 'Tell us what you need and we will point you to the right team.'}</p>
      </header>

      {!entry && (
        <>
          <div className="hero-art">
            <BubblesArt />
          </div>
          <Tiles entries={GLOBAL_ENTRIES} onPick={pick} />
          <OtherOptions />
          <Hotline region={region} />
        </>
      )}

      {entry && (
        <>
          <div className="back-row">
            <BackButton onClick={() => pick(null)} />
          </div>
          <ChatFlow
            key={`${entry.key}-${region}-${user?.email ?? 'anon'}`}
            entry={entry}
            baseData={baseData}
            onState={onState}
          />
        </>
      )}
    </div>
  );
}
