import React from 'react';

export default function DatePicker({ selectedDate, onDateChange, label }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#666', marginBottom: '6px' }}>
        {label}
      </label>
      <input 
        type="date" 
        value={selectedDate} 
        onChange={(e) => onDateChange(e.target.value)}
        style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e8e8e8', boxSizing: 'border-box' }}
      />
    </div>
  );
}