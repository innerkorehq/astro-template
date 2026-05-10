/**
 * scripts/db-init.ts
 *
 * Drops and recreates site.db with schema + seed data.
 * Run:
 *   npm run db:init    — create/reset site.db
 *   npm run db:reset   — alias: delete then init
 */

import Database from 'better-sqlite3';
import { readFileSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname  = dirname(fileURLToPath(import.meta.url));
const ROOT       = join(__dirname, '..');
const DB_PATH    = join(ROOT, 'site.db');
const SCHEMA_SQL = join(ROOT, 'src/db/schema.sql');
const SEED_SQL   = join(ROOT, 'src/db/seed.sql');

for (const f of [DB_PATH, `${DB_PATH}-wal`, `${DB_PATH}-shm`]) {
  if (existsSync(f)) rmSync(f);
}
console.log('  🗑  Cleared site.db (+ WAL/SHM)');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
console.log('  ✓  Created site.db');

db.exec(readFileSync(SCHEMA_SQL, 'utf-8'));

const tables = (db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all() as { name: string }[])
  .map((r) => r.name);
console.log(`  ✓  Schema applied  (tables: ${tables.join(', ')})`);

db.exec(readFileSync(SEED_SQL, 'utf-8'));

const pages = db.prepare('SELECT path, status FROM page').all() as { path: string; status: string }[];
const menus = db.prepare('SELECT handle FROM menu').all() as { handle: string }[];
const items = db.prepare('SELECT COUNT(*) AS n FROM menu_item').get() as { n: number };
console.log(`  ✓  Seed applied`);
console.log(`       pages : ${pages.map((p) => `${p.path} (${p.status})`).join(', ')}`);
console.log(`       menus : ${menus.map((m) => m.handle).join(', ')} (${items.n} items)`);

console.log('\n  ✅  site.db ready\n');
