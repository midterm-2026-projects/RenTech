import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Discover every migration file on disk so this test stays correct as new
// migrations (002_, 003_, ...) are added.
const ALL_MIGRATIONS = readdirSync(join(__dirname, '../../migrations')).filter(
  (f) => f.toLowerCase().endsWith('.sql')
);

const state = vi.hoisted(() => ({ applied: [] }));

vi.mock('../../config/database.js', () => ({
  query: vi.fn(async (sql) => {
    if (typeof sql === 'string' && sql.includes('SELECT name FROM _migrations')) {
      return state.applied.map(name => ({ name }));
    }
    return [];
  }),
}));

import { query } from '../../config/database.js';
import { runMigrations } from '../../migrations/runner.js';

describe('migration runner', () => {
  beforeEach(() => {
    state.applied = [];
    query.mockClear();
  });

  it('creates the _migrations tracking table before anything else', async () => {
    await runMigrations();
    const firstCall = query.mock.calls[0][0];
    expect(firstCall).toContain('CREATE TABLE IF NOT EXISTS _migrations');
  });

  it('applies unapplied .sql files and records them', async () => {
    state.applied = [];
    const result = await runMigrations();

    expect(result.ran).toContain('001_analytics_schema.sql');
    expect(result.skipped).toEqual([]);

    const recorded = query.mock.calls.some(
      c => typeof c[0] === 'string' && c[0].includes("VALUES ('001_analytics_schema.sql')")
    );
    expect(recorded).toBe(true);
  });

  it('skips migrations that are already applied', async () => {
    // Mark every migration on disk as already applied.
    state.applied = [...ALL_MIGRATIONS];
    const result = await runMigrations();

    expect(result.ran).toEqual([]);
    expect(result.skipped).toEqual(expect.arrayContaining(['001_analytics_schema.sql']));

    const attempted = query.mock.calls.some(
      c => typeof c[0] === 'string' && c[0].includes("VALUES ('001_analytics_schema.sql')")
    );
    expect(attempted).toBe(false);
  });

  it('records each applied migration exactly once and yields applied list', async () => {
    const result = await runMigrations();
    expect(result.applied).toEqual(result.ran);
  });
});
