import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

// Get all users
app.get("/api/users", async (_req, res) => {
  const { rows } = await pool.query(
    "SELECT id, full_name, email, phone, role FROM users ORDER BY id",
  );
  res.json(rows);
});

// Get all properties with optional filters
app.get("/api/properties", async (req, res) => {
  const { city, minPrice, maxPrice, status } = req.query;
  let q = `SELECT p.id, p.title, p.address, p.city, p.state, p.zip_code, p.price,
                  p.bedrooms, p.bathrooms, p.sq_ft, p.property_type, p.status, p.description,
                  u.full_name AS agent_name, u.phone AS agent_phone, u.email AS agent_email
           FROM properties p
           JOIN users u ON p.agent_id = u.id WHERE 1=1`;
  const params = [];

  if (city) {
    q += ` AND p.city = $${params.length + 1}`;
    params.push(city);
  }
  if (minPrice) {
    q += ` AND p.price >= $${params.length + 1}`;
    params.push(parseInt(minPrice));
  }
  if (maxPrice) {
    q += ` AND p.price <= $${params.length + 1}`;
    params.push(parseInt(maxPrice));
  }
  if (status) {
    q += ` AND p.status = $${params.length + 1}`;
    params.push(status);
  }

  q += " ORDER BY p.price ASC";
  const { rows } = await pool.query(q, params);
  res.json(rows);
});

// Get single property
app.get("/api/properties/:id", async (req, res) => {
  const q = `SELECT p.id, p.title, p.address, p.city, p.state, p.zip_code, p.price,
                    p.bedrooms, p.bathrooms, p.sq_ft, p.property_type, p.status, p.description,
                    p.listed_date, p.sold_date, u.full_name AS agent_name, u.phone AS agent_phone,
                    u.email AS agent_email
             FROM properties p
             JOIN users u ON p.agent_id = u.id
             WHERE p.id = $1`;
  const { rows } = await pool.query(q, [req.params.id]);
  res.json(rows[0] || {});
});

// Get all agents
app.get("/api/agents", async (_req, res) => {
  const { rows } = await pool.query(
    "SELECT id, full_name, email, phone, license_number FROM users WHERE role = 'agent' ORDER BY full_name",
  );
  res.json(rows);
});

// Add new agent
app.post("/api/agents", async (req, res) => {
  try {
    const { fullName, email, phone, licenseNumber } = req.body;
    const q = `INSERT INTO users (full_name, email, phone, role, license_number)
               VALUES ($1, $2, $3, 'agent', $4)
               RETURNING id, full_name, email, phone, license_number`;
    const { rows } = await pool.query(q, [
      fullName,
      email,
      phone || null,
      licenseNumber || null,
    ]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error adding agent:", error);
    res.status(500).json({ error: error.message });
  }
});

// Add new client
app.post("/api/clients", async (req, res) => {
  try {
    const { fullName, email, phone, clientType, budgetMin, budgetMax } = req.body;
    const userQ = `INSERT INTO users (full_name, email, phone, role)
                   VALUES ($1, $2, $3, 'client')
                   RETURNING id`;
    const userResult = await pool.query(userQ, [fullName, email, phone || null]);
    const userId = userResult.rows[0].id;

    const clientQ = `INSERT INTO clients (user_id, client_type, budget_min, budget_max)
                     VALUES ($1, $2, $3, $4)
                     RETURNING id`;
    await pool.query(clientQ, [
      userId,
      clientType,
      budgetMin || null,
      budgetMax || null,
    ]);

    res.status(201).json({ id: userId, full_name: fullName, email, phone });
  } catch (error) {
    console.error("Error adding client:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get agent performance (view)
app.get("/api/analytics/agent-performance", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM agent_performance ORDER BY total_commission DESC",
    );
    res.json(rows);
  } catch (error) {
    console.error("Agent performance query error:", error);
    res.status(500).json({ error: "Failed to fetch agent performance" });
  }
});

// Get market trends (view)
app.get("/api/analytics/market-trends", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM market_trends");
    res.json(rows);
  } catch (error) {
    console.error("Market trends query error:", error);
    res.status(500).json({ error: "Failed to fetch market trends" });
  }
});

// Get available properties by location (view)
app.get("/api/analytics/available-by-location", async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM available_properties_by_location",
    );
    res.json(rows);
  } catch (error) {
    console.error("Available properties query error:", error);
    res.status(500).json({ error: "Failed to fetch available properties" });
  }
});

