import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => <div>{children}</div>,
  };
});

vi.mock('../../services/analyticsApiClient', () => ({
  getAnalyticsDashboard: vi.fn(),
}));

import LiveAdminDashboard from '../../components/LiveAdminDashboard';
import { getAnalyticsDashboard } from '../../services/analyticsApiClient';

describe('LiveAdminDashboard', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows a loading skeleton while fetching', () => {
    getAnalyticsDashboard.mockReturnValue(new Promise(() => {}));
    render(<LiveAdminDashboard />);
    expect(screen.getByTestId('skeleton-chart')).toBeInTheDocument();
  });

  it('shows "No analytics data available" when every source is empty', async () => {
    getAnalyticsDashboard.mockResolvedValue({
      summaries: [],
      forecasts: [],
      kpis: [],
      projections: [],
    });
    render(<LiveAdminDashboard />);
    await waitFor(() =>
      expect(screen.getByText('No analytics data available')).toBeInTheDocument()
    );
  });

  it('renders the dashboard once data loads', async () => {
    getAnalyticsDashboard.mockResolvedValue({
      summaries: [{ period: 'Jan', metric_value: 10 }],
      forecasts: [],
      kpis: [],
      projections: [],
    });
    render(<LiveAdminDashboard />);
    await waitFor(() =>
      expect(screen.getByText('Revenue Trends')).toBeInTheDocument()
    );
  });

  it('shows an error with a Retry button and reloads on click', async () => {
    getAnalyticsDashboard.mockRejectedValue(new Error('boom'));

    render(<LiveAdminDashboard />);
    const retry = await screen.findByRole('button', { name: /retry/i });
    expect(retry).toBeInTheDocument();

    getAnalyticsDashboard.mockResolvedValue({
      summaries: [{ period: 'Jan', metric_value: 10 }],
      forecasts: [],
      kpis: [],
      projections: [],
    });

    await userEvent.click(retry);

    await waitFor(() =>
      expect(screen.getByText('Revenue Trends')).toBeInTheDocument()
    );
  });
});
