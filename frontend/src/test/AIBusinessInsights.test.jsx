import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AIBusinessInsights from '../components/AIBusinessInsights';

describe('AIBusinessInsights Component', () => {

  it('renders a fallback UI when data is completely empty or null', () => {
    render(<AIBusinessInsights insights={[]} suggestions={[]} />);
    expect(screen.getByTestId('ai-fallback')).toHaveTextContent(
      'No AI insights or suggestions available'
    );
  });

  it('correctly renders mock AI-generated text/suggestions', () => {
    const mockInsights = ['Rental demand for winter coats is up 20% this week.'];
    const mockSuggestions = ['Recommend styling scarves to customers renting coats.'];

    render(<AIBusinessInsights insights={mockInsights} suggestions={mockSuggestions} />);

    expect(screen.getByText(mockInsights[0])).toBeInTheDocument();
    expect(screen.getByText(mockSuggestions[0])).toBeInTheDocument();
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
    expect(screen.getByText('New suggestion')).toBeInTheDocument();
  });

  it('displays insights but shows fallback for empty suggestions', () => {
    render(
      <AIBusinessInsights
        insights={['Stock moving quickly.']}
        suggestions={[]}
      />
    );

    expect(screen.queryByTestId('ai-fallback')).not.toBeInTheDocument();

    expect(screen.getByTestId('insights-list')).toBeInTheDocument();
    expect(screen.getByText('Stock moving quickly.')).toBeInTheDocument();

    expect(screen.queryByTestId('suggestions-list')).not.toBeInTheDocument();
    expect(screen.getByText('No suggestions available.')).toBeInTheDocument();
  });

  it('displays suggestions but shows fallback for empty insights', () => {
    render(
      <AIBusinessInsights
        insights={null}
        suggestions={['Bundle items for discount.']}
      />
    );

    expect(screen.queryByTestId('ai-fallback')).not.toBeInTheDocument();

    expect(screen.queryByTestId('insights-list')).not.toBeInTheDocument();
    expect(screen.getByText('No insights available.')).toBeInTheDocument();

    expect(screen.getByTestId('suggestions-list')).toBeInTheDocument();
    expect(screen.getByText('Bundle items for discount.')).toBeInTheDocument();
  });

});