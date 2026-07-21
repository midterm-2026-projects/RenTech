import 'dotenv/config';
import { query } from '../config/database.js';
import { randomUUID } from 'crypto';
import { pathToFileURL } from 'url';

// Small deterministic PRNG so seed data is reproducible across runs.
function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const run = async (sql, params = []) => {
  const r = await query(sql, params);
  return Array.isArray(r) ? r : (r?.data ?? []);
};

// Insert many rows in a single statement: batchInsert('t', ['a','b'], [[1,2],[3,4]])
const batchInsert = async (table, columns, rows) => {
  if (rows.length === 0) return;
  const cols = columns.join(', ');
  const params = [];
  const valueRows = rows.map((row, ri) => {
    const placeholders = row.map((_, ci) => `$${ri * row.length + ci + 1}`);
    row.forEach((v) => params.push(v));
    return `(${placeholders.join(', ')})`;
  });
  const sql = `INSERT INTO ${table} (${cols}) VALUES ${valueRows.join(', ')}`;
  await query(sql, params);
};

async function populateTestData() {
  try {
    console.log('Populating realistic test data...');

    const YEAR = 2026;
    const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const months = MONTH_LABELS.map((label, i) => ({
      idx: i,
      label,
      key: `${YEAR}-${String(i + 1).padStart(2, '0')}`,
    }));

    // ---- 1. Inventory items (mirror of the product catalog) ----
    const INVENTORY = [
      { name: 'Emerald Silk Mermaid Evening Gown', category: 'GOWN', price: 4500 },
      { name: 'A-Line Ivory Lace Wedding Gown', category: 'GOWN', price: 7500 },
      { name: 'Midnight Black Peak Lapel Tuxedo', category: 'SUIT', price: 3800 },
      { name: 'Modern Charcoal Grey Slim Suit', category: 'SUIT', price: 3200 },
      { name: 'Royal Blue Velvet Blazer', category: 'SUIT', price: 3500 },
      { name: 'Blush Pink Chiffon Bridesmaid Dress', category: 'GOWN', price: 2800 },
      { name: 'Vintage Gatsby Sequin Dress', category: 'GOWN', price: 5200 },
      { name: 'Classic White Wingtip Dress Shoes', category: 'ACCESSORY', price: 1200 },
      { name: 'Crystal Statement Clutch', category: 'ACCESSORY', price: 1500 },
      { name: 'Floral Embroidered Summer Dress', category: 'GOWN', price: 2400 },
      { name: 'Burgundy Velvet Tuxedo', category: 'SUIT', price: 4000 },
      { name: 'Diamond Beaded Evening Gloves', category: 'ACCESSORY', price: 900 },
    ];

    // ---- Clear existing rows (child tables first to respect FKs) ----
    await query('DELETE FROM inventory_metrics');
    await query('DELETE FROM rentals');
    await query('DELETE FROM reservations');
    await query('DELETE FROM bookings');
    await query('DELETE FROM transactions');
    await query('DELETE FROM analytics_summaries');
    await query('DELETE FROM forecasts');
    await query('DELETE FROM kpi_storage');
    await query('DELETE FROM revenue_projections');
    await query('DELETE FROM inventory_items');

    // ---- Insert inventory items (explicit UUIDs so FK links don't depend on a SELECT round-trip) ----
    const invIds = INVENTORY.map(() => randomUUID());
    const idByName = {};
    INVENTORY.forEach((it, i) => { idByName[it.name] = invIds[i]; });
    await batchInsert(
      'inventory_items',
      ['id', 'name', 'category', 'price', 'image', 'status'],
      INVENTORY.map((it, i) => [invIds[i], it.name, it.category, it.price, it.image ?? null, it.status ?? 'Available'])
    );

    const rng = makeRng(20260621);
    const pick = (arr) => arr[Math.floor(rng() * arr.length)];

    // Popularity weights (index into INVENTORY)
    const POPULAR = [9, 7, 8, 6, 4, 5, 3, 2, 2, 1, 3, 1];
    const totalPop = POPULAR.reduce((a, b) => a + b, 0);
    const pickPopular = () => {
      let r = rng() * totalPop;
      for (let i = 0; i < INVENTORY.length; i++) {
        if (r < POPULAR[i]) return INVENTORY[i];
        r -= POPULAR[i];
      }
      return INVENTORY[0];
    };

    // ---- 2. Rentals (realized demand + revenue), Jan-Jul 2026 ----
    const monthlyRentalPlan = [12, 10, 14, 11, 16, 13, 9]; // none for Aug-Dec yet
    const rentals = [];
    months.forEach(({ idx, key }) => {
      const count = monthlyRentalPlan[idx] || 0;
      for (let i = 0; i < count; i++) {
        const item = pickPopular();
        const day = 1 + Math.floor(rng() * 27);
        const date = `${key}-${String(day).padStart(2, '0')}`;
        const amount = Math.round(item.price * (0.9 + rng() * 0.2));
        rentals.push({ name: item.name, date, amount });
      }
    });

    const rentalRows = rentals.map((r) => [idByName[r.name], r.date, r.amount]);
    await batchInsert('rentals', ['inventory_id', 'rental_date', 'amount'], rentalRows);

    // Aggregate monthly revenue & demand from the real rentals
    const monthlyRevenue = {};
    const monthlyDemand = {};
    rentals.forEach((r) => {
      const mk = r.date.slice(0, 7);
      monthlyRevenue[mk] = (monthlyRevenue[mk] || 0) + r.amount;
      monthlyDemand[mk] = (monthlyDemand[mk] || 0) + 1;
    });

    // ---- 3. Reservations (future holds), Jul-Sep 2026 ----
    const reservations = [];
    for (let i = 0; i < 15; i++) {
      const item = pickPopular();
      const monthOffset = 6 + Math.floor(rng() * 3); // Jul(6)..Sep(8)
      const day = 1 + Math.floor(rng() * 27);
      const key = `${YEAR}-${String(monthOffset + 1).padStart(2, '0')}`;
      reservations.push({ name: item.name, date: `${key}-${String(day).padStart(2, '0')}` });
    }
    const reservationRows = reservations.map((r) => [idByName[r.name], r.date]);
    await batchInsert('reservations', ['inventory_id', 'reservation_date'], reservationRows);

    // ---- 4. Bookings (customer submissions) ----
    const NAMES = ['Maria Santos', 'John Reyes', 'Ana Cruz', 'Liza Galvez', 'Mark Dela Cruz',
      'Sophia Reyes', 'Gabriel Mendoza', 'Patricia Lopez', 'Daniel Ramos', 'Camille Torres',
      'Paolo Garcia', 'Riza Bautista'];
    const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
    const BOOKING_STATUS = ['Confirmed', 'Pending', 'Completed', 'Returned', 'Overdue'];
    const bookings = [];
    for (let i = 0; i < 20; i++) {
      const item = pick(INVENTORY);
      const type = i % 2 === 0 ? 'Rental' : 'Reservation';
      // weight toward Confirmed/Completed, a couple Overdue
      const status = i % 9 === 0 ? 'Overdue' : pick(['Confirmed', 'Completed', 'Returned', 'Pending', 'Confirmed']);
      const monthOffset = 4 + Math.floor(rng() * 4); // May..Aug
      const day = 1 + Math.floor(rng() * 27);
      const key = `${YEAR}-${String(monthOffset + 1).padStart(2, '0')}`;
      bookings.push([
        `BK-${String(1001 + i)}`,
        item.name,
        item.price,
        type,
        pick(NAMES),
        `09${String(100 + Math.floor(rng() * 899))}`,
        `${pick(['Manila', 'Quezon City', 'Makati', 'Cebu'])}`,
        'Please deliver before 5pm.',
        `${key}-${String(day).padStart(2, '0')}`,
        pick(SIZES),
        status,
      ]);
    }
    await batchInsert(
      'bookings',
      ['id', 'item_name', 'total_price', 'booking_type', 'full_name', 'phone_number', 'address', 'special_notes', 'rental_date', 'size_selected', 'status'],
      bookings
    );
    const overdueCount = bookings.filter((b) => b[10] === 'Overdue').length;

    // ---- 5. Transactions (logbook) ----
    const TXN_STATUS = ['Reserved', 'Confirmed', 'Completed', 'Cancelled', 'Overdue'];
    const transactions = [];
    for (let i = 0; i < 25; i++) {
      const item = pick(INVENTORY);
      const status = i % 7 === 0 ? 'Overdue' : pick(['Reserved', 'Confirmed', 'Completed', 'Cancelled']);
      const monthOffset = Math.floor(rng() * 7); // Jan..Jul
      const day = 1 + Math.floor(rng() * 27);
      const key = `${YEAR}-${String(monthOffset + 1).padStart(2, '0')}`;
      transactions.push([
        `TXN-${String(2001 + i)}`,
        item.name,
        `${key}-${String(day).padStart(2, '0')}`,
        status,
        String(item.price),
      ]);
    }
    await batchInsert(
      'transactions',
      ['id', 'item', 'date', 'status', 'amount'],
      transactions
    );

    // ---- 6. analytics_summaries (monthly revenue + operating cost) ----
    const summaryRows = [];
    months.slice(0, 7).forEach(({ key, label }) => {
      const rev = monthlyRevenue[key] || 0;
      summaryRows.push(['revenue', rev, label]);
      summaryRows.push(['operating_cost', Math.round(rev * 0.35), label]);
    });
    await batchInsert('analytics_summaries', ['metric_name', 'metric_value', 'period'], summaryRows);

    // ---- 7. forecasts (DEMAND: actual = rental counts, projected = SMA) ----
    const actualDemand = months.map(({ key }) =>
      key in monthlyDemand ? monthlyDemand[key] : null
    );
    const trailingAvg = (arr, i, win = 3) => {
      let s = 0, c = 0;
      for (let k = Math.max(0, i - win + 1); k <= i; k++) {
        if (arr[k] != null) { s += arr[k]; c++; }
      }
      return c ? s / c : 0;
    };
    const demandForecast = actualDemand.map((_, i) => {
      if (i < 7) return Math.round(trailingAvg(actualDemand, i));
      const base = trailingAvg(actualDemand, 6);
      return Math.round(base * Math.pow(1.03, i - 6));
    });
    const forecastRows = months.map(({ key }, i) => [
      `${key}-01`,
      demandForecast[i],
      actualDemand[i],
      'sma',
    ]);
    await batchInsert('forecasts', ['forecast_date', 'forecast_value', 'actual_value', 'model'], forecastRows);

    // ---- 8. revenue_projections (FINANCIAL: projected + confidence + actual) ----
    const actualRev = months.map(({ key }) =>
      key in monthlyRevenue ? monthlyRevenue[key] : null
    );
    const revForecast = actualRev.map((_, i) => {
      if (i < 7) return Math.round(trailingAvg(actualRev, i));
      const base = trailingAvg(actualRev, 6);
      return Math.round(base * Math.pow(1.03, i - 6));
    });
    const projectionRows = months.map(({ key }, i) => [
      `${key}-01`,
      revForecast[i],
      actualRev[i],
      Math.round(revForecast[i] * 0.9),
      Math.round(revForecast[i] * 1.1),
    ]);
    await batchInsert(
      'revenue_projections',
      ['projection_date', 'projected_revenue', 'actual_revenue', 'confidence_lower', 'confidence_upper'],
      projectionRows
    );

    // ---- 9. kpi_storage ----
    const rentedItemNames = new Set(rentals.map((r) => r.name));
    const utilization = Math.round((rentedItemNames.size / INVENTORY.length) * 100);
    const kpiRows = [
      ['active_rentals', monthlyDemand[`${YEAR}-07`] || 0, 'current'],
      ['overdue_returns', overdueCount, 'current'],
      ['inventory_utilization', utilization, 'current'],
      ['customer_satisfaction', 94, 'current'],
    ];
    months.slice(0, 7).forEach(({ key, label }) => {
      kpiRows.push(['monthly_revenue', monthlyRevenue[key] || 0, label]);
    });
    await batchInsert('kpi_storage', ['kpi_name', 'kpi_value', 'period'], kpiRows);

    console.log('Test data populated successfully!');

    // ---- Verify ----
    const tables = ['inventory_items', 'rentals', 'reservations', 'bookings', 'transactions',
      'analytics_summaries', 'forecasts', 'kpi_storage', 'revenue_projections'];
    for (const t of tables) {
      const res = await run(`SELECT COUNT(*) as count FROM ${t}`);
      const count = res[0]?.count ?? res[0]?.data?.[0]?.count ?? 0;
      console.log(`${t}: ${count} rows`);
    }

    return true;
  } catch (error) {
    console.error('Failed to populate test data:', error.message);
    throw error;
  }
}

export async function runPopulateDataCLI() {
  try {
    await populateTestData();
    process.exit(0);
  } catch (error) {
    console.error('Populate data failed:', error.message);
    process.exit(1);
  }
}

export default { populateTestData, runPopulateDataCLI };

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runPopulateDataCLI();
}
