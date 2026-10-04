// Matching the headings of a document to the sections of the checklist. A heading and an alias are put in one normal
// form, and a heading matches a section when the words of one of its aliases stand together in the words of the heading.
// The longest alias is taken first and its words are used up, so "Out of scope" is the out-of-scope section and not the
// scope, while "Data protection and confidentiality" matches both of its sections. Nothing is matched by similarity.

// The words of a heading that number it: "4.2", "1.", "A)", "iv.", "Section 3:", "Appendix B -".
const NUMBERED_PART = /^(?:section|part|appendix|annex|schedule|clause|article|exhibit)\s+(?:\d+(?:\.\d+)*|[a-z]|[ivxlcdm]+)\b\s*[-:.)]*\s*(?=\S)/i;
const NUMBER = /^(?:\d+(?:\.\d+)*[.)]?|[a-z][.)]|[ivxlcdm]+[.)])\s+(?=\S)/i;
const LINK_DESTINATION = /\]\([^)]*\)/g;
const MARKUP = /[*_`[\]<>#\\]/g;
const NOT_WORD = /[^\p{L}\p{N}]+/gu;

export const SECTION_LIMITS = { maxHeadingWords: 64, maxHeadingChars: 1000 };

// The normal form of a text: lower case, "&" read as "and", every run of characters that are not letters or digits read
// as one space. With numbered: true the numbering at the start of a heading is left out first.
export function normalizeHeading(text, { numbered = true } = {}) {
  let t = String(text).slice(0, SECTION_LIMITS.maxHeadingChars).replace(LINK_DESTINATION, ']').replace(MARKUP, ' ').trim();
  if (numbered) {
    const stripped = t.replace(NUMBERED_PART, '').replace(NUMBER, '');
    if (/[\p{L}\p{N}]/u.test(stripped)) t = stripped;
  }
  return t.toLowerCase().replace(/&/g, ' and ').replace(NOT_WORD, ' ').trim();
}

export const wordsOf = (normal) => (normal === '' ? [] : normal.split(' '));

// The sections that one heading matches: [{ id, alias }], at most one entry for each section. sections is the checklist
// of the configuration, each with aliasWords: [[words of an alias], ...] and aliases in the same order.
export function matchHeading(text, sections, limits = SECTION_LIMITS) {
  const words = wordsOf(normalizeHeading(text)).slice(0, limits.maxHeadingWords);
  if (!words.length) return [];
  const candidates = [];
  sections.forEach((section, order) => {
    if (section.level === 'off') return;
    section.aliasWords.forEach((alias, a) => {
      for (let at = 0; at + alias.length <= words.length; at += 1) {
        let same = true;
        for (let k = 0; k < alias.length && same; k += 1) same = words[at + k] === alias[k];
        if (same) candidates.push({ id: section.id, alias: section.aliases[a], order, at, size: alias.length, chars: alias.join(' ').length });
      }
    });
  });
  candidates.sort((x, y) => y.size - x.size || y.chars - x.chars || x.order - y.order || x.at - y.at);
  const used = new Array(words.length).fill(false);
  const matched = new Map();
  for (const c of candidates) {
    if (matched.has(c.id)) continue;
    let free = true;
    for (let k = c.at; k < c.at + c.size && free; k += 1) free = !used[k];
    if (!free) continue;
    for (let k = c.at; k < c.at + c.size; k += 1) used[k] = true;
    matched.set(c.id, { id: c.id, alias: c.alias, order: c.order });
  }
  return [...matched.values()].sort((a, b) => a.order - b.order).map(({ id, alias }) => ({ id, alias }));
}

// The extent of every heading: the index of the next heading at its level or above, so heading h covers the headings
// h + 1 up to end - 1 and everything under them.
export function headingExtents(headings) {
  const ends = new Array(headings.length).fill(headings.length);
  const open = [];
  headings.forEach((h, i) => {
    while (open.length && headings[open[open.length - 1]].level >= h.level) ends[open.pop()] = i;
    open.push(i);
  });
  return ends;
}
