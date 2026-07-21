import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import KPICards from '../../components/KPICards';

describe('KPI Cards Component', () => {
  // Only the most important intelligence KPIs are shown:
  // Total Revenue, Forecast Revenue, Active Rentals, Utilization, Overdue Returns.

  it('should show summary cards with default placeholder values when no data is provided', () => {
    render(<KPICards />);

    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('Forecast Revenue')).toBeInTheDocument();
    expect(screen.getByText('Active Rentals')).toBeInTheDocument();
    expect(screen.getByText('Utilization')).toBeInTheDocument();
    expect(screen.getByText('Overdue Returns')).toBeInTheDocument();

    expect(screen.getAllByText('₱0')).toHaveLength(2);
  });

  it('should display correct numerical values when metrics are provided', () => {
    const mockData = {
      totalRevenue: '₱15,400',
      activeRentals: '32',
      forecastRevenue: '₱18,200',
      utilization: '78%',
      overdueReturns: '3',
    };

    render(<KPICards metrics={mockData} />);

    expect(screen.getByText('₱15,400')).toBeInTheDocument();
    expect(screen.getByText('32')).toBeInTheDocument();
    expect(screen.getByText('₱18,200')).toBeInTheDocument();
    expect(screen.getByText('78%')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should display a mix of provided values and default placeholders when partial data is provided', () => {
    const partialData = {
      totalRevenue: '₱5,000',
      forecastRevenue: '₱7,500',
    };

    render(<KPICards metrics={partialData} />);

    expect(screen.getByText('₱5,000')).toBeInTheDocument();
    expect(screen.getByText('₱7,500')).toBeInTheDocument();
  });

  it('should render the correct icons for each KPI card', () => {
    render(<KPICards />);

    expect(screen.getByTestId('Total Revenue-icon')).toBeInTheDocument();
    expect(screen.getByTestId('Forecast Revenue-icon')).toBeInTheDocument();
    expect(screen.getByTestId('Active Rentals-icon')).toBeInTheDocument();
    expect(screen.getByTestId('Utilization-icon')).toBeInTheDocument();
    expect(screen.getByTestId('Overdue Returns-icon')).toBeInTheDocument();
  });
});
