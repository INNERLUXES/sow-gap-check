// Runs the README examples, checks that they report what the README shows, and writes the reports of the two made-up
// statements of work to examples/output. CI runs it and then fails if those files changed, so the example output in the
// repository is always the real output.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { main } from '../src/index.js';

const root = resolve(fileURLToPath(import.meta.url), '..', '..');

// The arguments of the examples; every path is relative to the root of the repository.
export const WEAK = ['examples/weak-sow.md', '--config', 'examples/config.json'];
export const SOLID = ['examples/solid-sow.md', '--config', 'examples/config.json'];

// Runs the tool on files of the repository; the paths shown in the report are relative to the root of the repository.
async function run(argv) {
  let out = '';
  const code = await main(argv, { out: (t) => { out += t; }, err: (t) => process.stderr.write(t) }, undefined, root);
  return { code, out };
}

const problems = [];
function expect(name, result, code, expected, unwanted) {
  const missing = expected.filter((e) => !result.out.includes(e));
  const wrong = unwanted.filter((e) => result.out.includes(e));
  if (result.code !== code || missing.length || wrong.length) {
    problems.push(`${name}: unexpected report (exit code ${result.code}, expected ${code}; missing: ${missing.join(' / ') || 'none'}; should not appear: ${wrong.join(' / ') || 'none'})`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const weak = await run(WEAK);
  process.stdout.write(weak.out);
  expect('weak statement of work', weak, 1, [
    'results: 7 of 22 sections found, 2 empty, 13 missing',
    'findings: 26 (4 error, 13 warning, 9 notice); fail level warning',
    'the scope is described under "2. Scope" (line 9), but there is no section Out of scope',
    'vague wording "user-friendly" in "3. Deliverables": A fast, user-friendly web portal that works on phones.',
    'acceptance criterion with nothing to measure in "4. Acceptance": Orders reach the accounting system.',
    'the heading "5. Timeline" holds nothing but TBD',
    'the heading "7. Change requests" has no text under it',
    'placeholder to be confirmed in "9. Support"',
    'required section Security requirements is missing',
    'RESULT: FAIL - 17 findings at or above warning'
  ], ['Fast reorder', 'reorder-mode', 'Month end', 'RESULT: PASS']);

  const solid = await run(SOLID);
  expect('solid statement of work', solid, 0, [
    'results: 21 of 22 sections found, 0 empty, 1 missing',
    'recommended section Accessibility is missing',
    'RESULT: PASS - no finding at or above warning (1 below it)'
  ], ['  WARNING  ', '  ERROR  ', 'RESULT: FAIL']);

  // With the fail level at notice, the notice of the solid document fails the run.
  const strict = await run([...SOLID, '--fail-on', 'notice']);
  expect('fail on notice', strict, 1, ['RESULT: FAIL - 1 finding at or above notice'], []);

  // The built-in checklist alone: the weak document has no out-of-scope section either way.
  const builtIn = await run(['examples/weak-sow.md']);
  expect('built-in checklist', builtIn, 1, ['checklist: built-in defaults: 21 sections (8 required, 13 recommended)', 'no-out-of-scope'], ['Accessibility']);

  // The README shows the whole report of the weak document, the --explain lines of one finding, and the report of the
  // solid one up to its checklist.
  const readme = (await readFile(resolve(root, 'README.md'), 'utf8')).split('\r\n').join('\n');
  if (!readme.includes(weak.out)) problems.push('README: the sample output of the weak document differs from a real run');
  const solidHead = solid.out.slice(0, solid.out.indexOf('Checklist ('));
  if (!readme.includes(solidHead)) problems.push('README: the sample output of the solid document differs from a real run');

  await mkdir(resolve(root, 'examples/output'), { recursive: true });
  await writeFile(resolve(root, 'examples/output/weak-sow.txt'), weak.out);
  await writeFile(resolve(root, 'examples/output/solid-sow.txt'), solid.out);
  const explain = await run([...WEAK, '--explain']);
  if (explain.code !== 1) problems.push(`explain: exit code ${explain.code}, expected 1`);
  const lines = explain.out.split('\n');
  const at = lines.findIndex((l) => l.includes('unmeasurable-criterion') && l.includes('weak-sow.md:36:'));
  const sample = lines.slice(at, at + 7).join('\n');
  if (at < 0 || !readme.includes(sample)) problems.push('README: the --explain sample of the criterion on line 36 differs from a real run');
  await writeFile(resolve(root, 'examples/output/weak-sow-explain.txt'), explain.out);
  for (const [format, name] of [['markdown', 'weak-sow.md'], ['json', 'weak-sow.json']]) {
    const r = await run([...WEAK, '--format', format, '--explain']);
    if (r.code !== 1) problems.push(`${format}: exit code ${r.code}, expected 1`);
    await writeFile(resolve(root, 'examples/output', name), r.out);
  }
  const defaults = await run(['--print-defaults']);
  if (defaults.code !== 0) problems.push(`--print-defaults: exit code ${defaults.code}, expected 0`);
  await writeFile(resolve(root, 'examples/output/defaults.json'), defaults.out);

  if (problems.length) {
    for (const p of problems) console.error(`example: ${p}`);
    process.exit(1);
  }
}
