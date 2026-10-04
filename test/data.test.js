import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { DEFAULT_SECTIONS, FACTS, LEVELS, NOT_LEGAL_ADVICE, RULES, SECTION_LEVELS, SOURCES, factPage, flat, source } from '../src/index.js';

// These tests read the saved pages again and compare them with src/data.js: every sentence that a rule, a section of the
// checklist or a document quotes.

const text = async (id) => readFile(new URL(`../research/sources/${source(id).file}`, import.meta.url), 'utf8');
const has = (page, needle) => flat(page).includes(flat(needle));
// The words of a tool that wrote a text, built from pieces so that this file does not hold them.
const WRITTEN = new RegExp(`\\b(?:${['A', 'I'].join('')}|${['cha', 't'].join('')}|${['gene', 'rated'].join('')}|${['assis', 'tants?'].join('')}|${['g', 'pt'].join('')}|${['l', 'lms?'].join('')})\\b|${['clau', 'de'].join('')}|${['anthro', 'pic'].join('')}|${['ses', 'sion'].join('')}`, 'i');
const YEAR = /\b(?:19|20)\d{2}\b/;
const DOCS = ['docs/method.md', 'docs/rules-and-sources.md', 'docs/inputs.md', 'docs/limits.md', 'docs/threat-model.md', 'docs/secure-defaults.md', 'docs/decisions/0001-read-headings-not-meaning-and-give-no-legal-advice.md', 'README.md'];

test('sources: every saved page has its address on the first line, as listed in src/data.js, and holds text', async () => {
  for (const s of SOURCES) {
    const page = await text(s.id);
    assert.equal(page.split('\n')[0], `Source: ${s.url}`, s.file);
    assert.ok(page.length > 400, `${s.file} holds the page text`);
    assert.match(s.url, /^https:\/\/[a-z0-9.-]+\/[A-Za-z0-9/._?=:-]*$/);
    assert.ok(s.label.length > 10, s.id);
  }
  assert.equal(SOURCES.length, new Set(SOURCES.map((s) => s.url)).size);
  assert.equal(SOURCES.length, new Set(SOURCES.map((s) => s.file)).size);
  assert.equal(SOURCES.length, new Set(SOURCES.map((s) => s.id)).size);
});

test('sources: every file in research/sources is listed in src/data.js, and the other way round', async () => {
  const files = (await readdir(new URL('../research/sources/', import.meta.url))).sort();
  assert.deepEqual(files, SOURCES.map((s) => s.file).sort());
});

test('sources: the CommonMark and GFM specs, the GSA template, the FAR on Acquisition.GOV, GOV.UK and the RFC Editor', () => {
  const hosts = SOURCES.map((s) => new URL(s.url).host);
  assert.deepEqual([...new Set(hosts)].sort(), ['buy.gsa.gov', 'github.github.com', 'spec.commonmark.org', 'www.acquisition.gov', 'www.gov.uk', 'www.rfc-editor.org']);
});

test('sources: no saved page holds a year, a mention of a tool that wrote it, a control byte, a carriage return or a character that is not ASCII', async () => {
  for (const s of SOURCES) {
    const page = await text(s.id);
    assert.doesNotMatch(page, YEAR, s.file);
    assert.doesNotMatch(page, WRITTEN, s.file);
    assert.doesNotMatch(page, new RegExp(`[${String.fromCharCode(1)}-${String.fromCharCode(8)}]`), s.file);
    assert.ok(!page.includes('\r'), s.file);
    assert.ok([...page].every((c) => c.charCodeAt(0) < 128), s.file);
    assert.ok(page.endsWith('\n'), s.file);
  }
});

test('the saved pages hold the sections the tool reads: ATX and setext headings, code blocks, block quotes, tables, the SOO list and the statement of work list', async () => {
  const cm = await text('commonmark');
  for (const s of ['4.2 ATX headings', '4.3 Setext headings', '4.4 Indented code blocks', '4.5 Fenced code blocks', '5.1 Block quotes']) assert.ok(cm.includes(`\n${s}\n`), s);
  assert.ok((await text('gfm')).includes('4.10 Tables (extension)'));
  const far = await text('far');
  for (const s of ['(1) Purpose;', '(2) Scope or mission;', '(6) Any operating constraints.']) assert.ok(far.includes(s), s);
  const uk = await text('gov-uk');
  for (const s of ['A statement of work should include:', 'Changes to contracts', 'Ending a contract', 'withdrawn']) assert.ok(uk.includes(s), s);
  const gsa = await text('gsa');
  for (const s of ['2.0 OBJECTIVES', '3.0 SCOPE', '5.1 Deliverables', '6.6.8 Records/Data', '7.0 INVOICING/ PROCEDURES FOR PAYMENT']) assert.ok(gsa.includes(s), s);
});

