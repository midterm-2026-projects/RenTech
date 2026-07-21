
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

export async function generateReport(data = {}) {
  try {
    const response = await api.post('/api/ai/insights', { kpis: data.kpis || data });
    return response.data;
  } catch {
    const kpis = data.kpis || {};
    const revenue = data.revenue || [];
    const forecast = data.forecast || [];

    const kpiLines = Object.entries(kpis).map(([k, v]) => `${k}: ${v}`).join('\n');
    const revenueLines = revenue.map(r => `${r.period}: ${r.value}`).join('\n');
    const forecastLines = forecast.map(f => `${f.month}: actual=${f.actual || 'N/A'}, forecast=${f.forecast}`).join('\n');

    return {
      insights: [`KPI Overview:\n${kpiLines || 'No KPIs available'}\n\nRevenue:\n${revenueLines || 'No revenue data'}\n\nForecast:\n${forecastLines || 'No forecast data'}`],
      suggestions: [],
      report: `Executive Summary\n\nBusiness metrics for the period are as follows.\n\nKey Performance Indicators\n${kpiLines || 'No KPI data available'}\n\nRevenue Analysis\n${revenueLines || 'No revenue data available'}\n\nDemand Forecast\n${forecastLines || 'No forecast data available'}`
    };
  }
}