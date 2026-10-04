// The three reports: text for a terminal, Markdown for a ticket or a pull request, and JSON for other tools. Every text
// from the document (a heading, a piece of a line) was cleaned by safeText before it reached the report. The Markdown
// report also escapes each cell, so a heading cannot break a table, make a link or be read as HTML, and a cell that
// starts with =, +, -, @, a tab or a carriage return gets a leading apostrophe, so a spreadsheet that the table is pasted
// into does not read it as a formula. Every report ends with the sentence that the tool gives no legal advice.

import { grouped, plural } from './size.js';

const FORMULA_START = new Set(['=', '+', '-', '@', '\t', '\r']);

// A cell that a spreadsheet would read as a formula, with a leading apostrophe.
export function guardFormula(t) {
  const s = String(t);
  return s.length && FORMULA_START.has(s[0]) ? `'${s}` : s;
}

export function mdCell(t) {
  return guardFormula(String(t))
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\\/g, '\\\\')
    .replace(/\|/g, '\\|')
    .replace(/[[\]`*_]/g, (c) => `\\${c}`)
    .replace(/\r?\n|\r/g, ' ');
}

function configLine(r) {
  const c = r.config;
  const where = c.file ? `${c.file}${c.name ? ` (${c.name})` : ''}` : 'built-in defaults';
  return `${where}: ${plural(c.sections.total, 'section')} (${grouped(c.sections.required)} required, ${grouped(c.sections.recommended)} recommended${c.sections.off ? `, ${grouped(c.sections.off)} off` : ''}), ${plural(c.phrases.vague, 'vague phrase')}, ${plural(c.phrases.placeholders, 'placeholder')}`;
}

function documentLine(r) {
  const d = r.document;
  return `${d.file} (${plural(d.lines, 'line')}, ${plural(d.headings, 'heading')}, ${plural(d.lists, 'list')}, ${plural(d.tables, 'table')}, ${plural(d.codeBlocks, 'code block')}, ${plural(d.quotes, 'block quote')})`;
}

function rulesLine(r) {
  return r.config.rules.map((x) => (x.id === 'missing-section' ? `${x.id} (required ${x.required}, recommended ${x.recommended})` : `${x.id} (${x.level})`)).join('; ');
}

function resultsLine(r) {
  const t = r.totals;
  return `${grouped(t.found)} of ${plural(t.found + t.empty + t.missing, 'section')} found, ${grouped(t.empty)} empty, ${grouped(t.missing)} missing`;
}

function findingsLine(r) {
  const b = r.verdict.byLevel;
  const parts = ['error', 'warning', 'notice'].filter((l) => b[l]).map((l) => `${grouped(b[l])} ${l}`);
  return `${grouped(r.findings.length)}${parts.length ? ` (${parts.join(', ')})` : ''}; fail level ${r.verdict.failOn}`;
}

const headingsText = (c) => c.headings.map((h) => `line ${grouped(h.line)} "${h.text}"${h.state === 'body' ? '' : ` (${h.state})`}`).join('; ');
const basisText = (b) => `"${b.text}" (${b.section}, ${b.page})`;

// Pads the columns of a table of text to their widths.
function table(rows, indent = '  ') {
  const widths = rows[0].map((_, i) => Math.min(40, Math.max(...rows.map((row) => String(row[i]).length))));
  return rows.map((row) => `${indent}${row.map((cell, i) => (i === row.length - 1 ? String(cell) : String(cell).padEnd(widths[i]))).join('  ')}`.trimEnd());
}

export function toText(r, { explain = false } = {}) {
  const out = [];
  out.push(`sow-gap-check: ${r.document.file}`);
  out.push(`document: ${documentLine(r)}`);
  out.push(`checklist: ${configLine(r)}`);
  out.push(`rules: ${rulesLine(r)}`);
  out.push(`results: ${resultsLine(r)}`);
  out.push(`findings: ${findingsLine(r)}`);
  out.push('', `Findings (${grouped(r.findings.length)})`, '');
  if (!r.findings.length) out.push('  none', '');
  const pad = ' '.repeat(11);
  for (const f of r.findings) {
    out.push(`  ${f.level.toUpperCase().padEnd(8)} ${f.rule.padEnd(22)}  ${f.at}`);
    out.push(`${pad}${f.found}`);
    if (explain) {
      out.push(`${pad}rule: ${r.config.rules.find((x) => x.id === f.rule).rule}`);
      for (const w of f.why) out.push(`${pad}why: ${w}`);
      for (const b of f.basis) out.push(`${pad}basis: ${basisText(b)}`);
    }
    out.push('');
  }
  out.push(`Checklist (${grouped(r.checklist.length)})`, '');
  const rows = r.checklist.map((c) => [c.status, c.level, c.title, headingsText(c)]);
  for (const [i, line] of table(rows).entries()) {
    out.push(line);
    if (explain) {
      const c = r.checklist[i];
      if (c.status !== 'off') out.push(`      aliases: ${c.aliases.join(', ')}`);
      for (const b of c.basis) out.push(`      basis: ${basisText(b)}`);
      if (c.own) out.push(`      the tool's own choice: ${c.own}`);
    }
  }
  out.push('');
  for (const n of r.notes) out.push(`note: ${n}`);
  if (r.notes.length) out.push('');
  out.push(r.notice, '');
  out.push(`RESULT: ${r.verdict.text}`);
  return `${out.join('\n')}\n`;
}

