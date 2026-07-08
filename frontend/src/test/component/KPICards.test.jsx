import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import KPICards from '../../components/KPICards';

describe('KPI Cards Component', () => {
  
  it('should show five summary cards with default placeholder values when no data is provided', () => {
    render(<KPICards />);
    
    // Check titles
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('Active Rentals')).toBeInTheDocument();
    expect(screen.getByText('Reservations')).toBeInTheDocument();
    expect(screen.getByText('Forecast Revenue')).toBeInTheDocument();
    expect(screen.getByText('Inventory Items')).toBeInTheDocument();

    // Check default values
    const zeroAmounts = screen.getAllByText('Php0.00');
    expect(zeroAmounts).toHaveLength(2); // Total Revenue, Forecast Revenue

    const zeroCounts = screen.getAllByText('0');
    expect(zeroCounts).toHaveLength(3); // Rentals, Reservations, Inventory
  });

  it('should display correct numerical values when metrics are provided', () => {
    const mockData = {
      totalRevenue: 'Php15,400',
      activeRentals: '32',
      reservations: '14',
      forecastRevenue: 'Php18,200',
      inventoryItems: '240'
    };
    
    render(<KPICards metrics={mockData} />);
    
    expect(screen.getByText('Php15,400')).toBeInTheDocument();
    expect(screen.getByText('32')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('Php18,200')).toBeInTheDocument();
    expect(screen.getByText('240')).toBeInTheDocument();
  });


  it('should display a mix of provided values and default placeholders when partial data is provided', () => {
    const partialData = {
      totalRevenue: 'Php5,000',
      // missing activeRentals
      // missing reservations
      forecastRevenue: 'Php7,500',
      // missing inventoryItems
    };
    
    render(<KPICards metrics={partialData} />);
    
    // Check if the provided values rendered successfully
    expect(screen.getByText('Php5,000')).toBeInTheDocument();
    expect(screen.getByText('Php7,500')).toBeInTheDocument();

    // Check if the missing values properly fell back to default '0'
    const zeroCounts = screen.getAllByText('0');
    expect(zeroCounts).toHaveLength(3); // Rentals, Reservations, Inventory should default to 0
  });

  it('should render the correct icons for each KPI card', () => {
    render(<KPICards />);
    
    // Verifies that the icons are present on the screen using the data-testid
    expect(screen.getByTestId('Total Revenue-icon')).toBeInTheDocument();
    expect(screen.getByTestId('Active Rentals-icon')).toBeInTheDocument();
    expect(screen.getByTestId('Reservations-icon')).toBeInTheDocument();
    expect(screen.getByTestId('Forecast Revenue-icon')).toBeInTheDocument();
    expect(screen.getByTestId('Inventory Items-icon')).toBeInTheDocument();
  });

});
