import { BarChart3 } from 'lucide-react';
import {
  Bar, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthIndex = (m) => { const i = MONTHS.indexOf(m); return i === -1 ? 99 : i; };

const fmtPHP = (value) => `₱${Number(value || 0).toLocaleString('en-PH')}`;

const ProjectionTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md text-xs space-y-0.5">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color || p.fill }}>
          {p.name}: {fmtPHP(p.value)}
        </p>
      ))}
    </div>
  );
};

// Compares actual monthly revenue against the system's projected revenue.
const RevenueVsProjection = ({ revenueData = [], projectionData = [] }) => {
  const byMonth = {};
  (revenueData || []).forEach((d) => {
    byMonth[d.month] = { ...(byMonth[d.month] || {}), month: d.month, revenue: Number(d.revenue) || 0 };
  });
  (projectionData || []).forEach((d) => {
    byMonth[d.month] = {
      ...(byMonth[d.month] || {}),
      month: d.month,
      projected: Number(d.projected) || 0,
      actualProjected: d.actual != null ? Number(d.actual) : null,
    };
  });

  const data = Object.values(byMonth).sort((a, b) => monthIndex(a.month) - monthIndex(b.month));

  if (!data.length) return null;

  return (
    <div className="w-full border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden" data-testid="revenue-vs-projection-chart">
      <div className="bg-gradient-to-r from-rose-500 to-rose-600 px-6 py-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-white" />
          <h2 className="text-sm font-bold text-white">Revenue vs. Projection</h2>
        </div>
        <p className="text-xs text-rose-200 mt-0.5">Actual rental revenue against forecast</p>
      </div>
      <div className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <YAxis tickFormatter={(v) => `₱${v}`} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} width={64} />
            <Tooltip content={<ProjectionTooltip />} cursor={{ fill: '#f8fafc' }} />
            <Legend verticalAlign="top" height={28} wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="revenue" fill="#e11d48" radius={[4, 4, 0, 0]} name="Actual Revenue" />
            <Bar dataKey="projected" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Projected Revenue" />
            <Line type="monotone" dataKey="actualProjected" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} name="Projected Actual" connectNulls />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueVsProjection;
