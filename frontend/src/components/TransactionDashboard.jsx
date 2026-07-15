import React, { useState, useEffect } from 'react';

export default function TransactionDashboard() {
  const [searchText, setSearchText] = useState("");
  const [userRole, setUserRole] = useState("Admin"); 
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState({
    Active: false,
    Reserved: false,
    Returned: false 
  });

  const [transactions, setTransactions] = useState([
    { id: "TX-1001", username: "ana rivera", itemName: "Vintage Gatsby Sequin Dress", date: "May 01, 2026", pricePerDay: 500, daysRented: 3, totalCost: 1500, status: "Active" },
    { id: "TX-1002", username: "carlos mendez", itemName: "Barong Tagalog", date: "May 02, 2026", pricePerDay: 400, daysRented: 2, totalCost: 800, status: "Active" },
    { id: "TX-1003", username: "liza santos", itemName: "Emerald Velvet Gown", date: "May 03, 2026", pricePerDay: 600, daysRented: 3, totalCost: 1800, status: "Active" },
    { id: "TX-1004", username: "daniel cruz", itemName: "Black Tuxedo", date: "May 04, 2026", pricePerDay: 700, daysRented: 2, totalCost: 1400, status: "Returned" },
    { id: "TX-1005", username: "isabel garcia", itemName: "Champagne Silk Gown", date: "May 02, 2026", pricePerDay: 850, daysRented: 2, totalCost: 1700, status: "Active" }
  ]);

  useEffect(function() {
    const savedSession = localStorage.getItem('rentech_session');
    if (savedSession !== null) {
      const parsedSession = JSON.parse(savedSession);
      if (parsedSession.role) {
        setUserRole(parsedSession.role);
      }
    }
  }, []);

  function handleReturnClick(idToUpdate) {
    const updatedArray = [];
    for (let i = 0; i < transactions.length; i++) {
      const currentItem = transactions[i];
      if (currentItem.id === idToUpdate) {
        updatedArray.push({ ...currentItem, status: "Returned" });
      } else {
        updatedArray.push(currentItem);
      }
    }
    setTransactions(updatedArray);
    alert("Item status updated to Returned!");
  }

  function handleCheckboxChange(statusKey) {
    setSelectedStatuses(prev => ({
      ...prev,
      [statusKey]: !prev[statusKey]
    }));
  }

  const filteredTransactions = [];
  const searchKeyword = searchText.toLowerCase().trim();

  const isAnyStatusFilterActive = selectedStatuses.Active || selectedStatuses.Reserved || selectedStatuses.Returned;

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
      matchesStatus = false;
      if (selectedStatuses.Active && item.status === "Active") matchesStatus = true;
      if (selectedStatuses.Reserved && item.status === "Reserved") matchesStatus = true;
      if (selectedStatuses.Returned && item.status === "Returned") matchesStatus = true;
    }

    if (matchesSearch && matchesStatus) {
      filteredTransactions.push(item);
    }
  }

  function renderTableRows() {
    const tableRowsHtml = [];

    for (let i = 0; i < filteredTransactions.length; i++) {
      const item = filteredTransactions[i];

      let actionElement = null;
      if (userRole === "Customer") {
        actionElement = <span style={{ color: '#cbd5e1', fontSize: '13px' }}>None</span>;
      } else if (item.status === "Returned") {
        actionElement = (
          <button 
            disabled
            style={{ border: 'none', backgroundColor: '#f1f5f9', color: '#cbd5e1', width: '32px', height: '32px', borderRadius: '50%', cursor: 'not-allowed', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Already returned"
          >
            ↩
          </button>
        );
      } else {
        actionElement = (
          <button 
            onClick={function() { handleReturnClick(item.id); }}
            style={{ border: 'none', backgroundColor: '#fff5f5', color: '#e05656', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Process Return Modification"
          >
            ↩
          </button>
        );
      }

      let statusBgColor = '#ecfdf5';
      let statusTextColor = '#059669';
      if (item.status === 'Returned') {
        statusBgColor = '#ede9fe';
        statusTextColor = '#7c3aed';
      } else if (item.status === 'Reserved') {
        statusBgColor = '#fef3c7';
        statusTextColor = '#d97706';
      }

      tableRowsHtml.push(
        <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
          <td style={{ padding: '20px 12px', fontWeight: 'bold', color: '#1e293b', fontSize: '15px' }}>{item.id}</td>
          <td style={{ padding: '20px 12px', color: '#334155', fontSize: '15px', textTransform: 'capitalize' }}>{item.username}</td>
          <td style={{ padding: '20px 12px', color: '#64748b', fontSize: '15px' }}>{item.itemName}</td>
          <td style={{ padding: '20px 12px', color: '#64748b', fontSize: '15px' }}>{item.date}</td>
          <td style={{ padding: '20px 12px' }}>
            <span style={{ backgroundColor: statusBgColor, color: statusTextColor, padding: '6px 14px', borderRadius: '15px', fontSize: '13px', fontWeight: '600' }}>
              {item.status}
            </span>
          </td>
          <td style={{ padding: '20px 12px', fontWeight: 'bold', color: '#1e293b', fontSize: '15px' }}>₱{item.totalCost.toLocaleString()}</td>
          <td style={{ padding: '20px 12px' }}>{actionElement}</td>
        </tr>
      );
    }

    return tableRowsHtml;
  }

  return (
    /* Top Main Layout Frame Layer restricting frame height view */
    <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', fontFamily: 'sans-serif' }}>
      
      {/* INDEPENDENTLY SCROLLABLE DATA DASHBOARD BODY */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 40px 40px 40px' }}>
        <h1 style={{ margin: '0 0 5px 0', fontSize: '32px', color: '#0f172a', fontWeight: 'bold' }}>Records</h1>
        <p style={{ color: 'gray', margin: '0 0 30px 0', fontSize: '16px' }}>Digital logbook of all rental transactions.</p>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px', position: 'relative' }}>
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
              onChange={function(e) { setSearchText(e.target.value); }}
              style={{ 
                padding: '14px 24px 14px 48px', 
                width: '426px', 
                borderRadius: '25px', 
                border: '1px solid #e2e8f0', 
                backgroundColor: '#f8fafc', 
                outline: 'none', 
                fontSize: '15px' 
              }}
            />
          </div>
          
          <button 
            aria-label="Filter configuration options"
            onClick={function() { setIsFilterOpen(!isFilterOpen); }}
            style={{ 
              marginLeft: '12px', 
              width: '45px', 
              height: '45px', 
              borderRadius: '50%', 
              border: '1px solid #e2e8f0', 
              backgroundColor: isFilterOpen ? '#f1f5f9' : 'white', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '0',
              outline: 'none'
            }}
          >
            <svg 
              width="21" 
              height="21" 
              viewBox="0 0 24 24" 
              fill="none" 
              style={{ display: 'block' }}
            >
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
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#334155', fontSize: '15px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={selectedStatuses.Active} onChange={function() { handleCheckboxChange('Active'); }} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  Active
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#334155', fontSize: '15px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={selectedStatuses.Reserved} onChange={function() { handleCheckboxChange('Reserved'); }} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  Reserved
                </label>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#334155', fontSize: '15px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={selectedStatuses.Returned} onChange={function() { handleCheckboxChange('Returned'); }} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  Returned
                </label>
              </div>
            </div>
          )}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #edf2f7' }}>
              <th style={{ padding: '16px 12px', color: '#64748b', fontWeight: '500', fontSize: '15px' }}>ID</th>
              <th style={{ padding: '16px 12px', color: '#64748b', fontWeight: '500', fontSize: '15px' }}>Customer</th>
              <th style={{ padding: '16px 12px', color: '#64748b', fontWeight: '500', fontSize: '15px' }}>Item</th>
              <th style={{ padding: '16px 12px', color: '#64748b', fontWeight: '500', fontSize: '15px' }}>Date</th>
              <th style={{ padding: '16px 12px', color: '#64748b', fontWeight: '500', fontSize: '15px' }}>Status</th>
              <th style={{ padding: '16px 12px', color: '#64748b', fontWeight: '500', fontSize: '15px' }}>Amount</th>
              <th style={{ padding: '16px 12px', color: '#64748b', fontWeight: '500', fontSize: '15px' }}>Action</th>
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
      </div>
    </div>
  );
}