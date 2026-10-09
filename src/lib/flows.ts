import type { EntryPoint, FlowStep, Option } from './types';
import { PRODUCT_AREAS, PRODUCT_NAME, REP_ROLES } from './data';

/**
 * The whole conversation lives in this file. Change the copy, reorder steps or
 * add an option here and the chat, the flow map and the tests all follow.
 * Nothing in the UI hard codes a question.
 */

export const RESTART = '__restart__';

const methodOptions: Option[] = [
  { label: 'Send a message', nextId: 'ask_message_content', value: 'message' },
  { label: 'Talk to us', nextId: 'confirm_region_phone', value: 'phone' },
  { label: 'Live chat', nextId: 'chat_unavailable', value: 'chat' }
];

const consent =
  'By submitting this request you agree that Halden may process your data to respond to it, and may send you related product news. You can opt out at any time.';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const hours = Array.from({ length: 9 }, (_, i) => `${String(i + 9).padStart(2, '0')}:00`);

const steps: FlowStep[] = [
  // ENTRY
  {
    id: 'main_menu',
    message: 'How can we help you today?',
    type: 'options',
    options: [
      { label: 'I need information about products or services', nextId: 'info' },
      { label: 'I want to buy a product or get a quote', nextId: 'purchase' },
      { label: 'I need support for a product I own', nextId: 'support' },
      { label: 'I want to find a Halden representative or partner', nextId: 'representative' },
      { label: 'I have a different request', nextId: 'default_view' }
    ]
  },
  {
    id: 'default_view',
    message: 'Other requests are handled from the contact overview page.',
    type: 'end'
  },

  // INFO FLOW
  {
    id: 'info',
    message:
      'Happy to help with product information. Do you know the product name or article number?',
    type: 'options',
    options: [
      { label: 'Yes, I do', nextId: 'ask_product_name' },
      { label: "No, I don't", nextId: 'ask_product_family' }
    ]
  },
  {
    id: 'ask_product_name',
    message: 'Great. Please type the product name or article number.',
    type: 'text',
    inputKey: 'productName',
    nextId: 'ask_contact_method'
  },
  {
    id: 'ask_product_family',
    message: 'No problem. Do you know which product family or series it belongs to?',
    type: 'options',
    options: [
      { label: 'Yes, I know the series', nextId: 'ask_family_name' },
      { label: "No, I'm not sure", nextId: 'ask_contact_method_unknown_product' }
    ]
  },
  {
    id: 'ask_family_name',
    message: 'Please enter the product family or series name.',
    type: 'text',
    inputKey: 'productFamily',
    nextId: 'ask_contact_method'
  },
  {
    id: 'ask_contact_method_unknown_product',
    message: 'That is fine, our team will help you identify the right product. How would you like to reach us?',
    type: 'options',
    options: methodOptions,
    inputKey: 'contactMethod'
  },
  {
    id: 'ask_contact_method',
    message: (d) =>
      `How would you prefer to get in touch about ${d.productName || d.productFamily || 'this product'}?`,
    type: 'options',
    options: methodOptions,
    inputKey: 'contactMethod'
  },
  {
    id: 'chat_unavailable',
    message: 'Live chat is not available right now. Please pick another way to reach us.',
    type: 'options',
    options: methodOptions.filter((o) => o.value !== 'chat'),
    inputKey: 'contactMethod'
  },

  // PRODUCT PAGE ENTRY (product already known)
  {
    id: 'pdp_info',
    message: (d) => `Happy to help with ${d.productName}.`,
    type: 'auto',
    nextId: 'ask_contact_method'
  },

  // REGION CONFIRMATION
  {
    id: 'confirm_region_phone',
    message: (d) => `It looks like you are in ${d.region}. Is that right?`,
    type: 'options',
    options: [
      { label: "Yes, that's right", nextId: 'show_phone_numbers' },
      { label: 'No, change region', nextId: 'ask_region_manual_phone' }
    ]
  },
  {
    id: 'ask_region_manual_phone',
    message: 'Which country are you in?',
    type: 'text',
    inputKey: 'region',
    nextId: 'show_phone_numbers'
  },

  // MESSAGE PATH
  {
    id: 'ask_message_content',
    message: 'Tell us briefly what you need.',
    type: 'text',
    inputKey: 'userMessage',
    nextId: 'ask_full_name'
  },
  {
    id: 'ask_full_name',
    message: 'May I have your full name?',
    type: 'text',
    inputKey: 'fullName',
    skipWhenKnown: true,
    nextId: 'ask_company'
  },
  {
    id: 'ask_company',
    message: 'Which company are you with?',
    type: 'text',
    inputKey: 'company',
    skipWhenKnown: true,
    nextId: 'ask_email'
  },
  {
    id: 'ask_email',
    message: 'What email address should we reply to?',
    type: 'text',
    inputKey: 'userEmail',
    validate: 'email',
    skipWhenKnown: true,
    nextId: 'ask_phone'
  },
  {
    id: 'ask_phone',
    message: 'And the best phone number to reach you?',
    type: 'text',
    inputKey: 'userPhone',
    validate: 'phone',
    skipWhenKnown: true,
    nextId: 'confirm_region_info'
  },
  {
    id: 'confirm_region_info',
    message: (d) => `It looks like you are in ${d.region}. Is that right?`,
    type: 'options',
    options: [
      { label: "Yes, that's right", nextId: 'review_submission' },
      { label: 'No, change region', nextId: 'ask_region_manual_info' }
    ]
  },
  {
    id: 'ask_region_manual_info',
    message: 'Which country are you in?',
    type: 'text',
    inputKey: 'region',
    nextId: 'review_submission'
  },
  {
    id: 'review_submission',
    message: 'Here is what we have. Does everything look right?',
    type: 'options',
    customComponent: 'SubmissionSummary',
    options: [
      { label: 'Yes, send my request', nextId: 'submission_success' },
      { label: 'Start over', nextId: RESTART }
    ],
    footnote: consent
  },
  {
    id: 'submission_success',
    message: (d) =>
      `Thanks, your request is in. Your reference is ${d.ref}. We sent a confirmation to ${d.userEmail}.`,
    type: 'end',
    submit: true
  },

  // PHONE PATH
  {
    id: 'show_phone_numbers',
    message: (d) => `Here are the numbers for ${d.region}:`,
    type: 'custom',
    customComponent: 'PhoneList',
    nextId: 'end_phone'
  },
  {
    id: 'end_phone',
    message: 'Anything else we can help with?',
    type: 'end',
    restartable: true
  },

  // PURCHASE FLOW
  {
    id: 'purchase',
    message: 'Happy to help with your purchase. Which product name or article number are you interested in?',
    type: 'text',
    inputKey: 'productName',
    nextId: 'purchase_options'
  },
  {
    id: 'purchase_options',
    message: 'What do you need for this product?',
    type: 'options',
    options: [
      { label: 'Request a quote', nextId: 'ask_deal_size', value: 'quote' },
      { label: 'Place an order', nextId: 'ask_deal_size', value: 'order' },
      { label: 'Check availability', nextId: 'ask_contact_method_callback', value: 'availability' },
      { label: 'Something else about buying', nextId: 'ask_contact_method_callback', value: 'other' }
    ],
    inputKey: 'purchaseType'
  },
  {
    id: 'ask_deal_size',
    message: 'Roughly how large is this opportunity? This helps us send you to the right person quickly.',
    type: 'options',
    options: [
      { label: 'Under 10,000 USD', nextId: 'ask_contact_method_callback', value: 'small' },
      { label: '10,000 to 100,000 USD', nextId: 'ask_contact_method_callback', value: 'medium' },
      { label: 'Over 100,000 USD', nextId: 'ask_contact_method_callback', value: 'large' },
      { label: "I'm not sure yet", nextId: 'ask_contact_method_callback', value: 'unknown' }
    ],
    inputKey: 'dealSize'
  },

  // SUPPORT FLOW
  {
    id: 'support',
    message: 'Sorry you are having trouble. Which product name or article number do you need help with?',
    type: 'text',
    inputKey: 'productName',
    nextId: 'support_options'
  },
  {
    id: 'support_options',
    message: 'What kind of help do you need?',
    type: 'options',
    options: [
      { label: 'Troubleshooting', nextId: 'ask_contact_method_callback', value: 'troubleshooting' },
      { label: 'Installation or setup', nextId: 'ask_contact_method_callback', value: 'installation' },
      { label: 'Spare parts', nextId: 'ask_contact_method_callback', value: 'parts' },
      { label: 'Repair or warranty', nextId: 'ask_contact_method_callback', value: 'repair' }
    ],
    inputKey: 'supportType'
  },

  // SHARED STEP FOR PURCHASE AND SUPPORT (message or callback)
  {
    id: 'ask_contact_method_callback',
    message: (d) => `How would you prefer to get in touch about ${d.productName || 'this product'}?`,
    type: 'options',
    options: [
      { label: 'Send a message', nextId: 'ask_message_content', value: 'message' },
      { label: 'Call me back', nextId: 'ask_full_name_callback', value: 'callback' }
    ],
    inputKey: 'contactMethod'
  },

  // CALLBACK CHAIN
  {
    id: 'ask_full_name_callback',
    message: 'May I have your full name?',
    type: 'text',
    inputKey: 'fullName',
    skipWhenKnown: true,
    nextId: 'ask_company_callback'
  },
  {
    id: 'ask_company_callback',
    message: 'Which company are you with?',
    type: 'text',
    inputKey: 'company',
    skipWhenKnown: true,
    nextId: 'ask_email_callback'
  },
  {
    id: 'ask_email_callback',
    message: 'What email address should we send the confirmation to?',
    type: 'text',
    inputKey: 'userEmail',
    validate: 'email',
    skipWhenKnown: true,
    nextId: 'ask_phone_callback'
  },
  {
    id: 'ask_phone_callback',
    message: 'Which number should we call?',
    type: 'text',
    inputKey: 'userPhone',
    validate: 'phone',
    skipWhenKnown: true,
    nextId: 'ask_callback_day'
  },
  {
    id: 'ask_callback_day',
    message: 'Which day works best for the call?',
    type: 'options',
    options: days.map((d) => ({ label: d, nextId: 'ask_callback_hour', value: d })),
    inputKey: 'callbackDay'
  },
  {
    id: 'ask_callback_hour',
    message: 'And at what time?',
    type: 'options',
    options: hours.map((h) => ({ label: h, nextId: 'confirm_region_callback', value: h })),
    inputKey: 'callbackHour'
  },
  {
    id: 'confirm_region_callback',
    message: (d) => `It looks like you are in ${d.region}. Is that right?`,
    type: 'options',
    options: [
      { label: "Yes, that's right", nextId: 'review_callback' },
      { label: 'No, change region', nextId: 'ask_region_manual_callback' }
    ]
  },
  {
    id: 'ask_region_manual_callback',
    message: 'Which country are you in?',
    type: 'text',
    inputKey: 'region',
    nextId: 'review_callback'
  },
  {
    id: 'review_callback',
    message: 'Here is your callback request. Shall we book it?',
    type: 'options',
    customComponent: 'SubmissionSummary',
    options: [
      { label: 'Yes, book the callback', nextId: 'callback_success' },
      { label: 'Start over', nextId: RESTART }
    ],
    footnote: consent
  },
  {
    id: 'callback_success',
    message: (d) =>
      `All set. We will call you ${d.callbackDay} at ${d.callbackHour}. Your reference is ${d.ref}, and a confirmation is on its way to ${d.userEmail}.`,
    type: 'end',
    submit: true
  },

  // REPRESENTATIVE FLOW
  {
    id: 'representative',
    message: 'Who would you like to get in touch with?',
    type: 'options',
    options: REP_ROLES.map((r) => ({ label: r, nextId: 'ask_product_area', value: r })),
    inputKey: 'repRole'
  },
  {
    id: 'ask_product_area',
    message: 'Which product area is this about?',
    type: 'options',
    options: PRODUCT_AREAS.map((a) => ({ label: a, nextId: 'confirm_region_rep', value: a })),
    inputKey: 'productArea'
  },
  {
    id: 'confirm_region_rep',
    message: (d) => `It looks like you are in ${d.region}. Is that right?`,
    type: 'options',
    options: [
      { label: "Yes, that's right", nextId: 'show_contacts' },
      { label: 'No, change region', nextId: 'ask_region_manual_rep' }
    ]
  },
  {
    id: 'ask_region_manual_rep',
    message: 'Which country are you in?',
    type: 'text',
    inputKey: 'region',
    nextId: 'show_contacts'
  },
  {
    id: 'show_contacts',
    message: 'These are the people who can help:',
    type: 'custom',
    customComponent: 'ContactCards',
    nextId: 'end_rep'
  },
  {
    id: 'end_rep',
    message: 'Want to look for someone else?',
    type: 'end',
    restartable: true
  }
];

