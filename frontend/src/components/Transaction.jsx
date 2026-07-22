import React, { useState, useEffect } from 'react';

const Transaction = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch live transactions from backend API
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

  const filteredTransactions = transactions.filter(tx => 
    (tx.id && tx.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (tx.item && tx.item.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (tx.username && tx.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
        {/* Header Section */}
        <div style={styles.header}>
          <h1 style={styles.title}>Transactions</h1>
          <p style={styles.subtitle}>Track your active and past reservations.</p>
        </div>

        {/* Search Input Box */}
        <div style={styles.searchWrapper}>
          <div style={styles.iconWrapper}>
            <svg style={styles.searchIcon} fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by ID, customer, or item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.input}
          />
        </div>

        {/* Table Card */}
        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.thLeft}>ID</th>
                <th style={styles.thLeft}>Item</th>
                <th style={styles.thLeft}>Customer</th>
                <th style={styles.thLeft}>Date</th>
                <th style={styles.thLeft}>Status</th>
                <th style={styles.thRight}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={styles.noData}>Loading live transactions...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" style={{ ...styles.noData, color: '#ef4444' }}>{error}</td>
                </tr>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id || tx._id} style={styles.tableRow}>
                    <td style={styles.tdId}>{tx.id}</td>
                    <td style={styles.tdItem}>{tx.item || tx.itemName}</td>
                    <td style={styles.tdItem}>{tx.username || 'Customer'}</td>
                    <td style={styles.tdDate}>{tx.date}</td>
                    <td style={styles.tdLeft}>
                      <span style={styles.badge}>{tx.status}</span>
                    </td>
                    <td style={styles.tdAmount}>₱{tx.amount || tx.totalCost}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={styles.noData}>No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
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