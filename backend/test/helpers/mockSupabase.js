export function buildSupabase(mockRows = []) {
  let filters = [];
  let currentEq = null;
  let insertTable = null;
  const state = { rows: [...mockRows] };
  const q = {
    from: (t) => { insertTable = t; return q; },
    select: () => q,
    ilike: (col, val) => { filters.push({ type: 'ilike', col, val }); return q; },
    in: (col, vals) => { filters.push({ type: 'in', col, vals }); return q; },
    eq: (col, val) => { currentEq = { col, val }; filters.push({ type: 'eq', col, val }); return q; },
    order: () => q,
    range: () => q,
    or: () => q,
    neq: () => q,
    upsert: async ({ key, value }) => { return { error: null }; },
    maybeSingle: async () => {
      if (currentEq) {
        const found = state.rows.find(r => r[currentEq.col] === currentEq.val);
        currentEq = null;
        return { data: found || null, error: null };
      }
      return { data: null, error: null };
    },
    insert: async (rows) => { const r = Array.isArray(rows) ? rows[0] : rows; if (r) state.rows.push(r); return { error: null }; },
    delete: () => q,
    then: (fn) => {
      const f = filters.splice(0);
      let results = [...state.rows];
      for (const f2 of f) {
        if (f2.type === 'ilike') {
          const pattern = f2.val.replace(/%/g, '').toLowerCase();
          results = results.filter(r => String(r[f2.col] || '').toLowerCase().includes(pattern));
        }
        if (f2.type === 'eq') results = results.filter(r => r[f2.col] === f2.val);
        if (f2.type === 'in') results = results.filter(r => f2.vals.includes(r[f2.col]));
      }
      return Promise.resolve({ data: results, error: null, count: results.length }).then(fn);
    },
  };
  return q;
}

export function mockGetSupabase(rows) {
  return () => buildSupabase(rows);
}
