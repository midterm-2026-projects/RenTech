import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import Transaction from '../components/Transaction'; 

describe('Transaction Component', () => {
  
  it('renders the header title and description', () => {
    render(<Transaction />);
    
    expect(screen.getByRole('heading', { name: /transactions/i })).toBeInTheDocument();
    expect(screen.getByText(/track your active and past reservations/i)).toBeInTheDocument();
  });

  it('renders all initial transactions in the table', () => {
    render(<Transaction />);
    
    
    expect(screen.getByText('Crimson Ballgown')).toBeInTheDocument();
    expect(screen.getByText('Emerald Evening Gown')).toBeInTheDocument();
    expect(screen.getByText('Sapphire Tuxedo')).toBeInTheDocument();
    
    
    expect(screen.getByText('TX-1021')).toBeInTheDocument();
    expect(screen.getByText('TX-1022')).toBeInTheDocument();
    expect(screen.getByText('TX-1023')).toBeInTheDocument();
  });

  it('filters transactions when typing a matching Item name', async () => {
    render(<Transaction />);
    const user = userEvent.setup();
    
    const searchInput = screen.getByPlaceholderText(/search by id, customer, or item/i);
    
    
    await user.type(searchInput, 'Crimson');
    
    
    expect(screen.getByText('Crimson Ballgown')).toBeInTheDocument();
    
    
    expect(screen.queryByText('Emerald Evening Gown')).not.toBeInTheDocument();
    expect(screen.queryByText('Sapphire Tuxedo')).not.toBeInTheDocument();
  });

  it('filters transactions case-insensitively when typing a matching ID', async () => {
    render(<Transaction />);
    const user = userEvent.setup();
    
    const searchInput = screen.getByPlaceholderText(/search by id, customer, or item/i);
    
    
    await user.type(searchInput, 'tx-1023');
    
    
    expect(screen.getByText('Sapphire Tuxedo')).toBeInTheDocument();
    
    
    expect(screen.queryByText('Crimson Ballgown')).not.toBeInTheDocument();
    expect(screen.queryByText('Emerald Evening Gown')).not.toBeInTheDocument();
  });

  it('displays a "No transactions found" message when there are no matches', async () => {
    render(<Transaction />);
    const user = userEvent.setup();
    
    const searchInput = screen.getByPlaceholderText(/search by id, customer, or item/i);
    
    
    await user.type(searchInput, 'Non-existent Item');
    
    
    expect(screen.queryByText('Crimson Ballgown')).not.toBeInTheDocument();
    
    
    expect(screen.getByText('No transactions found.')).toBeInTheDocument();
  });
});