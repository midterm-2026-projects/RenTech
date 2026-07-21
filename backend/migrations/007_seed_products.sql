-- 007_seed_products.sql
-- The products table already exists with 4 sample rows. Seed additional
-- inventory so the admin inventory view has enough records to paginate.
-- Existing rows are preserved (ON CONFLICT DO NOTHING on the primary key).

INSERT INTO products (id, name, category, price, image, status) VALUES
  ('BK-201001', 'Vintage Gatsby Sequin Dress',      'GOWN',      1500, 'https://picsum.photos/seed/BK-201001/500/600', 'Available'),
  ('BK-201002', 'Champagne Silk A-Line Gown',       'GOWN',      5200, 'https://picsum.photos/seed/BK-201002/500/600', 'Rented'),
  ('BK-201003', 'Royal Blue Velvet Blazer',         'SUIT',      3500, 'https://picsum.photos/seed/BK-201003/500/600', 'Available'),
  ('BK-201004', 'Ivory Embroidered Barong Tagalog', 'BARONG',    1800, 'https://picsum.photos/seed/BK-201004/500/600', 'Maintenance'),
  ('BK-201005', 'Blush Tulle Ballgown',             'GOWN',      6800, 'https://picsum.photos/seed/BK-201005/500/600', 'Available'),
  ('BK-201006', 'Classic Navy Notch Lapel Suit',    'SUIT',      3400, 'https://picsum.photos/seed/BK-201006/500/600', 'Overdue'),
  ('BK-201007', 'Crimson Satin Mermaid Gown',       'GOWN',      5900, 'https://picsum.photos/seed/BK-201007/500/600', 'Available'),
  ('BK-201008', 'Tailored Beige Linen Suit',        'SUIT',      2900, 'https://picsum.photos/seed/BK-201008/500/600', 'Rented'),
  ('BK-201009', 'Emerald Velvet Gown',              'GOWN',      6100, 'https://picsum.photos/seed/BK-201009/500/600', 'Available'),
  ('BK-201010', 'White Filipiniana Terno',          'BARONG',    2400, 'https://picsum.photos/seed/BK-201010/500/600', 'Available'),
  ('BK-201011', 'Black Velvet Dinner Jacket',       'SUIT',      4200, 'https://picsum.photos/seed/BK-201011/500/600', 'Maintenance'),
  ('BK-201012', 'Rose Gold Sequin Gown',            'GOWN',      7300, 'https://picsum.photos/seed/BK-201012/500/600', 'Available'),
  ('BK-201013', 'Slim-Fit Charcoal Waistcoat',      'SUIT',      1900, 'https://picsum.photos/seed/BK-201013/500/600', 'Rented'),
  ('BK-201014', 'Lavender Chiffon Bridesmaid Dress','GOWN',      3300, 'https://picsum.photos/seed/BK-201014/500/600', 'Available'),
  ('BK-201015', 'Burgundy Velvet Tuxedo',           'SUIT',      4800, 'https://picsum.photos/seed/BK-201015/500/600', 'Overdue'),
  ('BK-201016', 'Golden Goddess Evening Gown',      'GOWN',      8100, 'https://picsum.photos/seed/BK-201016/500/600', 'Available'),
  ('BK-201017', 'Modern Barong Jacket',             'BARONG',    2100, 'https://picsum.photos/seed/BK-201017/500/600', 'Available'),
  ('BK-201018', 'Pearl Beaded Sheath Gown',         'GOWN',      6500, 'https://picsum.photos/seed/BK-201018/500/600', 'Maintenance'),
  ('BK-201019', 'Steel Grey Three-Piece Suit',      'SUIT',      3900, 'https://picsum.photos/seed/BK-201019/500/600', 'Available'),
  ('BK-201020', 'Coral Off-Shoulder Gown',          'GOWN',      4700, 'https://picsum.photos/seed/BK-201020/500/600', 'Rented')
ON CONFLICT (id) DO NOTHING;
