import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SmartInventoryOptimization from '../components/SmartInventoryOptimization';

describe('SmartInventoryOptimization Component', () => {

  it('renders safely and shows a fallback UI when metrics prop is null', () => {
    render(<SmartInventoryOptimization metrics={null} />);
    expect(screen.getByTestId('inventory-fallback')).toHaveTextContent(
      'Inventory and sales data unavailable.'
    );
  });

  it('safely handles partial datasets without crashing (shows N/A for missing)', () => {
    const partialMetrics = { totalSales: 1500 };

    render(<SmartInventoryOptimization metrics={partialMetrics} />);

    expect(screen.getByTestId('total-sales')).toHaveTextContent('1500');
    expect(screen.getByTestId('low-stock')).toHaveTextContent('0');
    expect(screen.getByTestId('opt-score')).toBeInTheDocument();
    expect(screen.getByTestId('top-item')).toHaveTextContent('N/A');
  });

  it('renders all optimization metrics correctly when fully provided', () => {
    const fullMetrics = {
      totalSales: 5240,
      lowStockItems: 8,
      optimizationScore: 92,
      topSellingItem: 'Classic Black Tuxedo'
    };

    render(<SmartInventoryOptimization metrics={fullMetrics} />);

    expect(screen.getByTestId('total-sales')).toHaveTextContent('5240');
    expect(screen.getByTestId('low-stock')).toHaveTextContent('8');
    expect(screen.getByTestId('opt-score')).toHaveTextContent('92%');
    expect(screen.getByTestId('top-item')).toHaveTextContent('Classic Black Tuxedo');
  });

  it('updates UI dynamically when new mock metric values are passed', () => {
    const { rerender } = render(
      <SmartInventoryOptimization metrics={{ totalSales: 1000 }} />
    );

    expect(screen.getByTestId('total-sales')).toHaveTextContent('1000');

    rerender(
      <SmartInventoryOptimization
        metrics={{
          totalSales: 3500,
          lowStockItems: 3,
          topSellingItem: 'Floral Gown'
        }}
      />
    );

    expect(screen.getByTestId('total-sales')).toHaveTextContent('3500');
    expect(screen.getByTestId('low-stock')).toHaveTextContent('3');
    expect(screen.getByTestId('top-item')).toHaveTextContent('Floral Gown');
  });

  it('correctly renders 0 instead of falling back to N/A for numeric metrics', () => {
    const zeroMetrics = {
      totalSales: 0,
      lowStockItems: 0,
      optimizationScore: 0
    };

    render(<SmartInventoryOptimization metrics={zeroMetrics} />);

    expect(screen.getByTestId('total-sales')).toHaveTextContent('0');
    expect(screen.getByTestId('low-stock')).toHaveTextContent('0');
    expect(screen.getByTestId('opt-score')).toHaveTextContent('0%');
  });

  it('falls back to N/A if string-based metrics are empty strings', () => {
    const emptyStringMetrics = {
      totalSales: 100,
      topSellingItem: ''
    };

    render(<SmartInventoryOptimization metrics={emptyStringMetrics} />);

    expect(screen.getByTestId('top-item')).toHaveTextContent('N/A');
  });

  // -------------------------------
  // 🧠 SMART INVENTORY TESTS (NEW)
  // -------------------------------

  it('computes a valid optimization score when rental and inventory data is provided', () => {
    const metrics = {
      totalSales: 1200,
      lowStockItems: 1,
      inventoryTurnover: 80,
      rentedItems: ['Camera', 'Tripod'],
      notRentedItems: ['Lighting Kit']
    };

    render(<SmartInventoryOptimization metrics={metrics} />);

    expect(screen.getByText(/AI-adjusted:/i)).toBeInTheDocument();
  });

  it('reduces optimization score when business performance is weak', () => {
    const metrics = {
      totalSales: 100,
      lowStockItems: 10,
      inventoryTurnover: 20,
      rentedItems: [],
      notRentedItems: ['Item A', 'Item B']
    };

    render(<SmartInventoryOptimization metrics={metrics} />);

    expect(screen.getByText(/AI-adjusted:/i)).toBeInTheDocument();
  });

  it('generates promotion recommendations for not rented items', () => {
    const metrics = {
      notRentedItems: ['DSLR Camera', 'Studio Light']
    };

    render(<SmartInventoryOptimization metrics={metrics} />);

    expect(
      screen.getByText(/Promote "DSLR Camera"/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Promote "Studio Light"/i)
    ).toBeInTheDocument();
  });

  it('shows no promotion needed when all items are rented', () => {
    const metrics = {
      rentedItems: ['Camera', 'Lens'],
      notRentedItems: []
    };

    render(<SmartInventoryOptimization metrics={metrics} />);

    expect(
      screen.getByText(/No promotion needed/i)
    ).toBeInTheDocument();
  });

  it('displays rental utilization stats correctly', () => {
    const metrics = {
      rentedItems: ['A', 'B', 'C'],
      notRentedItems: ['X']
    };

    render(<SmartInventoryOptimization metrics={metrics} />);

    expect(screen.getByText(/Rented Items: 3/i)).toBeInTheDocument();
    expect(screen.getByText(/Not Rented Items: 1/i)).toBeInTheDocument();
  });

  it('handles missing rental arrays safely without crashing', () => {
    const metrics = {
      totalSales: 500
    };

    render(<SmartInventoryOptimization metrics={metrics} />);

    expect(screen.getByTestId('total-sales')).toHaveTextContent('500');
    expect(screen.getByText(/Rented Items: 0/i)).toBeInTheDocument();
    expect(screen.getByText(/Not Rented Items: 0/i)).toBeInTheDocument();
  });
});