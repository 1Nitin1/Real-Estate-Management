-- Clear existing data
TRUNCATE TABLE transactions, viewings, properties, clients, users CASCADE;

-- Insert users (mix of admins, agents, and clients)
INSERT INTO users (full_name, email, phone, role, license_number) VALUES
  ('Admin User', 'admin@realestate.com', '555-0001', 'admin', NULL),
  ('Alice Johnson', 'alice@agents.com', '555-1001', 'agent', 'AL-2024-001'),
  ('Bob Smith', 'bob@agents.com', '555-1002', 'agent', 'BS-2024-002'),
  ('Charlie Davis', 'charlie@agents.com', '555-1003', 'agent', 'CD-2024-003'),
  ('Emma Wilson', 'emma@clients.com', '555-2001', 'client', NULL),
  ('Frank Miller', 'frank@clients.com', '555-2002', 'client', NULL),
  ('Grace Lee', 'grace@clients.com', '555-2003', 'client', NULL),
  ('Henry Brown', 'henry@clients.com', '555-2004', 'client', NULL),
  ('Iris Garcia', 'iris@clients.com', '555-2005', 'client', NULL),
  ('Jack Taylor', 'jack@clients.com', '555-2006', 'client', NULL);

-- Insert clients
INSERT INTO clients (user_id, client_type, preferences, budget_min, budget_max) VALUES
  (5, 'buyer', 'Modern apartment with gym', 200000, 400000),
  (6, 'seller', 'Quick sale', 500000, NULL),
  (7, 'both', 'Suburban house', 300000, 600000),
  (8, 'buyer', 'Downtown loft', 250000, 450000),
  (9, 'seller', 'Estate sale needed', 800000, NULL),
  (10, 'buyer', 'Family home', 400000, 700000);

-- Insert properties
INSERT INTO properties (title, address, city, state, zip_code, price, bedrooms, bathrooms, sq_ft, property_type, status, description, agent_id, seller_id, listed_date, sold_date) VALUES
  ('Sunny Downtown Loft', '123 Main St', 'New York', 'NY', '10001', 350000, 1, 1.5, 800, 'apartment', 'active', 'Modern loft in heart of downtown', 2, 6, '2024-01-15', NULL),
  ('Cozy Suburban Home', '456 Oak Ave', 'Boston', 'MA', '02101', 450000, 3, 2, 1800, 'house', 'active', 'Family-friendly suburban home', 2, 9, '2024-02-01', NULL),
  ('Luxury Penthouse', '789 Park Pl', 'New York', 'NY', '10002', 950000, 3, 3, 3000, 'apartment', 'pending', 'High-end penthouse with views', 3, 6, '2024-01-20', NULL),
  ('Modern Condo', '321 Beach Blvd', 'Miami', 'FL', '33101', 280000, 2, 2, 1200, 'condo', 'sold', 'Beachfront condo in Miami', 3, 8, '2023-12-01', '2024-03-10'),
  ('Victorian House', '654 Elm St', 'Boston', 'MA', '02102', 520000, 4, 2.5, 2200, 'house', 'active', 'Restored Victorian with character', 2, 9, '2024-02-15', NULL),
  ('Urban Studio', '987 First Ave', 'New York', 'NY', '10003', 195000, 0, 1, 500, 'apartment', 'active', 'Efficient studio apartment', 4, 8, '2024-03-01', NULL),
  ('Townhouse', '111 Market St', 'Philadelphia', 'PA', '19103', 380000, 3, 2.5, 1600, 'townhouse', 'active', 'Modern townhouse in Philly', 4, NULL, '2024-03-05', NULL),
  ('Suburban Plot', '222 Green Ln', 'Boston', 'MA', '02103', 150000, 0, 0, 5000, 'land', 'active', 'Prime development opportunity', 4, 7, '2024-02-20', NULL),
  ('Beachfront Condo', '333 Ocean Dr', 'Miami', 'FL', '33102', 550000, 2, 2, 1400, 'condo', 'active', 'Stunning ocean view condo', 3, NULL, '2024-01-10', NULL),
  ('Executive Home', '444 Vista Way', 'San Francisco', 'CA', '94102', 1200000, 4, 3.5, 3500, 'house', 'sold', 'Luxury executive home', 2, 9, '2023-11-15', '2024-02-28');

-- Insert viewings
INSERT INTO viewings (property_id, client_id, viewing_date, notes) VALUES
  (1, 5, '2024-03-12 10:00:00', 'Interested, needs financing'),
  (1, 8, '2024-03-13 14:00:00', 'Very interested, making offer'),
  (2, 7, '2024-03-10 11:00:00', 'Loved it, discussing with spouse'),
  (3, 5, '2024-03-14 09:00:00', 'Out of budget but viewing for reference'),
  (3, 10, '2024-03-14 15:00:00', 'Perfect fit for family'),
  (6, 8, '2024-03-11 13:00:00', 'Too small, moving on'),
  (7, 5, '2024-03-15 10:00:00', 'Considering offer'),
  (9, 7, '2024-03-09 11:00:00', 'Perfect, awaiting loan approval'),
  (9, 10, '2024-03-13 16:00:00', 'Interested, needs inspection'),
  (2, 10, '2024-03-15 14:00:00', 'Great location, good price');

-- Insert transactions
INSERT INTO transactions (property_id, buyer_id, seller_id, agent_id, sale_price, commission_rate, commission_amount, transaction_date) VALUES
  (4, 8, 8, 3, 280000, 6.0, 16800, '2024-03-10'),
  (10, 9, 9, 2, 1200000, 5.5, 66000, '2024-02-28');