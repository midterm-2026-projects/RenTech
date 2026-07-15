import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LoadingSkeleton from '../../components/LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('renders nothing when not loading', () => {
    const { container } = render(<LoadingSkeleton variant="chart" loading={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders a chart placeholder while loading', () => {
    render(<LoadingSkeleton variant="chart" loading />);
    expect(screen.getByTestId('skeleton-chart')).toBeInTheDocument();
  });

  it('renders the configured number of card placeholders', () => {
    render(<LoadingSkeleton variant="card" count={5} loading />);
    const wrapper = screen.getByTestId('skeleton-cards');
    expect(wrapper.children.length).toBe(5);
  });

  it('renders a table placeholder while loading', () => {
    render(<LoadingSkeleton variant="table" count={3} loading />);
    expect(screen.getByTestId('skeleton-table')).toBeInTheDocument();
  });
});
