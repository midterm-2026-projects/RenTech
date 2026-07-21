import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../services/inventoryApiClient', () => ({
  getProducts: vi.fn(),
}));

import InventoryManagement from '../../components/InventoryManagement';
import { getProducts } from '../../services/inventoryApiClient';

const PRODUCTS = [
  { id: 1, name: 'Ivory Lace Gown', category: 'wedding', price: 1500, status: 'Available' },
  { id: 2, name: 'Black Tuxedo', category: 'suit', price: 800, status: 'Rented' },
  { id: 3, name: 'Velvet Cloak', category: 'costume', price: 600, status: 'Maintenance' },
];

describe('InventoryManagement Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading state then renders stat cards and the stock table', async () => {
    getProducts.mockResolvedValue({
      data: PRODUCTS,
      total: PRODUCTS.length,
      totalPages: 1,
      page: 1,
      limit: 8,
    });

    render(<InventoryManagement />);

    expect(screen.getByText(/Loading inventory/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Stock Levels')).toBeInTheDocument();
    });

    expect(getProducts).toHaveBeenCalledWith({ page: 1, limit: 8 });
    expect(screen.getAllByText('Ivory Lace Gown').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Black Tuxedo').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Velvet Cloak').length).toBeGreaterThan(0);
  });

  it('renders the expected summary statistics from the loaded products', async () => {
    getProducts.mockResolvedValue({
      data: PRODUCTS,
      total: PRODUCTS.length,
      totalPages: 1,
      page: 1,
      limit: 8,
    });

    render(<InventoryManagement />);

    await waitFor(() => expect(screen.getByText('Total Items')).toBeInTheDocument());

    expect(screen.getByText(String(PRODUCTS.length))).toBeInTheDocument();
    expect(screen.getByText('Optimization Score')).toBeInTheDocument();
    expect(screen.getByText('AI Promotion Recommendations')).toBeInTheDocument();
    expect(screen.getByText(/Promote "Ivory Lace Gown"/i)).toBeInTheDocument();
  });

  it('displays an error message when the API call fails', async () => {
    getProducts.mockRejectedValue(new Error('Failed to load inventory'));

    render(<InventoryManagement />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load inventory/i)).toBeInTheDocument();
    });
    expect(screen.queryByText('Ivory Lace Gown')).not.toBeInTheDocument();
  });

  it('shows the empty state when there are no products', async () => {
    getProducts.mockResolvedValue({
      data: [],
      total: 0,
      totalPages: 1,
      page: 1,
      limit: 8,
    });

    render(<InventoryManagement />);

    await waitFor(() => {
      expect(screen.getByText(/No inventory data available/i)).toBeInTheDocument();
    });
  });

  it('renders pagination controls and loads the next page on click', async () => {
    getProducts
      .mockResolvedValueOnce({
        data: PRODUCTS,
        total: 20,
        totalPages: 3,
        page: 1,
        limit: 8,
      })
      .mockResolvedValueOnce({
        data: [{ id: 9, name: 'Page Two Gown', category: 'evening', price: 900, status: 'Available' }],
        total: 20,
        totalPages: 3,
        page: 2,
        limit: 8,
      });

    const user = userEvent.setup();
    render(<InventoryManagement />);

    await waitFor(() => expect(screen.getByText('Stock Levels')).toBeInTheDocument());

    const nextBtn = screen.getByRole('button', { name: /Next/i });
    await user.click(nextBtn);

    await waitFor(() => {
      expect(screen.getByText('Page Two Gown')).toBeInTheDocument();
    });
    expect(getProducts).toHaveBeenLastCalledWith({ page: 2, limit: 8 });
  });
});
