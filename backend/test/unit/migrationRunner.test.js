import { describe, it, expect, vi, beforeEach } from 'vitest';

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
    state.applied = ['001_analytics_schema.sql'];
    const result = await runMigrations();

    expect(result.ran).toEqual([]);
    expect(result.skipped).toContain('001_analytics_schema.sql');

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
