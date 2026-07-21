import {
  AreaChart, Area,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Acceptance Criteria: Hardcoded example data for Revenue
const hardcodedRevenueData = [
  { month: 'Jan', revenue: 4000 },
  { month: 'Feb', revenue: 3000 },
  { month: 'Mar', revenue: 5000 },
  { month: 'Apr', revenue: 2780 },
  { month: 'May', revenue: 1890 },
  { month: 'Jun', revenue: 2390 },
];

// Acceptance Criteria: Hardcoded example data for Demand Forecasting (SMA)
// Note: Future months lack 'actualDemand' to simulate projections
const hardcodedForecastData = [
  { month: 'Jan', actualDemand: 45, projectedSMA: 40 },
  { month: 'Feb', actualDemand: 52, projectedSMA: 46 },
  { month: 'Mar', actualDemand: 61, projectedSMA: 53 },
  { month: 'Apr', actualDemand: 48, projectedSMA: 55 },
  { month: 'May', actualDemand: null, projectedSMA: 60 }, // Future Projection
  { month: 'Jun', actualDemand: null, projectedSMA: 65 }, // Future Projection
];

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
      <p className="text-emerald-600">
        Actual Demand: {point.actualDemand != null ? point.actualDemand : '—'}
      </p>
      <p className="text-amber-600">
        Projected (SMA): {point.projectedSMA != null ? point.projectedSMA : '—'}
      </p>
    </div>
  );
};

const AnalyticsDashboard = ({ revenueData = hardcodedRevenueData, forecastData = hardcodedForecastData }) => {
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
        <div className="w-full p-6 border border-gray-100 rounded-2xl shadow-sm bg-white revenue-chart-container">
          <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Revenue Trends</h2>
                <p className="text-xs text-gray-400 mt-0.5">Revenue for {currentMonth} (PHP)</p>
              </div>
              <span className="text-2xl font-bold text-rose-600">
                {fmtPHP(currentMonthRevenue)}
              </span>
          </div>
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
      )}

      {/* --- Demand Forecasting SMA Chart (Line) --- */}
      {hasForecast && (
        <div className="w-full p-6 border border-gray-100 rounded-2xl shadow-sm bg-white forecast-chart-container">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-800">Demand Forecasting (SMA)</h2>
            <p className="text-xs text-gray-400 mt-0.5">Actual vs. projected rental demand</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={normalizedForecast} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} width={36} />
              <Tooltip content={<ForecastTooltip />} />
              <Legend verticalAlign="top" height={28} iconType="plainline" wrapperStyle={{ fontSize: 12 }} />
              {/* connectNulls ensures the line doesn't break if a month is missing actual data */}
              <Line type="monotone" dataKey="actualDemand" stroke="#10b981" name="Actual Demand" strokeWidth={3} dot={{ r: 3 }} connectNulls />
              {/* Dashed line to represent mathematical projection */}
              <Line type="monotone" dataKey="projectedSMA" stroke="#f59e0b" name="Projected Demand (SMA)" strokeDasharray="5 5" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
