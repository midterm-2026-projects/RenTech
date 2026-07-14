import { useState, useEffect, useCallback } from 'react';
import KPICards from './KPICards';
import AnalyticsDashboard from './AnalyticsDashboard';
import LoadingSkeleton from './LoadingSkeleton';
import { getAnalyticsDashboard } from '../services/analyticsApiClient';

const hasData = (d) =>
  Boolean(
    d &&
      (d.summaries?.length ||
        d.forecasts?.length ||
        d.kpis?.length ||
        d.projections?.length)
  );

const LiveAdminDashboard = () => {
  const [state, setState] = useState({ loading: true, error: null, data: null });

  const load = useCallback(() => {
    setState({ loading: true, error: null, data: null });
    getAnalyticsDashboard()
      .then((data) => setState({ loading: false, error: null, data }))
      .catch((err) =>
        setState({
          loading: false,
          error: err?.message || 'Failed to load analytics',
          data: null,
        })
      );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (state.loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton variant="card" count={5} loading />
        <LoadingSkeleton variant="chart" loading />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="w-full h-96 border rounded-lg shadow-sm bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 font-medium">
          Unable to load analytics: {state.error}
        </p>
        <button
          onClick={load}
          className="px-4 py-2 bg-gray-900 text-white rounded-full text-sm font-semibold hover:bg-gray-800"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!hasData(state.data)) {
    return (
      <div className="w-full h-96 border rounded-lg shadow-sm bg-white flex items-center justify-center">
        <p className="text-gray-500 font-medium text-lg">
          No analytics data available
        </p>
      </div>
    );
  }

  const { summaries = [], forecasts = [], projections = [] } = state.data;

  const revenueData = summaries.map((s) => ({
    month: s.period,
    revenue: Number(s.metric_value) || 0,
  }));

  const forecastData = forecasts.map((f) => ({
    month: String(f.forecast_date),
    actualDemand: f.actual_value != null ? Number(f.actual_value) : null,
    projectedSMA: Number(f.forecast_value) || 0,
  }));

  const totalRevenue = projections.reduce(
    (sum, p) => sum + (Number(p.projected_revenue) || 0),
    0
  );

  return (
    <div className="space-y-6">
      <KPICards
        metrics={{
          totalRevenue: `Php${totalRevenue.toFixed(2)}`,
          forecastRevenue: `Php${totalRevenue.toFixed(2)}`,
          inventoryItems: String(summaries.length),
        }}
      />
      <AnalyticsDashboard revenueData={revenueData} forecastData={forecastData} />
    </div>
  );
};

export default LiveAdminDashboard;
