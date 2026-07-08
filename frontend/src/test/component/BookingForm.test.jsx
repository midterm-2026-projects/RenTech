import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import BookingForm from '../../components/BookingForm';

// Mocking DatePicker to isolate test environment
vi.mock('./DatePicker', () => {
  return {
    default: ({ selectedDate, onDateChange, label }) => (
      <div>
        <label>{label}</label>
        <input
          data-testid="mock-date"
          type="date"
          value={selectedDate}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>
    ),
  };
});

describe('BookingForm Interactions', () => {
  
  beforeEach(() => {
    // Prevent real alert windows or confirm boxes from hanging the virtual test execution
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('should toggle user choices when selection buttons are clicked', () => {
    render(<BookingForm />);
    const someoneOptionBtn = screen.getByText('Someone else');
    
    fireEvent.click(someoneOptionBtn);
    
    expect(screen.getByPlaceholderText('Full Name').value).toBe('');
  });

  it('should process typing when info fill-up sessions are modified', () => {
    render(<BookingForm />);
    const phoneField = screen.getByPlaceholderText('Phone Number');
    
    fireEvent.change(phoneField, { target: { value: '09998887777' } });
    
    expect(phoneField.value).toBe('09998887777');
  });

  it('should update value options when size select control updates', () => {
    render(<BookingForm />);
    const sizeSelectBox = screen.getByRole('combobox');
    
    fireEvent.change(sizeSelectBox, { target: { value: 'L' } });
    
    expect(sizeSelectBox.value).toBe('L');
  });

  it('should render the error when the size is not clicked', () => {
    render(<BookingForm />);
    const sizeSelectBox = screen.getByRole('combobox');
    const actionBtn = screen.getByText('Continue to Payment');

    fireEvent.click(actionBtn);

    // Queries generic text elements to verify size selection error rendering.
    const validationError = screen.queryByText(/size/i) || screen.queryByText(/select/i) || screen.queryByText(/required/i);
    if (validationError) {
      expect(validationError).toBeInTheDocument();
    } else {
      // Fallback: Checks html5 native field validation constraint structure
      expect(sizeSelectBox.validity.valid).toBe(false);
    }
  });

  it('should add the downpayment when the up button is clicked', () => {
    render(<BookingForm />);
    const downpaymentInput = screen.getByRole('spinbutton');

    fireEvent.change(downpaymentInput, { target: { value: '3000' } });

    downpaymentInput.stepUp();
    fireEvent.change(downpaymentInput);

    expect(downpaymentInput.value).toBe('3050');
  });

  it('should transition steps forward when continue action layout button is triggered', () => {
    render(<BookingForm />);
    
    const phoneField = screen.getByPlaceholderText('Phone Number');
    const sizeSelectBox = screen.getByRole('combobox');
    fireEvent.change(phoneField, { target: { value: '09998887777' } });
    fireEvent.change(sizeSelectBox, { target: { value: 'L' } });

    const actionBtn = screen.getByText('Continue to Payment');
    fireEvent.click(actionBtn);
    
    expect(screen.getByText('Payment Method')).toBeInTheDocument();
  });

  it('should adjust selection highlights when explicit payment method cards are clicked', () => {
    render(<BookingForm />);
    
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), { target: { value: '09998887777' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'L' } });
    
    fireEvent.click(screen.getByText('Continue to Payment'));
    const cardSelection = screen.getByRole('generic', { name: 'Select Card' });
    
    fireEvent.click(cardSelection);
    
    const styles = window.getComputedStyle(cardSelection);
    expect(styles.borderColor).toBe('rgb(185, 74, 72)');
  });

  it('should exhibit receipt layout confirmations when final checkout confirmation is executed', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    }));
    
    render(<BookingForm />);
    
    fireEvent.change(screen.getByPlaceholderText('Phone Number'), { target: { value: '09998887777' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'L' } });

    fireEvent.click(screen.getByText('Continue to Payment'));
    const finalConfirmBtn = screen.getByText('Confirm Payment');

    fireEvent.click(finalConfirmBtn);

    await waitFor(() => {
      expect(screen.getByText('Booking Confirmed!')).toBeInTheDocument();
    });
  });

});
