import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Catalog from '../components/Catalog';

describe('Catalog Layout Tests', () => {
  test('renders the Customer Portal badge smoothly and correctly', () => {
    render(<Catalog />);
    
    const portalBadge = screen.getByText('Customer Portal');
    expect(portalBadge).toBeInTheDocument();
    expect(portalBadge).toHaveStyle({ fontWeight: '700' });
  });

  test('renders the main Collection title clearly', () => {
    render(<Catalog />);
    
    const mainTitle = screen.getByRole('heading', { level: 1, name: 'Collection' });
    expect(mainTitle).toBeInTheDocument();
  });

  test('renders the premium formal wear subtitle clearly', () => {
    render(<Catalog />);
    
    const subtitle = screen.getByText('Browse our premium formal wear.');
    expect(subtitle).toBeInTheDocument();
  });
});