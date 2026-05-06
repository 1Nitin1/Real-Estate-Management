CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'client', 'agent')),
  license_number TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_type TEXT NOT NULL CHECK (client_type IN ('buyer', 'seller', 'both')),
  preferences TEXT,
  budget_min INT,
  budget_max INT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  price INT NOT NULL,
  bedrooms INT NOT NULL DEFAULT 0,
  bathrooms DECIMAL(3, 1) NOT NULL DEFAULT 0,
  sq_ft INT NOT NULL DEFAULT 0,
  property_type TEXT NOT NULL CHECK (property_type IN ('house', 'apartment', 'condo', 'townhouse', 'land')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold', 'off_market')),
  description TEXT,
  agent_id INT NOT NULL REFERENCES users(id),
  seller_id INT REFERENCES users(id),
  listed_date DATE DEFAULT CURRENT_DATE,
  sold_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS viewings (
  id SERIAL PRIMARY KEY,
  property_id INT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  client_id INT NOT NULL REFERENCES users(id),
  viewing_date TIMESTAMP NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  property_id INT NOT NULL REFERENCES properties(id),
  buyer_id INT NOT NULL REFERENCES users(id),
  seller_id INT NOT NULL REFERENCES users(id),
  agent_id INT NOT NULL REFERENCES users(id),
  sale_price INT NOT NULL,
  commission_rate DECIMAL(5, 2) NOT NULL DEFAULT 6.0,
  commission_amount INT,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_agent_id ON properties(agent_id);
CREATE INDEX idx_viewings_property_id ON viewings(property_id);
CREATE INDEX idx_viewings_client_id ON viewings(client_id);
CREATE INDEX idx_transactions_agent_id ON transactions(agent_id);

-- SQL VIEW 1: Available properties by location and price range
CREATE OR REPLACE VIEW available_properties_by_location AS
SELECT
  p.id,
  p.title,
  p.address,
  p.city,
  p.state,
  p.price,
  p.bedrooms,
  p.bathrooms,
  p.sq_ft,
  p.property_type,
  p.status,
  u.full_name AS agent_name,
  u.phone AS agent_phone,
  u.email AS agent_email
FROM properties p
JOIN users u ON p.agent_id = u.id
WHERE p.status IN ('active', 'pending')
ORDER BY p.price ASC;

-- SQL VIEW 2: Agent performance metrics
CREATE OR REPLACE VIEW agent_performance AS
SELECT
  u.id,
  u.full_name AS agent_name,
  u.email,
  u.phone,
  COUNT(DISTINCT CASE WHEN t.id IS NOT NULL THEN t.id END) AS total_sales,
  COALESCE(SUM(t.commission_amount), 0) AS total_commission,
  COALESCE(AVG(t.sale_price), 0)::INT AS avg_sale_price,
  COUNT(DISTINCT p.id) AS active_listings,
  COUNT(DISTINCT v.id) AS total_viewings
FROM users u
LEFT JOIN properties p ON u.id = p.agent_id AND p.status != 'sold'
LEFT JOIN transactions t ON u.id = t.agent_id
LEFT JOIN viewings v ON p.id = v.property_id
WHERE u.role = 'agent'
GROUP BY u.id, u.full_name, u.email, u.phone
ORDER BY total_commission DESC;

-- SQL VIEW 3: Market trends and analysis
CREATE OR REPLACE VIEW market_trends AS
SELECT
  p.city,
  p.property_type,
  COUNT(*) AS total_properties,
  COUNT(CASE WHEN p.status = 'sold' THEN 1 END) AS sold_count,
  COALESCE(AVG(CASE WHEN p.status = 'sold' THEN t.sale_price END), 0)::INT AS avg_sold_price,
  MIN(p.price) AS min_price,
  MAX(p.price) AS max_price,
  COALESCE(AVG(p.price), 0)::INT AS avg_listed_price,
  COALESCE(AVG(p.sq_ft), 0)::INT AS avg_sq_ft
FROM properties p
LEFT JOIN transactions t ON p.id = t.property_id
GROUP BY p.city, p.property_type
ORDER BY p.city, total_properties DESC;

-- SQL VIEW 4: Client interaction history
CREATE OR REPLACE VIEW client_interaction_history AS
SELECT
  u.id,
  u.full_name AS client_name,
  u.email,
  c.client_type,
  c.budget_min,
  c.budget_max,
  COUNT(DISTINCT v.id) AS viewings_count,
  COUNT(DISTINCT t.id) AS purchases_count,
  COALESCE(MAX(v.viewing_date), NOW()) AS last_viewing_date,
  COALESCE(MAX(t.transaction_date), CURRENT_DATE) AS last_purchase_date
FROM users u
LEFT JOIN clients c ON u.id = c.user_id
LEFT JOIN viewings v ON u.id = v.client_id
LEFT JOIN transactions t ON u.id = t.buyer_id
WHERE u.role = 'client'
GROUP BY u.id, u.full_name, u.email, c.client_type, c.budget_min, c.budget_max
ORDER BY last_viewing_date DESC;
