import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import DatePicker from '../../components/DatePicker';

describe('DatePicker Component', () => {

  it('should render the correct label text', () => {
    render(<DatePicker label="Select Rental Date" selectedDate="" onDateChange={() => {}} />);
    expect(screen.getByText('Select Rental Date')).toBeInTheDocument();
  });

  it('should display the initial selected date', () => {
    // We pull out "container" here to help us select the input element directly
    const { container } = render(<DatePicker label="Date" selectedDate="2026-06-30" onDateChange={() => {}} />);
    
    // This finds the <input /> tag on the page directly
    const dateInput = container.querySelector('input');
    
    expect(dateInput.value).toBe('2026-06-30');
  });

  it('should call onDateChange when a new date is picked', () => {
    const mockOnDateChange = vi.fn();
    const { container } = render(<DatePicker label="Date" selectedDate="" onDateChange={mockOnDateChange} />);
    
    // This finds the <input /> tag on the page directly
    const dateInput = container.querySelector('input');

    fireEvent.change(dateInput, { target: { value: '2026-07-15' } });

    expect(mockOnDateChange).toHaveBeenCalledWith('2026-07-15');
  });

});
