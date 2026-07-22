import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import Transaction from '../../components/Transaction'; 

const mockTransactions = [
  {
    id: 'TX-1021',
    item: 'Crimson Ballgown',
    username: 'Alice',
    date: '2026-06-01',
    status: 'Completed',
    amount: '1,500'
  },
  {
    id: 'TX-1022',
    item: 'Emerald Evening Gown',
    username: 'Bob',
    date: '2026-06-02',
    status: 'Pending',
    amount: '2,000'
  },
  {
    id: 'TX-1023',
    item: 'Sapphire Tuxedo',
    username: 'Charlie',
    date: '2026-06-03',
    status: 'Completed',
    amount: '2,500'
  }
];

describe('Transaction Component', () => {

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the header title and description', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValueOnce({
      json: async () => ({ status: 'success', data: mockTransactions }),
    });

    render(<Transaction />);
    
    expect(screen.getByRole('heading', { name: /transactions/i })).toBeInTheDocument();
    expect(screen.getByText(/track your active and past reservations/i)).toBeInTheDocument();
  });

  it('renders all initial transactions in the table', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValueOnce({
      json: async () => ({ status: 'success', data: mockTransactions }),
    });

    render(<Transaction />);
    
    expect(await screen.findByText('Crimson Ballgown')).toBeInTheDocument();
    expect(screen.getByText('Emerald Evening Gown')).toBeInTheDocument();
    expect(screen.getByText('Sapphire Tuxedo')).toBeInTheDocument();
    
    expect(screen.getByText('TX-1021')).toBeInTheDocument();
    expect(screen.getByText('TX-1022')).toBeInTheDocument();
    expect(screen.getByText('TX-1023')).toBeInTheDocument();
  });

  it('filters transactions when typing a matching Item name', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValueOnce({
      json: async () => ({ status: 'success', data: mockTransactions }),
    });

    render(<Transaction />);
    const user = userEvent.setup();
    
    await screen.findByText('Crimson Ballgown');

    const searchInput = screen.getByPlaceholderText(/search by id, customer, or item/i);
    await user.type(searchInput, 'Crimson');
    
    expect(screen.getByText('Crimson Ballgown')).toBeInTheDocument();
    expect(screen.queryByText('Emerald Evening Gown')).not.toBeInTheDocument();
    expect(screen.queryByText('Sapphire Tuxedo')).not.toBeInTheDocument();
  });

  it('filters transactions case-insensitively when typing a matching ID', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValueOnce({
      json: async () => ({ status: 'success', data: mockTransactions }),
    });

    render(<Transaction />);
    const user = userEvent.setup();
    
    await screen.findByText('Sapphire Tuxedo');

    const searchInput = screen.getByPlaceholderText(/search by id, customer, or item/i);
    await user.type(searchInput, 'tx-1023');
    
    expect(screen.getByText('Sapphire Tuxedo')).toBeInTheDocument();
    expect(screen.queryByText('Crimson Ballgown')).not.toBeInTheDocument();
    expect(screen.queryByText('Emerald Evening Gown')).not.toBeInTheDocument();
  });

  it('displays a "No transactions found" message when there are no matches', async () => {
    vi.spyOn(window, 'fetch').mockResolvedValueOnce({
      json: async () => ({ status: 'success', data: mockTransactions }),
    });

    render(<Transaction />);
    const user = userEvent.setup();
    
    await screen.findByText('Crimson Ballgown');

    const searchInput = screen.getByPlaceholderText(/search by id, customer, or item/i);
    await user.type(searchInput, 'Non-existent Item');
    
    expect(screen.queryByText('Crimson Ballgown')).not.toBeInTheDocument();
    expect(screen.getByText('No transactions found.')).toBeInTheDocument();
  });
});