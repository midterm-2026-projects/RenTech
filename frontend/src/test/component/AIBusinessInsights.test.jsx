import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AIBusinessInsights from '../../components/AIBusinessInsights';

vi.mock('../../services/analyticsApiClient', () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: { insights: [], suggestions: [] } })),
  },
}));

beforeEach(() => {
  sessionStorage.clear();
});

describe('AIBusinessInsights Component', () => {

  it('renders a fallback UI when data is completely empty or null', async () => {
    render(<AIBusinessInsights insights={null} suggestions={null} />);
    await waitFor(() =>
      expect(screen.getByText(/No AI business insights available/i)).toBeInTheDocument()
    );
  });

  it('correctly renders mock AI-generated insight text', () => {
    const mockInsights = ['Rental demand for winter coats is up 20% this week.'];

    render(<AIBusinessInsights insights={mockInsights} suggestions={[]} />);

    expect(screen.getByText(mockInsights[0])).toBeInTheDocument();
  });

  it('properly updates the UI when new mock prop values are passed', () => {
    const { rerender } = render(
      <AIBusinessInsights insights={['Initial insight']} suggestions={[]} />
    );

    expect(screen.getByText('Initial insight')).toBeInTheDocument();

    rerender(
      <AIBusinessInsights
        insights={['Updated insight']}
        suggestions={['New suggestion']}
      />
    );

    expect(screen.queryByText('Initial insight')).not.toBeInTheDocument();
    expect(screen.getByText('Updated insight')).toBeInTheDocument();
  });

  it('displays insights and no longer renders a suggestions section', () => {
    render(
      <AIBusinessInsights
        insights={['Stock moving quickly.']}
        suggestions={[]}
      />
    );

    expect(screen.queryByText(/No AI business insights available/i)).not.toBeInTheDocument();

    expect(screen.getByTestId('insights-list')).toBeInTheDocument();
    expect(screen.getByText('Stock moving quickly.')).toBeInTheDocument();

    expect(screen.queryByTestId('suggestions-list')).not.toBeInTheDocument();
    expect(screen.queryByText(/No suggestions available/i)).not.toBeInTheDocument();
  });

  it('shows the fallback when no insights are provided', async () => {
    render(<AIBusinessInsights insights={null} suggestions={['Bundle items for discount.']} />);

    await waitFor(() => {
      expect(screen.getByText(/No AI business insights available/i)).toBeInTheDocument();
    });
    expect(screen.queryByTestId('insights-list')).not.toBeInTheDocument();
  });

  it('renders a regenerate button when insights are displayed', () => {
    const mockInsights = ['Rental demand for winter coats is up 20% this week.'];
    render(<AIBusinessInsights insights={mockInsights} suggestions={[]} />);
    expect(screen.getByRole('button', { name: /regenerate/i })).toBeInTheDocument();
  });

  it('shows the loading indicator when insights are being regenerated', async () => {
    const mockInsights = ['Rental demand for winter coats is up 20% this week.'];
    render(<AIBusinessInsights insights={mockInsights} suggestions={[]} />);
    const button = screen.getByRole('button', { name: /regenerate/i });
    expect(button).toBeInTheDocument();
  });

});
