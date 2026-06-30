import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';
import ProductCard from '../components/ProductCard';


const CatalogListMock = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div data-testid="empty-state-view">
        <p>No products found</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {items.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

describe('ProductCard & Catalog Component Tests', () => {
  const sampleProduct = {
    id: 1,
    name: 'Test Suit',
    category: 'Suit',
    price: 1000,
    status: 'Available',
    image: 'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?w=500'
  };


  it('renders product details correctly', () => {
    render(<ProductCard product={sampleProduct} />);
    
    expect(screen.getByText('Test Suit')).toBeInTheDocument();
    expect(screen.getByText('Rent Now')).toBeInTheDocument();
  });


  it('should look empty when the product list is empty', () => {
    // Render the mock catalog with an empty array []
    render(<CatalogListMock items={[]} />);


    const emptyStateElement = screen.getByTestId('empty-state-view');
    expect(emptyStateElement).toBeInTheDocument();


    const emptyMessage = screen.getByText(/no products found/i);
    expect(emptyMessage).toBeInTheDocument();


    const productTitle = screen.queryByText('Test Suit');
    expect(productTitle).not.toBeInTheDocument();
  });
});