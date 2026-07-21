import { useState, useEffect, useCallback } from 'react';
import KPICards from './KPICards';
import AnalyticsDashboard from './AnalyticsDashboard';
import ReportExport from './ReportExport';
import LoadingSkeleton from './LoadingSkeleton';
import AIBusinessInsights from './AIBusinessInsights';
import { getAnalyticsDashboard } from '../services/analyticsApiClient';
import { getProducts, getTransactions } from '../services/inventoryApiClient';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Normalizes a period/date value into a short month label ("Jan", "Mar", ...).
// Handles already-short labels, "YYYY-MM-DD" strings, and Date objects.
const toMonthLabel = (value) => {
  if (value == null) return '';
  if (MONTHS.includes(value)) return value;
  const dt = new Date(value);
  if (isNaN(dt.getTime())) return String(value);
  return MONTHS[dt.getMonth()];
};

const hasData = (d) =>
  Boolean(
    d &&
      (d.summaries?.length ||
        d.forecasts?.length ||
        d.kpis?.length ||
        d.projections?.length)
  );

const toNum = (v) => (v == null ? 0 : Number(v) || 0);

const ACTIVE_STATUSES = ['Confirmed', 'Reserved', 'Overdue'];

const LiveAdminDashboard = () => {
  const [state, setState] = useState({
    loading: true,
    error: null,
    data: null,
    products: null,
    transactions: null,
  });

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.allSettled([
      getAnalyticsDashboard(),
      getProducts({ limit: 1 }),
      getTransactions({ limit: 200 }),
    ])
      .then(([analyticsRes, productsRes, txRes]) => {
        if (analyticsRes.status === 'rejected') {
          setState({
            loading: false,
            error: analyticsRes.reason?.message || 'Failed to load analytics',
            data: null,
            products: null,
            transactions: null,
          });
          return;
        }
        const data = analyticsRes.value;
        const products = productsRes.status === 'fulfilled' ? productsRes.value : null;
        const transactions = txRes.status === 'fulfilled' ? txRes.value : null;
        setState({ loading: false, error: null, data, products, transactions });
      })
      .catch((err) =>
        setState({
          loading: false,
          error: err?.message || 'Failed to load analytics',
          data: null,
          products: null,
          transactions: null,
        })
      );
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      <div className="w-full h-96 border border-gray-200 rounded-lg shadow-sm bg-white flex flex-col items-center justify-center gap-4">
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

  const { summaries = [], forecasts = [], projections = [], kpis = [] } = state.data || {};

  // Real KPI values from the live inventory + transaction tables.
  const kpiMap = {};
  kpis.forEach((k) => {
    kpiMap[k.kpi_name] = k.kpi_value;
  });

  const inventoryTotal = state.products?.total != null ? state.products.total : toNum(kpiMap['inventory_items']);
  const txs = state.transactions?.data || [];
  const hasTx = txs.length > 0;

  const totalRevenue = txs.reduce((sum, t) => sum + (Number(t.totalCost) || 0), 0);
  const forecastRevenue = projections.reduce((sum, p) => sum + (Number(p.projected_revenue) || 0), 0);

  const activeRentals = hasTx
    ? txs.filter((t) => ACTIVE_STATUSES.includes(t.status)).length
    : toNum(kpiMap['active_rentals']);
  const reservations = hasTx
    ? txs.filter((t) => t.status === 'Reserved').length
    : toNum(kpiMap['reservations']);
  const overdueReturns = hasTx
    ? txs.filter((t) => t.status === 'Overdue').length
    : toNum(kpiMap['overdue_returns']);

  const utilization = inventoryTotal
    ? Math.round((activeRentals / inventoryTotal) * 100)
    : toNum(kpiMap['inventory_utilization']);

  const metrics = {
    totalRevenue: `₱${totalRevenue.toLocaleString()}`,
    forecastRevenue: `₱${forecastRevenue.toLocaleString()}`,
    inventoryItems: String(inventoryTotal),
    activeRentals: String(activeRentals),
    reservations: String(reservations),
    overdueReturns: String(overdueReturns),
    utilization: `${utilization}%`,
  };

  const monthIndex = (m) => {
    const i = MONTHS.indexOf(m);
    return i === -1 ? 99 : i;
  };

  const revenueData = summaries
    .filter((s) => s.metric_name === 'revenue')
    .map((s) => ({
      month: toMonthLabel(s.period),
      revenue: Number(s.metric_value) || 0,
    }))
    .sort((a, b) => monthIndex(a.month) - monthIndex(b.month));

  const forecastData = forecasts
    .map((f) => {
      const date = f.forecast_date || f.period;
      return {
        month: toMonthLabel(date),
        actualDemand: f.actual_value != null ? Number(f.actual_value) : null,
        projectedSMA: f.forecast_value != null ? Number(f.forecast_value) : null,
      };
    })
    .filter((f) => f.projectedSMA != null)
    .sort((a, b) => monthIndex(a.month) - monthIndex(b.month));

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Analytics Dashboard</h2>
        <KPICards metrics={metrics} />
      </section>

      {hasData(state.data) ? (
        <AnalyticsDashboard revenueData={revenueData} forecastData={forecastData} />
      ) : (
        <div className="w-full h-96 border border-gray-200 rounded-lg shadow-sm bg-white flex items-center justify-center">
          <p className="text-gray-500 font-medium text-lg">
            No analytics data available
          </p>
        </div>
      )}

      <AIBusinessInsights />

      <div className="flex justify-end">
        <ReportExport revenueData={revenueData} forecastData={forecastData} />
      </div>
    </div>
  );
};

export default LiveAdminDashboard;
