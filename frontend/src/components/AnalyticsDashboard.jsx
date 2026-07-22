import { TrendingUp, BarChart3 } from 'lucide-react';
import {
  AreaChart, Area,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const fmtPHP = (value) =>
  `₱${Number(value || 0).toLocaleString('en-PH')}`;

const RevenueTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-rose-600">Revenue: {fmtPHP(point.revenue)}</p>
    </div>
  );
};

const ForecastTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md text-xs space-y-0.5">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-rose-600">
        Actual Demand: {point.actualDemand != null ? point.actualDemand : '—'}
      </p>
      <p className="text-blue-600">
        Projected (SMA): {point.projectedSMA != null ? point.projectedSMA : '—'}
      </p>
    </div>
  );
};

const AnalyticsDashboard = ({ revenueData = [], forecastData = [] }) => {
  const normalizedRevenue = (revenueData || []).map((d) => ({
    month: d.month,
    revenue: Number(d.revenue) || 0,
  }));

  const normalizedForecast = (forecastData || []).map((d) => ({
    month: d.month,
    actualDemand: d.actualDemand != null ? Number(d.actualDemand) : null,
    projectedSMA: d.projectedSMA != null ? Number(d.projectedSMA) : null,
  }));

  const hasRevenue = normalizedRevenue.length > 0;
  const hasForecast = normalizedForecast.length > 0;

  // Headline figure: show the current month's revenue, not the all-time sum.
  const currentMonth = MONTHS[new Date().getMonth()];
  const currentMonthPoint = normalizedRevenue.find((d) => d.month === currentMonth);
  const currentMonthRevenue = currentMonthPoint
    ? currentMonthPoint.revenue
    : normalizedRevenue.length
      ? normalizedRevenue[normalizedRevenue.length - 1].revenue
      : 0;

  // Acceptance Criteria: If all data is empty, show "No data available" message instead of a broken view
  if (!hasRevenue && !hasForecast) {
    return (
      <div className="w-full h-96 border border-gray-200 rounded-2xl shadow-sm bg-white flex items-center justify-center">
        <p className="text-gray-500 font-medium text-lg">No data available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* --- Revenue Trends Chart (Area) --- */}
      {hasRevenue && (
        <div className="w-full border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden revenue-chart-container">
          <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-white" />
                <h2 className="text-sm font-bold text-white">Revenue Trends</h2>
              </div>
              <span className="text-lg font-bold text-white">
                {fmtPHP(currentMonthRevenue)}
              </span>
            </div>
            <p className="text-xs text-rose-200 mt-0.5">Revenue for {currentMonth} (PHP)</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={normalizedRevenue} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tickFormatter={(v) => `₱${v}`} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} width={64} />
                <Tooltip content={<RevenueTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#e11d48" strokeWidth={3} fill="url(#revFill)" name="Monthly Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* --- Demand Forecasting SMA Chart (Line) --- */}
      {hasForecast && (
        <div className="w-full border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden forecast-chart-container">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-white" />
              <h2 className="text-sm font-bold text-white">Demand Forecasting (SMA)</h2>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">Actual vs. projected rental demand</p>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={normalizedForecast} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} width={36} />
                <Tooltip content={<ForecastTooltip />} />
                <Legend verticalAlign="top" height={28} iconType="plainline" wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="actualDemand" stroke="#e11d48" name="Actual Demand" strokeWidth={3} dot={{ r: 3 }} connectNulls />
                <Line type="monotone" dataKey="projectedSMA" stroke="#3b82f6" name="Projected Demand (SMA)" strokeDasharray="5 5" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
