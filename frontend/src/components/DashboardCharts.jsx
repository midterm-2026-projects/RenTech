import { TrendingUp, CalendarCheck, Package } from 'lucide-react';
import {
  PieChart, Pie, Cell,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const fmtPHP = (value) => `₱${Number(value || 0).toLocaleString('en-PH')}`;

const STATUS_COLORS = {
  Confirmed: '#e11d48',
  Reserved: '#3b82f6',
  Overdue: '#be123c',
};

const INVENTORY_COLORS = {
  Available: '#e11d48',
  Rented: '#3b82f6',
  Overdue: '#be123c',
  Maintenance: '#1d4ed8',
};

const statusColor = (name, palette, fallback = '#94a3b8') =>
  palette[name] || fallback;

const StatusTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-gray-700">{point.name}</p>
      <p className="text-gray-600">{point.value} items</p>
    </div>
  );
};

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

const DashboardCharts = ({
  revenueData = [],
  bookingStatus = { confirmed: 0, reserved: 0, overdue: 0 },
  productStatus = [],
}) => {
  const normalizedRevenue = (revenueData || []).map((d) => ({
    month: d.month,
    revenue: Number(d.revenue) || 0,
  }));

  const pieData = [
    { name: 'Confirmed', value: Number(bookingStatus.confirmed) || 0 },
    { name: 'Reserved', value: Number(bookingStatus.reserved) || 0 },
    { name: 'Overdue', value: Number(bookingStatus.overdue) || 0 },
  ].filter((d) => d.value > 0);

  const inventoryData = (productStatus || []).filter((d) => d.value > 0);

  const hasRevenue = normalizedRevenue.length > 0;
  const hasBooking = pieData.length > 0;
  const hasInventory = inventoryData.length > 0;

  if (!hasRevenue && !hasBooking && !hasInventory) {
    return (
      <div className="w-full h-96 border border-gray-200 rounded-xl shadow-sm bg-white flex items-center justify-center">
        <p className="text-gray-500 font-medium text-lg">No analytics data available</p>
      </div>
    );
  }

  const visibleCount = [hasRevenue, hasBooking, hasInventory].filter(Boolean).length;
  const gridCols = visibleCount <= 2
    ? 'grid-cols-1 md:grid-cols-2'
    : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3';
  const singleColSpan = visibleCount === 1 ? 'md:col-span-2' : '';

  return (
    <div className={`grid ${gridCols} gap-5 sm:gap-6`}>
      {/* --- Revenue Trajectory (Line) --- */}
      {hasRevenue && (
        <div className={`w-full border border-gray-200 rounded-xl shadow-sm bg-white ${singleColSpan}`} data-testid="revenue-trajectory-chart">
          <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-4 sm:px-5 py-3 overflow-hidden rounded-t-xl">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              <h2 className="text-sm sm:text-base font-bold text-white">Revenue Trajectory</h2>
            </div>
            <p className="text-sm text-rose-200 mt-0.5">Monthly rental revenue</p>
          </div>
          <div className="p-4 sm:p-5">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={normalizedRevenue} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tickFormatter={(v) => `₱${v}`} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} width={64} />
                <Tooltip content={<RevenueTooltip />} />
                <Line type="monotone" dataKey="revenue" stroke="#e11d48" strokeWidth={3} dot={{ r: 3 }} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* --- Booking Status (Pie) --- */}
      {hasBooking && (
        <div className={`w-full border border-gray-200 rounded-xl shadow-sm bg-white ${singleColSpan}`} data-testid="booking-status-chart">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 sm:px-5 py-3 overflow-hidden rounded-t-xl">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              <h2 className="text-sm sm:text-base font-bold text-white">Booking Status</h2>
            </div>
            <p className="text-sm text-blue-200 mt-0.5">Distribution of rental states</p>
          </div>
          <div className="p-4 sm:p-5 pb-8 sm:pb-7">
            <ResponsiveContainer width="100%" height={340}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={2}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={statusColor(entry.name, STATUS_COLORS)} />
                  ))}
                </Pie>
                <Tooltip content={<StatusTooltip />} />
                <Legend verticalAlign="bottom" height={48} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* --- Inventory by Status (Pie) --- */}
      {hasInventory && (
        <div className={`w-full border border-gray-200 rounded-xl shadow-sm bg-white ${singleColSpan}`} data-testid="inventory-status-chart">
          <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-4 sm:px-5 py-3 overflow-hidden rounded-t-xl">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              <h2 className="text-sm sm:text-base font-bold text-white">Inventory by Status</h2>
            </div>
            <p className="text-sm text-rose-200 mt-0.5">Current stock distribution</p>
          </div>
          <div className="p-4 sm:p-5 pb-8 sm:pb-7">
            <ResponsiveContainer width="100%" height={340}>
              <PieChart>
                <Pie
                  data={inventoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={2}
                >
                  {inventoryData.map((entry) => (
                    <Cell key={entry.name} fill={statusColor(entry.name, INVENTORY_COLORS)} />
                  ))}
                </Pie>
                <Tooltip content={<StatusTooltip />} />
                <Legend verticalAlign="bottom" height={48} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCharts;
