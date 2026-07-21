
import api from './analyticsApiClient';

// Generates a mock AI response based on the user's input and available data.
// Replace this with a real API call later.

export const generateResponse = (input, insights = [], suggestions = []) => {
  const lower = String(input ?? "").toLowerCase();

  if (lower.includes("insight")) {
    return insights?.length
      ? `Here are key insights: ${insights.slice(0, 2).map(String).join(", ")}`
      : "No insights available right now.";
  }

  if (lower.includes("suggest")) {
    return suggestions?.length
      ? `Customer suggestions include: ${suggestions.slice(0, 2).map(String).join(", ")}`
      : "No suggestions available right now.";
  }

  return "I can help you understand insights, customer feedback, or business recommendations. Try asking about insights or suggestions.";
};

// Builds plain-language, scannable insights from the raw analytics payload.
// Used as a graceful fallback when the generative AI endpoint is unavailable
// so the panel still surfaces something useful instead of raw JSON.
export function buildFallbackInsights({ kpis = {}, revenue = [], forecast = [] }) {
  const insights = [];

  const toNum = (v) => (v == null ? 0 : Number(v) || 0);
  const php = (v) => `₱${toNum(v).toLocaleString('en-PH')}`;

  if (revenue.length) {
    const sorted = [...revenue].sort((a, b) => toNum(b.value) - toNum(a.value));
    const total = revenue.reduce((sum, r) => sum + toNum(r.value), 0);
    const top = sorted[0];
    insights.push(
      `Total revenue for the period is ${php(total)}, peaking in ${top.period} at ${php(top.value)}.`
    );
  }

  if (kpis.inventory_utilization != null) {
    const u = toNum(kpis.inventory_utilization);
    insights.push(
      `Inventory utilization is at ${u}%, signalling ${u >= 80 ? 'strong' : u >= 50 ? 'steady' : 'soft'} demand — ${u >= 80 ? 'prioritise restocking best-sellers' : 'review slow-moving stock'}.`
    );
  }

  if (kpis.customer_satisfaction != null) {
    const s = toNum(kpis.customer_satisfaction);
    insights.push(
      `Customer satisfaction sits at ${s}%, a ${s >= 90 ? 'strong' : s >= 75 ? 'healthy' : 'needing-attention'} score to maintain.`
    );
  }

  if (kpis.overdue_returns != null) {
    const o = toNum(kpis.overdue_returns);
    insights.push(
      o > 0
        ? `There are ${o} overdue return${o === 1 ? '' : 's'} — follow up promptly to recover inventory.`
        : `No overdue returns — rental fulfilment is on track.`
    );
  }

  if (kpis.active_rentals != null) {
    insights.push(`You currently have ${toNum(kpis.active_rentals)} active rental${toNum(kpis.active_rentals) === 1 ? '' : 's'} in progress.`);
  }

  if (forecast.length) {
    const upcoming = forecast.filter((f) => f.forecast != null).slice(-3);
    if (upcoming.length) {
      const vals = upcoming.map((f) => toNum(f.forecast));
      insights.push(
        `Demand is projected to hold around ${Math.min(...vals)}–${Math.max(...vals)} rentals/month over the next few months.`
      );
    }
  }

  if (!insights.length) {
    insights.push('No analytics data is available yet — connect your rental activity to unlock insights.');
  }

  return insights;
}

export async function generateReport(data = {}) {
  try {
    const response = await api.post('/api/ai/insights', { kpis: data.kpis || data });
    return response.data;
  } catch {
    const kpis = data.kpis || {};
    const revenue = data.revenue || [];
    const forecast = data.forecast || [];

    const insights = buildFallbackInsights({ kpis, revenue, forecast });
    const report = ['Executive Summary', '', ...insights].join('\n\n');

    return { insights, suggestions: [], report };
  }
}