export type StepType = 'options' | 'text' | 'end' | 'custom' | 'auto';

/** Everything the visitor has told us so far, keyed by the step's inputKey. */
export type FlowData = Record<string, string>;

export type CustomComponent = 'SubmissionSummary' | 'PhoneList' | 'ContactCards';

export interface Option {
  label: string;
  nextId: string;
  /** Stored in FlowData instead of the label when set. */
  value?: string;
}

export interface FlowStep {
  id: string;
  message: string | ((data: FlowData) => string);
  type: StepType;
  options?: Option[];
  /** Where the answer is stored. Used by text steps and by option steps that need to remember the choice. */
  inputKey?: string;
  /** Next step after a text answer, or after an auto or custom step. */
  nextId?: string;
  customComponent?: CustomComponent;
  /** Text steps only. If the value is already known (for example a logged in visitor), skip the question. */
  skipWhenKnown?: boolean;
  validate?: 'email' | 'phone';
  /** End steps only. Entering this step creates a request and runs the routing engine. */
  submit?: boolean;
  /** Show a "Start over" button on this step. Restarts the current flow only. */
  restartable?: boolean;
  /** Small print shown under the options, for example consent copy. */
  footnote?: string;
}

export type FlowKind = 'info' | 'purchase' | 'support' | 'representative';

export interface EntryPoint {
  key: string;
  label: string;
  flow: FlowKind;
  startStepId: string;
  presetData?: FlowData;
}

export interface User {
  name: string;
  company: string;
  email: string;
  phone: string;
  region: string;
}
