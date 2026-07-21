import { useState, useEffect } from 'react';
import { getSession } from './Login';
import { getTransactions } from '../services/inventoryApiClient';

const SEED_TRANSACTIONS = [
  {
    id: 'TX-1021',
    item: 'Crimson Ballgown',
    date: 'May 10, 2026',
    status: 'Reserved',
    amount: '₱2,000'
  },
  {
    id: 'TX-1022',
    item: 'Emerald Evening Gown',
    date: 'May 12, 2026',
    status: 'Reserved',
    amount: '₱3,500'
  },
  {
    id: 'TX-1023',
    item: 'Sapphire Tuxedo',
    date: 'May 15, 2026',
    status: 'Reserved',
    amount: '₱2,800'
  }
];

const Transaction = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState(SEED_TRANSACTIONS);

  useEffect(() => {
    const session = getSession();
    const username = session?.username;

    getTransactions({ page: 1, limit: 100 })
      .then((res) => {
        const rows = res?.data;
        if (Array.isArray(rows) && rows.length) {
          const mapped = rows
            .filter((t) => !username || (t.username || '').toLowerCase() === username.toLowerCase())
            .map((t) => ({
              id: t.id,
              item: t.itemName,
              date: t.date,
              status: t.status,
              amount: `₱${Number(String(t.totalCost).replace(/[^\d]/g, '')) || 0}`
            }));
          if (mapped.length > 0) {
            setTransactions(mapped);
          }
        }
      })
      .catch(() => { /* keep seed data on error */ });
  }, []);

  const filteredTransactions = transactions.filter(tx =>
    tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
        <div style={styles.header}>
          <h1 style={styles.title}>Transactions</h1>
          <p style={styles.subtitle}>Track your active and past reservations.</p>
        </div>

        <div style={styles.searchWrapper}>
          <div style={styles.iconWrapper}>
            <svg style={styles.searchIcon} fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by ID or item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.thLeft}>ID</th>
                <th style={styles.thLeft}>Item</th>
                <th style={styles.thLeft}>Date</th>
                <th style={styles.thLeft}>Status</th>
                <th style={styles.thRight}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} style={styles.tableRow}>
                    <td style={styles.tdId}>{tx.id}</td>
                    <td style={styles.tdItem}>{tx.item}</td>
                    <td style={styles.tdDate}>{tx.date}</td>
                    <td style={styles.tdLeft}>
                      <span style={{
                        ...styles.badge,
                        backgroundColor: tx.status === 'Active' ? '#ecfdf5' : tx.status === 'Overdue' ? '#fef2f2' : tx.status === 'Pending' ? '#fffbeb' : '#eff6ff',
                        color: tx.status === 'Active' ? '#059669' : tx.status === 'Overdue' ? '#dc2626' : tx.status === 'Pending' ? '#d97706' : '#2563eb',
                      }}>
                        {tx.status}
                      </span>
                    </td>
                    <td style={styles.tdAmount}>{tx.amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={styles.noData}>No transactions found.</td>
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
  },
  noData: {
    padding: '40px',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '14px',
  }
};

export default Transaction;
