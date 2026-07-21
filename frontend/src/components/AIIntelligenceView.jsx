import { useState, useEffect, useCallback } from 'react';
import { FileDown } from 'lucide-react';
import AnalyticsDashboard from './AnalyticsDashboard';
import AIBusinessInsights from './AIBusinessInsights';
import RevenueVsProjection from './RevenueVsProjection';
import LoadingSkeleton from './LoadingSkeleton';
import { getAnalyticsDashboard } from '../services/analyticsApiClient';
import { generateAnalyticsPdfReport } from '../services/pdfReportService';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const toMonthLabel = (value) => {
  if (value == null) return '';
  if (MONTHS.includes(value)) return value;
  const dt = new Date(value);
  if (isNaN(dt.getTime())) return String(value);
  return MONTHS[dt.getMonth()];
};

const monthIndex = (m) => {
  const i = MONTHS.indexOf(m);
  return i === -1 ? 99 : i;
};

// Objective 3 AI Intelligence view: demand/revenue charts plus the
// generative AI business insights, backed by the live analytics endpoints.
export default function AIIntelligenceView() {
  const [state, setState] = useState({ loading: true, error: null, data: null });
  const [exporting, setExporting] = useState(false);

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    getAnalyticsDashboard()
      .then((data) => setState({ loading: false, error: null, data }))
      .catch((err) =>
        setState({ loading: false, error: err?.message || 'Failed to load analytics', data: null })
      );
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      await generateAnalyticsPdfReport();
    } catch {
      alert('Failed to generate report. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  if (state.loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="chart" loading />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="w-full h-96 border border-gray-200 rounded-lg shadow-sm bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 font-medium">Unable to load analytics: {state.error}</p>
        <button
          onClick={load}
          className="px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-800"
        >
          Retry
        </button>
      </div>
    );
  }

  const { summaries = [], forecasts = [], projections = [] } = state.data || {};

  const revenueData = summaries
    .filter((s) => s.metric_name === 'revenue')
    .map((s) => ({ month: toMonthLabel(s.period), revenue: Number(s.metric_value) || 0 }))
    .sort((a, b) => monthIndex(a.month) - monthIndex(b.month));

  const forecastData = forecasts
    .map((f) => ({
      month: toMonthLabel(f.forecast_date || f.period),
      actualDemand: f.actual_value != null ? Number(f.actual_value) : null,
      projectedSMA: f.forecast_value != null ? Number(f.forecast_value) : null,
    }))
    .filter((f) => f.projectedSMA != null)
    .sort((a, b) => monthIndex(a.month) - monthIndex(b.month));

  const projectionData = projections
    .map((p) => ({
      month: toMonthLabel(p.projection_date || p.period),
      projected: Number(p.projected_revenue) || 0,
      actual: p.actual_revenue != null ? Number(p.actual_revenue) : null,
    }))
    .filter((p) => p.projected)
    .sort((a, b) => monthIndex(a.month) - monthIndex(b.month));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">AI Intelligence</h1>
          <p className="text-sm text-gray-400">Live analytics &amp; AI-generated business insights</p>
        </div>
        <button
          onClick={handleExportPdf}
          disabled={exporting}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <FileDown className="w-4 h-4" />
          <span>{exporting ? 'Exporting...' : 'Export PDF Report'}</span>
        </button>
      </div>

      <AnalyticsDashboard revenueData={revenueData} forecastData={forecastData} />
      <RevenueVsProjection revenueData={revenueData} projectionData={projectionData} />
      <AIBusinessInsights />
    </div>
  );
}
