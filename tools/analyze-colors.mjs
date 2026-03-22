/**
 * Tier A + optional Tier B gloss scan for media/bloodmeridian.md.
 * Longest-match-first; Tier B only in spans not covered by Tier A.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function isWordChar(c) {
  return /[a-z0-9]/i.test(c) || c === "-";
}

function loadJson(rel) {
  const p = path.join(root, ...rel.split("/"));
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function loadLexicon() {
  const data = loadJson("data/lexicon.json");
  const entries = data.entries.map((e) => ({
    match: e.match.toLowerCase(),
    family: e.family,
  }));
  entries.sort((a, b) => b.match.length - a.match.length);
  return { ...data, entries };
}

function loadGloss() {
  const data = loadJson("data/gloss.json");
  if (!data || !data.entries || !data.entries.length) return null;
  const entries = data.entries.map((e) => ({
    match: e.match.toLowerCase(),
    family: e.family,
    note: e.note || "",
  }));
  entries.sort((a, b) => b.match.length - a.match.length);
  return { ...data, entries };
}

function loadNameExclusions() {
  const data = loadJson("data/name-exclusions.json");
  if (!data || !data.phrases || !data.phrases.length) return [];
  return data.phrases.map((p) => String(p).toLowerCase());
}

function loadMoneyMetalExclusions() {
  const data = loadJson("data/money-metal-exclusions.json");
  if (!data || !data.phrases || !data.phrases.length) return [];
  return data.phrases.map((p) => String(p).toLowerCase());
}

function loadHomonymExclusions() {
  const data = loadJson("data/homonym-exclusions.json");
  if (!data || !data.phrases || !data.phrases.length) return [];
  return data.phrases.map((p) => String(p).toLowerCase());
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Ranges in the original string (same indices as lowercased copy). */
function mergeSortedRanges(ranges) {
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const merged = [];
  for (const r of sorted) {
    const last = merged[merged.length - 1];
    if (last && r.start <= last.end) last.end = Math.max(last.end, r.end);
    else merged.push({ ...r });
  }
  return merged;
}

function findPhraseBlockedRanges(lower, phrases) {
  const ranges = [];
  for (const phrase of phrases) {
    const p = phrase.trim().toLowerCase();
    if (!p) continue;
    const inner = escapeRegex(p).replace(/\s+/g, "\\s+");
    const re = new RegExp(`\\b(?:${inner})\\b`, "gi");
    let m;
    while ((m = re.exec(lower)) !== null) {
      ranges.push({ start: m.index, end: m.index + m[0].length });
    }
  }
  return mergeSortedRanges(ranges);
}

function loadVerbHomographLemmas() {
  const data = loadJson("data/verb-homograph-exclusions.json");
  if (!data || !data.lemmas || !data.lemmas.length) return [];
  return data.lemmas.map((x) => String(x).toLowerCase());
}

/**
 * Block spans where a color lemma is used as a verb (infinitive, modal + base, etc.).
 */
function findVerbHomographBlockedRanges(lower, lemmas) {
  const ranges = [];
  const modals = "(?:will|would|could|should|must|may|might|can|shall)";
  const doForms = "(?:does|do|did)";
  for (const lem of lemmas) {
    const L = escapeRegex(lem);
    const patterns = [
      new RegExp(`\\bto\\s+${L}\\b`, "gi"),
      new RegExp(`\\b${modals}\\s+not\\s+${L}\\b`, "gi"),
      new RegExp(`\\b${modals}\\s+${L}\\b`, "gi"),
      new RegExp(`\\b${doForms}\\s+(?:not\\s+)?${L}\\b`, "gi"),
    ];
    for (const re of patterns) {
      let m;
      while ((m = re.exec(lower)) !== null) {
        ranges.push({ start: m.index, end: m.index + m[0].length });
      }
    }
  }
  return mergeSortedRanges(ranges);
}

