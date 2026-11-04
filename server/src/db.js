import { readFile, writeFile, rename, copyFile, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
// DB_FILE lets the tests use their own copy instead of the real data.
const DB_FILE = process.env.DB_FILE ?? path.join(here, "..", "data", "db.json");
const SEED_FILE = path.join(here, "..", "data", "seed.json");

async function ensureFile() {
  try {
    await access(DB_FILE);
  } catch {
    await copyFile(SEED_FILE, DB_FILE);
  }
}

export async function readDb() {
  await ensureFile();
  return JSON.parse(await readFile(DB_FILE, "utf8"));
}

// All changes go through this queue one at a time. Without it, two requests that
// arrive together could both read the old stock and both "succeed".
let queue = Promise.resolve();

export function updateDb(change) {
  const run = queue.then(async () => {
    const data = await readDb();
    const result = change(data);
    // Write to a temporary file first, then rename: a crash mid-write cannot leave half a file.
    const tmp = `${DB_FILE}.tmp`;
    await writeFile(tmp, JSON.stringify(data, null, 2));
    await rename(tmp, DB_FILE);
    return result;
  });
  queue = run.catch(() => {});
  return run;
}