export function toMarkdown(r, { explain = false } = {}) {
  const lines = [`## sow-gap-check: ${r.verdict.text}`, ''];
  lines.push(`- Document: ${mdCell(documentLine(r))}`);
  lines.push(`- Checklist: ${mdCell(configLine(r))}`);
  lines.push(`- Rules: ${mdCell(rulesLine(r))}`);
  lines.push(`- Results: ${mdCell(resultsLine(r))}`);
  lines.push(`- Findings: ${mdCell(findingsLine(r))}`);
  lines.push('', '### Findings', '');
  if (r.findings.length) {
    lines.push('| Level | Rule | Found | Where |', '| --- | --- | --- | --- |');
    for (const f of r.findings) lines.push(`| ${f.level === 'error' ? '**error**' : f.level} | ${f.rule} | ${mdCell(f.found)} | ${mdCell(f.at)} |`);
  } else lines.push('None.');
  if (explain) {
    for (const f of r.findings) {
      lines.push('', `#### ${f.rule}: ${mdCell(f.at)}`, '');
      lines.push(`- Rule: ${mdCell(r.config.rules.find((x) => x.id === f.rule).rule)}`);
      for (const w of f.why) lines.push(`- Why: ${mdCell(w)}`);
      for (const b of f.basis) lines.push(`- Basis: ${mdCell(basisText(b))}`);
    }
  }
  lines.push('', '### Checklist', '');
  lines.push('| Status | Level | Section | Headings |', '| --- | --- | --- | --- |');
  for (const c of r.checklist) lines.push(`| ${c.status === 'missing' ? '**missing**' : c.status} | ${c.level} | ${mdCell(c.title)} | ${mdCell(headingsText(c) || 'none')} |`);
  if (explain) {
    lines.push('', '### Where the checklist comes from', '');
    for (const c of r.checklist) {
      const from = [...c.basis.map((b) => basisText(b)), ...(c.own ? [`the tool's own choice: ${c.own}`] : [])];
      lines.push(`- ${mdCell(c.title)}: ${mdCell(from.join('; ') || 'added by the configuration')}`);
    }
  }
  if (r.notes.length) {
    lines.push('', '### Notes', '');
    for (const n of r.notes) lines.push(`- ${mdCell(n)}`);
  }
  lines.push('', mdCell(r.notice));
  return `${lines.join('\n')}\n`;
}

export function toJson(r, { explain = false } = {}) {
  const out = {
    ...r,
    findings: r.findings.map((f) => (explain ? f : { ...f, why: undefined, basis: undefined })),
    checklist: r.checklist.map((c) => (explain ? c : { ...c, basis: undefined, own: undefined }))
  };
  return `${JSON.stringify(out, null, 2)}\n`;
}
