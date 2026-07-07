function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return { year: y, month: m, day: d };
}

function getDayOfWeek(year, month, day) {
  return new Date(year, month - 1, day).getDay();
}

function formatDate(year, month, day) {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function getWeekStart(year, month, day) {
  const dow = getDayOfWeek(year, month, day);
  const diff = day - dow + (dow === 0 ? -6 : 1);
  return formatDate(year, month, diff);
}

export function aggregateTransactions(transactions, period) {
  if (!transactions || transactions.length === 0) return [];

  const isWeekly = period === 'week';
  const groups = {};

  for (const t of transactions) {
    const { year, month, day } = parseDate(t.date);
    const key = isWeekly ? getWeekStart(year, month, day) : t.date;

    if (!groups[key]) {
      groups[key] = { period: key, count: 0, revenue: 0 };
    }

    groups[key].count += 1;
    groups[key].revenue += t.amount || 0;
  }

  return Object.values(groups).sort((a, b) =>
    a.period.localeCompare(b.period)
  );
}