import { useState, useEffect, useCallback } from 'react';
import { ArrowRight, Receipt } from 'lucide-react';
import KPICards from './KPICards';
import DashboardCharts from './DashboardCharts';
import LoadingSkeleton from './LoadingSkeleton';
import { getAnalyticsDashboard } from '../services/analyticsApiClient';
import { getProducts, getTransactions } from '../services/inventoryApiClient';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
const fmtDate = (raw) => {
  if (!raw) return '—';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
const fmtPHP = (v) => `₱${toNum(v).toLocaleString('en-PH')}`;

const ACTIVE_STATUSES = ['Confirmed', 'Reserved', 'Overdue'];

const STATUS_STYLES = {
  Confirmed: 'bg-rose-100 text-rose-700',
  Reserved: 'bg-blue-100 text-blue-700',
  Overdue: 'bg-rose-200 text-rose-800',
  Completed: 'bg-blue-100 text-blue-700',
  Cancelled: 'bg-gray-100 text-gray-500',
  Returned: 'bg-rose-100 text-rose-700',
};

const LiveAdminDashboard = ({ onTabChange }) => {
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
      getProducts({ limit: 200 }),
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
    load();
  }, [load]);

  if (state.loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <LoadingSkeleton variant="card" count={5} loading />
        <LoadingSkeleton variant="chart" loading />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="w-full h-96 border border-gray-200 rounded-xl shadow-sm bg-white flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-red-500 font-medium text-sm sm:text-base text-center">
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

  const { summaries = [], projections = [], kpis = [] } = state.data || {};

  const kpiMap = {};
  kpis.forEach((k) => {
    kpiMap[k.kpi_name] = k.kpi_value;
  });

  const inventoryTotal = kpiMap['inventory_items'] != null
    ? toNum(kpiMap['inventory_items'])
    : (state.products?.total != null ? state.products.total : 0);
  const txs = state.transactions?.data || [];
  const hasTx = txs.length > 0;

  const totalRevenue = kpiMap['monthly_revenue'] != null
    ? toNum(kpiMap['monthly_revenue'])
    : txs.reduce((sum, t) => sum + (Number(t.totalCost) || 0), 0);
  const forecastRevenue = projections.reduce((sum, p) => sum + (Number(p.projected_revenue) || 0), 0);

  const activeRentals = kpiMap['active_rentals'] != null
    ? toNum(kpiMap['active_rentals'])
    : (hasTx ? txs.filter((t) => ACTIVE_STATUSES.includes(t.status)).length : 0);
  const reservations = kpiMap['reservations'] != null
    ? toNum(kpiMap['reservations'])
    : (hasTx ? txs.filter((t) => t.status === 'Reserved').length : 0);
  const overdueReturns = kpiMap['overdue_returns'] != null
    ? toNum(kpiMap['overdue_returns'])
    : (hasTx ? txs.filter((t) => t.status === 'Overdue').length : 0);

  const utilization = kpiMap['inventory_utilization'] != null
    ? toNum(kpiMap['inventory_utilization'])
    : (inventoryTotal ? Math.round((activeRentals / inventoryTotal) * 100) : 0);

  const bookingStatus = {
    confirmed: activeRentals - reservations - overdueReturns,
    reserved: reservations,
    overdue: overdueReturns,
  };

  const productRows = state.products?.data || [];
  const productStatusMap = productRows.reduce((acc, p) => {
    const key = p.status || 'Unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const productStatus = Object.entries(productStatusMap).map(([name, value]) => ({ name, value }));

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

  const recentTxs = [...txs]
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <KPICards metrics={metrics} />

      {hasData(state.data) ? (
        <DashboardCharts
          revenueData={revenueData}
          bookingStatus={bookingStatus}
          productStatus={productStatus}
        />
      ) : (
        <div className="w-full h-48 sm:h-80 border border-gray-200 rounded-xl shadow-sm bg-white flex items-center justify-center">
          <p className="text-sm sm:text-base text-gray-500 font-medium">
            No analytics data available
          </p>
        </div>
      )}

      <div className="border border-gray-200 rounded-xl shadow-sm bg-white">
        <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-4 sm:px-6 py-3 overflow-hidden rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 sm:p-1.5 rounded-lg bg-white/20">
                <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </span>
              <h2 className="text-sm sm:text-base font-bold text-white">Latest Transactions</h2>
            </div>
            <button
              onClick={() => onTabChange?.('transactions')}
              className="inline-flex items-center gap-1 text-sm text-rose-200 hover:text-white transition-colors shrink-0"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {recentTxs.length > 0 ? (
            recentTxs.map((tx) => (
              <div key={tx.id} className="px-4 sm:px-6 py-3.5 hover:bg-rose-50/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm sm:text-base font-medium text-gray-800 truncate">
                      {tx.username || 'Walk-in Customer'}
                    </p>
                    <p className="text-xs text-gray-400 truncate sm:hidden">
                      {tx.itemName || tx.item} · {fmtDate(tx.date)}
                    </p>
                  </div>
                  <p className="hidden sm:block text-xs sm:text-sm text-gray-400 truncate max-w-[160px]">
                    {tx.itemName || tx.item}
                  </p>
                  <p className="hidden sm:block text-xs sm:text-sm text-gray-400 w-20 sm:w-24 text-right shrink-0">
                    {fmtDate(tx.date)}
                  </p>
                  <span className={`text-xs sm:text-sm font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLES[tx.status] || 'bg-gray-100 text-gray-600'}`}>
                    {tx.status}
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-gray-800 w-20 sm:w-24 text-right shrink-0">
                    {fmtPHP(tx.totalCost)}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 sm:px-6 py-12 text-center text-sm sm:text-base text-gray-400">
              No transactions yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveAdminDashboard;
