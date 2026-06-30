import React, { useState } from 'react';

const SearchAndFilter = ({ searchTerm, onSearchChange, selectedCategory, onCategoryChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const statuses = ['All', 'Available', 'Maintenance', 'Overdue', 'Rented'];

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleSelectStatus = (status) => {
    onCategoryChange(status);
    setIsDropdownOpen(false);
  };

  return (
    <div style={styles.controlsContainer}>
      <div style={styles.searchWrapper}>
        <svg
          style={styles.searchIcon}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        
        <input
          type="text"
          placeholder="Search (e.g. Gatsby, Suit)..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      <div style={styles.filterWrapper}>
        <button style={styles.filterButton} onClick={toggleDropdown} type="button">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#475569"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
        </button>

        {isDropdownOpen && (
          <div style={styles.dropdownMenu}>
            <div style={styles.dropdownHeader}>STATUS</div>
            {statuses.map((status) => {
              const isSelected = selectedCategory === status;
              return (
                <button
                  key={status}
                  onClick={() => handleSelectStatus(status)}
                  style={{
                    ...styles.dropdownItem,
                    ...(isSelected ? styles.dropdownItemActive : {}),
                  }}
                  type="button"
                >
                  {status}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  controlsContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '320px',
  },
  searchIcon: {
    position: 'absolute',
    left: '18px',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px 12px 46px',
    fontSize: '0.95rem',
    color: '#334155',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '24px',
    outline: 'none',
  },
  filterWrapper: {
    position: 'relative',
  },
  filterButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '45px',
    height: '45px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '50%',
    cursor: 'pointer',
    outline: 'none',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '55px',
    right: 0,
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
    border: '1px solid #f1f5f9',
    padding: '12px 8px',
    width: '160px',
    zIndex: 2000,
  },
  dropdownHeader: {
    fontSize: '0.7rem',
    fontWeight: '700',
    color: '#94a3b8',
    padding: '0 12px 6px 12px',
    letterSpacing: '0.5px',
  },
  dropdownItem: {
    width: '100%',
    padding: '10px 12px',
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#334155',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '10px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  dropdownItemActive: {
    backgroundColor: '#be123c', 
    color: '#ffffff',
    fontWeight: '600',
  },
};

export default SearchAndFilter;