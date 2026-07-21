-- 007_seed_products.sql
-- products is now a view over inventory_items (see 010_unify_products.sql),
-- so the catalog is seeded directly into inventory_items. Rows whose name
-- already exists are skipped, making re-runs safe (idempotent).

-- Ensure the columns exist even though 010_unify_products.sql runs later.
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS price DECIMAL(12, 2);
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Available';

INSERT INTO inventory_items (id, name, category, price, image, status, created_at)
SELECT gen_random_uuid(), name, category, price, image, status, now()
FROM (VALUES
  ('Vintage Gatsby Sequin Dress',      'GOWN',   1500, 'https://picsum.photos/seed/BK-201001/500/600', 'Available'),
  ('Champagne Silk A-Line Gown',       'GOWN',   5200, 'https://picsum.photos/seed/BK-201002/500/600', 'Rented'),
  ('Royal Blue Velvet Blazer',         'SUIT',   3500, 'https://picsum.photos/seed/BK-201003/500/600', 'Available'),
  ('Ivory Embroidered Barong Tagalog', 'BARONG', 1800, 'https://picsum.photos/seed/BK-201004/500/600', 'Maintenance'),
  ('Blush Tulle Ballgown',             'GOWN',   6800, 'https://picsum.photos/seed/BK-201005/500/600', 'Available'),
  ('Classic Navy Notch Lapel Suit',    'SUIT',   3400, 'https://picsum.photos/seed/BK-201006/500/600', 'Overdue'),
  ('Crimson Satin Mermaid Gown',       'GOWN',   5900, 'https://picsum.photos/seed/BK-201007/500/600', 'Available'),
  ('Tailored Beige Linen Suit',        'SUIT',   2900, 'https://picsum.photos/seed/BK-201008/500/600', 'Rented'),
  ('Emerald Velvet Gown',              'GOWN',   6100, 'https://picsum.photos/seed/BK-201009/500/600', 'Available'),
  ('White Filipiniana Terno',          'BARONG', 2400, 'https://picsum.photos/seed/BK-201010/500/600', 'Available'),
  ('Black Velvet Dinner Jacket',       'SUIT',   4200, 'https://picsum.photos/seed/BK-201011/500/600', 'Maintenance'),
  ('Rose Gold Sequin Gown',            'GOWN',   7300, 'https://picsum.photos/seed/BK-201012/500/600', 'Available'),
  ('Slim-Fit Charcoal Waistcoat',      'SUIT',   1900, 'https://picsum.photos/seed/BK-201013/500/600', 'Rented'),
  ('Lavender Chiffon Bridesmaid Dress','GOWN',   3300, 'https://picsum.photos/seed/BK-201014/500/600', 'Available'),
  ('Burgundy Velvet Tuxedo',           'SUIT',   4800, 'https://picsum.photos/seed/BK-201015/500/600', 'Overdue'),
  ('Golden Goddess Evening Gown',      'GOWN',   8100, 'https://picsum.photos/seed/BK-201016/500/600', 'Available'),
  ('Modern Barong Jacket',             'BARONG', 2100, 'https://picsum.photos/seed/BK-201017/500/600', 'Available'),
  ('Pearl Beaded Sheath Gown',         'GOWN',   6500, 'https://picsum.photos/seed/BK-201018/500/600', 'Maintenance'),
  ('Steel Grey Three-Piece Suit',      'SUIT',   3900, 'https://picsum.photos/seed/BK-201019/500/600', 'Available'),
  ('Coral Off-Shoulder Gown',          'GOWN',   4700, 'https://picsum.photos/seed/BK-201020/500/600', 'Rented')
) AS p(name, category, price, image, status)
WHERE NOT EXISTS (
  SELECT 1 FROM inventory_items i WHERE i.name = p.name
);
