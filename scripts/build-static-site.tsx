/**
 * Generates the static site's data files and PDF handouts.
 * Run with: npx tsx scripts/build-static-site.tsx
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from "fs";
import path from "path";
import { ALL_TESTS } from "../src/lib/tests";
import { buildHandouts } from "../src/lib/handout/courses";
import { buildHandout } from "../src/lib/handout/pdf-handout";
import { MATERIALS } from "../src/lib/materials-data";
import { buildMaterialPdf } from "../src/lib/pdf";
import { seedLectures, seedNews } from "../src/lib/seed-data";

const ROOT = path.join(process.cwd(), "public", "prince-learning-hub");
const DATA_ONLY = process.argv.includes("--data-only");
for (const dir of ["", "data", "downloads", "images", "css", "js", "pages"]) {
  mkdirSync(path.join(ROOT, dir), { recursive: true });
}

/* ---------- photographs ---------- */
const imgSrc = path.join(process.cwd(), "public", "images");
for (const f of readdirSync(imgSrc)) {
  if (f.endsWith(".jpg") || f.endsWith(".png")) copyFileSync(path.join(imgSrc, f), path.join(ROOT, "images", f));
}
console.log("images copied:", readdirSync(path.join(ROOT, "images")).length);

async function main() {
type MaterialMeta = {
  id: number;
  title: string;
  courseCode: string;
  courseTitle: string;
  category: string;
  department: string;
  level: string;
  semester: string;
  description: string;
  fileName: string;
  sizeBytes: number;
  downloads: number;
};

/* ---------- materials (handouts + school notes) ---------- */
const materials: MaterialMeta[] = [];
let id = 1;

if (!DATA_ONLY) {
for (const h of buildHandouts()) {
  const bytes = await buildHandout(h);
  const fileName = `${h.courseCode.replace(/[^A-Za-z0-9-]+/g, "")}_${h.department.replace(/[^A-Za-z0-9-]+/g, "")}_Handout.pdf`;
  writeFileSync(path.join(ROOT, "downloads", fileName), bytes);
  materials.push({
    id: id++,
    title: `${h.courseCode} — ${h.title}`,
    courseCode: h.courseCode,
    courseTitle: h.title,
    category: h.categoryLabel.toLowerCase(),
    department: h.department,
    level: h.level,
    semester: h.semester,
    description: `Lecture handout and study guide with units, worked examples, diagrams, assignments, glossary and practice questions. Prepared by Mr. Damilola.`,
    fileName,
    sizeBytes: bytes.length,
    downloads: 0,
  });
}

for (const m of MATERIALS.filter((x) => x.category === "primary" || x.category === "secondary")) {
  const bytes = await buildMaterialPdf({
    title: m.title,
    courseCode: m.courseCode,
    courseTitle: m.courseTitle,
    audience: `${m.category} · ${m.department} · ${m.level}`,
    sections: m.sections,
  });
  const fileName = `${m.courseCode.replace(/[^A-Za-z0-9-]+/g, "")}_${m.category}_Notes.pdf`;
  writeFileSync(path.join(ROOT, "downloads", fileName), bytes);
  materials.push({
    id: id++,
    title: m.title,
    courseCode: m.courseCode,
    courseTitle: m.courseTitle,
    category: m.category,
    department: m.department,
    level: m.level,
    semester: "",
    description: m.description,
    fileName,
    sizeBytes: bytes.length,
    downloads: 0,
  });
}
console.log("pdf downloads written:", materials.length);
}


/* Shuffle each question's options so the correct letter is spread across A–D.
   Deterministic: the same question always shuffles the same way. */
function shuffleOptions(question: string, options: string[], answerIndex: number) {
  let h = 2166136261;
  for (const ch of question) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  const rand = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 3266489909) >>> 0;
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
  const order = options.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return { options: order.map((i) => options[i]), answerIndex: order.indexOf(answerIndex) };
}

/* ---------- tests (question banks) ---------- */
const tests = ALL_TESTS.map((t, i) => ({
  id: i + 1,
  code: t.code,
  title: t.title,
  category: t.category,
  department: t.department,
  level: t.level,
  levels: t.levels ?? [t.level],
  semester: t.semester ?? "",
  durationMin: t.durationMin,
  description: t.description,
  questions: t.questions.map(([question, options, answerIndex, explanation]) => ({
    question,
    ...shuffleOptions(question, options, answerIndex),
    explanation,
  })),
}));
console.log("tests:", tests.length, "questions:", tests.reduce((a, t) => a + t.questions.length, 0));

/* ---------- lectures + news ---------- */
const lectures = seedLectures().map((l, i) => ({
  id: i + 1,
  ...l,
  scheduledAt: l.scheduledAt.toISOString(),
}));
const news = seedNews.map((n, i) => ({
  id: i + 1,
  ...n,
  createdAt: new Date(Date.now() - (i + 1) * 36e5 * 9).toISOString(),
}));

if (!DATA_ONLY) writeFileSync(
  path.join(ROOT, "data", "content.js"),
  "/* Generated content for the Prince Learning Hub static site. */\nwindow.PLH = window.PLH || {};\nwindow.PLH.data = " +
    JSON.stringify({ news, lectures, materials }) +
    ";\n",
);
writeFileSync(
  path.join(ROOT, "data", "questions.js"),
  "/* Generated CBT question banks. */\nwindow.PLH = window.PLH || {};\nwindow.PLH.tests = " + JSON.stringify(tests) + ";\n",
);
console.log("data files written");
}

main().catch((e) => { console.error(e); process.exit(1); });
