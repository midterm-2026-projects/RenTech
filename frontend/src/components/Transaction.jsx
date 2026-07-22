import React, { useState, useEffect, useRef } from 'react';
import { Filter } from 'lucide-react';

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
        const response = await fetch('http://localhost:5000/api/transactions');
        const result = await response.json();

        if (result.status === 'success') {
          setTransactions(result.data || []);
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
           (tx.item && tx.item.toLowerCase().includes(term)) ||
           (tx.username && tx.username.toLowerCase().includes(term));
  });

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
            onChange={(e) => setSearchTerm(e.target.value)}
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
            <div className="absolute top-[52px] right-0 bg-white rounded-2xl shadow-lg border border-gray-100 p-3 w-[160px] z-50">
              <div className="text-[11px] font-bold text-gray-400 tracking-wide px-3 pb-1.5">STATUS</div>
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setFilterOpen(false); }}
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
        isMobile ? (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => (
              <div key={tx.id || tx._id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-900">{tx.id}</span>
                  <span className="text-xs font-bold text-gray-900">₱{tx.amount || tx.totalCost}</span>
                </div>
                <div className="text-sm text-gray-600 mb-1">{tx.item || tx.itemName}</div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{tx.username || 'Customer'}</span>
                  <span>{tx.date}</span>
                </div>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-600">{tx.status}</span>
                </div>
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
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id || tx._id} className="border-b border-gray-50">
                    <td className="px-4 sm:px-6 py-4 text-sm font-bold text-gray-900">{tx.id}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">{tx.item || tx.itemName}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">{tx.username || 'Customer'}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-500">{tx.date}</td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-600">{tx.status}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm font-bold text-gray-900 text-right">₱{tx.amount || tx.totalCost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="text-center py-10 text-sm text-gray-400">No transactions found.</div>
      )}
    </div>
  );
};

const styles = {
  container: {
    width: '100%', 
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    boxSizing: 'border-box',
    padding: '20px 0', 
  },
  contentWrapper: {
    maxWidth: '1000px', 
    width: '100%',
    margin: '0 auto', 
    padding: '0 24px', 
    boxSizing: 'border-box',
  },
  header: {
    marginBottom: '28px',
    width: '100%',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  searchWrapper: {
    position: 'relative',
    maxWidth: '380px',
    width: '100%',
    marginBottom: '32px',
  },
  iconWrapper: {
    position: 'absolute',
    top: '50%',
    left: '16px',
    transform: 'translateY(-50%)',
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  searchIcon: {
    width: '18px',
    height: '18px',
  },
  input: {
    width: '100%',
    padding: '12px 16px 12px 44px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '100px',
    fontSize: '14px',
    color: '#334155',
    outline: 'none',
    boxSizing: 'border-box',
  },
  tableCard: {
    width: '100%',
    border: '1px solid #f1f5f9',
    borderRadius: '16px',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeaderRow: {
    borderBottom: '1px solid #f1f5f9',
    backgroundColor: '#fafafa',
  },
  thLeft: {
    padding: '18px 24px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
  },
  thRight: {
    padding: '18px 24px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'right',
  },
  tableRow: {
    borderBottom: '1px solid #f8fafc',
  },
  tdId: {
    padding: '20px 24px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
  },
  tdItem: {
    padding: '20px 24px',
    fontSize: '14px',
    color: '#64748b',
  },
  tdDate: {
    padding: '20px 24px',
    fontSize: '14px',
    color: '#64748b',
  },
  tdLeft: {
    padding: '20px 24px',
  },
  tdAmount: {
    padding: '20px 24px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'right',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    backgroundColor: '#eff6ff',
    color: '#2563eb',
  },
  noData: {
    padding: '40px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px',
  }
};

export default Transaction;