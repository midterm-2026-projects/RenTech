import { query } from '../config/database.js';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MIGRATIONS_TABLE = '_migrations';

async function ensureMigrationsTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function getApplied() {
  const rows = await query(`SELECT name FROM ${MIGRATIONS_TABLE} ORDER BY id ASC;`);
  const list = Array.isArray(rows) ? rows : (rows && rows.data) || [];
  return list.map(r => r.name);
}

function listMigrationFiles() {
  return readdirSync(__dirname)
    .filter(f => f.toLowerCase().endsWith('.sql'))
    .sort();
}

export async function runMigrations() {
  await ensureMigrationsTable();
  const applied = await getApplied();
  const files = listMigrationFiles();

  const ran = [];
  const skipped = [];

  for (const file of files) {
    if (applied.includes(file)) {
      skipped.push(file);
      continue;
    }
    const sql = readFileSync(join(__dirname, file), 'utf8');
    await query(sql);
    const safe = file.replace(/'/g, "''");
    await query(
      `INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES ('${safe}') ON CONFLICT (name) DO NOTHING;`
    );
    ran.push(file);
  }

  return { ran, skipped, applied: [...applied, ...ran] };
}

export default { runMigrations };
