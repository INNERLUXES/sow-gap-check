import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaultsAsConfig, main } from '../src/index.js';
import { SOLID, WEAK } from '../tools/example.mjs';
import { lineOf } from './helpers.js';

const root = resolve(fileURLToPath(import.meta.url), '..', '..');

async function run(argv, base = root) {
  let out = '';
  let err = '';
  const code = await main(argv, { out: (t) => { out += t; }, err: (t) => { err += t; } }, undefined, base);
  return { code, out, err };
}

const saved = (name) => readFile(resolve(root, 'examples/output', name), 'utf8');

test('examples: the weak statement of work fails with the report that is saved in examples/output', async () => {
  const r = await run(WEAK);
  assert.equal(r.code, 1);
  assert.equal(r.err, '');
  assert.equal(r.out, await saved('weak-sow.txt'));
  assert.match(r.out, /findings: 26 \(4 error, 13 warning, 9 notice\); fail level warning/);
  assert.match(r.out, /RESULT: FAIL - 17 findings at or above warning\n$/);
});

test('examples: the solid statement of work passes with one notice, as saved', async () => {
  const r = await run(SOLID);
  assert.equal(r.code, 0);
  assert.equal(r.out, await saved('solid-sow.txt'));
  assert.match(r.out, /findings: 1 \(1 notice\); fail level warning/);
});

test('examples: --explain, Markdown, JSON and the defaults are the reports that are saved', async () => {
  assert.equal((await run([...WEAK, '--explain'])).out, await saved('weak-sow-explain.txt'));
  assert.equal((await run([...WEAK, '--format', 'markdown', '--explain'])).out, await saved('weak-sow.md'));
  assert.equal((await run([...WEAK, '--format', 'json', '--explain'])).out, await saved('weak-sow.json'));
  const defaults = await saved('defaults.json');
  assert.deepEqual(JSON.parse(defaults), JSON.parse(JSON.stringify(defaultsAsConfig())));
});

test('examples: each rule fires in the weak document where the README says, and nothing inside quotes or code', async () => {
  const doc = await readFile(resolve(root, 'examples/weak-sow.md'), 'utf8');
  const report = JSON.parse((await run([...WEAK, '--format', 'json'])).out);
  const at = (rule) => report.findings.filter((f) => f.rule === rule).map((f) => f.line);
  assert.deepEqual(at('no-out-of-scope'), [lineOf(doc, '## 2. Scope')]);
  assert.deepEqual(at('vague-wording'), [lineOf(doc, '- A fast'), lineOf(doc, '- A fast'), lineOf(doc, '- An admin'), lineOf(doc, '- A link'), lineOf(doc, '- Documentation'), lineOf(doc, '- The portal is easy'), lineOf(doc, '- Pages load')]);
  assert.deepEqual(at('unmeasurable-criterion'), [lineOf(doc, '- The portal is easy'), lineOf(doc, '- Pages load'), lineOf(doc, '- Orders reach')]);
  assert.deepEqual(at('empty-section'), [lineOf(doc, '## 5. Timeline'), lineOf(doc, '## 7. Change requests')]);
  assert.deepEqual(at('placeholder'), [lineOf(doc, 'Lanternfield will fix')]);
  assert.ok(!report.findings.some((f) => f.line === lineOf(doc, 'The portal shows a "Fast reorder"') || f.line === lineOf(doc, 'reorder-mode: fast')));
  assert.equal(report.checklist.find((c) => c.id === 'accessibility').origin, 'config');
});

test('examples: the same files written with CRLF line ends give the same reports, with the same lines', async () => {
  const dir = await mkdtemp(resolve(tmpdir(), 'sow-gap-check-crlf-'));
  try {
    await cp(resolve(root, 'examples'), resolve(dir, 'examples'), { recursive: true });
    for (const name of await readdir(resolve(dir, 'examples'))) {
      if (!name.endsWith('.md') && !name.endsWith('.json')) continue;
      const file = resolve(dir, 'examples', name);
      const text = (await readFile(file, 'utf8')).split('\r\n').join('\n');
      await writeFile(file, text.split('\n').join('\r\n'));
    }
    const r = await run([...WEAK, '--explain'], dir);
    assert.equal(r.code, 1);
    assert.equal(r.out, await saved('weak-sow-explain.txt'));
    assert.equal((await run(SOLID, dir)).out, await saved('solid-sow.txt'));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
