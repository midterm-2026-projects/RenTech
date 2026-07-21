import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Boxes, CheckCircle2, AlertTriangle, PackageX, Gauge, Tag
} from 'lucide-react';
import {
  calculateOptimizationScore,
  generatePromotionRecommendations,
} from '../services/inventoryOptimizationService';
import { getProducts } from '../services/inventoryApiClient';

const STATUS_STYLES = {
  Available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rented: 'bg-sky-50 text-sky-700 border-sky-200',
  Maintenance: 'bg-amber-50 text-amber-700 border-amber-200',
  Overdue: 'bg-rose-50 text-rose-700 border-rose-200',
  default: 'bg-gray-50 text-gray-600 border-gray-200',
};

const PAGE_SIZE = 8;

const InventoryManagement = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPage = useCallback(async (nextPage) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProducts({ page: nextPage, limit: PAGE_SIZE });
      setProducts(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
      setPage(nextPage);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load inventory');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPage(1);
  }, [loadPage]);

  const derived = useMemo(() => {
    const countByStatus = products.reduce((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {});

    const rentedItems = products
      .filter((p) => p.status === 'Rented' || p.status === 'Overdue')
      .map((p) => p.name);
    const notRentedItems = products
      .filter((p) => p.status === 'Available' || p.status === 'Maintenance')
      .map((p) => p.name);

    const activeRevenue = products
      .filter((p) => p.status === 'Rented' || p.status === 'Overdue')
      .reduce((sum, p) => sum + (Number(p.price) || 0), 0);

    const attentionItems = products.filter(
      (p) => p.status === 'Maintenance' || p.status === 'Overdue'
    );

    const topSellingItem = products
      .filter((p) => p.status === 'Rented' || p.status === 'Overdue')
      .sort((a, b) => (b.price || 0) - (a.price || 0))[0]?.name || 'N/A';

    const totalItems = products.length || 1;
    const inventoryTurnover = Math.round(((rentedItems.length / totalItems) * 100));

    const metrics = {
      totalSales: activeRevenue,
      lowStockItems: attentionItems.length,
      topSellingItem,
      rentedItems,
      notRentedItems,
      inventoryTurnover,
    };

    return {
      countByStatus,
      metrics,
      optimizationScore: calculateOptimizationScore(metrics),
      promotions: generatePromotionRecommendations(notRentedItems),
    };
  }, [products]);

  const { countByStatus, metrics, optimizationScore, promotions } = derived;

  const scoreColor =
    optimizationScore >= 75
      ? 'text-emerald-600'
      : optimizationScore >= 50
      ? 'text-amber-600'
      : 'text-rose-600';

  const stats = [
    { label: 'Total Items', value: total, Icon: Boxes, tone: 'text-slate-600 bg-slate-100' },
    { label: 'Available', value: countByStatus.Available || 0, Icon: CheckCircle2, tone: 'text-emerald-600 bg-emerald-100' },
    { label: 'Out (Rented/Overdue)', value: (countByStatus.Rented || 0) + (countByStatus.Overdue || 0), Icon: AlertTriangle, tone: 'text-sky-600 bg-sky-100' },
    { label: 'Needs Attention', value: (countByStatus.Maintenance || 0) + (countByStatus.Overdue || 0), Icon: PackageX, tone: 'text-rose-600 bg-rose-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, Icon, tone }) => (
          <div key={label} className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${tone}`}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock table */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Stock Levels</h2>
              <p className="text-xs text-gray-400 mt-0.5 mb-4">Current inventory by item and status</p>
            </div>
            <span className="text-xs text-gray-400">
              {total} item{total === 1 ? '' : 's'} · Page {page} of {totalPages}
            </span>
          </div>

          {loading && (
            <p className="py-6 text-center text-gray-400">Loading inventory…</p>
          )}
          {!loading && error && (
            <p className="py-6 text-center text-rose-500">{error}</p>
          )}
          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-gray-100">
                    <th className="py-2 pr-4 font-medium">Item</th>
                    <th className="py-2 pr-4 font-medium">Category</th>
                    <th className="py-2 pr-4 font-medium">Price</th>
                    <th className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-3 pr-4 font-medium text-gray-700">{p.name}</td>
                      <td className="py-3 pr-4 text-gray-500">{p.category || '—'}</td>
                      <td className="py-3 pr-4 text-gray-600">₱{(Number(p.price) || 0).toLocaleString()}</td>
                      <td className="py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_STYLES[p.status] || STATUS_STYLES.default}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-gray-400">No inventory data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination controls */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button
                type="button"
                onClick={() => loadPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                ← Prev
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => loadPage(p)}
                    className={`w-8 h-8 text-sm rounded-lg border border-gray-200 ${
                      p === page
                        ? 'border-rose-200 bg-rose-50 text-rose-600'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => loadPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* Optimization score */}
        <div className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col">
          <div className="flex items-center space-x-2 mb-2">
            <Gauge className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-800">Optimization Score</h2>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-4">
            <div className="relative w-36 h-36">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
                <circle
                  cx="18" cy="18" r="15.5" fill="none"
                  stroke={optimizationScore >= 75 ? '#059669' : optimizationScore >= 50 ? '#d97706' : '#e11d48'}
                  strokeWidth="3.5" strokeLinecap="round"
                  strokeDasharray={`${(optimizationScore / 100) * 97.4} 97.4`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${scoreColor}`}>{optimizationScore}</span>
                <span className="text-xs text-gray-400">/ 100</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-center text-gray-500">
              AI-adjusted health of your rental inventory
            </p>
          </div>
          <dl className="mt-4 space-y-1 text-sm border-t border-gray-100 pt-3">
            <div className="flex justify-between"><dt className="text-gray-400">Active Revenue</dt><dd className="font-medium text-gray-700">₱{metrics.totalSales.toLocaleString()}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-400">Top Performer</dt><dd className="font-medium text-gray-700 truncate max-w-[140px]" title={metrics.topSellingItem}>{metrics.topSellingItem}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-400">Turnover</dt><dd className="font-medium text-gray-700">{metrics.inventoryTurnover}%</dd></div>
          </dl>
        </div>
      </div>

      {/* Promotion engine */}
      <div className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center space-x-2 mb-3">
          <Tag className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-bold text-gray-800">AI Promotion Recommendations</h2>
        </div>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {promotions.map((rec, idx) => (
            <li
              key={idx}
              className="flex items-start space-x-2 p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-sm text-gray-700"
            >
              <span className="mt-0.5 text-indigo-400">★</span>
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default InventoryManagement;
