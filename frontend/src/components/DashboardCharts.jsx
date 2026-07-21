import {
  PieChart, Pie, Cell,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const fmtPHP = (value) => `₱${Number(value || 0).toLocaleString('en-PH')}`;

const STATUS_COLORS = {
  Confirmed: '#10b981',
  Reserved: '#f59e0b',
  Overdue: '#ef4444',
};

const INVENTORY_COLORS = {
  Available: '#10b981',
  Rented: '#6366f1',
  Overdue: '#ef4444',
  Maintenance: '#f59e0b',
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
      <div className="w-full h-96 border border-gray-200 rounded-2xl shadow-sm bg-white flex items-center justify-center">
        <p className="text-gray-500 font-medium text-lg">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* --- Revenue Trajectory (Line) --- */}
      {hasRevenue && (
        <div className="w-full p-6 border border-gray-100 rounded-2xl shadow-sm bg-white" data-testid="revenue-trajectory-chart">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Revenue Trajectory</h2>
          <p className="text-xs text-gray-400 mb-4">Monthly rental revenue</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={normalizedRevenue} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tickFormatter={(v) => `₱${v}`} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} width={56} />
              <Tooltip content={<RevenueTooltip />} />
              <Line type="monotone" dataKey="revenue" stroke="#e11d48" strokeWidth={3} dot={{ r: 3 }} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* --- Booking Status (Pie) --- */}
      {hasBooking && (
        <div className="w-full p-6 border border-gray-100 rounded-2xl shadow-sm bg-white" data-testid="booking-status-chart">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Booking Status</h2>
          <p className="text-xs text-gray-400 mb-4">Distribution of rental states</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={45}
                paddingAngle={2}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={statusColor(entry.name, STATUS_COLORS)} />
                ))}
              </Pie>
              <Tooltip content={<StatusTooltip />} />
              <Legend verticalAlign="bottom" height={28} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* --- Inventory by Status (Pie) --- */}
      {hasInventory && (
        <div className="w-full p-6 border border-gray-100 rounded-2xl shadow-sm bg-white" data-testid="inventory-status-chart">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Inventory by Status</h2>
          <p className="text-xs text-gray-400 mb-4">Current stock distribution</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={inventoryData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={45}
                paddingAngle={2}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {inventoryData.map((entry) => (
                  <Cell key={entry.name} fill={statusColor(entry.name, INVENTORY_COLORS)} />
                ))}
              </Pie>
              <Tooltip content={<StatusTooltip />} />
              <Legend verticalAlign="bottom" height={28} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default DashboardCharts;
