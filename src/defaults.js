// The default checklist and the default lists of phrases. Every entry can be changed in the configuration file
// (docs/inputs.md), and `--print-defaults` writes all of it out as a configuration file to start from.
//
// Each section of the checklist names the sentences of the saved pages it comes from (basis, keys of FACTS in
// src/data.js). A section that no saved page names is the tool's own choice, and own says why it is on the list; such a
// section is marked as the tool's own choice in docs/rules-and-sources.md. Aliases are compared with a heading after both
// are put in the normal form of src/sections.js: no numbering, lower case, "&" read as "and", punctuation read as a space.

export const DEFAULT_SECTIONS = [
  {
    id: 'background',
    title: 'Background',
    level: 'recommended',
    aliases: ['background', 'context', 'introduction', 'overview', 'project background', 'project overview', 'about the project'],
    basis: ['gsaBackground', 'farBackground']
  },
  {
    id: 'objectives',
    title: 'Objectives',
    level: 'required',
    aliases: ['objectives', 'objective', 'goals', 'goal', 'aims', 'purpose', 'project objectives', 'business objectives', 'outcomes', 'desired outcomes'],
    basis: ['gsaObjectives', 'farPurpose', 'farObjectives']
  },
  {
    id: 'inScope',
    title: 'In scope',
    level: 'required',
    aliases: ['in scope', 'scope', 'scope of work', 'scope of services', 'description of services', 'description of work', 'work to be performed', 'requirements', 'tasks'],
    basis: ['ukWork', 'gsaScope', 'farScope']
  },
  {
    id: 'outOfScope',
    title: 'Out of scope',
    level: 'required',
    aliases: ['out of scope', 'outside scope', 'outside the scope', 'not in scope', 'exclusions', 'excluded', 'excluded work', 'not included', 'what is not included'],
    basis: [],
    own: 'No saved page names a list of what is excluded. The tool asks for it because work that is in scope only by silence is a frequent cause of disputes; the no-out-of-scope rule checks it next to the scope.'
  },
  {
    id: 'deliverables',
    title: 'Deliverables',
    level: 'required',
    aliases: ['deliverables', 'deliverable', 'outputs', 'work products', 'what will be delivered'],
    wording: true,
    basis: ['gsaDeliverables']
  },
  {
    id: 'acceptance',
    title: 'Acceptance criteria',
    level: 'required',
    aliases: ['acceptance criteria', 'acceptance', 'acceptance tests', 'acceptance testing', 'user acceptance testing', 'uat', 'definition of done', 'inspection and acceptance', 'sign off', 'completion criteria'],
    wording: true,
    criteria: true,
    basis: ['gsaInspection', 'gsaAcceptance', 'farMeasurable']
  },
  {
    id: 'changeControl',
    title: 'Change control',
    level: 'required',
    aliases: ['change control', 'change process', 'change request', 'change requests', 'change management', 'changes', 'contract changes', 'changes to the contract', 'variations', 'change order', 'change orders'],
    basis: ['ukChangeNotice']
  },
  {
    id: 'assumptions',
    title: 'Assumptions',
    level: 'recommended',
    aliases: ['assumptions', 'assumption', 'constraints', 'operating constraints'],
    basis: ['farConstraints'],
    own: 'FAR 37.602 names operating constraints; assumptions are the tool\'s own addition, because an assumption that is written down can be checked when it turns out wrong.'
  },
  {
    id: 'clientResponsibilities',
    title: 'Dependencies and client responsibilities',
    level: 'recommended',
    aliases: ['dependencies', 'dependency', 'client responsibilities', 'customer responsibilities', 'buyer responsibilities', 'client obligations', 'customer obligations', 'responsibilities of the client', 'client dependencies', 'government furnished items', 'client furnished items', 'inputs from the client'],
    basis: ['gsaFurnished']
  },
  {
    id: 'roles',
    title: 'Roles and contacts',
    level: 'recommended',
    aliases: ['roles', 'roles and responsibilities', 'contacts', 'points of contact', 'point of contact', 'key personnel', 'key contacts', 'team', 'project team', 'staffing', 'people', 'stakeholders'],
    basis: ['ukPeople', 'gsaContacts']
  },
  {
    id: 'schedule',
    title: 'Schedule and milestones',
    level: 'required',
    aliases: ['schedule', 'milestones', 'milestone', 'timeline', 'timetable', 'delivery schedule', 'project schedule', 'phases', 'period of performance', 'duration', 'time frame', 'timeframe'],
    basis: ['ukHowLong', 'farPeriod', 'gsaPeriod']
  },
  {
    id: 'pricing',
    title: 'Pricing and payment terms',
    level: 'required',
    aliases: ['pricing', 'price', 'prices', 'fees', 'fee', 'payment', 'payments', 'payment terms', 'payment schedule', 'invoicing', 'charges', 'costs', 'cost', 'commercials', 'commercial terms', 'budget', 'rates', 'compensation'],
    basis: ['ukPay', 'ukCost', 'gsaInvoice']
  },
  {
    id: 'intellectualProperty',
    title: 'Intellectual property and ownership',
    level: 'recommended',
    aliases: ['intellectual property', 'intellectual property rights', 'ip', 'ip rights', 'ip ownership', 'ownership', 'ownership of deliverables', 'licensing', 'license', 'licence'],
    basis: ['gsaProperty']
  },
  {
    id: 'confidentiality',
    title: 'Confidentiality',
    level: 'recommended',
    aliases: ['confidentiality', 'confidential information', 'non disclosure', 'nondisclosure', 'nda'],
    basis: [],
    own: 'No saved page names confidentiality. The tool lists it because an outsourced team sees the client\'s code, data and plans, and the rules for that information belong in writing.'
  },
  {
    id: 'dataProtection',
    title: 'Data protection',
    level: 'recommended',
    aliases: ['data protection', 'personal data', 'privacy', 'data privacy', 'gdpr', 'processing of personal data', 'data processing'],
    basis: ['gsaPrivacy']
  },
  {
    id: 'security',
    title: 'Security requirements',
    level: 'recommended',
    aliases: ['security', 'security requirements', 'information security', 'access control'],
    basis: ['gsaSecurity']
  },
  {
    id: 'warranty',
    title: 'Warranty and defects',
    level: 'recommended',
    aliases: ['warranty', 'warranties', 'warranty period', 'defects', 'defect remediation', 'defect correction', 'bug fixing', 'bug fixes', 'guarantee'],
    basis: ['gsaDefects']
  },
  {
    id: 'support',
    title: 'Support after delivery',
    level: 'recommended',
    aliases: ['support', 'maintenance', 'support and maintenance', 'post delivery support', 'after delivery support', 'hypercare', 'ongoing support', 'service levels', 'sla', 'handover', 'transition'],
    basis: [],
    own: 'No saved page names support after delivery. The GSA template asks for a transition plan out of the task order, which is close but not the same; the tool lists support because who fixes what after the handover is a frequent question at the end of an outsourced project.'
  },
  {
    id: 'termination',
    title: 'Termination',
    level: 'recommended',
    aliases: ['termination', 'terminating the agreement', 'ending the contract', 'ending the agreement', 'exit', 'exit plan', 'cancellation'],
    basis: ['ukEnd']
  },
  {
    id: 'governance',
    title: 'Governance and reporting',
    level: 'recommended',
    aliases: ['governance', 'reporting', 'reports', 'status reporting', 'progress reporting', 'communication', 'communications', 'meetings', 'project management', 'performance management', 'steering committee', 'escalation'],
    basis: ['ukMeasure', 'ukMeet', 'gsaMonitor']
  },
  {
    id: 'disputes',
    title: 'Dispute resolution',
    level: 'recommended',
    aliases: ['dispute resolution', 'disputes', 'dispute'],
    basis: ['ukDispute']
  }
];

