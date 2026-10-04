// The pages and sentences the tool and its documents rest on. Each sentence comes from a page that is saved, with its
// address on the first line, in research/sources, and test/data.test.js compares this file with the saved text. Change a
// sentence here only after saving the new page text and updating docs/rules-and-sources.md. The code in src/ uses these
// constants and never writes a quoted sentence of its own.

export const SOURCES = [
  { id: 'commonmark', file: 'commonmark-headings-and-blocks.txt', url: 'https://spec.commonmark.org/0.31.2/', label: 'CommonMark Spec 0.31.2: ATX headings, setext headings, indented and fenced code blocks, block quotes' },
  { id: 'gfm', file: 'gfm-tables.txt', url: 'https://github.github.com/gfm/', label: 'GitHub Flavored Markdown Spec: Tables (extension)' },
  { id: 'gsa', file: 'gsa-sow-pws-template.txt', url: 'https://buy.gsa.gov/api/system/files/documents/Sch_70_SOW_PWS_TaskOrder_Template_opt.pdf', label: 'U.S. General Services Administration: Schedule 70 task order template for a Statement of Work/Performance Work Statement (SOW/PWS)' },
  { id: 'far', file: 'far-37-602-performance-work-statement.txt', url: 'https://www.acquisition.gov/far/37.602', label: 'Federal Acquisition Regulation 37.602, Performance work statement, on Acquisition.GOV' },
  { id: 'gov-uk', file: 'gov-uk-dos-manage-contract.txt', url: 'https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract', label: 'GOV.UK, Government Digital Service: How to manage your Digital Outcomes and Specialists contract (withdrawn guidance)' },
  { id: 'rfc8259', file: 'rfc8259-json-objects.txt', url: 'https://www.rfc-editor.org/rfc/rfc8259', label: 'RFC 8259, The JSON Data Interchange Format' }
];

export const source = (id) => SOURCES.find((s) => s.id === id);

