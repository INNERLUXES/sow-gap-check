import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdir, symlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { LIMITS, maskLine, normalizeHeading, readMarkdown, toJson } from '../src/index.js';
import { FULL, cli, columnIn, findingsOf, fullWith, md, reportOf, run, withFiles } from './helpers.js';

// Hostile input: files built to exhaust the memory or the time, to rewrite the terminal, to break a table, to be read as
// a formula, or to change how objects behave, and files that are not text. Each test also checks the time, because work
// that grows faster than the input is a failure even when the answer is right. Tests that need a symbolic link or a
// device are guarded with process.platform, and none of them asserts a line or a column: those are asserted in the tests
// that run everywhere.

const LIMIT = { timeout: 120000 };
// Coverage counting slows every line of the tool several times over, so a run with --experimental-test-coverage gets a
// wider time limit. A plain `npm test` keeps the tight one, and that is the run that guards against slow growth.
// The runner sets NODE_V8_COVERAGE for its test processes only when coverage is on.
const COVERAGE = Boolean(process.env.NODE_V8_COVERAGE);
const fast = async (fn, ms = 5000) => {
  const limit = COVERAGE ? ms * 4 : ms;
  const start = Date.now();
  const result = await fn();
  assert.ok(Date.now() - start < limit, `took ${Date.now() - start} ms`);
  return result;
};

test('hostile: a file over the size limit is refused before it is read, and so is a configuration over its limit', LIMIT, async () => {
  const r = await fast(() => run({ 'sow.md': md(...FULL) }, ['sow.md'], { maxDocumentBytes: 50 }));
  assert.equal(r.code, 2);
  assert.match(r.err, /sow\.md: \d+ bytes is over the 50 byte limit/);
  assert.equal(LIMITS.maxDocumentBytes, 4 * 1024 * 1024);
  const big = await run({ 'sow.md': md(...FULL), 'c.json': `{"name": "${'x'.repeat(2 * 1024 * 1024)}"}` }, ['sow.md', '--config', 'c.json']);
  assert.equal(big.code, 2);
  assert.match(big.err, /c\.json: \d[\d,]* bytes is over the 1 MB limit/);
});

test('hostile: binary input, UTF-16 and bytes that are not UTF-8 are refused with no verdict', async () => {
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0x0d]);
  for (const [content, pattern] of [
    [png, /holds binary data \(a null byte\)/],
    [Buffer.from([0xff, 0xfe, 0x23, 0, 0x20, 0]), /is UTF-16/],
    [Buffer.from([0x23, 0x20, 0xc0, 0xaf, 0x0a]), /is not valid UTF-8/]
  ]) {
    const r = await run({ 'sow.md': content }, ['sow.md']);
    assert.equal(r.code, 2);
    assert.match(r.err, pattern);
    assert.equal(r.out, '');
  }
});

test('hostile: CRLF, lone CR and a byte order mark give the same report, with the same lines and columns, as LF', async () => {
  const doc = fullWith({ remove: ['Out of scope'], replace: { Deliverables: ['- A fast\tand robust portal.'], Milestones: ['TBD'] } });
  const base = toJson(reportOf(doc), { explain: true });
  assert.equal(toJson(reportOf(doc.split('\n').join('\r\n')), { explain: true }), base);
  assert.equal(toJson(reportOf(doc.split('\n').join('\r')), { explain: true }), base);
  const bom = await run({ 'sow.md': Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(doc.split('\n').join('\r\n'))]) }, ['sow.md', '--format', 'json', '--explain']);
  const lf = await run({ 'sow.md': doc }, ['sow.md', '--format', 'json', '--explain']);
  assert.equal(bom.out, lf.out);
  const robust = JSON.parse(lf.out).findings.find((f) => f.found.includes('"robust"'));
  assert.equal(robust.column, columnIn(doc, 'robust'), 'a tab counts as one character in a column of the file');
});

