import React from 'react';

const Catalog = () => {
  return (
    <div style={styles.pageContainer}>
      <div style={styles.stickyHeaderWrapper}>
        <header style={styles.headerFrame}>
          <div style={styles.headerContent}>
            <div style={styles.portalBadge}>Customer Portal</div>
          </div>
        </header>

        <div style={styles.mainHeaderRow}>
          <div>
            <h1 style={styles.mainTitle}>Collection</h1>
            <p style={styles.subtitle}>Browse our premium formal wear.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    fontFamily: '"Inter", sans-serif',
    backgroundColor: '#fafafa',
    minHeight: '100vh',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  stickyHeaderWrapper: {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    backgroundColor: '#ffffff',
    width: '100%',
    display: 'block',
  },
  headerFrame: {
    backgroundColor: '#f1f5f9', 
    width: '100%',
  },
  headerContent: {
    height: '60px',
    padding: '0 60px',
    display: 'flex',
    alignItems: 'center',
  },
  portalBadge: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1a202c',
    letterSpacing: '-0.2px',
  },
  mainHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
    padding: '30px 60px 20px 60px',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #f1f5f9',
  },
  mainTitle: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#718096',
    margin: 0,
  }
};

export default Catalog;