// Get client interaction history (view)
app.get("/api/analytics/client-history/:clientId", async (req, res) => {
  try {
    const q = `SELECT * FROM client_interaction_history WHERE id = $1`;
    const { rows } = await pool.query(q, [req.params.clientId]);
    res.json(rows[0] || {});
  } catch (error) {
    console.error("Client history query error:", error);
    res.status(500).json({ error: "Failed to fetch client history" });
  }
});

// Get viewings for a property
app.get("/api/viewings", async (req, res) => {
  const { propertyId, clientId } = req.query;
  let q = `SELECT v.id, v.property_id, v.viewing_date, v.notes,
                  u.full_name AS client_name, u.email,
                  p.title AS property_title, p.address
           FROM viewings v
           JOIN users u ON v.client_id = u.id
           JOIN properties p ON v.property_id = p.id WHERE 1=1`;
  const params = [];

  if (propertyId) {
    q += ` AND v.property_id = $${params.length + 1}`;
    params.push(propertyId);
  }
  if (clientId) {
    q += ` AND v.client_id = $${params.length + 1}`;
    params.push(clientId);
  }

  q += " ORDER BY v.viewing_date DESC";
  const { rows } = await pool.query(q, params);
  res.json(rows);
});

// Add new viewing
app.post("/api/viewings", async (req, res) => {
  const { propertyId, clientId, viewingDate, notes } = req.body;
  const q = `INSERT INTO viewings (property_id, client_id, viewing_date, notes)
             VALUES ($1, $2, $3, $4)
             RETURNING *`;
  const { rows } = await pool.query(q, [
    propertyId,
    clientId,
    viewingDate,
    notes || null,
  ]);
  res.status(201).json(rows[0]);
});

// Add new property listing
app.post("/api/properties", async (req, res) => {
  try {
    const {
      title,
      address,
      city,
      state,
      zipCode,
      price,
      bedrooms,
      bathrooms,
      sqFt,
      propertyType,
      description,
      agentId,
    } = req.body;
    const q = `INSERT INTO properties (title, address, city, state, zip_code, price, bedrooms, bathrooms, sq_ft, property_type, description, agent_id)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
               RETURNING *`;
    const { rows } = await pool.query(q, [
      title,
      address || "",
      city,
      state || "",
      zipCode || "",
      parseInt(price) || 0,
      parseInt(bedrooms) || 0,
      parseFloat(bathrooms) || 0,
      parseInt(sqFt) || 0,
      propertyType,
      description || "",
      parseInt(agentId),
    ]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error adding property:", error);
    res.status(500).json({ error: error.message });
  }
});

// Update property status
app.patch("/api/properties/:id", async (req, res) => {
  const { status, soldDate } = req.body;
  const allowed = ["active", "pending", "sold", "off_market"];
  if (!allowed.includes(status))
    return res.status(400).json({ error: "Invalid status" });

  const q =
    "UPDATE properties SET status = $1, sold_date = $2 WHERE id = $3 RETURNING *";
  const { rows } = await pool.query(q, [
    status,
    soldDate || null,
    req.params.id,
  ]);
  res.json(rows[0]);
});

// Add transaction
app.post("/api/transactions", async (req, res) => {
  const { propertyId, buyerId, sellerId, agentId, salePrice, commissionRate } =
    req.body;
  const commissionAmount = Math.round((salePrice * commissionRate) / 100);
  const q = `INSERT INTO transactions (property_id, buyer_id, seller_id, agent_id, sale_price, commission_rate, commission_amount, transaction_date)
             VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE)
             RETURNING *`;
  const { rows } = await pool.query(q, [
    propertyId,
    buyerId,
    sellerId,
    agentId,
    salePrice,
    commissionRate,
    commissionAmount,
  ]);

  // Update property status to sold
  await pool.query(
    "UPDATE properties SET status = 'sold', sold_date = CURRENT_DATE WHERE id = $1",
    [propertyId],
  );

  res.status(201).json(rows[0]);
});

// Get dashboard summary
app.get("/api/dashboard/summary", async (_req, res) => {
  const q = `SELECT
      (SELECT COUNT(*) FROM properties WHERE status IN ('active', 'pending')) AS active_listings,
      (SELECT COUNT(*) FROM properties WHERE status = 'sold') AS sold_properties,
      (SELECT SUM(commission_amount) FROM transactions) AS total_commissions,
      (SELECT COUNT(DISTINCT property_id) FROM viewings) AS properties_viewed`;
  const { rows } = await pool.query(q);
  res.json(rows[0]);
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Real Estate API running on http://localhost:${port}`);
});
