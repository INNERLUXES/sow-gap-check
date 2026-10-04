import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { NOT_LEGAL_ADVICE, USAGE, VERSION, defaultsAsConfig, guardFormula, mdCell, parseArgs, toJson, toMarkdown, toText } from '../src/index.js';
import { FULL, cli, fullWith, lineOf, md, reportOf, run, withFiles } from './helpers.js';

// The command line, the exit codes and the three reports.

const GOOD = md(...FULL);
const BAD = fullWith({ remove: ['Out of scope'], replace: { Deliverables: ['- A fast portal.'] } });

test('cli: --help, --version and --print-defaults print and exit 0; the usage names every option and rule and says it is no legal review', async () => {
  const help = await cli(['--help'], process.cwd());
  assert.equal(help.code, 0);
  assert.equal(help.out, USAGE);
  for (const o of ['--config', '--format', '--explain', '--fail-on', '--out', '--print-defaults', 'missing-section (rules.missingSection)', 'no-out-of-scope (rules.noOutOfScope)', 'not a legal', 'review and gives no legal advice']) assert.ok(USAGE.includes(o), o);
  const version = await cli(['--version'], process.cwd());
  assert.equal(version.out, `${VERSION}\n`);
  assert.equal(VERSION, '1.0.0');
  const defaults = await cli(['--print-defaults'], process.cwd());
  assert.equal(defaults.code, 0);
  assert.deepEqual(JSON.parse(defaults.out), JSON.parse(JSON.stringify(defaultsAsConfig())));
});

test('cli: usage errors exit 2 with the reason and the usage on standard error', async () => {
  for (const [argv, pattern] of [
    [[], /give the statement of work to check/],
    [['a.md', 'b.md'], /one document at a time; b\.md is a second one/],
    [['a.md', '--config', 'c.json', '--config', 'd.json'], /--config was given twice/],
    [['a.md', '--format', 'html'], /unknown format html/],
    [['a.md', '--fail-on', 'fatal'], /unknown level fatal/],
    [['a.md', '--wat'], /unknown argument --wat/],
    [['-'], /standard input is not supported/],
    [['a.md', '--config', '-'], /standard input is not supported/],
    [['a.md', '--config'], /--config needs a value/],
    [['a.md', '--out', '--explain'], /--out needs a value/],
    [['https://example.com/sow.md'], /never fetches a URL/],
    [['a.md', '--config', 'file://x/c.json'], /never fetches a URL/]
  ]) {
    const r = await cli(argv, process.cwd());
    assert.equal(r.code, 2, argv.join(' '));
    assert.match(r.err, pattern);
    assert.ok(r.err.includes('Usage: sow-gap-check'), argv.join(' '));
    assert.equal(r.out, '');
  }
  assert.equal(parseArgs(['C:\\docs\\sow.md']).document, 'C:\\docs\\sow.md');
});

test('cli: exit 0 when no finding is at or above the fail level, 1 when one is, and --fail-on moves the level', async () => {
  const good = await run({ 'sow.md': GOOD }, ['sow.md']);
  assert.equal(good.code, 0, good.err);
  assert.match(good.out, /RESULT: PASS - no finding at or above warning \(13 below it\)\n$/);
  assert.equal((await run({ 'sow.md': GOOD }, ['sow.md', '--fail-on', 'notice'])).code, 1);
  const bad = await run({ 'sow.md': BAD }, ['sow.md']);
  assert.equal(bad.code, 1);
  assert.match(bad.out, /RESULT: FAIL - 2 findings at or above warning\n$/);
  assert.equal((await run({ 'sow.md': BAD }, ['sow.md', '--fail-on', 'error'])).code, 1);
  const config = JSON.stringify({ rules: { noOutOfScope: { level: 'notice' }, vagueWording: { level: 'notice' } } });
  assert.equal((await run({ 'sow.md': BAD, 'c.json': config }, ['sow.md', '--config', 'c.json'])).code, 0);
  assert.equal((await run({ 'sow.md': BAD, 'c.json': JSON.stringify({ failOn: 'error' }) }, ['sow.md', '--config', 'c.json'])).code, 1);
});

