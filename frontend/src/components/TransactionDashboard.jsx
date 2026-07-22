import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Download, ArrowLeft, ArrowRight, Undo2 } from 'lucide-react';
import { getTransactions, updateTransactionStatus } from '../services/inventoryApiClient';

const PAGE_SIZE = 10;

function formatTransactionDate(raw) {
  if (!raw) return '—';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const STATUS_STYLES = {
  Confirmed: 'bg-rose-100 text-rose-700',
  Reserved: 'bg-blue-100 text-blue-700',
  Overdue: 'bg-rose-200 text-rose-800',
  Completed: 'bg-blue-100 text-blue-700',
  Cancelled: 'bg-gray-100 text-gray-500',
  Returned: 'bg-rose-100 text-rose-700',
};

export default function TransactionDashboard() {
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState({
    Confirmed: false, Reserved: false, Overdue: false, Completed: false, Cancelled: false
  });
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchText), 300);
    return () => clearTimeout(t);
  }, [searchText]);

  const activeStatuses = Object.keys(selectedStatuses).filter((key) => selectedStatuses[key]);
  const statusParam = activeStatuses.join(',');

  const loadTransactions = useCallback(async (nextPage) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getTransactions({
        page: nextPage, limit: PAGE_SIZE, search: debouncedSearch, status: statusParam,
      });
      setTransactions(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
      setPage(nextPage);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusParam]);

  useEffect(() => {
    loadTransactions(1);
  }, [loadTransactions]);

  useEffect(() => {
    const refresh = () => { if (document.visibilityState === 'visible') loadTransactions(page); };
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [page, loadTransactions]);

  async function handleReturnClick(idToUpdate) {
    try {
      await updateTransactionStatus(idToUpdate, 'Returned');
      setTransactions((prev) =>
        prev.map((t) => (t.id === idToUpdate ? { ...t, status: 'Returned' } : t))
      );
      alert('Item status updated to Returned!');
    } catch {
      alert('Failed to update status. Please try again.');
    }
  }

  async function handleExport() {
    try {
      const res = await getTransactions({ page: 1, limit: 1000, search: debouncedSearch, status: statusParam });
      const rows = res.data || [];
      if (!rows.length) { alert('No records to export.'); return; }
      const header = ['ID', 'Customer', 'Item', 'Date', 'Status', 'Amount'];
      const body = rows.map((r) => [r.id, r.username, r.itemName, r.date, r.status, `₱${Number(r.totalCost || 0).toLocaleString()}`]);
      downloadCSV('transactions.csv', [header, ...body]);
    } catch {
      alert('Failed to export transactions. Please try again.');
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="p-4 sm:p-6">
            <div className="flex flex-wrap gap-3 mb-6 sm:flex-row sm:items-center">
              <div className="relative flex-1 min-w-0 sm:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by ID, customer, or item..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
              </div>

              <div className="relative flex-none">
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={`w-full p-2.5 rounded-xl border transition-colors flex items-center justify-center gap-2 ${
                      isFilterOpen ? 'bg-rose-50/50 border-rose-200 text-rose-600' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">Filters</span>
                    {activeStatuses.length > 0 && (
                      <span className="bg-rose-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                        {activeStatuses.length}
                      </span>
                    )}
                  </button>

                  {isFilterOpen && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-5 w-56 z-50">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-bold text-gray-500 tracking-wider uppercase">Filter by Status</p>
                        {activeStatuses.length > 0 && (
                          <button
                            onClick={() => setSelectedStatuses(Object.keys(selectedStatuses).reduce((acc, key) => ({ ...acc, [key]: false }), {}))}
                            className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        {Object.keys(selectedStatuses).map((status) => (
                          <label key={status} className={`flex items-center gap-3 text-sm cursor-pointer p-2 rounded-lg transition-colors ${
                            selectedStatuses[status] ? 'bg-rose-50/50 text-rose-700' : 'hover:bg-gray-50 text-gray-700'
                          }`}>                          <input
                            type="checkbox"
                            checked={selectedStatuses[status]}
                            onChange={() => setSelectedStatuses((prev) => ({ ...prev, [status]: !prev[status] }))}
                            className="w-4 h-4 accent-rose-500 cursor-pointer rounded focus:ring-rose-200"
                          />
                          <span className="font-medium">{status}</span>
                        </label>
                      ))}
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400">
                          {activeStatuses.length === 0 ? 'No filters applied' : `${activeStatuses.length} status${activeStatuses.length === 1 ? '' : 'es'} selected`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

              <button
                onClick={handleExport}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>

        <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Transaction ID</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Item</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="py-4 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="py-4 px-6 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="inline-flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm text-gray-500">Loading records…</span>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="inline-flex flex-col items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                          <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{error}</span>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && !error && transactions.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="inline-flex flex-col items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center">
                          <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">No records match your tracking filter options</p>
                          <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filter criteria</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                {!loading && !error && transactions.map((item) => (
                  <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors duration-150">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-50 to-rose-100 flex items-center justify-center text-rose-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                          </svg>
                        </div>
                        <div className="font-medium text-gray-900">#{item.id}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-700 capitalize">{item.username}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293H6"/>
                          </svg>
                        </div>
                        <div className="text-gray-600 truncate max-w-[120px]" title={item.itemName}>{item.itemName}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-600">{formatTransactionDate(item.date)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${STATUS_STYLES[item.status] || 'bg-gray-100 text-gray-600'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="font-semibold text-gray-900">₱{(Number(item.totalCost) || 0).toLocaleString()}</div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {item.status !== 'Returned' ? (
                        <button
                          onClick={() => handleReturnClick(item.id)}
                          className="group/btn inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Process Return"
                        >
                          <Undo2 className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                          <span>Return</span>
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-emerald-600 bg-emerald-50/50 rounded-lg border border-emerald-200/50">
                          <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                            </svg>
                          </div>
                          <span>Returned</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="md:hidden space-y-3">
          {loading && (
            <div className="py-10 text-center">
              <div className="inline-flex items-center gap-2 text-gray-400">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-400 rounded-full animate-spin"></div>
                <span className="text-sm">Loading records…</span>
              </div>
            </div>
          )}
          {!loading && error && (
            <div className="py-10 text-center">
              <div className="inline-flex flex-col items-center gap-2 text-rose-500">
                <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}
          {!loading && !error && transactions.length === 0 && (
            <div className="py-10 text-center">
              <div className="inline-flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">No records match your tracking filter options</p>
                  <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filter criteria</p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && transactions.map((item) => (
            <div key={item.id} className="group relative rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-lg transition-all duration-200 ease-in-out">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-50 to-rose-100 flex items-center justify-center text-rose-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Transaction ID</div>
                        <div className="text-lg font-semibold text-gray-800">#{item.id}</div>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date</div>
                      <div className="text-sm text-gray-500">{formatTransactionDate(item.date)}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Customer</div>
                      <div className="text-sm font-medium text-gray-700 capitalize">{item.username}</div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Item</div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293H6"/>
                          </svg>
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-[120px]" title={item.itemName}>{item.itemName}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status</div>
                      <span className={`inline-flex px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${STATUS_STYLES[item.status] || 'bg-gray-100 text-gray-600'}`}>
                        {item.status}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Amount</div>
                      <div className="text-lg font-bold text-gray-800">₱{(Number(item.totalCost) || 0).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4 sm:mt-0">
                  <div className="text-left">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Actions</div>
                    {item.status !== 'Returned' ? (
                      <button
                        onClick={() => handleReturnClick(item.id)}
                        className="group/btn inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all duration-200 shadow-sm hover:shadow-md w-full sm:w-auto justify-center"
                        title="Process Return"
                      >
                        <Undo2 className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                        <span>Return</span>
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-emerald-600 bg-emerald-50/50 rounded-lg border border-emerald-200/50">
                        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                          </svg>
                        </div>
                        <span>Returned</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {!loading && !error && totalPages > 1 && (
          <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-100 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs sm:text-sm text-gray-400">
              {total} record{total === 1 ? '' : 's'} · Page {page} of {totalPages}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
              <button
                onClick={() => loadTransactions(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Prev
              </button>
              <div className="flex flex-wrap items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => loadTransactions(p)}
                    className={`w-8 h-8 text-sm rounded-lg border transition-colors ${
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
                onClick={() => loadTransactions(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                Next
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function downloadCSV(filename, rows) {
  const escape = (cell) => {
    const s = String(cell == null ? '' : cell);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const csv = rows.map((r) => r.map(escape).join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