// Sentences quoted in the reports and the documents. Every text is on its saved page word for word (test/data.test.js
// compares them, with runs of white space read as one space), and holds no year.
export const FACTS = {
  ukShouldInclude: { source: 'gov-uk', section: "Understanding the contract scope and writing 'statements of work'", text: 'A statement of work should include:' },
  ukWork: { source: 'gov-uk', section: "Understanding the contract scope and writing 'statements of work'", text: 'clear descriptions of the work that needs to be done' },
  ukHowLong: { source: 'gov-uk', section: "Understanding the contract scope and writing 'statements of work'", text: 'how long the work should take' },
  ukPeople: { source: 'gov-uk', section: "Understanding the contract scope and writing 'statements of work'", text: 'a list of people needed to do the work' },
  ukPay: { source: 'gov-uk', section: "Understanding the contract scope and writing 'statements of work'", text: "how the buyer will pay for the work, using either the 'fixed price', 'time and materials' or 'capped time and materials' approach" },
  ukCost: { source: 'gov-uk', section: "Understanding the contract scope and writing 'statements of work'", text: 'how much the work will cost' },
  ukScope: { source: 'gov-uk', section: "Understanding the contract scope and writing 'statements of work'", text: "You'll agree the scope of the contract with the supplier before the buying process ends so you both know what the contract covers." },
  ukChangeNotice: { source: 'gov-uk', section: 'Changes to contracts', text: 'You must complete a contract change notice (CCN) if:' },
  ukMeasure: { source: 'gov-uk', section: 'How to manage supplier performance', text: "agree how you'll measure it upfront" },
  ukMeet: { source: 'gov-uk', section: 'How to manage supplier performance', text: 'meet regularly to discuss ongoing performance' },
  ukDispute: { source: 'gov-uk', section: 'Dispute resolution', text: "If you disagree with the supplier about the work that's being done and both parties have made all efforts to resolve the dispute, you should follow a dispute resolution process." },
  ukEnd: { source: 'gov-uk', section: 'Ending a contract', text: 'You can end a contract for:' },
  ukWithdrawn: { source: 'gov-uk', section: 'How to manage your Digital Outcomes and Specialists contract', text: 'This page has been withdrawn as it is out of date.' },
  farMeasurable: { source: 'far', section: '37.602 Performance work statement.', text: 'Enable assessment of work performance against measurable performance standards;' },
  farSoo: { source: 'far', section: '37.602 Performance work statement.', text: 'The SOO shall, at a minimum, include-' },
  farPurpose: { source: 'far', section: '37.602 Performance work statement.', text: '(1) Purpose;' },
  farScope: { source: 'far', section: '37.602 Performance work statement.', text: '(2) Scope or mission;' },
  farPeriod: { source: 'far', section: '37.602 Performance work statement.', text: '(3) Period and place of performance;' },
  farBackground: { source: 'far', section: '37.602 Performance work statement.', text: '(4) Background;' },
  farObjectives: { source: 'far', section: '37.602 Performance work statement.', text: '(5) Performance objectives, i.e., required results; and' },
  farConstraints: { source: 'far', section: '37.602 Performance work statement.', text: '(6) Any operating constraints.' },
  gsaBackground: { source: 'gsa', section: '1.0 BACKGROUND', text: 'PROVIDE THE BACKGROUND INFORMATION THAT PROVIDES A HIGH LEVEL DESCRIPTION OF THE REQUIREMENT OF THE CLIENT.' },
  gsaObjectives: { source: 'gsa', section: '2.0 OBJECTIVES', text: 'DESCRIBE WHAT THIS TASK WILL ACCOMPLISH. THIS SHOULD REFLECT THE END STATE THE CLIENT WANTS TO ACHIEVE.' },
  gsaScope: { source: 'gsa', section: '3.0 SCOPE', text: 'DESCRIBE THE TYPE OF WORK (RANGE OF TASKS) THE TASK ORDER WILL SUPPORT.' },
  gsaDeliverables: { source: 'gsa', section: '5.1 Deliverables', text: 'DESCRIBE ALL EXPECTED DELIVERABLES AND THE TIMEFRAME FOR THEIR DELIVERY.' },
  gsaInspection: { source: 'gsa', section: '5.1.2 Inspection and Acceptance of Services', text: 'All periodic reports and task deliverables shall be inspected, tested (where applicable), reviewed, and accepted by the Government within a reasonable period of time' },
  gsaAcceptance: { source: 'gsa', section: '5.1.2 Inspection and Acceptance of Services', text: 'DESCRIBE ACCEPTANCE CRITERIA AS APPLICABLE TO THE TASK.' },
  gsaDefects: { source: 'gsa', section: '5.1.2 Inspection and Acceptance of Services', text: 'Performance by the Contractor to correct defects found by the Government as a result of quality assurance surveillance and by the Contractor as a result of quality control' },
  gsaMonitor: { source: 'gsa', section: '5.1.2 Inspection and Acceptance of Services', text: 'The client representative will monitor compliance and report to the PM.' },
  gsaPeriod: { source: 'gsa', section: '6.2 Period of Performance (POP) and FAR Clauses in Full Text or by Reference', text: 'The POP for this task is a [#-MONTH BASE + #/DURATION OF OPTIONS].' },
  gsaSecurity: { source: 'gsa', section: '6.4 Security', text: 'Note: This requirement must be met on any procurement, IT, PS, etc., where the contractor will have access to government electronic information.' },
  gsaTransition: { source: 'gsa', section: '6.6.3 Transition Plan (Phase In and Out of Task Order)', text: 'The contractor shall provide a transition plan that outlines the designated time period and strategy to transition into the duties as the contractor and to transition out of the task order at the end of the period of performance.' },
  gsaPrivacy: { source: 'gsa', section: '6.6.5 Privacy Act', text: 'Work on this project may require that personnel have access to Privacy Information.' },
  gsaProperty: { source: 'gsa', section: '6.6.8 Records/Data', text: 'All deliverables become the sole property of the United States Government.' },
  gsaFurnished: { source: 'gsa', section: '6.6.9 Government Furnished Items', text: 'DESCRIBE ALL GFE. INCLUDE WHAT IS BEING PROVIDED AND WHEN IT WILL BE PROVIDED.' },
  gsaInvoice: { source: 'gsa', section: '7.0 INVOICING/ PROCEDURES FOR PAYMENT', text: 'The contractor shall submit only one invoice per month per order/contract.' },
  gsaContacts: { source: 'gsa', section: 'APPENDIX A', text: '1.0 POINTS OF CONTACT.' },
  atxOpening: { source: 'commonmark', section: '4.2 ATX headings', text: 'The opening sequence of # characters must be followed by spaces or tabs, or by the end of line.' },
  atxIndent: { source: 'commonmark', section: '4.2 ATX headings', text: 'The opening # character may be preceded by up to three spaces of indentation.' },
  atxLevel: { source: 'commonmark', section: '4.2 ATX headings', text: 'The heading level is equal to the number of # characters in the opening sequence.' },
  setextUnderline: { source: 'commonmark', section: '4.3 Setext headings', text: 'A setext heading underline is a sequence of = characters or a sequence of - characters, with no more than 3 spaces of indentation and any number of trailing spaces or tabs.' },
  setextLevel: { source: 'commonmark', section: '4.3 Setext headings', text: 'The heading is a level 1 heading if = characters are used in the setext heading underline, and a level 2 heading if - characters are used.' },
  indentedCode: { source: 'commonmark', section: '4.4 Indented code blocks', text: 'An indented chunk is a sequence of non-blank lines, each preceded by four or more spaces of indentation.' },
  fenceOpen: { source: 'commonmark', section: '4.5 Fenced code blocks', text: 'A code fence is a sequence of at least three consecutive backtick characters (`) or tildes (~).' },
  fenceLiteral: { source: 'commonmark', section: '4.5 Fenced code blocks', text: 'The content of a code fence is treated as literal text, not parsed as inlines.' },
  fenceUnclosed: { source: 'commonmark', section: '4.5 Fenced code blocks', text: 'If the end of the containing block (or document) is reached and no closing code fence has been found, the code block contains all of the lines after the opening code fence until the end of the containing block (or document).' },
  tableDelimiter: { source: 'gfm', section: '4.10 Tables (extension)', text: 'The delimiter row consists of cells whose only content are hyphens (-), and optionally, a leading or trailing colon (:), or both, to indicate left, right, or center alignment respectively.' },
  tableHeader: { source: 'gfm', section: '4.10 Tables (extension)', text: 'The header row must match the delimiter row in the number of cells.' },
  jsonUnpredictable: { source: 'rfc8259', section: '4. Objects', text: 'When the names within an object are not unique, the behavior of software that receives such an object is unpredictable.' }
};

// The page of a quoted sentence.
export const factPage = (key) => source(FACTS[key].source).url;

// The levels of a finding, from the lowest. A finding fails the run when its level is the fail level or above.
export const LEVELS = ['notice', 'warning', 'error'];

// The levels of a section of the checklist.
export const SECTION_LEVELS = ['required', 'recommended', 'off'];

// The sentence every report ends with, before the result.
export const NOT_LEGAL_ADVICE = 'This report checks the structure and the wording of the document only. It is not a legal review and gives no legal advice.';
