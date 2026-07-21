import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Boxes, CheckCircle2, AlertTriangle, PackageX, Trash2, Search
} from 'lucide-react';
import { getProducts, softDeleteProduct } from '../services/inventoryApiClient';
import SmartInventoryOptimization from './SmartInventoryOptimization';

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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const loadPage = useCallback(async (nextPage) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProducts({
        page: nextPage,
        limit: PAGE_SIZE,
        search,
        status: statusFilter,
      });
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
  }, [search, statusFilter]);

  // Initial load (no debounce) so the first paint is prompt and deterministic.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPage(1);
  }, []);

  // Re-fetch (resetting to page 1) when the user changes the search or status
  // filter, debounced so we don't hit the API on every keystroke.
  useEffect(() => {
    if (search === '' && statusFilter === '') return;
    const timer = setTimeout(() => loadPage(1), 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = useCallback(async (id) => {
    const target = products.find((p) => p.id === id);
    const label = target ? `"${target.name}"` : 'this item';
    if (!window.confirm(`Delete ${label}? It will be hidden from inventory but rental history is kept.`)) {
      return;
    }
    setDeletingId(id);
    try {
      await softDeleteProduct(id);
      await loadPage(page);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to delete item');
    } finally {
      setDeletingId(null);
    }
  }, [products, page, loadPage]);

  const statusOptions = ['Available', 'Rented', 'Maintenance', 'Overdue'];

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

    return { countByStatus, metrics };
  }, [products]);

  const { countByStatus, metrics } = derived;

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

      <div className="space-y-6">
        {/* Stock table */}
        <div className="p-6 rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Stock Levels</h2>
              <p className="text-xs text-gray-400 mt-0.5 mb-4">Current inventory by item and status</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search items…"
                  aria-label="Search inventory"
                  className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-200 w-44"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by status"
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-200"
              >
                <option value="">All statuses</option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between mb-3">
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
                    <th className="py-2 font-medium text-right">Actions</th>
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
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          disabled={deletingId === p.id}
                          aria-label={`Delete ${p.name}`}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {deletingId === p.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-400">No inventory data available.</td>
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

      </div>

      {/* Smart Inventory & Rental Optimization (Objective 3.3) */}
      <SmartInventoryOptimization metrics={metrics} />
    </div>
  );
};

export default InventoryManagement;
