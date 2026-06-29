// ─────────────────────────────────────────────────────────────
//  IMPORT PERFORMERS FROM A 2-COLUMN SHEET  →  one .md per row
//
//  Usage:
//    node scripts/import-performers-csv.mjs path/to/your-file.csv
//    node scripts/import-performers-csv.mjs path/to/your-file.csv --force
//
//  Your sheet needs TWO columns (header row, case-insensitive):
//    File Name , Description
//  …and an optional THIRD:
//    City
//  (Leave City out entirely, or leave a row's City blank — both fine.)
//
//  For each data row it writes:
//    src/content/performers/<slug-from-file-name>.md
//
//  …whose frontmatter holds the Description (verbatim) and a short
//  list of auto-picked tags. NO name line is written — the title is
//  derived from the filename at render time, exactly like your old
//  cards. Images keep working the same way: name them
//  <slug>1.jpg, <slug>2.jpg … in the same folder.
//
//  SAFETY: if a .md with that name already exists, it is SKIPPED, so
//  your old hand-written entries are never touched. Pass --force only
//  if you deliberately want to overwrite.
//
//  If your file is .xlsx, open it in Excel/Sheets and "Save As" /
//  "Export" → CSV first, then point this script at the .csv file.
// ─────────────────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const force = args.includes('--force');

// Optional output folder: --out "some/dir"  (defaults to the content folder)
let outArg = '';
const outFlagPos = args.indexOf('--out');
if (outFlagPos !== -1) outArg = args[outFlagPos + 1] ?? '';

const inputPath = args.find((a, i) =>
  !a.startsWith('--') && i !== outFlagPos + 1
);

if (!inputPath) {
  console.error('Usage: node scripts/import-performers-csv.mjs path/to/file.csv [--out "folder"] [--force]');
  process.exit(1);
}

const raw = fs.readFileSync(inputPath, 'utf8');

// Same quote-aware CSV parser as your X / Instagram importers — handles
// commas, "" escaping, and newlines inside a quoted Description field.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  text = text.replace(/\r\n/g, '\n');

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n') {
      row.push(field); field = '';
      rows.push(row); row = [];
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

const rows = parseCsv(raw);
if (rows.length < 2) {
  console.error('No data rows found (is the file empty, or just a header?).');
  process.exit(1);
}

const header = rows[0].map((h) => h.trim().toLowerCase());
const dataRows = rows.slice(1); // skip row 1 (titles)

function col(headerNames) {
  for (const name of headerNames) {
    const idx = header.indexOf(name.toLowerCase());
    if (idx !== -1) return idx;
  }
  return -1;
}

const idx = {
  fileName: col(['file name', 'filename', 'file', 'name', 'title', 'slug']),
  description: col(['description', 'desc', 'text', 'body', 'about']),
};

// City is optional: include the column if it's there, ignore it if not.
const cityIdx = col(['city', 'location', 'town']);

const missing = Object.entries(idx).filter(([, v]) => v === -1).map(([k]) => k);
if (missing.length) {
  console.error('Could not find these columns in row 1:', missing.join(', '));
  console.error('Found headers were:', rows[0].join(' | '));
  console.error('Expected something like:  File Name , Description');
  process.exit(1);
}