function isSentenceInitial(sentence, start) {
  const before = sentence.slice(0, start);
  const t = before.trimEnd();
  if (t === "") return true;
  return /[.!?]["'”’]?\s*$/.test(t);
}

function isTitleCaseWord(sentence, start, end) {
  const w = sentence.slice(start, end);
  if (w.length < 2) return false;
  const first = w[0];
  const rest = w.slice(1);
  if (first !== first.toUpperCase() || first === first.toLowerCase()) return false;
  return rest === rest.toLowerCase();
}

/**
 * Skip chromatic hits that are likely proper names or titles (e.g. Reverend Green,
 * Captain White, Brown as surname). Lowercase color words still count.
 */
function shouldExcludeName(sentence, start, end) {
  const w = sentence.slice(start, end);
  const lower = w.toLowerCase();

  if (!isTitleCaseWord(sentence, start, end)) {
    return false;
  }

  if (isSentenceInitial(sentence, start)) {
    if (lower === "brown" && w === "Brown") return true;
    return false;
  }

  return true;
}

function filterMatchesByName(sentence, matches) {
  return matches.filter((m) => !shouldExcludeName(sentence, m.start, m.end));
}

function stripMarkdown(md) {
  const lines = md.split(/\r?\n/);
  const out = [];
  for (const line of lines) {
    const t = line.trim();
    if (/^#{1,6}\s/.test(t)) continue;
    if (t === "") continue;
    out.push(line);
  }
  return out.join(" ");
}

function normalizeText(s) {
  return s.replace(/\s+/g, " ").trim();
}

function splitSentences(text) {
  const t = normalizeText(text);
  if (!t) return [];
  const parts = t.split(/(?<=[.!?])\s+/);
  return parts.map((s) => s.trim()).filter(Boolean);
}

function overlapsAny(start, end, ranges) {
  for (const r of ranges) {
    if (start < r.end && end > r.start) return true;
  }
  return false;
}

function findMatchesInSentence(lower, entries, blockedRanges) {
  const blocked = blockedRanges || [];
  const matches = [];
  let i = 0;
  while (i < lower.length) {
    let best = null;
    for (const e of entries) {
      const m = e.match;
      if (!lower.startsWith(m, i)) continue;
      const end = i + m.length;
      const before = i === 0 ? " " : lower[i - 1];
      const after = end >= lower.length ? " " : lower[end];
      const okBefore = !isWordChar(before);
      const okAfter = !isWordChar(after);
      if (!okBefore || !okAfter) continue;
      if (overlapsAny(i, end, blocked)) continue;
      if (!best || m.length > best.match.length) {
        best = { ...e, start: i, end, matched: m };
      }
    }
    if (best) {
      matches.push({
        word: best.matched,
        family: best.family,
        start: best.start,
        end: best.end,
      });
      i = best.end;
    } else {
      i += 1;
    }
  }
  return matches;
}

function wordsAfter(sentence, endIndex) {
  const tail = sentence
    .slice(endIndex)
    .trim()
    .replace(/^[,;:\u2014\-\u2013]\s*/, "");
  return tail.split(/\s+/).filter(Boolean).slice(0, 10).join(" ");
}

function buildByFamilyWords(families, occurrences) {
  const out = Object.fromEntries(families.map((f) => [f.id, {}]));
  for (const o of occurrences) {
    const fam = o.family;
    const w = o.word;
    if (!out[fam]) out[fam] = {};
    out[fam][w] = (out[fam][w] || 0) + 1;
  }
  return out;
}

function main() {
  const lex = loadLexicon();
  const gloss = loadGloss();
  const mdPath = path.join(root, "media", "bloodmeridian.md");
  const raw = fs.readFileSync(mdPath, "utf8");
  const body = stripMarkdown(raw);
  const sentences = splitSentences(body);

  const byFamily = Object.fromEntries(lex.families.map((f) => [f.id, 0]));
  const byWord = {};
  const occurrences = [];
  let tierACount = 0;
  let tierBCount = 0;

  const nameOnlyPhrases = loadNameExclusions();
  const moneyMetalPhrases = loadMoneyMetalExclusions();
  const homonymPhrases = loadHomonymExclusions();
  const namePhrases = [
    ...nameOnlyPhrases,
    ...moneyMetalPhrases,
    ...homonymPhrases,
  ];
  const verbHomographLemmas = loadVerbHomographLemmas();

  sentences.forEach((sentence, sentenceId) => {
    const lower = sentence.toLowerCase();

    const nameBlocked = findPhraseBlockedRanges(lower, namePhrases);
    const verbBlocked = findVerbHomographBlockedRanges(
      lower,
      verbHomographLemmas
    );
    const preBlocked = mergeSortedRanges([...nameBlocked, ...verbBlocked]);

    const tierAMatchesRaw = findMatchesInSentence(
      lower,
      lex.entries,
      preBlocked
    );
    const tierAMatches = filterMatchesByName(sentence, tierAMatchesRaw);

    const blockedForB = [
      ...preBlocked,
      ...tierAMatches.map((m) => ({ start: m.start, end: m.end })),
    ];

    for (const m of tierAMatches) {
      tierACount += 1;
      byFamily[m.family] = (byFamily[m.family] || 0) + 1;
      byWord[m.word] = (byWord[m.word] || 0) + 1;
      occurrences.push({
        sentenceId,
        word: m.word,
        family: m.family,
        start: m.start,
        end: m.end,
        sentence,
        tier: "A",
        contextAfter: wordsAfter(sentence, m.end),
        note: "",
      });
    }

    if (gloss && gloss.entries.length) {
      const tierBMatchesRaw = findMatchesInSentence(
        lower,
        gloss.entries,
        blockedForB
      );
      const tierBMatches = filterMatchesByName(sentence, tierBMatchesRaw);
      for (const m of tierBMatches) {
        const gEntry = gloss.entries.find((e) => e.match === m.word);
        tierBCount += 1;
        byFamily[m.family] = (byFamily[m.family] || 0) + 1;
        byWord[m.word] = (byWord[m.word] || 0) + 1;
        occurrences.push({
          sentenceId,
          word: m.word,
          family: m.family,
          start: m.start,
          end: m.end,
          sentence,
          tier: "B",
          contextAfter: wordsAfter(sentence, m.end),
          note: gEntry?.note || "",
        });
      }
    }
  });

  occurrences.sort((a, b) => {
    if (a.sentenceId !== b.sentenceId) return a.sentenceId - b.sentenceId;
    return a.start - b.start;
  });

  const byFamilyWords = buildByFamilyWords(lex.families, occurrences);

  const totalHits = occurrences.length;
  const tierLabel =
    gloss && gloss.entries.length ? "A + B (gloss)" : "A";

  const meta = {
    sourcePath: "media/bloodmeridian.md",
    tier: tierLabel,
    tierAHits: tierACount,
    tierBHits: tierBCount,
    generatedAt: new Date().toISOString(),
    sentenceCount: sentences.length,
    totalHits,
    notes:
      "Tier A: explicit lemmas. Tier B: gloss metonyms where they do not overlap Tier A. Name-like uses: data/name-exclusions.json + Title Case. Gold/silver money: data/money-metal-exclusions.json. Material/fruit/other homonyms: data/homonym-exclusions.json. Verbs: data/verb-homograph-exclusions.json.",
    nameExclusions: {
      phraseCount: nameOnlyPhrases.length,
    },
    moneyMetalPhrases: moneyMetalPhrases.length,
    homonymPhrases: homonymPhrases.length,
    verbHomographLemmas: verbHomographLemmas.length,
  };

  const payload = {
    meta,
    families: lex.families,
    gloss: gloss
      ? { tier: gloss.tier, notes: gloss.notes, entryCount: gloss.entries.length }
      : null,
    byFamily,
    byFamilyWords,
    byWord,
    occurrences,
  };

  const jsonPath = path.join(root, "data", "color-analysis.json");
  fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), "utf8");

  const embedPath = path.join(root, "js", "color-data.js");
  const embed = `/* Generated by npm run analyze:colors — do not edit by hand */
window.__BM_COLOR__ = ${JSON.stringify(payload)};
`;
  fs.writeFileSync(embedPath, embed, "utf8");

  console.log(`Wrote ${jsonPath}`);
  console.log(`Wrote ${embedPath}`);
  console.log(`Sentences: ${sentences.length}, hits: ${totalHits} (A: ${tierACount}, B: ${tierBCount})`);
  console.log("By family:", byFamily);
}

main();
