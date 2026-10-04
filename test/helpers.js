// Shared test helpers: documents and configurations built inline, checked in memory or written into a temporary folder
// that is removed after the test. Paths are built with resolve() from forward-slash names, so the same test runs on
// Linux, macOS and Windows. The line a test expects is found with lineOf(), which counts lines the way the tool does, so a
// test never holds a line number worked out by hand for one system only; columnIn() does the same for a column. No test
// reads the clock, the time zone or the locale.

import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { buildReport, defaultConfig, lineStarts, main, positionOf, readConfig, readMarkdown } from '../src/index.js';

export async function withFiles(files, fn) {
  const dir = await mkdtemp(resolve(tmpdir(), 'sow-gap-check-'));
  try {
    for (const [rel, content] of Object.entries(files)) {
      await mkdir(dirname(resolve(dir, rel)), { recursive: true });
      await writeFile(resolve(dir, rel), content);
    }
    return await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

// The line (from 1) of the n-th place where needle starts in text.
export function lineOf(text, needle, n = 1) {
  let at = -1;
  for (let i = 0; i < n; i += 1) {
    at = text.indexOf(needle, at + 1);
    if (at < 0) throw new Error(`${needle} is not in the text ${n} times`);
  }
  return positionOf(lineStarts(text), at).line;
}

// The column (from 1) of the n-th place where needle starts in text, in its line.
export function columnIn(text, needle, n = 1) {
  let at = -1;
  for (let i = 0; i < n; i += 1) {
    at = text.indexOf(needle, at + 1);
    if (at < 0) throw new Error(`${needle} is not in the text ${n} times`);
  }
  return positionOf(lineStarts(text), at).column;
}

// A document from lines.
export const md = (...lines) => `${lines.join('\n')}\n`;

// The configuration of a configuration object, through the real reader, or the defaults.
export const configOf = (object) => (object ? readConfig(JSON.stringify(object), 'config.json') : defaultConfig());

// The report of a document text, in memory.
export const reportOf = (text, config = null, meta = {}) => buildReport(readMarkdown(text), configOf(config), { file: 'sow.md', ...meta });

// The findings of a report, of one rule or of all.
export const findingsOf = (report, rule) => report.findings.filter((f) => !rule || f.rule === rule);

// The checklist entry of a section.
export const entryOf = (report, id) => report.checklist.find((c) => c.id === id);

// A document that has every required section with text, so a test can change one part and see one rule.
export const FULL = [
  '# Statement of work',
  '',
  '## Objectives',
  '',
  'Cafes order stock online.',
  '',
  '## Scope',
  '',
  'An order portal and an admin area.',
  '',
  '## Out of scope',
  '',
  'Payments by card.',
  '',
  '## Deliverables',
  '',
  '- D1: the portal, deployed to the client account.',
  '',
  '## Acceptance criteria',
  '',
  '- 95% of pages load in under 2 seconds.',
  '',
  '## Change control',
  '',
  'Changes are agreed in writing by both parties.',
  '',
  '## Milestones',
  '',
  '1. Launch at the end of week 14.',
  '',
  '## Pricing',
  '',
  'A fixed price paid at each milestone.'
];

// The full document with lines replaced: { at: 'heading text', body: [lines] } puts body under that heading, in place
// of what was there; extra lines are added at the end.
export function fullWith({ replace = {}, remove = [], extra = [] } = {}) {
  const out = [];
  let skip = false;
  for (const line of FULL) {
    if (line.startsWith('#')) {
      skip = false;
      const name = line.replace(/^#+ /, '');
      if (remove.includes(name)) {
        skip = true;
        continue;
      }
      out.push(line);
      if (Object.hasOwn(replace, name)) {
        out.push('', ...replace[name]);
        skip = true;
      }
      continue;
    }
    if (!skip) out.push(line);
  }
  return md(...out, ...extra);
}

// Writes the files and runs the command line with these arguments (paths relative to the folder).
export async function run(files, args = [], limits) {
  return withFiles(files, async (dir) => {
    let out = '';
    let err = '';
    const code = await main(args, { out: (t) => { out += t; }, err: (t) => { err += t; } }, limits, dir);
    return { code, out, err, dir };
  });
}

// Runs the command line with exactly these arguments, in a folder.
export async function cli(argv, base) {
  let out = '';
  let err = '';
  const code = await main(argv, { out: (t) => { out += t; }, err: (t) => { err += t; } }, undefined, base);
  return { code, out, err };
}
