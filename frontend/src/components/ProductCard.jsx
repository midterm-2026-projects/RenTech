import React, { useState } from 'react';

const ProductCard = ({ product, onRentClick }) => {
  const [isImageHovered, setIsImageHovered] = useState(false);

  const getStatusButtonStyle = (status) => {
    switch (status) {
      case 'Available':
        return { backgroundColor: '#b94a48', color: '#ffffff', border: '1px solid #b94a48' };
      case 'Rented':
        return { backgroundColor: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0', cursor: 'not-allowed' };
      case 'Maintenance':
        return { backgroundColor: '#fef3c7', color: '#d97706', border: '1px solid #fde68a', cursor: 'not-allowed' };
      case 'Overdue':
        return { backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', cursor: 'not-allowed' };
      default:
        return { backgroundColor: '#ffffff', color: '#1e293b', border: '1px solid #e2e8f0' };
    }
  };

  const statusStyle = getStatusButtonStyle(product.status);
  const buttonText = product.status === 'Available' ? 'Rent Now' : product.status === 'Rented' ? 'Unavailable' : product.status;

  return (
    <div style={styles.cardContainer}>
      <div 
        style={styles.imageWrapper}
        onMouseEnter={() => setIsImageHovered(true)}
        onMouseLeave={() => setIsImageHovered(false)}
      >
        <img 
          src={product.image} 
          alt={product.name} 
          style={{
            ...styles.image,
            transform: isImageHovered ? 'scale(1.05)' : 'scale(1)'
          }} 
        />
      </div>

      <div style={styles.detailsContainer}>
        <span style={styles.categoryLabel}>{product.category ? product.category.toUpperCase() : 'PRODUCT'}</span>
        <h3 style={styles.productTitle}>{product.name}</h3>
        <div style={styles.priceTag}>₱{product.price.toLocaleString()}</div>
        
        <div style={styles.actionArea}>
          <button 
            style={{ ...styles.statusButton, ...statusStyle }}
            disabled={product.status !== 'Available'}
            onClick={() => product.status === 'Available' && onRentClick && onRentClick(product)}
            type="button"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  cardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    border: '1px solid #f1f5f9',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01)',
    overflow: 'hidden', 
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minHeight: '410px',
  },
  imageWrapper: {
    width: '100%',
    height: '250px',
    backgroundColor: '#f9fafb',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.4s ease',
  },
  detailsContainer: {
    padding: '20px 16px 24px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    flexGrow: 1,
  },
  categoryLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#94a3b8',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },
  productTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#0f172a',
    margin: 0,
    lineHeight: '1.4',
  },
  priceTag: {
    fontSize: '1.05rem',
    fontWeight: '700',
    color: '#0f172a',
    marginTop: '6px',
  },
  actionArea: {
    width: '100%',
    marginTop: 'auto',
  },
  statusButton: {
    width: '100%',
    padding: '11px 0',
    fontSize: '0.85rem',
    fontWeight: '600',
    borderRadius: '20px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.15s ease',
  },
};

ProductCard.products = [
  {
    id: 'BK-839260',
    name: "Emerald Silk Mermaid Evening Gown",
    price: 4500,
    category: "GOWN",
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500&auto=format&fit=crop&q=80", 
    status: "Available"
  },
  {
    id: 'BK-112233',
    name: "A-Line Ivory Lace Wedding Gown",
    price: 7500,
    category: "GOWN",
    image: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=500&auto=format&fit=crop&q=80",
    status: "Rented"
  },
  {
    id: 'BK-445566',
    name: "Midnight Black Peak Lapel Tuxedo",
    price: 3800,
    category: "SUIT",
    image: "https://images.unsplash.com/photo-1593030103066-0093718efeb9?w=500&auto=format&fit=crop&q=80",
    status: "Maintenance"
  },
  {
    id: 'BK-778899',
    name: "Modern Charcoal Grey Slim Suit",
    price: 3200,
    category: "SUIT",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&auto=format&fit=crop&q=80",
    status: "Overdue"
  }
];

export default ProductCard;