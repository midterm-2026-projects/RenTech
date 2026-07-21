import { useState, useEffect } from 'react';
import { getTransactions, updateTransactionStatus } from '../services/inventoryApiClient';

const SEED_TRANSACTIONS = [
  { id: "TX-1001", username: "ana rivera", itemName: "Vintage Gatsby Sequin Dress", date: "May 01, 2026", pricePerDay: 500, daysRented: 3, totalCost: 1500, status: "Active" },
  { id: "TX-1002", username: "carlos mendez", itemName: "Barong Tagalog", date: "May 02, 2026", pricePerDay: 400, daysRented: 2, totalCost: 800, status: "Active" },
  { id: "TX-1003", username: "liza santos", itemName: "Emerald Velvet Gown", date: "May 03, 2026", pricePerDay: 600, daysRented: 3, totalCost: 1800, status: "Reserved" },
  { id: "TX-1004", username: "daniel cruz", itemName: "Black Tuxedo", date: "May 04, 2026", pricePerDay: 700, daysRented: 2, totalCost: 1400, status: "Active" },
  { id: "TX-1005", username: "isabel garcia", itemName: "Champagne Silk Gown", date: "May 02, 2026", pricePerDay: 850, daysRented: 2, totalCost: 1700, status: "Overdue" },
  { id: "TX-1006", username: "marco bautista", itemName: "Grey Suit", date: "May 03, 2026", pricePerDay: 550, daysRented: 2, totalCost: 1100, status: "Returned" },
  { id: "TX-1007", username: "angela lopez", itemName: "Blush Pink Dress", date: "May 01, 2026", pricePerDay: 800, daysRented: 2, totalCost: 1600, status: "Pending" },
  { id: "TX-1011", username: "juan dela cruz", itemName: "Navy Slim Suit", date: "May 06, 2026", pricePerDay: 600, daysRented: 2, totalCost: 1200, status: "Active" },
  { id: "TX-1012", username: "paolo reyes", itemName: "Charcoal Suit", date: "May 07, 2026", pricePerDay: 675, daysRented: 2, totalCost: 1350, status: "Active" },
  { id: "TX-1013", username: "sofia gomez", itemName: "Royal Blue Gown", date: "May 08, 2026", pricePerDay: 1100, daysRented: 2, totalCost: 2200, status: "Reserved" }
];

