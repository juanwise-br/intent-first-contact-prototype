import type { MarketGroup } from './routing';

export const PRODUCT_NAME = 'Lumi Labs Controller X2';

export const DEAL_LABELS: Record<string, string> = {
  small: 'Under 10,000 USD',
  medium: '10,000 to 100,000 USD',
  large: 'Over 100,000 USD',
  unknown: 'Not sure yet'
};

export const NEED_LABELS: Record<string, string> = {
  quote: 'Request a quote',
  order: 'Place an order',
  availability: 'Check availability',
  other: 'Something else about buying',
  troubleshooting: 'Troubleshooting',
  installation: 'Installation or setup',
  parts: 'Spare parts',
  repair: 'Repair or warranty'
};

export const FLOW_LABELS: Record<string, string> = {
  info: 'Product information',
  purchase: 'Purchase or quote',
  support: 'Product support',
  representative: 'Find a representative'
};

/** Fictional placeholder numbers. */
export const HOTLINES: Record<MarketGroup, { label: string; number: string }[]> = {
  Europe: [
    { label: 'Product questions', number: '+00 100 555 0101' },
    { label: 'Technical support', number: '+00 100 555 0102' }
  ],
  'North America': [
    { label: 'Product questions', number: '+1 555 010 0201' },
    { label: 'Technical support', number: '+1 555 010 0202' }
  ],
  'Latin America': [
    { label: 'Product questions', number: '+00 200 555 0301' },
    { label: 'Technical support', number: '+00 200 555 0302' }
  ],
  'Asia Pacific': [
    { label: 'Product questions', number: '+00 300 555 0401' },
    { label: 'Technical support', number: '+00 300 555 0402' }
  ],
  'Middle East and Africa': [{ label: 'Technical support', number: '+00 400 555 0502' }],
  Unknown: [{ label: 'Global contact desk', number: '+00 000 555 0000' }]
};

export interface Contact {
  name: string;
  title: string;
  role: string;
  area: string;
  group: MarketGroup;
  city: string;
}

/** All names are fictional. */
export const CONTACTS: Contact[] = [
  { name: 'Lena Hartmann', title: 'Regional Sales Lead', role: 'Sales', area: 'Automation and control', group: 'Europe', city: 'Munich' },
  { name: 'Mateo Ruiz', title: 'Key Account Manager', role: 'Sales', area: 'Drives and motion', group: 'Europe', city: 'Madrid' },
  { name: 'Sofia Laurent', title: 'Solutions Sales', role: 'Sales', area: 'Software and data', group: 'Europe', city: 'Lyon' },
  { name: 'Dana Whitfield', title: 'Regional Sales Lead', role: 'Sales', area: 'Automation and control', group: 'North America', city: 'Chicago' },
  { name: 'Marcus Bell', title: 'Technical Support Engineer', role: 'Technical support', area: 'Drives and motion', group: 'North America', city: 'Austin' },
  { name: 'Ana Beltran', title: 'Distributor Manager', role: 'Distributor', area: 'Energy and power', group: 'Latin America', city: 'Bogota' },
  { name: 'Rafael Costa', title: 'Sales Engineer', role: 'Sales', area: 'Buildings', group: 'Latin America', city: 'Sao Paulo' },
  { name: 'Priya Raman', title: 'Technical Support Lead', role: 'Technical support', area: 'Automation and control', group: 'Asia Pacific', city: 'Pune' },
  { name: 'Kenji Mori', title: 'Solution Partner Manager', role: 'Solution partner', area: 'Software and data', group: 'Asia Pacific', city: 'Osaka' },
  { name: 'Wei Tan', title: 'Training Coordinator', role: 'Training', area: 'Services', group: 'Asia Pacific', city: 'Singapore' },
  { name: 'Omar Khalil', title: 'Spare Parts Specialist', role: 'Spare parts and calibration', area: 'Energy and power', group: 'Middle East and Africa', city: 'Dubai' },
  { name: 'Thandi Nkosi', title: 'Technical Support Engineer', role: 'Technical support', area: 'Automation and control', group: 'Middle East and Africa', city: 'Johannesburg' },
  { name: 'Greta Lindqvist', title: 'Training Lead', role: 'Training', area: 'Services', group: 'Europe', city: 'Stockholm' },
  { name: 'Hannah Cole', title: 'Calibration Services', role: 'Spare parts and calibration', area: 'Drives and motion', group: 'North America', city: 'Toronto' }
];

export const GLOBAL_DESK: Contact = {
  name: 'Lumi Labs Global Contact Desk',
  title: 'We will find the right person for you',
  role: 'Any',
  area: 'Any',
  group: 'Unknown',
  city: 'Remote'
};

export const REP_ROLES = [
  'Sales',
  'Technical support',
  'Distributor',
  'Solution partner',
  'Spare parts and calibration',
  'Training'
];

export const PRODUCT_AREAS = [
  'Automation and control',
  'Drives and motion',
  'Energy and power',
  'Buildings',
  'Software and data',
  'Services'
];

export const OTHER_CATEGORIES: { title: string; items: string[] }[] = [
  {
    title: 'Requests and support',
    items: [
      'I need help with billing or financing',
      'I want to become a partner',
      'I am looking for training options',
      'I want to check academic offers'
    ]
  },
  {
    title: 'Corporate contacts',
    items: ['Press team', 'Investor relations', 'Industry analyst relations']
  },
  {
    title: 'General inquiries',
    items: ['Careers at Lumi Labs', 'Consumer products', 'Whistleblowing and reporting channels']
  }
];