// ── slug: "Kangna Khan" / "kangna_khan" → "kangna-khan" ──
// Matches how nameFromId() reverses it back into a Title, and how your
// image files are named (<slug>1.jpg, <slug>2.jpg …).
function slugify(s) {
  return (s ?? '')
    .trim()
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')      // drop a stray ".md" if present
    .replace(/[’'`]/g, '')             // drop apostrophes outright
    .replace(/[^a-z0-9]+/g, '-')       // everything else → hyphen
    .replace(/^-+|-+$/g, '')           // trim leading/trailing hyphens
    .replace(/-{2,}/g, '-');           // collapse runs of hyphens
}

// ── auto-tags: the few most-repeated meaningful words in the text ──
const STOP = new Set([
  'this','that','with','from','your','have','will','they','them','their','there','here',
  'what','when','where','which','while','very','just','into','also','more','than','then',
  'about','would','could','should','been','being','were','some','such','only','onto','off',
  'over','under','after','before','because','these','those','other','again','still','most',
  'much','many','each','every','both','either','neither','through','between','around','upon',
  'does','done','doing','make','made','like','well','even','ever','out',
]);

function autoTags(text, max = 6) {
  const freq = new Map();
  const words = (text.toLowerCase().match(/[a-z\u00c0-\u024f]+/gi) ?? []);
  for (const w of words) {
    if (w.length < 4 || STOP.has(w)) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, max)
    .map(([w]) => w);
}

// ── YAML double-quoted escaping: keeps the description verbatim
//    (colons, commas, quotes, line breaks) without breaking frontmatter. ──
function yamlString(s) {
  const escaped = (s ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r/g, '')
    .replace(/\t/g, '\\t')
    .replace(/\n/g, '\\n');
  return '"' + escaped + '"';
}

function yamlTagArray(tags) {
  if (!tags.length) return '[]';
  return '[' + tags.map((t) => yamlString(t)).join(', ') + ']';
}

const outDir = outArg
  ? path.resolve(outArg)
  : path.join(process.cwd(), 'src/content/performers');
fs.mkdirSync(outDir, { recursive: true });
console.log('Writing to: ' + outDir + '\n');

let written = 0;
let skippedExisting = 0;
let skippedBlank = 0;
const seen = new Set();

const expectedCols = header.length;
for (const r of dataRows) {
  const rawName = (r[idx.fileName] ?? '').trim();
  let description = (r[idx.description] ?? '').trim();
  const city = cityIdx === -1 ? '' : (r[cityIdx] ?? '').trim();

  // If a Description had an un-quoted comma, the CSV splits it into extra
  // columns. Stitch only the columns that fall BETWEEN description and the
  // next real column (city, if present) back onto the description, so a
  // stray comma can't swallow the City value. Warn either way.
  if (r.length > expectedCols) {
    const stitchEnd = cityIdx > idx.description ? cityIdx : r.length;
    const overflow = r.slice(idx.description + 1, stitchEnd).join(', ').trim();
    if (overflow) description = (description + ', ' + overflow).trim();
    console.warn('! Row "' + rawName + '" had extra columns (un-quoted comma?). '
      + 'Stitched it back — but quote that cell in your sheet to be safe.');
  }

  const slug = slugify(rawName);

  if (!slug) { skippedBlank++; continue; }          // no usable filename
  if (seen.has(slug)) {
    console.warn('! Duplicate filename in sheet, skipping second one: "' + rawName + '" -> ' + slug + '.md');
    continue;
  }
  seen.add(slug);

  const filePath = path.join(outDir, slug + '.md');

  // Never clobber an existing entry unless --force was passed. This is
  // what protects your old hand-written cards.
  if (fs.existsSync(filePath) && !force) {
    skippedExisting++;
    continue;
  }

  const tags = autoTags(description);

  const md = '---\n'
    + (city ? 'city: ' + yamlString(city) + '\n' : '')
    + 'description: ' + yamlString(description) + '\n'
    + 'tags: ' + yamlTagArray(tags) + '\n'
    + '---\n';

  fs.writeFileSync(filePath, md, 'utf8');
  written++;
}

console.log('\nDone.');
console.log('  Wrote:            ' + written + ' file(s) -> ' + outDir);
if (skippedExisting) console.log('  Skipped existing: ' + skippedExisting + ' (already on disk — use --force to overwrite)');
if (skippedBlank)    console.log('  Skipped blank:    ' + skippedBlank + ' (no filename)');
console.log('\nReminder: drop the matching images next to them as <slug>1.jpg, <slug>2.jpg …');
