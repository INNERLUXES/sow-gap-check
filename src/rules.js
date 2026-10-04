// The six rules and the verdict. Each rule names the sentences of the saved pages it rests on (src/data.js), and
// docs/method.md says exactly what each rule looks at and what it cannot see. A rule whose level is "off" is not run.

import { LEVELS } from './data.js';
import { grouped, plural } from './size.js';

export const RULES = [
  {
    id: 'missing-section',
    key: 'missingSection',
    title: 'a section of the checklist that no heading matches',
    facts: ['ukShouldInclude', 'farSoo'],
    rule: (r) => `a section of the checklist at level required (finding at ${r.required}) or recommended (finding at ${r.recommended}) for which no heading of the document matches one of its aliases`
  },
  {
    id: 'empty-section',
    key: 'emptySection',
    title: 'a heading with no text under it, or nothing but placeholders',
    facts: ['ukWork'],
    rule: () => 'a heading under which, down to the next heading at its level or above, there is no paragraph, list, table, code block or block quote, or where every piece of text is nothing but placeholders'
  },
  {
    id: 'placeholder',
    key: 'placeholder',
    title: 'text that marks a part of the document as not written yet',
    facts: ['ukWork'],
    rule: (r, config) => `a placeholder of the list (${plural(config.placeholders.length, 'phrase')}) in a heading or in text of any section, outside code, quotes and links`
  },
  {
    id: 'vague-wording',
    key: 'vagueWording',
    title: 'a word that makes a deliverable or an acceptance criterion impossible to check',
    facts: ['farMeasurable', 'ukWork'],
    rule: (r, config) => `a phrase of the list (${plural(config.vaguePhrases.length, 'phrase')}) in a paragraph, list item or table cell of a section marked for wording (${config.sections.filter((s) => s.wording && s.level !== 'off').map((s) => s.title).join(', ') || 'none'}), outside code, quotes and links`
  },
  {
    id: 'unmeasurable-criterion',
    key: 'unmeasurableCriterion',
    title: 'an acceptance criterion with nothing in it that can be measured',
    facts: ['farMeasurable', 'gsaInspection'],
    rule: (r, config) => `a list item with no list inside it, in a section marked for criteria (${config.sections.filter((s) => s.criteria && s.level !== 'off').map((s) => s.title).join(', ') || 'none'}), that holds no digit, no number word, no code span, no named standard and no quoted name next to a test word`
  },
  {
    id: 'no-out-of-scope',
    key: 'noOutOfScope',
    title: 'a scope with no out-of-scope section, or an empty one',
    facts: ['ukScope'],
    rule: (r, config) => `the section ${config.sections.find((s) => s.id === r.inScope)?.title ?? r.inScope} is there and holds text, and the section ${config.sections.find((s) => s.id === r.outOfScope)?.title ?? r.outOfScope} is missing or empty`
  }
];

export const ruleById = (id) => RULES.find((r) => r.id === id);

// True when a level is the fail level or above it.
export const atOrAbove = (level, failOn) => LEVELS.indexOf(level) >= LEVELS.indexOf(failOn);

// The verdict: { pass, failOn, failing, byLevel, text }.
export function decide(findings, failOn) {
  const byLevel = { error: 0, warning: 0, notice: 0 };
  for (const f of findings) byLevel[f.level] += 1;
  const failing = findings.filter((f) => atOrAbove(f.level, failOn)).length;
  const text = failing ? `FAIL - ${plural(failing, 'finding')} at or above ${failOn}` : `PASS - no finding at or above ${failOn}${findings.length ? ` (${grouped(findings.length)} below it)` : ''}`;
  return { pass: failing === 0, failOn, failing, byLevel, text };
}
