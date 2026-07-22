import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AnalyticsDashboard from '../../components/AnalyticsDashboard';

vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
  };
});

const sampleRevenue = [{ month: 'Jan', revenue: 4000 }, { month: 'Feb', revenue: 3000 }];
const sampleForecast = [{ month: 'Jan', actualDemand: 45, projectedSMA: 40 }, { month: 'Feb', actualDemand: 52, projectedSMA: 46 }];

describe('Analytics Dashboard Component', () => {
  
  it('should render both the Revenue Trends and Demand Forecasting charts when data is provided', () => {
    render(<AnalyticsDashboard revenueData={sampleRevenue} forecastData={sampleForecast} />);
    
    expect(screen.getByText('Revenue Trends')).toBeInTheDocument();
    expect(screen.getByText('Demand Forecasting (SMA)')).toBeInTheDocument();
  });

  it('should display the correct title text inside the heading elements', () => {
    render(<AnalyticsDashboard revenueData={sampleRevenue} forecastData={sampleForecast} />);
    
    const headings = screen.getAllByRole('heading');
    
    expect(headings[0]).toHaveTextContent('Revenue Trends');
    expect(headings[1]).toHaveTextContent('Demand Forecasting (SMA)');
  });

  it('should show No data available message when both data arrays are empty', () => {
    const { container } = render(<AnalyticsDashboard revenueData={[]} forecastData={[]} />);
    
    expect(container).toHaveTextContent('No data available');
    
    // Ensure the chart titles are hidden
    expect(screen.queryByText('Revenue Trends')).not.toBeInTheDocument(); 
    expect(screen.queryByText('Demand Forecasting (SMA)')).not.toBeInTheDocument(); 
  });

  it('should show No data available message when both data arrays are null', () => {
    render(<AnalyticsDashboard revenueData={null} forecastData={null} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('should render only the Forecasting chart if Revenue data is missing', () => {
    render(<AnalyticsDashboard revenueData={[]} forecastData={sampleForecast} />);
    
    expect(screen.queryByText('Revenue Trends')).not.toBeInTheDocument();
    expect(screen.getByText('Demand Forecasting (SMA)')).toBeInTheDocument();
  });

  it('should render only the Revenue chart if Forecasting data is missing', () => {
    render(<AnalyticsDashboard revenueData={sampleRevenue} forecastData={[]} />);
    
    expect(screen.getByText('Revenue Trends')).toBeInTheDocument();
    expect(screen.queryByText('Demand Forecasting (SMA)')).not.toBeInTheDocument();
  });

  it('should dynamically update the UI when data values change', () => {
    const initialRevenue = [{ month: 'Jan', revenue: 1000 }];
    
    // 1. Render with only revenue data initially
    const { rerender } = render(
      <AnalyticsDashboard revenueData={initialRevenue} forecastData={[]} />
    );
    
    // Verify only Revenue chart is visible
    expect(screen.getByText('Revenue Trends')).toBeInTheDocument();
    expect(screen.queryByText('Demand Forecasting (SMA)')).not.toBeInTheDocument();

    // 2. Prepare new updated data (simulating a successful API call or filter change)
    const updatedRevenue = [{ month: 'Feb', revenue: 5000 }];
    const newForecast = [{ month: 'Feb', actualDemand: 50, projectedSMA: 45 }];

    // 3. Re-render the same component with the new props
    rerender(
      <AnalyticsDashboard revenueData={updatedRevenue} forecastData={newForecast} />
    );

    // Verify both charts are now successfully mounted after the data update
    expect(screen.getByText('Revenue Trends')).toBeInTheDocument();
    expect(screen.getByText('Demand Forecasting (SMA)')).toBeInTheDocument();
  });

});
