CREATE TABLE IF NOT EXISTS bookings (
  id VARCHAR(255) PRIMARY KEY,
  item_name VARCHAR(255) NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  booking_type VARCHAR(50) NOT NULL,
  full_name VARCHAR(255),
  phone_number VARCHAR(100),
  address TEXT,
  special_notes TEXT,
  rental_date DATE NOT NULL,
  size_selected VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);