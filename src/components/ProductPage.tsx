import { PRODUCT_ENTRIES } from '../lib/flows';
import { PRODUCT_NAME } from '../lib/data';
import type { ChatState } from '../lib/engine';
import type { User } from '../lib/types';
import { ContactSection } from './ContactPage';

export function ProductPage({
  region,
  user,
  onState
}: {
  region: string;
  user: User | null;
  onState: (s: ChatState | null) => void;
}) {
  return (
    <div className="page">
      <section className="hero">
        <p className="eyebrow">Automation and control</p>
        <h1>{PRODUCT_NAME} Standard</h1>
        <p className="lede">
          A compact controller for mid-size production lines. This is a placeholder product page. It exists to show the
          same contact component reused with the product already known, so the conversation skips the product question.
        </p>
        <ul className="specs">
          <li>Placeholder spec one</li>
          <li>Placeholder spec two</li>
          <li>Placeholder spec three</li>
        </ul>
      </section>

      <ContactSection
        entries={PRODUCT_ENTRIES}
        region={region}
        user={user}
        title="Looking for more support?"
        onState={onState}
      />
    </div>
  );
}
