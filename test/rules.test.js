import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RULES, atOrAbove, decide, measurableElement, readMarkdown, defaultConfig, preparePhrase } from '../src/index.js';
import { FULL, columnIn, entryOf, findingsOf, fullWith, lineOf, md, reportOf } from './helpers.js';

// The six rules, each with a document written inline and near misses on both sides. Lines and columns are worked out
// from the text with lineOf() and columnIn().

const failing = (report) => report.findings.filter((f) => atOrAbove(f.level, report.verdict.failOn));

test('the full document of the helpers has every required section and passes; only recommended sections are noted', () => {
  const r = reportOf(md(...FULL));
  assert.deepEqual(failing(r), []);
  assert.equal(r.verdict.pass, true);
  assert.ok(findingsOf(r, 'missing-section').every((f) => f.level === 'notice'));
  assert.equal(r.totals.missing, 13);
  assert.equal(entryOf(r, 'inScope').status, 'found');
});

test('missing-section: a required section with no heading is an error, a recommended one a notice, an off one nothing', () => {
  const r = reportOf(fullWith({ remove: ['Pricing'] }));
  const f = findingsOf(r, 'missing-section').find((x) => x.section === 'pricing');
  assert.equal(f.level, 'error');
  assert.equal(f.line, null);
  assert.equal(f.at, 'sow.md');
  assert.match(f.found, /^required section Pricing and payment terms is missing$/);
  assert.match(f.why[0], /no heading matches one of its aliases: pricing, price, prices/);
  assert.match(f.why[1], /^on the checklist because "how the buyer will pay for the work/);
  assert.equal(entryOf(r, 'pricing').status, 'missing');
  const own = findingsOf(r, 'missing-section').find((x) => x.section === 'confidentiality');
  assert.equal(own.level, 'notice');
  assert.match(own.why[1], /^on the checklist as the tool's own choice: /);
  const off = reportOf(fullWith({ remove: ['Pricing'] }), { sections: { pricing: { level: 'off' } }, rules: { missingSection: { recommended: 'off' } } });
  assert.deepEqual(findingsOf(off, 'missing-section'), []);
  assert.equal(entryOf(off, 'pricing').status, 'off');
});

test('empty-section: a heading with nothing under it, or nothing but placeholders, with its line and column', () => {
  const doc = fullWith({ replace: { Milestones: ['TBD.'], 'Change control': [] } });
  const r = reportOf(doc);
  const f = findingsOf(r, 'empty-section');
  assert.deepEqual(f.map((x) => x.section), ['changeControl', 'schedule']);
  assert.equal(f[0].line, lineOf(doc, '## Change control'));
  assert.equal(f[0].column, columnIn(doc, 'Change control'));
  assert.match(f[0].found, /the heading "Change control" has no text under it/);
  assert.match(f[1].found, /the heading "Milestones" holds nothing but TBD/);
  assert.equal(entryOf(r, 'schedule').status, 'empty');
  assert.deepEqual(findingsOf(r, 'placeholder'), [], 'a placeholder-only section is reported once, as empty');
  const near = reportOf(fullWith({ replace: { Milestones: ['TBD: launch at the end of week 14.'] } }));
  assert.deepEqual(findingsOf(near, 'empty-section'), [], 'text next to the placeholder is text');
  assert.equal(findingsOf(near, 'placeholder').length, 1);
});

test('empty-section: a heading whose subheadings hold text is not empty; one whose subheadings are all empty is reported through them', () => {
  const ok = reportOf(fullWith({ extra: ['', '## Commercials', '', '### Rates', '', 'A day rate.'] }));
  assert.deepEqual(findingsOf(ok, 'empty-section'), []);
  const doc = fullWith({ extra: ['', '## Commercials', '', '### Rates', '', '### Travel'] });
  const empty = reportOf(doc);
  assert.deepEqual(findingsOf(empty, 'empty-section').map((x) => x.line), [lineOf(doc, '### Rates'), lineOf(doc, '### Travel')]);
  const code = reportOf(fullWith({ replace: { 'Change control': ['```', 'process.md', '```'] } }));
  assert.deepEqual(findingsOf(code, 'empty-section'), [], 'a code block is text of the section');
  const quote = reportOf(fullWith({ replace: { 'Change control': ['> As agreed in the framework contract.'] } }));
  assert.deepEqual(findingsOf(quote, 'empty-section'), [], 'a block quote is text of the section');
});

test('placeholder: every placeholder outside code, quotes and links, in headings too, with its column', () => {
  const doc = fullWith({ extra: ['', '## Support (TBD)', '', 'Hours to be confirmed. The `TODO` tag and the "TBC" label stay.', '', '```', 'TBD', '```', '', '> TBD in a quote'] });
  const r = reportOf(doc);
  const f = findingsOf(r, 'placeholder');
  assert.deepEqual(f.map((x) => [x.line, x.column]), [[lineOf(doc, '## Support (TBD)'), columnIn(doc, 'TBD)')], [lineOf(doc, 'Hours to be'), columnIn(doc, 'to be confirmed')]]);
  assert.match(f[1].found, /^placeholder to be confirmed in "Support \(TBD\)": Hours to be confirmed\./);
  assert.equal(f[1].at, `sow.md:${lineOf(doc, 'Hours to be')}:${columnIn(doc, 'to be confirmed')}`);
  const lower = reportOf(fullWith({ extra: ['', '## Notes', '', 'A todo list app with tbd in lower case.'] }));
  assert.deepEqual(findingsOf(lower, 'placeholder'), [], 'a placeholder in capitals is matched with case');
});

test('vague-wording: in deliverables and acceptance only, outside code blocks, code spans, quotes, block quotes and links', () => {
  const doc = fullWith({
    replace: {
      Deliverables: ['- A fast, user-friendly portal.', '- The "Fast reorder" button and the `fast` flag.', '- See [the guide](https://example.com/fast-and-seamless).', '', '```', 'fast seamless robust', '```', '', '> A seamless experience, said the client.', '', '| Item | Note |', '| --- | --- |', '| Search | quick to find |'],
      Scope: ['A fast and seamless portal.']
    }
  });
  const r = reportOf(doc);
  const f = findingsOf(r, 'vague-wording');
  assert.deepEqual(f.map((x) => x.found.match(/"([^"]+)"/)[1]), ['fast', 'user-friendly', 'quick']);
  assert.deepEqual(f.map((x) => [x.line, x.column]), [[lineOf(doc, '- A fast'), columnIn(doc, 'fast,')], [lineOf(doc, '- A fast'), columnIn(doc, 'user-friendly')], [lineOf(doc, '| Search'), columnIn(doc, 'quick')]]);
  assert.ok(f.every((x) => x.section === 'deliverables'));
  assert.match(f[0].found, /in "Deliverables": A fast, user-friendly portal\./);
  assert.ok(!f.some((x) => x.line === lineOf(doc, 'A fast and seamless portal.')), 'the scope is not a section marked for wording');
});

test('vague-wording: a phrase is matched at word edges, without case, and the list can be changed', () => {
  const doc = fullWith({ replace: { Deliverables: ['- Breakfast menus and a fast-track lane, FAST.', '- A world-class portal.'] } });
  assert.deepEqual(findingsOf(reportOf(doc), 'vague-wording').map((x) => x.column), [columnIn(doc, 'FAST')]);
  const added = reportOf(doc, { vaguePhrases: { add: ['world-class'], remove: ['fast'] } });
  assert.deepEqual(findingsOf(added, 'vague-wording').map((x) => x.found.match(/"([^"]+)"/)[1]), ['world-class']);
  const sub = reportOf(fullWith({ replace: { Deliverables: ['### Portal', '', '- A robust portal.'] } }));
  assert.equal(findingsOf(sub, 'vague-wording').length, 1, 'a subheading of a marked section is read too');
});

test('unmeasurable-criterion: a leaf list item of the acceptance criteria with no number, number word, code span, standard or quoted test name', () => {
  const doc = fullWith({
    replace: {
      'Acceptance criteria': [
        'The client accepts the work when:',
        '',
        '- Pages load in under 2 seconds.',
        '- Zero open defects of severity one.',
        '- `npm test` passes.',
        '- The portal meets WCAG level AA.',
        '- The "Month end" test script passes.',
        '- The portal works well.',
        '- The admin area is complete.',
        '- Orders:',
        '  - reach the accounting system',
        '- TBD',
        '- The "Month end" report looks right.'
      ]
    }
  });
  const r = reportOf(doc);
  const f = findingsOf(r, 'unmeasurable-criterion');
  assert.deepEqual(f.map((x) => x.line), [lineOf(doc, '- The portal works well.'), lineOf(doc, '- The admin area is complete.'), lineOf(doc, '  - reach the accounting'), lineOf(doc, '- The "Month end" report')]);
  assert.equal(f[0].column, columnIn(doc, 'The portal works well.'));
  assert.match(f[0].found, /^acceptance criterion with nothing to measure in "Acceptance criteria": The portal works well\.$/);
  assert.ok(!f.some((x) => x.line === lineOf(doc, '- Orders:')), 'an item with a list inside it is judged by its items');
  assert.ok(!f.some((x) => x.line === lineOf(doc, '- TBD')), 'a placeholder item is reported as a placeholder');
  assert.equal(findingsOf(r, 'placeholder').length, 1);
});

test('unmeasurable-criterion: why an item counts as measurable', () => {
  const config = defaultConfig();
  const prepared = { standards: config.standards.map(preparePhrase), measureWords: config.measureWords.map(preparePhrase), testWords: config.testWords.map(preparePhrase) };
  const why = (text) => measurableElement(readMarkdown(md(`- ${text}`)).units[0], prepared);
  assert.equal(why('Within 5 minutes.'), 'a number');
  assert.equal(why('Runs `make check`.'), 'a code span');
  assert.equal(why('Meets OWASP ASVS level two.'), 'the standard OWASP');
  assert.equal(why('Twelve reports.'), 'the number word twelve');
  assert.equal(why('Passes the "Checkout" scenario.'), 'a quoted name next to a test word');
  assert.equal(why('The "Checkout" page works.'), null);
  assert.equal(why('Is owasp approved.'), null, 'a standard in capitals is matched with case');
  assert.equal(why('Someone is happy.'), null, 'one is a number word only as a whole word');
  assert.equal(why('See [guide](https://example.com/v2).'), null, 'a digit in a link destination is not a number of the criterion');
});

test('unmeasurable-criterion: only in sections marked for criteria, and a section can be marked by the configuration', () => {
  const doc = fullWith({ replace: { Deliverables: ['- The portal works well.'] } });
  assert.deepEqual(findingsOf(reportOf(doc), 'unmeasurable-criterion'), []);
  const marked = reportOf(doc, { sections: { deliverables: { criteria: true } } });
  assert.equal(findingsOf(marked, 'unmeasurable-criterion').length, 1);
});

test('no-out-of-scope: a scope with text and no out-of-scope section, or an empty one, is one error at the scope heading', () => {
  const doc = fullWith({ remove: ['Out of scope'] });
  const r = reportOf(doc);
  const [f] = findingsOf(r, 'no-out-of-scope');
  assert.equal(f.level, 'error');
  assert.equal(f.line, lineOf(doc, '## Scope'));
  assert.match(f.found, /^the scope is described under "Scope" \(line \d+\), but there is no section Out of scope$/);
  assert.ok(!findingsOf(r, 'missing-section').some((x) => x.section === 'outOfScope'), 'not reported twice');
  const emptyDoc = fullWith({ replace: { 'Out of scope': ['TBD'] } });
  const empty = reportOf(emptyDoc);
  assert.match(findingsOf(empty, 'no-out-of-scope')[0].found, /but the section Out of scope under "Out of scope" \(line \d+\) is empty$/);
  assert.deepEqual(findingsOf(empty, 'empty-section'), [], 'the empty out-of-scope heading is reported once');
  assert.deepEqual(findingsOf(empty, 'placeholder'), []);
});

test('no-out-of-scope: no finding when the scope is missing or empty itself, or when the rule is off', () => {
  const noScope = reportOf(fullWith({ remove: ['Scope', 'Out of scope'] }));
  assert.deepEqual(findingsOf(noScope, 'no-out-of-scope'), []);
  assert.deepEqual(findingsOf(noScope, 'missing-section').filter((x) => x.level === 'error').map((x) => x.section), ['inScope', 'outOfScope']);
  const emptyScope = reportOf(fullWith({ remove: ['Out of scope'], replace: { Scope: [] } }));
  assert.deepEqual(findingsOf(emptyScope, 'no-out-of-scope'), []);
  const off = reportOf(fullWith({ remove: ['Out of scope'] }), { rules: { noOutOfScope: { level: 'off' } } });
  assert.deepEqual(findingsOf(off, 'no-out-of-scope'), []);
  assert.equal(findingsOf(off, 'missing-section').find((x) => x.section === 'outOfScope').level, 'error');
  const together = reportOf(fullWith({ remove: ['Out of scope'], replace: { Scope: ['A portal. Card payments are excluded.'] } }).replace('## Scope', '## Scope and exclusions'));
  assert.deepEqual(findingsOf(together, 'no-out-of-scope'), [], 'one heading can hold the scope and the exclusions');
});

test('findings are sorted by level, then line and column, and capped per rule with a note', () => {
  const doc = fullWith({ replace: { Deliverables: Array.from({ length: 12 }, () => '- fast') } });
  const r = reportOf(doc, null, { maxFindingsPerRule: 5 });
  assert.equal(findingsOf(r, 'vague-wording').length, 5);
  assert.ok(r.notes.includes('vague-wording: 12 findings; the first 5 are listed'));
  const ranks = r.findings.map((f) => ['error', 'warning', 'notice'].indexOf(f.level));
  assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b));
});

test('notes: a document with no heading, an unclosed fence and nesting past the limit', () => {
  const r = reportOf(md('Just text.', '', '```', '# hidden'));
  assert.ok(r.notes.some((n) => n.startsWith('the document has no heading')));
  assert.ok(r.notes.some((n) => n.startsWith(`a code fence opened on line ${lineOf(md('Just text.', '', '```'), '```')} is never closed`)));
  assert.equal(r.totals.found, 0);
});

test('rules and verdict: every rule has an id, a key, sentences and a text; the verdict counts the levels', () => {
  assert.deepEqual(RULES.map((r) => r.id), ['missing-section', 'empty-section', 'placeholder', 'vague-wording', 'unmeasurable-criterion', 'no-out-of-scope']);
  const v = decide([{ level: 'error' }, { level: 'notice' }], 'warning');
  assert.deepEqual(v, { pass: false, failOn: 'warning', failing: 1, byLevel: { error: 1, warning: 0, notice: 1 }, text: 'FAIL - 1 finding at or above warning' });
  assert.equal(decide([{ level: 'notice' }], 'warning').text, 'PASS - no finding at or above warning (1 below it)');
  assert.equal(decide([], 'notice').text, 'PASS - no finding at or above notice');
  assert.equal(atOrAbove('warning', 'notice'), true);
  assert.equal(atOrAbove('notice', 'warning'), false);
});