test('facts: every quoted sentence is on its saved page, word for word, with its section, no year and no mention of a tool that wrote it', async () => {
  for (const [key, fact] of Object.entries(FACTS)) {
    assert.ok(SOURCES.some((s) => s.id === fact.source), key);
    const page = await text(fact.source);
    assert.ok(has(page, fact.text), `${key}: "${fact.text}"`);
    assert.ok(has(page, fact.section), `${key}: the section ${fact.section} is on the page`);
    assert.doesNotMatch(fact.text, YEAR, key);
    assert.doesNotMatch(fact.text, WRITTEN, key);
    assert.ok(fact.text.length <= 360, `${key} is short`);
    assert.equal(factPage(key), source(fact.source).url);
  }
});

test('facts: every rule and every default section rests on sentences of src/data.js or says why it is the tool\'s own choice, and every page is quoted', () => {
  for (const r of RULES) {
    assert.match(r.id, /^[a-z]+(?:-[a-z]+)*$/, r.id);
    assert.ok(r.title.length > 10, r.id);
    assert.ok(r.facts.length >= 1 && r.facts.length <= 2, r.id);
    for (const k of r.facts) assert.ok(FACTS[k], `${r.id}: ${k}`);
  }
  for (const s of DEFAULT_SECTIONS) {
    for (const k of s.basis) assert.ok(FACTS[k], `${s.id}: ${k}`);
    assert.ok(s.basis.length || (s.own && s.own.length > 40), `${s.id} has a source or a reason`);
    assert.ok(SECTION_LEVELS.includes(s.level), s.id);
  }
  assert.deepEqual(DEFAULT_SECTIONS.filter((s) => !s.basis.length).map((s) => s.id), ['outOfScope', 'confidentiality', 'support']);
  const quoted = new Set(Object.values(FACTS).map((f) => f.source));
  for (const s of SOURCES) assert.ok(quoted.has(s.id), s.id);
});

test('lists: the levels of a finding and of a section, and the notice of every report', () => {
  assert.deepEqual(LEVELS, ['notice', 'warning', 'error']);
  assert.deepEqual(SECTION_LEVELS, ['required', 'recommended', 'off']);
  assert.match(NOT_LEGAL_ADVICE, /structure and the wording of the document only\. It is not a legal review and gives no legal advice\./);
});

test('src writes no quoted sentence outside src/data.js', async () => {
  for (const file of (await readdir(new URL('../src/', import.meta.url))).filter((f) => f !== 'data.js')) {
    const code = await readFile(new URL(`../src/${file}`, import.meta.url), 'utf8');
    for (const fact of Object.values(FACTS)) if (fact.text.length > 40) assert.ok(!code.includes(fact.text.slice(0, 40)), `${file} writes "${fact.text.slice(0, 40)}" itself`);
  }
});

test('docs: every sentence that the documents quote from a saved page is on a saved page', async () => {
  const pages = (await Promise.all(SOURCES.map((s) => text(s.id)))).map(flat).join(' ');
  let checked = 0;
  for (const file of DOCS) {
    const doc = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
    // Code blocks and inline code hold file contents and reports, not quotes.
    const prose = doc.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
    for (const m of prose.matchAll(/"([^"\n]{30,400})"/g)) {
      assert.ok(pages.includes(flat(m[1])), `${file}: ${m[1]}`);
      checked += 1;
    }
  }
  assert.ok(checked >= 15, `${checked} quotes checked`);
});

test('docs: docs/rules-and-sources.md names every saved page, every quoted sentence, every rule and every default section with its source or as the tool\'s own choice', async () => {
  const doc = await readFile(new URL('../docs/rules-and-sources.md', import.meta.url), 'utf8');
  for (const s of SOURCES) {
    assert.ok(doc.includes(s.file), s.file);
    assert.ok(doc.includes(s.url), s.url);
  }
  for (const [key, fact] of Object.entries(FACTS)) assert.ok(doc.includes(`| \`${key}\` |`) && doc.includes(flat(fact.text).replace(/\|/g, '\\|')), key);
  for (const r of RULES) {
    assert.ok(doc.includes(`| \`${r.id}\` | \`rules.${r.key}\` |`), r.id);
    assert.ok(doc.includes(`(method.md#${r.id})`), r.id);
    for (const k of r.facts) assert.ok(new RegExp(`\\| \`${k}\` \\| [^|]*\`${r.id}\``).test(doc), `${k} is used by ${r.id}`);
  }
  for (const s of DEFAULT_SECTIONS) {
    const row = doc.split('\n').find((l) => l.startsWith(`| \`${s.id}\` |`));
    assert.ok(row, `the row of ${s.id}`);
    for (const k of s.basis) assert.ok(row.includes(`\`${k}\``), `${s.id}: ${k}`);
    if (!s.basis.length) assert.ok(row.includes("the tool's own choice"), `${s.id} is marked as the tool's own choice`);
    if (s.own && s.basis.length) assert.ok(row.includes("the tool's own"), `${s.id} says which part is the tool's own`);
  }
  assert.match(doc, /withdrawn/);
});
