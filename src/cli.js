// Command line: sow-gap-check <file.md> [--config <file>] [options]

import { readFileSync } from 'node:fs';
import { InputError, LIMITS, checkPaths } from './check.js';
import { defaultsAsConfig } from './config.js';
import { writeReport } from './files.js';
import { toText, toMarkdown, toJson } from './report.js';
import { RULES } from './rules.js';
import { LEVELS } from './data.js';
import { safeText } from './text.js';

export const VERSION = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version;

const FORMATS = { text: toText, markdown: toMarkdown, json: toJson };

export const USAGE = `Usage: sow-gap-check <file.md> [--config <file>] [options]

Checks a statement of work for an outsourced software project, written in Markdown, for gaps: sections of a checklist
that are missing (objectives, scope, out of scope, deliverables, acceptance criteria, change control, schedule,
pricing and more, matched by their headings), headings with no text or nothing but placeholders such as TBD,
placeholders anywhere, vague words in the deliverables and the acceptance criteria, acceptance criteria with nothing
to measure, and a scope with no out-of-scope section. It checks the structure and the wording only: it is not a legal
review and gives no legal advice. It opens no network connection, follows no link and writes nothing to disk but the
file --out names.

Options:
  --config <file>           a configuration file (JSON) that changes the checklist, the phrases or the rules
                            (default: the built-in checklist; --print-defaults shows it)
  --format <name>           text, markdown or json (default: text)
  --explain                 show the rule, the reasons and the sentences behind each finding, and where each section
                            of the checklist comes from
  --fail-on <level>         the lowest level of a finding that fails the run: ${LEVELS.join(', ')} (default: failOn of
                            the configuration, else warning)
  --out <file>              write the report to this file instead of the screen
  --print-defaults          print the built-in configuration as a configuration file and exit
  --help                    show this text
  --version                 show the version

Rules: ${RULES.map((r) => `${r.id} (rules.${r.key})`).join(', ')}.

Exit codes: 0 no finding at or above the fail level, 1 a finding at or above it, 2 usage or input error.
`;

const isUrl = (f) => /^[a-z][a-z0-9+.-]*:\/\//i.test(f);

export function parseArgs(argv) {
  const o = { document: null, config: null, format: 'text', explain: false, failOn: null, out: null, printDefaults: false, help: false, version: false };
  const once = (name, current, value) => {
    if (current !== null) throw new Error(`${name} was given twice`);
    return value;
  };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const next = () => {
      const v = argv[i + 1];
      if (v === undefined || (v.startsWith('--') && v.length > 2)) throw new Error(`${a} needs a value`);
      if (v === '-') throw new Error('reading from standard input is not supported; give a file');
      i += 1;
      return v;
    };
    if (a === '--help' || a === '-h') o.help = true;
    else if (a === '--version' || a === '-v') o.version = true;
    else if (a === '--explain') o.explain = true;
    else if (a === '--print-defaults') o.printDefaults = true;
    else if (a === '--config') o.config = once(a, o.config, next());
    else if (a === '--out') o.out = once(a, o.out, next());
    else if (a === '--format') o.format = next();
    else if (a === '--fail-on') o.failOn = once(a, o.failOn, next());
    else if (a === '-') throw new Error('reading from standard input is not supported; give a file');
    else if (a.startsWith('-')) throw new Error(`unknown argument ${a}`);
    else if (o.document !== null) throw new Error(`one document at a time; ${a} is a second one`);
    else o.document = a;
  }
  if (!o.help && !o.version && !o.printDefaults) {
    if (!o.document) throw new Error('give the statement of work to check, such as sow-gap-check sow.md');
    for (const p of [o.document, o.config, o.out].filter(Boolean)) if (isUrl(p)) throw new Error('give a local path; the tool never fetches a URL');
    if (!Object.hasOwn(FORMATS, o.format)) throw new Error(`unknown format ${o.format} (text, markdown or json)`);
    if (o.failOn !== null && !LEVELS.includes(o.failOn)) throw new Error(`unknown level ${o.failOn} (${LEVELS.join(', ')})`);
  }
  return o;
}

const clean = (text) => safeText(text, 1500);

// Exit code: 0 no finding at or above the fail level, 1 a finding at or above it, 2 usage or input error.
export async function main(argv, io = { out: (t) => process.stdout.write(t), err: (t) => process.stderr.write(t) }, limits = undefined, base = process.cwd()) {
  let o;
  try {
    o = parseArgs(argv);
  } catch (error) {
    io.err(`sow-gap-check: ${clean(error.message)}\n\n${USAGE}`);
    return 2;
  }
  if (o.help) {
    io.out(USAGE);
    return 0;
  }
  if (o.version) {
    io.out(`${VERSION}\n`);
    return 0;
  }
  if (o.printDefaults) {
    io.out(`${JSON.stringify(defaultsAsConfig(), null, 2)}\n`);
    return 0;
  }
  let report;
  try {
    report = await checkPaths({ document: o.document, config: o.config, failOn: o.failOn, version: VERSION, limits: { ...LIMITS, ...(limits ?? {}) }, base });
  } catch (error) {
    if (error instanceof InputError) io.err(`sow-gap-check: no verdict, the input has ${error.problems.length === 1 ? 'a problem' : `${error.problems.length} problems`}:\n${error.problems.map((p) => `  ${clean(p)}`).join('\n')}\n`);
    else io.err(`sow-gap-check: ${clean(error.message)}\n`);
    return 2;
  }
  const text = FORMATS[o.format](report, { explain: o.explain });
  if (o.out) {
    try {
      const shown = await writeReport(o.out, text, base, [o.document, ...(o.config ? [o.config] : [])]);
      io.err(`sow-gap-check: the report is in ${clean(shown)}; ${report.verdict.text}\n`);
    } catch (error) {
      io.err(`sow-gap-check: ${clean(error.message)}\n`);
      return 2;
    }
  } else io.out(text);
  return report.verdict.pass ? 0 : 1;
}
