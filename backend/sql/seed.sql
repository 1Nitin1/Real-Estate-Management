-- Clear existing data
TRUNCATE TABLE transactions, viewings, properties, clients, users CASCADE;
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE clients_id_seq RESTART WITH 1;
ALTER SEQUENCE properties_id_seq RESTART WITH 1;
ALTER SEQUENCE viewings_id_seq RESTART WITH 1;
ALTER SEQUENCE transactions_id_seq RESTART WITH 1;

-- Insert users (mix of admins, agents, and clients)
INSERT INTO users (full_name, email, phone, role, license_number) VALUES
  ('Admin User', 'admin@realestate.com', '+91-9876543210', 'admin', NULL),
  ('Rajesh Kumar', 'rajesh@agents.com', '+91-9811234567', 'agent', 'RK-2024-001'),
  ('Priya Sharma', 'priya@agents.com', '+91-9823456789', 'agent', 'PS-2024-002'),
  ('Vikram Singh', 'vikram@agents.com', '+91-9834567890', 'agent', 'VS-2024-003'),
  ('Arjun Desai', 'arjun@clients.com', '+91-9845678901', 'client', NULL),
  ('Neha Verma', 'neha@clients.com', '+91-9856789012', 'client', NULL),
  ('Sanjay Gupta', 'sanjay@clients.com', '+91-9867890123', 'client', NULL),
  ('Divya Nair', 'divya@clients.com', '+91-9878901234', 'client', NULL),
  ('Rohan Iyer', 'rohan@clients.com', '+91-9889012345', 'client', NULL),
  ('Meera Kapoor', 'meera@clients.com', '+91-9890123456', 'client', NULL);

-- Insert clients
INSERT INTO clients (user_id, client_type, preferences, budget_min, budget_max) VALUES
  (5, 'buyer', 'Modern apartment with gym in Bandra', 2000000, 5000000),
  (6, 'seller', 'Quick sale needed', 3000000, NULL),
  (7, 'both', 'Luxury villa in suburbs', 8000000, 15000000),
  (8, 'buyer', 'Cozy 2-BHK in South Delhi', 2500000, 4500000),
  (9, 'seller', 'Large property for corporate office', 5000000, NULL),
  (10, 'buyer', 'Family home in Bangalore', 3500000, 7000000);

-- Insert properties
INSERT INTO properties (title, address, city, state, zip_code, price, bedrooms, bathrooms, sq_ft, property_type, status, description, agent_id, seller_id, listed_date, sold_date) VALUES
  ('आधुनिक लक्जरी अपार्टमेंट', 'Bandra East, Marine Drive', 'Mumbai', 'Maharashtra', '400051', 5000000, 3, 2, 1500, 'apartment', 'active', 'Modern luxury apartment with sea view', 2, 6, '2024-01-15', NULL),
  ('आरामदायक परिवार का घर', 'Whitefield Main Road', 'Bangalore', 'Karnataka', '560066', 4000000, 4, 2, 2200, 'house', 'active', 'Family-friendly villa with garden', 2, 9, '2024-02-01', NULL),
  ('प्रीमियम पेंटहाउस', 'Worli, South Mumbai', 'Mumbai', 'Maharashtra', '400025', 15000000, 4, 3, 3500, 'apartment', 'pending', 'Premium penthouse with 360° views', 3, 6, '2024-01-20', NULL),
  ('समुद्र के किनारे कॉन्डो', 'Sector 15, DLF Phase', 'Gurgaon', 'Haryana', '122001', 3500000, 2, 2, 1200, 'condo', 'sold', 'Beachfront condo in DLF', 3, 8, '2023-12-01', '2024-03-10'),
  ('ऐतिहासिक विलासवान घर', 'Koregaon Park', 'Pune', 'Maharashtra', '411001', 6500000, 4, 3, 2800, 'house', 'active', 'Restored heritage property with character', 2, 9, '2024-02-15', NULL),
  ('कॉम्पैक्ट स्टूडियो', 'Indiranagar Main Street', 'Bangalore', 'Karnataka', '560008', 1500000, 1, 1, 600, 'apartment', 'active', 'Compact studio in prime location', 4, 8, '2024-03-01', NULL),
  ('आधुनिक टाउनहाउस', 'Sector 37, Noida', 'Delhi', 'Delhi', '201303', 4500000, 3, 2.5, 1800, 'townhouse', 'active', 'Modern townhouse in Noida', 4, NULL, '2024-03-05', NULL),
  ('विकास के लिए जमीन', 'Outer Ring Road', 'Hyderabad', 'Telangana', '500081', 2000000, 0, 0, 10000, 'land', 'active', 'Prime land for development', 4, 7, '2024-02-20', NULL),
  ('समुद्र सामने कॉन्डो', 'Jubilee Hills', 'Hyderabad', 'Telangana', '500033', 7000000, 3, 2.5, 2000, 'condo', 'active', 'Luxury condo with lake view', 3, NULL, '2024-01-10', NULL),
  ('कार्यकारी आवास', 'Vasant Vihar', 'Delhi', 'Delhi', '110057', 12000000, 5, 4, 4000, 'house', 'sold', 'Luxury executive home', 2, 9, '2023-11-15', '2024-02-28');

-- Insert viewings
INSERT INTO viewings (property_id, client_id, viewing_date, notes) VALUES
  (1, 5, '2024-03-12 10:00:00', 'Interested, financing के लिए काम कर रहे हैं'),
  (1, 8, '2024-03-13 14:00:00', 'बहुत अधिक रुचि, ऑफर दे रहे हैं'),
  (2, 7, '2024-03-10 11:00:00', 'बहुत पसंद आया, पति से चर्चा कर रहे हैं'),
  (3, 5, '2024-03-14 09:00:00', 'बजट से ऊपर लेकिन देखने के लिए आए'),
  (3, 10, '2024-03-14 15:00:00', 'परिवार के लिए परफेक्ट'),
  (6, 8, '2024-03-11 13:00:00', 'बहुत छोटा, अगला देख रहे हैं'),
  (7, 5, '2024-03-15 10:00:00', 'ऑफर पर विचार कर रहे हैं'),
  (9, 7, '2024-03-09 11:00:00', 'परफेक्ट, लोन के लिए इंतजार'),
  (9, 10, '2024-03-13 16:00:00', 'रुचि है, निरीक्षण चाहिए'),
  (2, 10, '2024-03-15 14:00:00', 'अच्छी लोकेशन, अच्छी कीमत');

-- Insert transactions
INSERT INTO transactions (property_id, buyer_id, seller_id, agent_id, sale_price, commission_rate, commission_amount, transaction_date) VALUES
  (4, 8, 8, 3, 3500000, 6.0, 210000, '2024-03-10'),
  (10, 9, 9, 2, 12000000, 5.5, 660000, '2024-02-28');
