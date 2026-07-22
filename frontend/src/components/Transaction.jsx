import React, { useState, useEffect, useRef } from 'react';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { getTransactions } from '../services/inventoryApiClient';

const PAGE_SIZE = 8;

const STATUS_COLORS = {
  Reserved: 'bg-blue-50 text-blue-700',
  Confirmed: 'bg-emerald-50 text-emerald-700',
  Completed: 'bg-indigo-50 text-indigo-700',
  Cancelled: 'bg-gray-100 text-gray-500',
  Overdue: 'bg-rose-50 text-rose-700',
  Returned: 'bg-purple-50 text-purple-700',
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return isMobile;
}

const Transaction = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const filterRef = useRef(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const result = await getTransactions({ limit: 200 });

        if (result.status === 'success') {
          const data = result.data || [];
          data.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
          setTransactions(data);
        } else {
          setError(result.message || 'Failed to fetch transactions');
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Server connection error.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const statuses = ['All', 'Reserved', 'Confirmed', 'Completed', 'Cancelled', 'Overdue', 'Returned'];
  const filteredTransactions = transactions.filter(tx => {
    if (statusFilter !== 'All' && tx.status !== statusFilter) return false;
    const term = searchTerm.toLowerCase();
    return (tx.id && tx.id.toLowerCase().includes(term)) ||
           ((tx.itemName || tx.item) && (tx.itemName || tx.item).toLowerCase().includes(term)) ||
           (tx.username && tx.username.toLowerCase().includes(term));
  });

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / PAGE_SIZE));
  const paginated = filteredTransactions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const getPageNumbers = () => {
    const maxVisible = isMobile ? 3 : 5;
    if (totalPages <= maxVisible) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const half = Math.floor(maxVisible / 2);
    let start = page - half;
    let end = page + half;
    if (start < 1) { start = 1; end = maxVisible; }
    if (end > totalPages) { end = totalPages; start = totalPages - maxVisible + 1; }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Track your active and past reservations.</p>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3 w-full mb-5 sm:mb-8">
        <div className="relative flex-1 min-w-0">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by ID, customer, or item..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full pl-11 pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-full text-sm text-gray-700 outline-none bg-white"
          />
        </div>
        <div className="relative shrink-0" ref={filterRef}>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center justify-center w-[45px] h-[45px] bg-white border border-gray-200 rounded-full cursor-pointer hover:bg-gray-50 transition"
          >
            <Filter className="w-[18px] h-[18px] text-gray-500" />
          </button>
          {filterOpen && (
            <div className="absolute top-[52px] right-0 bg-white rounded-2xl shadow-lg border border-gray-100 p-3 w-[180px] sm:w-[160px] z-50">
              <div className="text-[11px] font-bold text-gray-400 tracking-wide px-3 pb-1.5">STATUS</div>
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setFilterOpen(false); setPage(1); }}
                  className={`w-full text-left px-3 py-2 text-sm font-medium rounded-xl transition cursor-pointer ${
                    statusFilter === s ? 'bg-rose-500 text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table / Cards */}
      {loading ? (
        <div className="text-center py-10 text-sm text-gray-400">Loading live transactions...</div>
      ) : error ? (
        <div className="text-center py-10 text-sm text-red-500">{error}</div>
      ) : filteredTransactions.length > 0 ? (
        <>
          {isMobile ? (
            <div className="space-y-3">
              {paginated.map((tx) => (
                <div key={tx.id || tx._id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-900">{tx.id}</span>
                    <span className="text-xs font-bold text-gray-900">₱{tx.amount || tx.totalCost}</span>
                  </div>
                  <div className="text-sm font-medium text-gray-700 mb-3">{tx.item || tx.itemName}</div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-300 mb-0.5">Customer</div>
                      <span>{tx.username || 'Customer'}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider text-gray-300 mb-0.5">Date</div>
                      <span>{tx.date}</span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${STATUS_COLORS[tx.status] || 'bg-gray-100 text-gray-600'}`}>{tx.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full border border-gray-100 rounded-2xl overflow-x-auto bg-white">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500">ID</th>
                    <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500">Item</th>
                    <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500">Customer</th>
                    <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500">Date</th>
                    <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500">Status</th>
                    <th className="px-4 sm:px-6 py-4 text-xs font-semibold text-gray-500 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((tx) => (
                    <tr key={tx.id || tx._id} className="border-b border-gray-50">
                      <td className="px-4 sm:px-6 py-4 text-sm font-bold text-gray-900">{tx.id}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">{tx.item || tx.itemName}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">{tx.username || 'Customer'}</td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">{tx.date}</td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${STATUS_COLORS[tx.status] || 'bg-gray-100 text-gray-600'}`}>{tx.status}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm font-bold text-gray-900 text-right">₱{tx.amount || tx.totalCost}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center mt-5 pt-4 border-t border-gray-100 text-sm text-gray-400 gap-3">
              <span className="text-xs sm:text-sm order-2 sm:order-1">{filteredTransactions.length} record{filteredTransactions.length === 1 ? '' : 's'} · Page {page} of {totalPages}</span>
              <div className="flex items-center gap-1.5 order-1 sm:order-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Prev</span>
                </button>
                {getPageNumbers().map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 text-xs rounded-lg border transition-colors ${
                      p === page
                        ? 'border-rose-200 bg-rose-50 text-rose-600'
                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition text-xs"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-10 text-sm text-gray-400">No transactions found.</div>
      )}
    </div>
  );
};

// styles intentionally removed — all styling is now Tailwind

export default Transaction;