// Words that make a deliverable or an acceptance criterion impossible to check, looked for in the sections whose
// checklist entry has wording: true. A phrase in capitals only is compared with case; any other phrase without case.
export const DEFAULT_VAGUE_PHRASES = [
  'user-friendly', 'user friendly', 'easy to use', 'intuitive', 'fast', 'quick', 'quickly', 'responsive', 'performant',
  'scalable', 'flexible', 'seamless', 'seamlessly', 'robust', 'modern', 'state of the art', 'state-of-the-art',
  'industry standard', 'industry-standard', 'best practice', 'best practices', 'best effort', 'best efforts',
  'high quality', 'high-quality', 'as needed', 'as required', 'as appropriate', 'if possible', 'where possible',
  'as soon as possible', 'asap', 'in a timely manner', 'timely', 'reasonable', 'adequate', 'sufficient', 'etc.',
  'and so on', 'and more', 'minimal', 'optimal', 'optimized', 'efficient', 'appropriate', 'normal', 'typical',
  'and/or'
];

// Text that marks a part of the document as not written yet. Looked for in every section.
export const DEFAULT_PLACEHOLDERS = [
  'TBD', 'TBC', 'TBA', 'TODO', 'FIXME', 'XXX', 'to be confirmed', 'to be determined', 'to be decided', 'to be defined',
  'to be agreed', 'to be advised', 'lorem ipsum', '[...]', '[insert'
];

// Names of standards. An acceptance criterion that names one has a measurable element. Compared with case when written in
// capitals only.
export const DEFAULT_STANDARDS = ['WCAG', 'ISO', 'IEC', 'IEEE', 'RFC', 'OWASP', 'ASVS', 'NIST', 'PCI DSS', 'SOC', 'HIPAA', 'GDPR', 'EN 301 549', 'W3C', 'OpenAPI'];

// Number words. An acceptance criterion that holds one, or a digit, has a measurable element.
export const DEFAULT_MEASURE_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'twenty', 'hundred', 'thousand', 'percent', 'half', 'none'];

// Words that name a test. An acceptance criterion that quotes a name ("...") next to one of these words names a test.
export const DEFAULT_TEST_WORDS = ['test', 'tests', 'test case', 'test cases', 'test suite', 'suite', 'scenario', 'scenarios', 'checklist', 'script', 'scripts'];

// The levels of the rules, the rule settings and the fail level.
export const DEFAULT_RULES = {
  missingSection: { required: 'error', recommended: 'notice' },
  emptySection: { level: 'warning' },
  placeholder: { level: 'warning' },
  vagueWording: { level: 'warning' },
  unmeasurableCriterion: { level: 'warning' },
  noOutOfScope: { level: 'error', inScope: 'inScope', outOfScope: 'outOfScope' }
};

export const DEFAULT_FAIL_ON = 'warning';
