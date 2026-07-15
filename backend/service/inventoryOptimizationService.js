// Inventory Optimization Service
// Classifies each inventory item into one of:
// Star Performer - frequently rented AND high revenue
// Slow Mover - low but steady movement
// Dead Stock - no activity for a configurable number of days


export const DEFAULT_THRESHOLDS = {
  starMinRentals: 10, // rentals needed to be considered a "Star"
  starMinRevenue: 5000, // total revenue needed to be considered a "Star"
  slowMinRentals: 1, // minimum rentals to count as "Slow Mover" (steady)
  deadDays: 90, // no activity for this many days => "Dead Stock"
};

function toDate(value) {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

function daysSince(dateValue, now) {
  const d = toDate(dateValue);
  if (!d || isNaN(d.getTime())) return Infinity;
  const ms = now.getTime() - d.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function classifyItem(item, thresholds = {}, now = new Date()) {
  const t = { ...DEFAULT_THRESHOLDS, ...thresholds };
  const rentalCount = item.rentalCount ?? 0;
  const revenue = item.revenue ?? 0;

  if (daysSince(item.lastActivity, now) > t.deadDays) {
    return 'Dead Stock';
  }

  if (rentalCount >= t.starMinRentals && revenue >= t.starMinRevenue) {
    return 'Star Performer';
  }

  if (rentalCount >= t.slowMinRentals) {
    return 'Slow Mover';
  }

  return 'Dead Stock';
}

export function classifyInventory(items = [], thresholds = {}, now = new Date()) {
  return items.map(item => ({
    id: item.id,
    name: item.name,
    category: item.category,
    classification: classifyItem(item, thresholds, now),
  }));
}

export default {
  classifyInventory,
  classifyItem,
  DEFAULT_THRESHOLDS,
};