export default function TransactionDashboard() {
  const [searchText, setSearchText] = useState("");
  const userRole = (() => {
    try {
      const saved = localStorage.getItem('rentech_session');
      return saved ? JSON.parse(saved).role || "Admin" : "Admin";
    } catch {
      return "Admin";
    }
  })();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState({
    Active: false,
    Reserved: false,
    Returned: false,
    Overdue: false,
    Pending: false
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [transactions, setTransactions] = useState(SEED_TRANSACTIONS);

  useEffect(function () {
    getTransactions({ page: 1, limit: 100 })
      .then((res) => {
        const rows = res?.data;
        if (Array.isArray(rows) && rows.length) {
          setTransactions(
            rows.map((t) => ({
              id: t.id,
              username: t.username || 'system',
              itemName: t.itemName,
              date: t.date,
              totalCost: t.totalCost != null ? Number(t.totalCost) : 0,
              status: t.status,
            }))
          );
        }
      })
      .catch(() => { /* keep seed data on error */ });
  }, []);

  async function handleReturnClick(idToUpdate) {
    try {
      await updateTransactionStatus(idToUpdate, 'Returned');
      setTransactions((prev) =>
        prev.map((t) => (t.id === idToUpdate ? { ...t, status: "Returned" } : t))
      );
    } catch {
      setTransactions((prev) =>
        prev.map((t) => (t.id === idToUpdate ? { ...t, status: "Returned" } : t))
      );
    }
  }

  function handleCheckboxChange(statusKey) {
    setSelectedStatuses(prev => ({
      ...prev,
      [statusKey]: !prev[statusKey]
    }));
    setCurrentPage(1);
  }

  const filteredTransactions = [];
  const searchKeyword = searchText.toLowerCase().trim();
  const activeFilters = Object.entries(selectedStatuses).filter(([, v]) => v).map(([k]) => k);
  const isAnyStatusFilterActive = activeFilters.length > 0;

  for (let i = 0; i < transactions.length; i++) {
    const item = transactions[i];

    const customerName = item.username.toLowerCase();
    const itemName = item.itemName.toLowerCase();
    const recordId = item.id.toLowerCase();

    const matchesSearch = customerName.includes(searchKeyword) ||
      itemName.includes(searchKeyword) ||
      recordId.includes(searchKeyword);

    let matchesStatus = true;
    if (isAnyStatusFilterActive) {
      matchesStatus = activeFilters.includes(item.status);
    }

    if (matchesSearch && matchesStatus) {
      filteredTransactions.push(item);
    }
  }

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTableData = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  function renderTableRows() {
    const tableRowsHtml = [];

    for (let i = 0; i < currentTableData.length; i++) {
      const item = currentTableData[i];

      const actionElement = userRole === "Customer" ? (
        <span style={{ color: '#cbd5e1', fontSize: '13px' }}>None</span>
      ) : (
        <button
          onClick={function () { handleReturnClick(item.id); }}
          style={{ 
            border: 'none', 
            backgroundColor: '#fff5f5', 
            color: '#e05656', 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            cursor: 'pointer', 
            fontSize: '14px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}
          title="Process Return Modification"
        >
          ↩
        </button>
      );

      let statusBgColor = '#ecfdf5';
      let statusTextColor = '#059669';
      if (item.status === 'Returned') {
        statusBgColor = '#dbdddb';
        statusTextColor = '#232423';
      } else if (item.status === 'Reserved') {
        statusBgColor = '#dce1f0';
        statusTextColor = '#1443df';
      } else if (item.status === 'Overdue') {
        statusBgColor = '#fef2f2';
        statusTextColor = '#dc2626';
      } else if (item.status === 'Pending') {
        statusBgColor = '#fffbeb';
        statusTextColor = '#d97706';
      }

      tableRowsHtml.push(
        <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
          <td style={{ padding: '18px 16px', fontWeight: 'bold', color: '#1e293b', fontSize: '15px' }}>{item.id}</td>
          <td style={{ padding: '18px 16px', color: '#334155', fontSize: '15px', textTransform: 'capitalize' }}>{item.username}</td>
          <td style={{ padding: '18px 16px', color: '#64748b', fontSize: '15px' }}>{item.itemName}</td>
          <td style={{ padding: '18px 16px', color: '#64748b', fontSize: '15px' }}>{item.date}</td>
          <td style={{ padding: '18px 16px' }}>
            <span style={{ backgroundColor: statusBgColor, color: statusTextColor, padding: '5px 12px', borderRadius: '15px', fontSize: '13px', fontWeight: '600' }}>
              {item.status}
            </span>
          </td>
          <td style={{ padding: '18px 16px', fontWeight: 'bold', color: '#1e293b', fontSize: '15px' }}>₱{item.totalCost.toLocaleString()}</td>
          <td style={{ padding: '18px 16px' }}>{actionElement}</td>
        </tr>
      );
    }

    return tableRowsHtml;
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px 40px 40px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'inherit' }}>
      <h1 style={{ margin: '0 0 5px 0', fontSize: '32px', color: '#0f172a', fontWeight: 'bold' }}>Records</h1>
      <p style={{ color: 'gray', margin: '0 0 30px 0', fontSize: '16px' }}>Digital logbook of all rental transactions.</p>

      {/* SEARCH AND FILTER BAR */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', position: 'relative' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            style={{ position: 'absolute', left: '20px', pointerEvents: 'none' }}
          >
            <circle cx="11" cy="11" r="7" stroke="#94a3b8" strokeWidth="2.5" />
            <path d="M16 16L21 21" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
          </svg>

          <input
            type="text"
            placeholder="Search by ID, customer, or item..."
            value={searchText}
            onChange={function (e) { setSearchText(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '14px 24px 14px 48px',
              width: '426px',
              borderRadius: '25px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              outline: 'none',
              fontSize: '15px',
              boxShadow: '0px 1px 2px rgba(0,0,0,0.02)'
            }}
          />
        </div>

        <button
          aria-label="Filter configuration options"
          onClick={function () { setIsFilterOpen(!isFilterOpen); }}
          style={{
            marginLeft: '12px',
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            border: '1px solid #e2e8f0',
            backgroundColor: isFilterOpen ? '#f1f5f9' : '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0',
            outline: 'none',
            boxShadow: '0px 1px 2px rgba(0,0,0,0.02)'
          }}
        >
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
            <path
              d="M3 4.5H21L14 12.5V18.5L10 20.5V12.5L3 4.5Z"
              stroke="#475569"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {isFilterOpen && (
          <div style={{ position: 'absolute', top: '55px', left: '410px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0px 10px 25px rgba(0,0,0,0.08)', padding: '20px', width: '180px', zIndex: 10 }}>
            <span style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#64748b', letterSpacing: '0.05em', marginBottom: '15px' }}>STATUS</span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {['Active', 'Reserved', 'Returned', 'Overdue', 'Pending'].map((status) => (
                <label key={status} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#334155', fontSize: '15px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedStatuses[status]}
                    onChange={function () { handleCheckboxChange(status); }}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  {status}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TABLE WRAPPER CARD */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
              <th style={{ padding: '16px 16px', color: '#64748b', fontWeight: '500', fontSize: '14px' }}>ID</th>
              <th style={{ padding: '16px 16px', color: '#64748b', fontWeight: '500', fontSize: '14px' }}>Customer</th>
              <th style={{ padding: '16px 16px', color: '#64748b', fontWeight: '500', fontSize: '14px' }}>Item</th>
              <th style={{ padding: '16px 16px', color: '#64748b', fontWeight: '500', fontSize: '14px' }}>Date</th>
              <th style={{ padding: '16px 16px', color: '#64748b', fontWeight: '500', fontSize: '14px' }}>Status</th>
              <th style={{ padding: '16px 16px', color: '#64748b', fontWeight: '500', fontSize: '14px' }}>Amount</th>
              <th style={{ padding: '16px 16px', color: '#64748b', fontWeight: '500', fontSize: '14px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {renderTableRows()}
          </tbody>
        </table>

        {filteredTransactions.length === 0 && (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px', fontSize: '16px' }}>
            No records match your tracking filter options.
          </div>
        )}

        {/* PAGINATION FOOTER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
          <span style={{ fontSize: '14px', color: '#64748b' }}>
            Showing {filteredTransactions.length > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                background: 'none',
                border: 'none',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                color: currentPage === 1 ? '#cbd5e1' : '#64748b',
                fontSize: '16px',
                padding: '4px 8px'
              }}
            >
              &lt;
            </button>
            <span style={{ fontSize: '14px', color: '#334155', fontWeight: '500' }}>
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                background: 'none',
                border: 'none',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                color: currentPage === totalPages ? '#cbd5e1' : '#64748b',
                fontSize: '16px',
                padding: '4px 8px'
              }}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