test('cli: an input problem exits 2 with no verdict and every problem listed', async () => {
  const r = await run({}, ['sow.md', '--config', 'c.json']);
  assert.equal(r.code, 2);
  assert.match(r.err, /^sow-gap-check: no verdict, the input has 2 problems:\n {2}c\.json: no such file\n {2}sow\.md: no such file\n$/);
  assert.equal(r.out, '');
  const bad = await run({ 'sow.md': GOOD, 'c.json': '{"rules": 1}' }, ['sow.md', '--config', 'c.json']);
  assert.equal(bad.code, 2);
  assert.match(bad.err, /c\.json:1: rules: must be an object/);
  const lines = await run({ 'sow.md': 'a\n'.repeat(20) }, ['sow.md'], { maxLines: 10 });
  assert.equal(lines.code, 2);
  assert.match(lines.err, /sow\.md: more than 10 lines/);
});

test('cli: --out writes the report to the file only, says where on standard error, and refuses an input as its path', async () => {
  await withFiles({ 'sow.md': BAD }, async (dir) => {
    const r = await cli(['sow.md', '--out', 'report.md', '--format', 'markdown'], dir);
    assert.equal(r.code, 1);
    assert.equal(r.out, '');
    assert.match(r.err, /the report is in report\.md; FAIL - 2 findings at or above warning/);
    assert.match(await readFile(resolve(dir, 'report.md'), 'utf8'), /^## sow-gap-check: FAIL/);
    const same = await cli(['sow.md', '--out', 'sow.md'], dir);
    assert.equal(same.code, 2);
    assert.match(same.err, /sow\.md: is one of the inputs/);
    assert.equal(await readFile(resolve(dir, 'sow.md'), 'utf8'), BAD);
    assert.deepEqual((await readdir(dir)).sort(), ['report.md', 'sow.md'], 'nothing else is written');
    const missing = await cli(['sow.md', '--out', 'no/such/folder/r.txt'], dir);
    assert.equal(missing.code, 2);
  });
});

test('text: the head, the findings with file, line and column, the checklist, the notes, the notice and the result', () => {
  const r = reportOf(BAD);
  const out = toText(r);
  const lines = out.split('\n');
  assert.equal(lines[0], 'sow-gap-check: sow.md');
  assert.match(lines[1], /^document: sow\.md \(\d+ lines, 8 headings, 3 lists, 0 tables, 0 code blocks, 0 block quotes\)$/);
  assert.equal(lines[2], 'checklist: built-in defaults: 21 sections (8 required, 13 recommended), 48 vague phrases, 15 placeholders');
  assert.ok(out.includes(`  ERROR    no-out-of-scope         sow.md:${lineOf(BAD, '## Scope')}:4`));
  assert.ok(out.includes(`  WARNING  vague-wording           sow.md:${lineOf(BAD, '- A fast')}:5`));
  assert.match(out, /\n {2}found {4}required {5}Deliverables +line \d+ "Deliverables"\n/);
  assert.match(out, /\n {2}missing {2}required {5}Out of scope\n/);
  assert.ok(out.includes(`\n${NOT_LEGAL_ADVICE}\n\nRESULT: FAIL - 2 findings at or above warning\n`));
  assert.ok(!out.includes('why:'));
  const explain = toText(r, { explain: true });
  for (const s of ['rule: the section In scope is there and holds text', 'why: In scope is matched by the heading "Scope" through the alias scope', 'basis: "You\'ll agree the scope of the contract', 'aliases: out of scope, outside scope', 'the tool\'s own choice: No saved page names a list of what is excluded.']) assert.ok(explain.includes(s), s);
  const none = toText(reportOf(md('# Notes', '', 'text')));
  assert.match(none, /Findings \(\d+\)/);
  const clean = toText({ ...reportOf(GOOD), findings: [] });
  assert.match(clean, /Findings \(0\)\n\n {2}none\n/);
});

test('markdown: tables with escaped cells, guarded formulas, the notes and the notice; --explain adds the reasons and where each section comes from', () => {
  const doc = fullWith({ extra: ['', '## =HYPERLINK("x") | <b>Pipes</b> [link]', ''] });
  const r = reportOf(doc);
  const out = toMarkdown(r);
  assert.match(out, /^## sow-gap-check: FAIL - 1 finding at or above warning\n/);
  assert.ok(out.includes('| Level | Rule | Found | Where |'));
  assert.ok(out.includes("'=HYPERLINK") === false, 'a cell that does not start with = is not guarded');
  assert.ok(out.includes('\\| &lt;b&gt;Pipes&lt;/b&gt; \\[link\\]'), 'pipes, tags and brackets are escaped');
  assert.ok(out.includes(`\n${mdCell(NOT_LEGAL_ADVICE)}\n`));
  const explain = toMarkdown(r, { explain: true });
  assert.ok(explain.includes('#### empty-section: sow.md:'));
  assert.ok(explain.includes('### Where the checklist comes from'));
  assert.ok(explain.includes('- Confidentiality: the tool\'s own choice: No saved page names confidentiality.'));
  const noted = toMarkdown(reportOf(md('text', '```')));
  assert.ok(noted.includes('### Notes'));
  assert.ok(toMarkdown({ ...reportOf(GOOD), findings: [] }).includes('\nNone.\n'));
  const added = reportOf(GOOD, { sections: { accessibility: { title: 'Accessibility', aliases: ['accessibility'], level: 'recommended' } } });
  assert.ok(toMarkdown(added, { explain: true }).includes('- Accessibility: added by the configuration'));
});

test('markdown: guardFormula and mdCell', () => {
  assert.equal(guardFormula('=SUM(A1)'), "'=SUM(A1)");
  assert.equal(guardFormula('+1'), "'+1");
  assert.equal(guardFormula('-x'), "'-x");
  assert.equal(guardFormula('@x'), "'@x");
  assert.equal(guardFormula('plain'), 'plain');
  assert.equal(guardFormula(''), '');
  assert.equal(mdCell('a|b\n*c* _d_ `e` \\ & <f>'), 'a\\|b \\*c\\* \\_d\\_ \\`e\\` \\\\ &amp; &lt;f&gt;');
  assert.equal(mdCell('=1'), "'=1");
});

test('json: the whole report; without --explain the reasons and the sentences are left out', () => {
  const r = reportOf(BAD, null, { version: '1.0.0' });
  const plain = JSON.parse(toJson(r));
  assert.equal(plain.tool, 'sow-gap-check');
  assert.equal(plain.version, '1.0.0');
  assert.equal(plain.notice, NOT_LEGAL_ADVICE);
  assert.deepEqual(Object.keys(plain), ['tool', 'version', 'document', 'config', 'totals', 'checklist', 'findings', 'verdict', 'notes', 'notice']);
  assert.equal(plain.findings[0].why, undefined);
  assert.equal(plain.checklist[0].basis, undefined);
  assert.deepEqual(plain.verdict.byLevel, { error: 1, warning: 1, notice: 13 });
  const full = JSON.parse(toJson(r, { explain: true }));
  assert.ok(full.findings[0].why.length > 0);
  assert.ok(full.findings[0].basis[0].page.startsWith('https://'));
  assert.equal(full.config.rules.length, 6);
  assert.equal(full.config.file, null);
  const vague = full.findings.find((f) => f.rule === 'vague-wording');
  assert.deepEqual([vague.line, vague.column, vague.section], [lineOf(BAD, '- A fast'), 5, 'deliverables']);
});