export const FLOWS: Record<string, FlowStep> = Object.fromEntries(steps.map((s) => [s.id, s]));

export const GLOBAL_ENTRIES: EntryPoint[] = [
  { key: 'info', label: 'I need information about products or services', flow: 'info', startStepId: 'info' },
  { key: 'purchase', label: 'I want to buy a product or get a quote', flow: 'purchase', startStepId: 'purchase' },
  { key: 'support', label: 'I need support for a product I own', flow: 'support', startStepId: 'support' },
  {
    key: 'representative',
    label: 'I want to find a Halden representative or partner',
    flow: 'representative',
    startStepId: 'representative'
  }
];

const preset = { productName: PRODUCT_NAME };

/** Entry points for a product page, where the product is already known so we skip that question. */
export const PRODUCT_ENTRIES: EntryPoint[] = [
  {
    key: 'pdp_info',
    label: `I have a question about ${PRODUCT_NAME}`,
    flow: 'info',
    startStepId: 'pdp_info',
    presetData: preset
  },
  {
    key: 'pdp_purchase',
    label: `I want to buy ${PRODUCT_NAME} or get a quote`,
    flow: 'purchase',
    startStepId: 'purchase_options',
    presetData: preset
  },
  {
    key: 'pdp_support',
    label: `I need support for ${PRODUCT_NAME}`,
    flow: 'support',
    startStepId: 'support_options',
    presetData: preset
  }
];

export const ALL_ENTRIES: EntryPoint[] = [...GLOBAL_ENTRIES, ...PRODUCT_ENTRIES];
