import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SECTIONS, defaultConfig, headingExtents, matchHeading, normalizeHeading, readMarkdown, wordsOf } from '../src/index.js';
import { configOf } from './helpers.js';

// Matching headings to the sections of the checklist: the normal form, the aliases, and the longest alias first.

const SECTIONS = defaultConfig().sections;
const ids = (heading, sections = SECTIONS) => matchHeading(heading, sections).map((m) => m.id);

test('normal form: numbering, markup, case, "&" and punctuation are left out', () => {
  assert.equal(normalizeHeading('4.2 Acceptance Criteria'), 'acceptance criteria');
  assert.equal(normalizeHeading('1. Goals'), 'goals');
  assert.equal(normalizeHeading('1) Goals'), 'goals');
  assert.equal(normalizeHeading('A. Scope'), 'scope');
  assert.equal(normalizeHeading('iv) Pricing'), 'pricing');
  assert.equal(normalizeHeading('Section 3: Deliverables'), 'deliverables');
  assert.equal(normalizeHeading('Appendix B - Pricing & Payment'), 'pricing and payment');
  assert.equal(normalizeHeading('**Out-of-scope** items'), 'out of scope items');
  assert.equal(normalizeHeading('[Scope](#scope)'), 'scope');
  assert.equal(normalizeHeading('Schedule and milestones'), 'schedule and milestones', 'a section word is not numbering');
  assert.equal(normalizeHeading('Schedule'), 'schedule');
  assert.equal(normalizeHeading('3'), '3', 'a heading that is only a number keeps it');
  assert.equal(normalizeHeading('1. Goals', { numbered: false }), '1 goals');
  assert.equal(normalizeHeading(`Pr${String.fromCharCode(0xe9)}sentation`), `pr${String.fromCharCode(0xe9)}sentation`);
  assert.deepEqual(wordsOf(''), []);
  assert.deepEqual(wordsOf('a b'), ['a', 'b']);
});

test('aliases: a heading matches a section when the words of an alias stand together in it', () => {
  assert.deepEqual(ids('Acceptance criteria'), ['acceptance']);
  assert.deepEqual(ids('7. Change requests'), ['changeControl']);
  assert.deepEqual(ids('Our project goals'), ['objectives']);
  assert.deepEqual(ids('Timeline and fees'), ['schedule', 'pricing'], 'two sections in one heading');
  assert.deepEqual(ids('Fees and payment schedule'), ['pricing'], 'payment schedule is one alias of pricing and uses up the word schedule');
  assert.deepEqual(ids('Acceptable use'), [], 'a word that only starts like an alias is not a match');
  assert.deepEqual(ids('Notes'), []);
  assert.deepEqual(ids(''), []);
});

test('aliases: the longest alias is taken first and its words are used up', () => {
  assert.deepEqual(ids('Out of scope'), ['outOfScope'], 'not the scope');
  assert.deepEqual(ids('Scope'), ['inScope']);
  assert.deepEqual(ids('Scope and exclusions'), ['inScope', 'outOfScope']);
  assert.deepEqual(ids('Roles and responsibilities'), ['roles']);
  assert.deepEqual(ids('Client responsibilities'), ['clientResponsibilities']);
  assert.deepEqual(ids('Security requirements'), ['security'], 'not the requirements of the scope');
  assert.deepEqual(ids('Data protection and confidentiality'), ['confidentiality', 'dataProtection']);
  assert.deepEqual(ids('Support and maintenance'), ['support']);
});

test('aliases: a section that is off matches nothing, and a section added by the configuration matches its own aliases', () => {
  const config = configOf({ sections: { security: { level: 'off' }, accessibility: { title: 'Accessibility', aliases: ['accessibility', 'a11y'], level: 'recommended' } } });
  assert.deepEqual(ids('Security', config.sections), []);
  assert.deepEqual(ids('A11y', config.sections), ['accessibility']);
  assert.equal(matchHeading('Accessibility', config.sections)[0].alias, 'accessibility');
});

test('aliases: no alias of the default checklist belongs to two sections, and every default section has a title and a level', () => {
  const seen = new Map();
  for (const s of DEFAULT_SECTIONS) {
    assert.ok(s.title && s.level && s.aliases.length, s.id);
    for (const a of s.aliases) {
      const key = normalizeHeading(a, { numbered: false });
      assert.ok(!seen.has(key), `${a} is an alias of ${seen.get(key)} and ${s.id}`);
      seen.set(key, s.id);
    }
  }
});

test('extents: a heading covers the headings under it, down to the next heading at its level or above', () => {
  const r = readMarkdown('# A\n## B\n### C\n## D\n# E\n');
  assert.deepEqual(headingExtents(r.headings), [4, 3, 3, 4, 5]);
  assert.deepEqual(headingExtents([]), []);
});
