# Real Estate Listing Portal - DBMS Project

A comprehensive real estate management platform built with React, Node.js, and PostgreSQL (Neon). Features SQL views, complex joins, and a modern admin dashboard.

**Live Ports:**
- Frontend: `http://localhost:8080`
- Backend: `http://localhost:5000`

---

## 📚 Table of Contents

1. [Database Schema](#database-schema)
2. [SQL Views & Joins](#sql-views--joins)
3. [API Endpoints](#api-endpoints)
4. [Features](#features)
5. [Setup Instructions](#setup-instructions)

---

## 📊 Database Schema

### Table 1: `users`
Stores all system users (agents, clients, admins)

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'client', 'agent')),
  license_number TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | SERIAL | PRIMARY KEY | Unique identifier |
| `full_name` | TEXT | NOT NULL | User's name |
| `email` | TEXT | UNIQUE, NOT NULL | Login email |
| `phone` | TEXT | NULLABLE | Contact number |
| `role` | TEXT | NOT NULL, CHECK | User type (admin/client/agent) |
| `license_number` | TEXT | NULLABLE | Real estate license (agents only) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Account creation time |

---

### Table 2: `clients`
Extended profile for buyer/seller clients

```sql
CREATE TABLE clients (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_type TEXT NOT NULL CHECK (client_type IN ('buyer', 'seller', 'both')),
  preferences TEXT,
  budget_min INT,
  budget_max INT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

| Column | Type | Relationship | Purpose |
|--------|------|--------------|---------|
| `id` | SERIAL | PRIMARY KEY | Unique identifier |
| `user_id` | INT | FK → users.id | Links to user account |
| `client_type` | TEXT | CHECK | Buyer/Seller/Both |
| `preferences` | TEXT | NULLABLE | Property preferences |
| `budget_min` | INT | NULLABLE | Minimum budget |
| `budget_max` | INT | NULLABLE | Maximum budget |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record creation |

**Relationship:** 1 user → 1 client profile (one-to-one)

---

### Table 3: `properties`
Real estate listings

```sql
CREATE TABLE properties (
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
  property_type TEXT NOT NULL CHECK (...),
  status TEXT NOT NULL DEFAULT 'active' CHECK (...),
  description TEXT,
  agent_id INT NOT NULL REFERENCES users(id),
  seller_id INT REFERENCES users(id),
  listed_date DATE DEFAULT CURRENT_DATE,
  sold_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

| Column | Type | Relationship | Purpose |
|--------|------|--------------|---------|
| `id` | SERIAL | PRIMARY KEY | Unique listing ID |
| `title` | TEXT | NOT NULL | Property name |
| `address` | TEXT | NOT NULL | Street address |
| `city`, `state`, `zip_code` | TEXT | NOT NULL | Location |
| `price` | INT | NOT NULL | Listing price |
| `bedrooms`, `bathrooms`, `sq_ft` | INT/DECIMAL | NOT NULL | Property specs |
| `property_type` | TEXT | CHECK | house/apartment/condo/townhouse/land |
| `status` | TEXT | DEFAULT 'active' | active/pending/sold/off_market |
| `description` | TEXT | NULLABLE | Property details |
| `agent_id` | INT | FK → users.id | Listing agent |
| `seller_id` | INT | FK → users.id | Property seller |
| `listed_date` | DATE | DEFAULT TODAY | Listing start date |
| `sold_date` | DATE | NULLABLE | Sale completion date |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record creation |

**Relationships:**
- Many properties → 1 agent (FK: agent_id)
- Many properties → 1 seller (FK: seller_id, NULLABLE)

---

### Table 4: `viewings`
Property viewing records (client site visits)

```sql
CREATE TABLE viewings (
  id SERIAL PRIMARY KEY,
  property_id INT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  client_id INT NOT NULL REFERENCES users(id),
  viewing_date TIMESTAMP NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

| Column | Type | Relationship | Purpose |
|--------|------|--------------|---------|
| `id` | SERIAL | PRIMARY KEY | Viewing record ID |
| `property_id` | INT | FK → properties.id | Viewed property |
| `client_id` | INT | FK → users.id | Client who viewed |
| `viewing_date` | TIMESTAMP | NOT NULL | Viewing scheduled time |
| `notes` | TEXT | NULLABLE | Agent/client notes |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record creation |

**Relationships:**
- Many viewings → 1 property (FK: property_id)
- Many viewings → 1 client (FK: client_id)

---

### Table 5: `transactions`
Completed property sales

```sql
CREATE TABLE transactions (
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
```

| Column | Type | Relationship | Purpose |
|--------|------|--------------|---------|
| `id` | SERIAL | PRIMARY KEY | Transaction ID |
| `property_id` | INT | FK → properties.id | Sold property |
| `buyer_id` | INT | FK → users.id | Buyer account |
| `seller_id` | INT | FK → users.id | Seller account |
| `agent_id` | INT | FK → users.id | Selling agent |
| `sale_price` | INT | NOT NULL | Final sale price |
| `commission_rate` | DECIMAL | DEFAULT 6.0 | Commission % |
| `commission_amount` | INT | NULLABLE | Actual commission $ |
| `transaction_date` | DATE | NOT NULL | Sale date |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record creation |

**Relationships:**
- 1 transaction → 1 property
- 1 transaction → 1 buyer (user)
- 1 transaction → 1 seller (user)
- 1 transaction → 1 agent (user)

---

## 🔗 SQL Indexes

Performance optimization indexes:

```sql
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_agent_id ON properties(agent_id);
CREATE INDEX idx_viewings_property_id ON viewings(property_id);
CREATE INDEX idx_viewings_client_id ON viewings(client_id);
CREATE INDEX idx_transactions_agent_id ON transactions(agent_id);
```

**Purpose:** Speeds up WHERE, JOIN, and ORDER BY queries on frequently filtered columns.

---

## 📈 SQL Views & Complex Joins

### View 1: `available_properties_by_location`
**Purpose:** Browse properties with agent contact info (filtered for active/pending)

```sql
CREATE OR REPLACE VIEW available_properties_by_location AS
SELECT
  p.id, p.title, p.address, p.city, p.state, p.price,
  p.bedrooms, p.bathrooms, p.sq_ft, p.property_type, p.status,
  u.full_name AS agent_name,
  u.phone AS agent_phone,
  u.email AS agent_email
FROM properties p
JOIN users u ON p.agent_id = u.id
WHERE p.status IN ('active', 'pending')
ORDER BY p.price ASC;
```

**Joins Used:**
- **INNER JOIN**: properties ← users (1:N via agent_id)
- Filters: Only active/pending listings
- Output: 13 columns including property details + agent contact

**Use Case:** Frontend Browse tab, property search

---

### View 2: `agent_performance`
**Purpose:** Agent sales metrics and commission tracking

```sql
CREATE OR REPLACE VIEW agent_performance AS
SELECT
  u.id,
  u.full_name AS agent_name,
  u.email, u.phone,
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
```

**Joins Used:**
- **LEFT JOIN**: users → properties (active listings only)
- **LEFT JOIN**: users → transactions (sales)
- **LEFT JOIN**: properties → viewings (viewings per listing)
- **Aggregations**: COUNT, SUM, AVG with GROUP BY
- **Conditionals**: CASE WHEN for counting non-null transactions

**Output Columns:**
| Column | Calculation |
|--------|-------------|
| total_sales | COUNT(DISTINCT transactions) |
| total_commission | SUM(commission_amount) |
| avg_sale_price | AVG(sale_price) |
| active_listings | COUNT(properties where status ≠ 'sold') |
| total_viewings | COUNT(viewings linked to agent's properties) |

**Use Case:** Frontend Analytics tab, agent dashboard

---

### View 3: `market_trends`
**Purpose:** Analyze price trends by city and property type

```sql
CREATE OR REPLACE VIEW market_trends AS
SELECT
  p.city, p.property_type,
  COUNT(*) AS total_properties,
  COUNT(CASE WHEN p.status = 'sold' THEN 1 END) AS sold_count,
  COALESCE(AVG(CASE WHEN p.status = 'sold' THEN t.sale_price END), 0)::INT 
    AS avg_sold_price,
  MIN(p.price) AS min_price,
  MAX(p.price) AS max_price,
  COALESCE(AVG(p.price), 0)::INT AS avg_listed_price,
  COALESCE(AVG(p.sq_ft), 0)::INT AS avg_sq_ft
FROM properties p
LEFT JOIN transactions t ON p.id = t.property_id
GROUP BY p.city, p.property_type
ORDER BY p.city, total_properties DESC;
```

**Joins Used:**
- **LEFT JOIN**: properties → transactions (for sold prices)
- **GROUP BY**: city + property_type (market segments)
- **Conditionals**: CASE WHEN to filter sold vs listed
- **Aggregations**: COUNT, MIN, MAX, AVG

**Output Columns:**
| Column | Meaning |
|--------|---------|
| sold_count | How many sold in this market |
| avg_sold_price | Average price paid (actual sales) |
| min_price, max_price | Price range of all listings |
| avg_listed_price | Average listing price |
| avg_sq_ft | Average property size |

**Use Case:** Frontend Analytics tab, market insights

---

### View 4: `client_interaction_history`
**Purpose:** Track client activity (viewings & purchases)

```sql
CREATE OR REPLACE VIEW client_interaction_history AS
SELECT
  u.id,
  u.full_name AS client_name,
  u.email,
  c.client_type,
  c.budget_min, c.budget_max,
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
```

**Joins Used:**
- **LEFT JOIN**: users → clients (1:1 profile data)
- **LEFT JOIN**: users → viewings (viewing history)
- **LEFT JOIN**: users → transactions (purchase history)
- **GROUP BY**: User ID with aggregations

**Output Columns:**
| Column | Purpose |
|--------|---------|
| viewings_count | Total property viewings |
| purchases_count | Total purchases made |
| last_viewing_date | Most recent viewing |
| last_purchase_date | Most recent purchase |

**Use Case:** Frontend History tab, CRM insights

---

## 🔌 API Endpoints

### Property Endpoints

#### **GET /api/properties**
Fetch properties with optional filters

```javascript
// Query Parameters:
{
  city: "New York",        // Filter by city
  minPrice: 200000,        // Minimum price
  maxPrice: 500000,        // Maximum price
  status: "active"         // active/pending/sold/off_market
}

// SQL Behind the Scenes:
SELECT p.*, u.full_name, u.phone, u.email
FROM properties p
JOIN users u ON p.agent_id = u.id
WHERE p.city = $1 AND p.price BETWEEN $2 AND $3 AND p.status = $4
ORDER BY p.price ASC;
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Sunny Downtown Loft",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "price": 350000,
    "bedrooms": 1,
    "bathrooms": 1.5,
    "sq_ft": 800,
    "property_type": "apartment",
    "status": "active",
    "agent_name": "Alice Johnson",
    "agent_phone": "555-1001",
    "agent_email": "alice@agents.com"
  }
]
```

---

#### **GET /api/properties/:id**
Fetch single property details

```sql
SELECT p.*, u.full_name, u.phone, u.email
FROM properties p
JOIN users u ON p.agent_id = u.id
WHERE p.id = $1;
```

---

#### **POST /api/properties**
Create new property listing

```javascript
// Request Body:
{
  title: "Luxury Penthouse",
  address: "789 Park Pl",
  city: "New York",
  state: "NY",
  zipCode: "10002",
  price: 950000,
  bedrooms: 3,
  bathrooms: 3,
  sqFt: 3000,
  propertyType: "apartment",
  description: "High-end penthouse with views",
  agentId: 3
}

// SQL:
INSERT INTO properties (title, address, city, state, zip_code, price, 
                       bedrooms, bathrooms, sq_ft, property_type, 
                       description, agent_id)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
RETURNING *;
```

---

#### **PATCH /api/properties/:id**
Update property status

```javascript
// Request Body:
{
  status: "sold",      // active/pending/sold/off_market
  soldDate: "2024-03-10"
}

// SQL:
UPDATE properties 
SET status = $1, sold_date = $2 
WHERE id = $3 
RETURNING *;
```

---

### Viewing Endpoints

#### **GET /api/viewings**
Fetch scheduled viewings

```javascript
// Query Parameters (optional):
{
  propertyId: 1,    // Filter by property
  clientId: 5       // Filter by client
}

// SQL:
SELECT v.*, u.full_name, u.email, p.title, p.address
FROM viewings v
JOIN users u ON v.client_id = u.id
JOIN properties p ON v.property_id = p.id
WHERE 1=1 [AND filters]
ORDER BY v.viewing_date DESC;
```

---

#### **POST /api/viewings**
Schedule a property viewing

```javascript
// Request Body:
{
  propertyId: 1,
  clientId: 5,
  viewingDate: "2024-03-15T14:00:00",
  notes: "Client interested, needs inspection"
}

// SQL:
INSERT INTO viewings (property_id, client_id, viewing_date, notes)
VALUES ($1, $2, $3, $4)
RETURNING *;
```

---

### Agent Endpoints

#### **GET /api/agents**
Fetch all agents

```sql
SELECT id, full_name, email, phone, license_number
FROM users
WHERE role = 'agent'
ORDER BY full_name;
```

---

#### **POST /api/agents**
Add new agent

```javascript
// Request Body:
{
  fullName: "Charlie Davis",
  email: "charlie@agents.com",
  phone: "555-1003",
  licenseNumber: "CD-2024-003"
}

// SQL:
INSERT INTO users (full_name, email, phone, role, license_number)
VALUES ($1, $2, $3, 'agent', $4)
RETURNING *;
```

---

### Client Endpoints

#### **POST /api/clients**
Add new client

```javascript
// Request Body:
{
  fullName: "Emma Wilson",
  email: "emma@clients.com",
  phone: "555-2001",
  clientType: "buyer",           // buyer/seller/both
  budgetMin: 200000,
  budgetMax: 400000
}

// SQL - Two Step Insert:
-- Step 1: Create user
INSERT INTO users (full_name, email, phone, role)
VALUES ($1, $2, $3, 'client')
RETURNING id;

-- Step 2: Create client profile
INSERT INTO clients (user_id, client_type, budget_min, budget_max)
VALUES ($1, $2, $3, $4);
```

---

### Analytics Endpoints

#### **GET /api/analytics/agent-performance**
Fetch agent performance view

```sql
SELECT * FROM agent_performance
ORDER BY total_commission DESC;
```

**Response:**
```json
[
  {
    "id": 2,
    "agent_name": "Alice Johnson",
    "email": "alice@agents.com",
    "total_sales": 2,
    "total_commission": 82800,
    "avg_sale_price": 1240000,
    "active_listings": 3,
    "total_viewings": 8
  }
]
```

---

#### **GET /api/analytics/market-trends**
Fetch market trends view

```sql
SELECT * FROM market_trends;
```

**Response:**
```json
[
  {
    "city": "New York",
    "property_type": "apartment",
    "total_properties": 4,
    "sold_count": 1,
    "avg_sold_price": 280000,
    "min_price": 195000,
    "max_price": 950000,
    "avg_listed_price": 431250,
    "avg_sq_ft": 1250
  }
]
```

---

#### **GET /api/analytics/client-history/:clientId**
Fetch client interaction history

```sql
SELECT * FROM client_interaction_history
WHERE id = $1;
```

---

#### **GET /api/dashboard/summary**
Dashboard statistics

```sql
SELECT
  (SELECT COUNT(*) FROM properties WHERE status IN ('active', 'pending')) 
    AS active_listings,
  (SELECT COUNT(*) FROM properties WHERE status = 'sold') 
    AS sold_properties,
  (SELECT SUM(commission_amount) FROM transactions) 
    AS total_commissions,
  (SELECT COUNT(DISTINCT property_id) FROM viewings) 
    AS properties_viewed;
```

---

### Transaction Endpoints

#### **POST /api/transactions**
Record completed sale

```javascript
// Request Body:
{
  propertyId: 4,
  buyerId: 8,
  sellerId: 8,
  agentId: 3,
  salePrice: 280000,
  commissionRate: 6.0
}

// SQL - Two Step:
-- Step 1: Insert transaction
INSERT INTO transactions (property_id, buyer_id, seller_id, agent_id, 
                         sale_price, commission_rate, commission_amount, 
                         transaction_date)
VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE);

-- Step 2: Update property status
UPDATE properties 
SET status = 'sold', sold_date = CURRENT_DATE 
WHERE id = $1;
```

---

## 🎯 Features & UI Sections

### 1. 🔍 **Browse Properties**
- Search by city, price range, status
- Live filter results
- View agent contact info
- Sorted by price (ascending)

**Database Query:**
```sql
SELECT * FROM available_properties_by_location
WHERE city = ? AND price BETWEEN ? AND ?
ORDER BY price ASC;
```

---

### 2. 📊 **Analytics Dashboard**

**Agent Performance Section:**
- Top agents by commission
- Sales count, avg sale price
- Active listings, total viewings

**Database Query:**
```sql
SELECT * FROM agent_performance
ORDER BY total_commission DESC;
```

**Market Trends Section:**
- Price analysis by city/type
- Sold vs listed inventory
- Min/max/avg prices

**Database Query:**
```sql
SELECT * FROM market_trends
WHERE city = ? AND property_type = ?;
```

---

### 3. ➕ **Manage Properties**

**Add Property:**
```sql
INSERT INTO properties (...) 
VALUES (...);
```

**Add Agent:**
```sql
INSERT INTO users (role = 'agent') ...;
```

**Add Client:**
```sql
INSERT INTO users (role = 'client') ...;
INSERT INTO clients (...) ...;
```

**Schedule Viewing:**
```sql
INSERT INTO viewings (property_id, client_id, viewing_date)
VALUES (...);
```

**Update Property Status:**
```sql
UPDATE properties SET status = ? WHERE id = ?;
```

---

### 4. 📅 **Scheduled Viewings**
View all upcoming/past viewings with client & property info

**Database Query:**
```sql
SELECT v.*, u.full_name, p.title, p.address
FROM viewings v
JOIN users u ON v.client_id = u.id
JOIN properties p ON v.property_id = p.id
ORDER BY v.viewing_date DESC;
```

---

### 5. 👤 **Client History**
Track client activity: viewings, purchases, budget, preferences

**Database Query:**
```sql
SELECT * FROM client_interaction_history
WHERE id = ?;
```

---

## 🚀 Setup Instructions

### 1. **Neon PostgreSQL Setup**

```bash
# Create Neon project at https://neon.tech
# Copy connection string to .env

DATABASE_URL=postgresql://[user]:[password]@[host]/[db]?sslmode=require
```

---

### 2. **Initialize Database**

```bash
# Copy schema.sql and seed.sql to Neon SQL Editor
# Execute in order:
1. backend/sql/schema.sql     # Creates tables + views + indexes
2. backend/sql/seed.sql       # Populates demo data
```

---

### 3. **Backend Setup**

```bash
cd backend
npm install
npm run dev          # Starts on http://localhost:5000
```

---

### 4. **Frontend Setup**

```bash
cd frontend
npm install
npm run dev          # Starts on http://localhost:8080
```

---

## 📋 Summary of Key Concepts

| Concept | Example | Purpose |
|---------|---------|---------|
| **Primary Key** | users.id | Unique row identifier |
| **Foreign Key** | properties.agent_id → users.id | Relationship between tables |
| **Index** | idx_properties_city | Speed up queries |
| **INNER JOIN** | properties JOIN users | Must match on both sides |
| **LEFT JOIN** | users LEFT JOIN transactions | Keep NULLs from left table |
| **GROUP BY** | GROUP BY city, property_type | Aggregate by dimensions |
| **CASE WHEN** | COUNT(CASE WHEN status='sold'...) | Conditional aggregation |
| **VIEW** | agent_performance | Pre-defined complex query |
| **COALESCE** | COALESCE(SUM(amount), 0) | Replace NULL with default |
| **ORDER BY** | ORDER BY price DESC | Sort results |

---

## 🎓 SQL Concepts Demonstrated

✅ **Joins** - INNER, LEFT, linking 5 tables  
✅ **Aggregations** - COUNT, SUM, AVG, MIN, MAX  
✅ **Grouping** - GROUP BY multi-column aggregations  
✅ **Filtering** - WHERE, CASE WHEN conditionals  
✅ **Views** - 4 pre-defined complex queries  
✅ **Indexes** - 7 indexes for performance  
✅ **Relationships** - 1:N, N:M, self-referencing  
✅ **Constraints** - PK, FK, UNIQUE, CHECK, DEFAULT  
✅ **Transactions** - RETURNING clause for created records  

---

## 📝 Demo Data

**3 Agents, 6 Clients, 10 Properties, 10 Viewings, 2 Transactions**

**Sample Cities:** New York, Boston, Miami, Philadelphia, San Francisco

**Property Types:** House, Apartment, Condo, Townhouse, Land

**Price Range:** $150K - $1.2M

---

## 🔐 Security Features

- Parameterized queries (prevent SQL injection)
- CORS enabled for frontend
- Error handling on all endpoints
- Role-based user types
- Constraint validation at DB level

---

**Built with ❤️ using React, Node.js, Express, and PostgreSQL**
