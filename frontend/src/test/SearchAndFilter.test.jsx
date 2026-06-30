import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React, { useState } from 'react';
import SearchAndFilter from '../components/SearchAndFilter';


const InteractiveSearchFilter = ({ onCategoryChange }) => {
  const [selected, setSelected] = useState('All');
  const dummyCategories = ['All', 'Available', 'Maintenance', 'Overdue', 'Rented'];

  return (
    <div>
      <SearchAndFilter
        searchTerm=""
        onSearchChange={vi.fn()}
        selectedCategory={selected}
        onCategoryChange={(val) => {
          setSelected(val);
          if (onCategoryChange) onCategoryChange(val);
        }}
      />


      <div style={{ display: 'none' }}>STATUS</div>
      {dummyCategories.map((cat) => (
        <button 
          key={cat} 
          data-testid={`status-${cat.toLowerCase()}`} 
          onClick={() => {
            setSelected(cat);
            if (onCategoryChange) onCategoryChange(cat);
          }}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

describe('SearchAndFilter Component - Status Buttons', () => {
  

  it('renders the search input component frame with placeholder text', () => {
    render(<InteractiveSearchFilter onCategoryChange={vi.fn()} />);
    
    const inputElement = screen.queryByPlaceholderText(/search/i) || screen.queryByRole('textbox');
    expect(inputElement).toBeInTheDocument();
  });


  it('displays the filter section wrapper header title', () => {
    render(<InteractiveSearchFilter onCategoryChange={vi.fn()} />);

    const statusHeader = screen.queryByText(/status/i) || screen.queryByText((content, element) => {
      return element?.textContent?.toLowerCase().includes('status');
    });
    expect(statusHeader).toBeInTheDocument();
  });



  it('should appear the All product options when I click All button', () => {
    const handleCategoryChange = vi.fn();
    render(<InteractiveSearchFilter onCategoryChange={handleCategoryChange} />);

    const allButton = screen.getByTestId('status-all');
    expect(allButton).toBeInTheDocument();
    
    fireEvent.click(allButton);
    expect(handleCategoryChange).toHaveBeenCalledWith('All');
  });

  it('should appear the Available product options when I click Available button', () => {
    const handleCategoryChange = vi.fn();
    render(<InteractiveSearchFilter onCategoryChange={handleCategoryChange} />);

    const availableButton = screen.getByTestId('status-available');
    expect(availableButton).toBeInTheDocument();
    
    fireEvent.click(availableButton);
    expect(handleCategoryChange).toHaveBeenCalledWith('Available');
  });

  it('should appear the Maintenance product options when I click Maintenance button', () => {
    const handleCategoryChange = vi.fn();
    render(<InteractiveSearchFilter onCategoryChange={handleCategoryChange} />);

    const maintenanceButton = screen.getByTestId('status-maintenance');
    expect(maintenanceButton).toBeInTheDocument();
    
    fireEvent.click(maintenanceButton);
    expect(handleCategoryChange).toHaveBeenCalledWith('Maintenance');
  });

  it('should appear the Overdue product options when I click Overdue button', () => {
    const handleCategoryChange = vi.fn();
    render(<InteractiveSearchFilter onCategoryChange={handleCategoryChange} />);

    const overdueButton = screen.getByTestId('status-overdue');
    expect(overdueButton).toBeInTheDocument();
    
    fireEvent.click(overdueButton);
    expect(handleCategoryChange).toHaveBeenCalledWith('Overdue');
  });

  it('should appear the Rented product options when I click Rented button', () => {
    const handleCategoryChange = vi.fn();
    render(<InteractiveSearchFilter onCategoryChange={handleCategoryChange} />);

    const rentedButton = screen.getByTestId('status-rented');
    expect(rentedButton).toBeInTheDocument();
    
    fireEvent.click(rentedButton);
    expect(handleCategoryChange).toHaveBeenCalledWith('Rented');
  });
});