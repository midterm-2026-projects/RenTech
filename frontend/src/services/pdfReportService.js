import { jsPDF } from 'jspdf';
import api from './analyticsApiClient';
import { generateReport, buildFallbackInsights } from './aiInsightsService';

// Matches the backend's error/configuration failure messages so we can fall
// back to locally-generated content instead of surfacing the raw message.
const isErrorReport = (text = '') =>
  /unable to generate|not configured|could not generate|no report generated/i.test(text);

// Loads the live analytics payload used for both the on-screen insights and
// the exported PDF report.
export async function loadAnalyticsPayload() {
  const kpisRes = await api.get('/api/analytics/kpis');
  const kpis = kpisRes.data || [];
  const summariesRes = await api.get('/api/analytics/summaries');
  const summaries = summariesRes.data || [];
  const forecastsRes = await api.get('/api/analytics/forecasts');
  const forecasts = forecastsRes.data || [];

  const kpiMap = {};
  kpis.forEach((k) => {
    kpiMap[k.kpi_name] = k.kpi_value;
  });

  const revenue = summaries
    .filter((s) => s.metric_name === 'revenue')
    .map((s) => ({ period: s.period, value: s.metric_value }));

  const forecast = forecasts.map((f) => ({
    month: f.forecast_date,
    forecast: f.forecast_value,
    actual: f.actual_value,
  }));

  return { kpis: kpiMap, revenue, forecast };
}

// Builds and downloads a properly formatted A4 analytics PDF report from the
// live analytics data. Falls back to locally-generated insights when the
// generative AI endpoint is unavailable so the export is never just an error.
export async function generateAnalyticsPdfReport() {
  const payload = await loadAnalyticsPayload();
  const result = await generateReport(payload);

  let reportText =
    (Array.isArray(result.insights)
      ? result.insights.join('\n\n')
      : result.insights) ||
    result.report ||
    '';

  // If the AI call failed or returned an error payload, build a proper
  // report locally so the exported PDF is never just an error string.
  if (!reportText.trim() || isErrorReport(reportText)) {
    reportText = buildFallbackInsights({
      kpis: payload.kpis,
      revenue: payload.revenue,
      forecast: payload.forecast,
    }).join('\n\n');
  }

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('RenTech Analytics Report', pageWidth / 2, y, { align: 'center' });
  y += 15;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, y, { align: 'center' });
  y += 12;

  const addSection = (title, content) => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 15, y);
    y += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const lines = doc.splitTextToSize(content, 180);
    doc.text(lines, 15, y);
    y += lines.length * 6 + 5;
  };

  // --- Executive KPI summary ---
  const kpiEntries = Object.entries(payload.kpis || {});
  if (kpiEntries.length > 0) {
    addSection(
      'Key Performance Indicators',
      kpiEntries.map(([k, v]) => `• ${k.replace(/_/g, ' ')}: ${v}`).join('\n')
    );
  }

  // --- Revenue summary ---
  const revenueRows = (payload.revenue || []).filter((r) => r.value != null);
  if (revenueRows.length > 0) {
    addSection(
      'Revenue Summary',
      revenueRows.map((r) => `• ${r.period}: ₱${Number(r.value).toLocaleString('en-PH')}`).join('\n')
    );
  }

  // --- Demand forecast summary ---
  const forecastRows = (payload.forecast || []).filter((f) => f.forecast != null);
  if (forecastRows.length > 0) {
    addSection(
      'Demand Forecast Summary',
      forecastRows
        .map((f) => {
          const actual = f.actual != null ? Number(f.actual).toLocaleString('en-PH') : '—';
          return `• ${f.month}: projected ${Number(f.forecast).toLocaleString('en-PH')} (actual ${actual})`;
        })
        .join('\n')
    );
  }

  // --- AI-generated insights / report ---
  if (reportText.trim()) {
    addSection('AI Business Insights', reportText.trim());
  }

  doc.save('rentech-analytics-report.pdf');
}
