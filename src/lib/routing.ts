import type { FlowData } from './types';

export type MarketGroup =
  | 'Europe'
  | 'North America'
  | 'Latin America'
  | 'Asia Pacific'
  | 'Middle East and Africa'
  | 'Unknown';

export const REGIONS: { name: string; group: MarketGroup }[] = [
  { name: 'Germany', group: 'Europe' },
  { name: 'Switzerland', group: 'Europe' },
  { name: 'France', group: 'Europe' },
  { name: 'Spain', group: 'Europe' },
  { name: 'United Kingdom', group: 'Europe' },
  { name: 'United States', group: 'North America' },
  { name: 'Canada', group: 'North America' },
  { name: 'Mexico', group: 'Latin America' },
  { name: 'Colombia', group: 'Latin America' },
  { name: 'Brazil', group: 'Latin America' },
  { name: 'India', group: 'Asia Pacific' },
  { name: 'Japan', group: 'Asia Pacific' },
  { name: 'Singapore', group: 'Asia Pacific' },
  { name: 'Australia', group: 'Asia Pacific' },
  { name: 'United Arab Emirates', group: 'Middle East and Africa' },
  { name: 'South Africa', group: 'Middle East and Africa' }
];

const GROUP_LOOKUP = new Map(REGIONS.map((r) => [r.name.toLowerCase(), r.group]));

export function marketGroupFor(region?: string): MarketGroup {
  if (!region) return 'Unknown';
  return GROUP_LOOKUP.get(region.trim().toLowerCase()) ?? 'Unknown';
}

export type RoutingFunction =
  | 'Sales'
  | 'Technical Support'
  | 'Product Information'
  | 'General Inquiries';

/**
 * Which market groups have a dedicated team for each function.
 * Anything not listed here falls back to the global desk for that function.
 * In a real build this would live in configuration owned by regional teams,
 * not in code.
 */
export const COVERAGE: Record<RoutingFunction, MarketGroup[]> = {
  Sales: ['Europe', 'North America', 'Latin America', 'Asia Pacific'],
  'Technical Support': [
    'Europe',
    'North America',
    'Latin America',
    'Asia Pacific',
    'Middle East and Africa'
  ],
  'Product Information': ['Europe', 'North America', 'Asia Pacific'],
  'General Inquiries': []
};

export type QueueType = 'standard' | 'priority' | 'callback';
export type FallbackLevel = 'none' | 'global-function' | 'global-triage';

export interface RoutingRequest {
  flow: string;
  method?: string;
  region?: string;
  dealSize?: string;
}

export interface RoutingDecision {
  team: string;
  fn: RoutingFunction;
  group: MarketGroup;
  queue: QueueType;
  fallback: FallbackLevel;
  reasons: string[];
}

const FLOW_TO_FUNCTION: Record<string, RoutingFunction> = {
  info: 'Product Information',
  purchase: 'Sales',
  support: 'Technical Support'
};

export function functionFor(flow: string): RoutingFunction {
  return FLOW_TO_FUNCTION[flow] ?? 'General Inquiries';
}

export const PRIORITY_DEAL_SIZE = 'large';

export function toRoutingRequest(data: FlowData): RoutingRequest {
  return {
    flow: data.flow,
    method: data.contactMethod,
    region: data.region,
    dealSize: data.dealSize
  };
}

/**
 * Every request gets a team. The fallback chain is:
 * regional team, then the global desk for the function, then the global triage desk.
 * There is deliberately no code path that returns "no team".
 */
export function routeRequest(req: RoutingRequest): RoutingDecision {
  const fn = functionFor(req.flow);
  const group = marketGroupFor(req.region);
  const reasons: string[] = [`Intent maps to ${fn}`];

  let team: string;
  let fallback: FallbackLevel = 'none';

  if (group === 'Unknown') {
    team = 'Global Triage Desk';
    fallback = 'global-triage';
    reasons.push(
      `Region "${req.region ?? 'not provided'}" is not recognised, so a person triages it`
    );
  } else if (COVERAGE[fn].includes(group)) {
    team = `${fn} ${group}`;
    reasons.push(`${group} has a dedicated ${fn} team`);
  } else {
    team = `Global ${fn} Desk`;
    fallback = 'global-function';
    reasons.push(`${group} has no dedicated ${fn} team, so the global desk picks it up`);
  }

  let queue: QueueType = 'standard';
  if (req.flow === 'purchase' && req.dealSize === PRIORITY_DEAL_SIZE) {
    queue = 'priority';
    team = `${team} (Priority Lane)`;
    reasons.push('Opportunity above 100,000 USD goes to the priority lane');
  } else if (req.method === 'callback') {
    queue = 'callback';
    reasons.push('Visitor asked for a callback');
  }

  return { team, fn, group, queue, fallback, reasons };
}