test('hostile: a line of three megabytes is read in one pass, and a vague word at its end gets its column', LIMIT, async () => {
  const long = `- ${'word '.repeat(600000)}fast`;
  const doc = fullWith({ replace: { Deliverables: [long] } });
  const r = await fast(() => reportOf(doc), 10000);
  const f = findingsOf(r, 'vague-wording');
  assert.equal(f.length, 1);
  assert.equal(f[0].column, long.length - 3);
  assert.ok(f[0].found.length < 400, 'the excerpt is short');
});

test('hostile: openers that never close (backticks, quotes, brackets, angle brackets, link destinations) cost one pass', LIMIT, async () => {
  for (const unit of ['` ``', '"', '<a ', '](', '\\', '``` ', '[x](y']) {
    const line = unit.repeat(Math.ceil(400000 / unit.length));
    const m = await fast(() => maskLine(line), 3000);
    assert.equal(m.plain.length, line.length);
  }
  const doc = fullWith({ replace: { Deliverables: [`- ${'`a '.repeat(200000)}`, `- ${'"b '.repeat(200000)}`] } });
  await fast(() => reportOf(doc), 10000);
});

test('hostile: lists and block quotes nested thousands deep are read to the depth limit, then as text, quickly', LIMIT, async () => {
  const lists = md('# Deliverables', '', ...Array.from({ length: 3000 }, (_, i) => `${'  '.repeat(i)}- level ${i} fast`));
  const r = await fast(() => reportOf(lists), 10000);
  assert.ok(r.notes.some((n) => n.startsWith(`lists or block quotes are nested more than ${LIMITS.maxDepth} deep`)));
  assert.ok(findingsOf(r, 'vague-wording').length >= LIMITS.maxDepth);
  const quotes = md('# Scope', '', `${'>'.repeat(100000)} deep`, `${'> '.repeat(50000)}deeper`);
  const q = await fast(() => readMarkdown(quotes), 10000);
  assert.equal(q.counts.quotes, 1);
  const mixed = md(...Array.from({ length: 1500 }, (_, i) => `${'> - '.repeat(i % 40)}text ${i}`));
  await fast(() => readMarkdown(mixed), 10000);
});

test('hostile: fifty thousand headings and a hundred thousand list items and table rows are read quickly, and findings are capped', LIMIT, async () => {
  const headings = Array.from({ length: 50000 }, (_, i) => `## Note ${i}`).join('\n');
  const r = await fast(() => reportOf(headings), 20000);
  assert.equal(findingsOf(r, 'empty-section').length, LIMITS.maxFindingsPerRule);
  assert.ok(r.notes.includes('empty-section: 50,000 findings; the first 500 are listed'));
  const items = md('# Acceptance criteria', '', ...Array.from({ length: 100000 }, () => '- works well'));
  const i = await fast(() => reportOf(items), 20000);
  assert.equal(findingsOf(i, 'unmeasurable-criterion').length, LIMITS.maxFindingsPerRule);
  const rows = md('# Deliverables', '', '| a | b |', '| - | - |', ...Array.from({ length: 100000 }, () => '| x | y |'));
  await fast(() => reportOf(rows), 20000);
});

test('hostile: a heading of a megabyte is cut before it is matched, and its numbering is read in one pass', LIMIT, async () => {
  await fast(() => normalizeHeading(`${'](('.repeat(400000)}`), 3000);
  await fast(() => normalizeHeading(`Section ${'1.'.repeat(400000)}`), 3000);
  const doc = md(`# ${'Scope '.repeat(200000)}`, '', 'text');
  const r = await fast(() => reportOf(doc), 10000);
  assert.ok(r.checklist.find((c) => c.id === 'inScope').headings[0].text.length < 100);
});

test('hostile: control, escape and direction characters in headings and text never reach the reports', async () => {
  const esc = String.fromCharCode(27);
  const rlo = String.fromCharCode(0x202e);
  const bel = String.fromCharCode(7);
  const doc = fullWith({ extra: ['', `## Notes${esc}[31m red${rlo}`, '', `Hours TBD${esc}]0;title${bel} later.`] });
  for (const format of ['text', 'markdown', 'json']) {
    const r = await run({ 'sow.md': doc }, ['sow.md', '--format', format, '--explain']);
    for (const c of [esc, rlo, bel]) assert.ok(!r.out.includes(c), `${format}: ${c.charCodeAt(0)}`);
    if (format === 'text') assert.ok(r.out.includes('Notes [31m red'));
  }
});

test('hostile: __proto__, constructor and toString as headings, section ids and phrases are only data', async () => {
  const config = JSON.stringify({ sections: { constructor: { title: 'Ctor', aliases: ['constructor'], level: 'recommended' }, toString: { title: 'To string', aliases: ['tostring'], level: 'recommended' } }, vaguePhrases: { add: ['__proto__'] } });
  const doc = fullWith({ replace: { Deliverables: ['- The __proto__ module.'] }, extra: ['', '## __proto__', '', 'x', '', '## constructor', '', 'y'] });
  const r = await run({ 'sow.md': doc, 'c.json': config }, ['sow.md', '--config', 'c.json', '--format', 'json']);
  assert.equal(r.code, 1, r.err);
  const report = JSON.parse(r.out);
  assert.equal(report.checklist.find((c) => c.id === 'constructor').status, 'found');
  assert.equal(report.checklist.find((c) => c.id === 'toString').status, 'missing');
  assert.equal(report.findings.filter((f) => f.rule === 'vague-wording').length, 1);
  const proto = await run({ 'sow.md': doc, 'c.json': '{"sections": {"__proto__": {"title": "P", "aliases": ["p"], "level": "off"}}}' }, ['sow.md', '--config', 'c.json']);
  assert.equal(proto.code, 2);
  assert.match(proto.err, /sections\.__proto__: the id of a section is a letter/);
  assert.equal({}.title, undefined);
  assert.equal(Object.getPrototypeOf({}), Object.prototype);
});

test('hostile: links in the document are text; a run opens nothing and leaves the folder as it was', async () => {
  const doc = fullWith({ extra: ['', '## Links', '', 'See <http://127.0.0.1:9/x> and [the plan](file:///etc/passwd) and ![img](http://127.0.0.1:9/i.png).'] });
  await withFiles({ 'sow.md': doc }, async (dir) => {
    const r = await fast(() => cli(['sow.md'], dir));
    assert.equal(r.code, 0, r.err);
    assert.deepEqual(await readdir(dir), ['sow.md']);
  });
});

test('hostile: a device or a link to one is refused as not a regular file, with no line or column', LIMIT, async (t) => {
  if (process.platform === 'win32') {
    t.skip('Windows has no /dev/zero and needs extra rights to make a symbolic link');
    return;
  }
  const device = await fast(() => cli(['/dev/zero'], process.cwd()));
  assert.equal(device.code, 2);
  assert.match(device.err, /not a regular file/);
  await withFiles({ 'c.json': '{}' }, async (dir) => {
    await symlink('/dev/zero', resolve(dir, 'sow.md'));
    const r = await fast(() => cli(['sow.md', '--config', 'c.json'], dir));
    assert.equal(r.code, 2);
    assert.match(r.err, /sow\.md: not a regular file/);
  });
});

test('hostile: a link to a regular file named on the command line is read, because the person who runs the tool named it', async (t) => {
  if (process.platform === 'win32') {
    t.skip('Windows needs extra rights to make a symbolic link');
    return;
  }
  await withFiles({ 'real.md': md(...FULL) }, async (dir) => {
    await symlink(resolve(dir, 'real.md'), resolve(dir, 'linked.md'));
    const r = await cli(['linked.md'], dir);
    assert.equal(r.code, 0);
    assert.match(r.out, /sow-gap-check: linked\.md/);
  });
});
