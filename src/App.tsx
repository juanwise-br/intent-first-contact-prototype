import { useState } from 'react';
import { REGIONS } from './lib/routing';
import type { ChatState } from './lib/engine';
import type { User } from './lib/types';
import { ContactPage } from './components/ContactPage';
import { ProductPage } from './components/ProductPage';
import { FlowMap } from './components/FlowMap';
import { RoutingTreemap } from './components/RoutingTreemap';
import { UnderTheHood } from './components/UnderTheHood';

type Tab = 'contact' | 'product' | 'flowmap' | 'treemap';

const TABS: { key: Tab; label: string }[] = [
  { key: 'contact', label: 'Contact page' },
  { key: 'product', label: 'Product page' },
  { key: 'flowmap', label: 'Flow map' },
  { key: 'treemap', label: 'Routing treemap' }
];

const DEMO_USER: User = {
  name: 'Alex Morgan',
  company: 'Example Industries',
  email: 'alex.morgan@example.com',
  phone: '+49 30 5550100',
  region: 'Germany'
};

export function App() {
  const [tab, setTab] = useState<Tab>('contact');
  const [region, setRegion] = useState('Switzerland');
  const [user, setUser] = useState<User | null>(null);
  const [state, setState] = useState<ChatState | null>(null);

  const toggleLogin = () => {
    if (user) {
      setUser(null);
    } else {
      setUser(DEMO_USER);
      setRegion(DEMO_USER.region);
    }
  };

  const changeTab = (t: Tab) => {
    setTab(t);
    setState(null);
  };

  const showHood = (tab === 'contact' || tab === 'product') && state;

  return (
    <div className="app">
      <header className="site-header">
        <div className="brand">HALDEN</div>
        <nav aria-label="Prototype sections">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`nav-btn ${tab === t.key ? 'active' : ''}`}
              onClick={() => changeTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="header-tools">
          <label className="region">
            <span className="sr-only">Region</span>
            <select value={region} onChange={(e) => setRegion(e.target.value)}>
              {REGIONS.map((r) => (
                <option key={r.name}>{r.name}</option>
              ))}
              {!REGIONS.some((r) => r.name === region) && <option>{region}</option>}
            </select>
          </label>
          <button className="login" onClick={toggleLogin}>
            {user ? user.name : 'Log in'}
          </button>
        </div>
      </header>

      <main className={`layout ${showHood ? 'with-hood' : ''}`}>
        <div>
          {tab === 'contact' && <ContactPage region={region} user={user} onState={setState} />}
          {tab === 'product' && <ProductPage region={region} user={user} onState={setState} />}
          {tab === 'flowmap' && <FlowMap />}
          {tab === 'treemap' && <RoutingTreemap />}
        </div>
        {showHood && <UnderTheHood state={state} />}
      </main>

      <footer className="site-footer">
        Prototype with a fictional company and mock data. Not affiliated with any real organisation.
      </footer>
    </div>
  );
}
