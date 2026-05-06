import { useEffect, useState } from "react";
import { api } from "./api";

export default function App() {
  const [tab, setTab] = useState("browse");
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [agents, setAgents] = useState([]);
  const [agentPerformance, setAgentPerformance] = useState([]);
  const [marketTrends, setMarketTrends] = useState([]);
  const [clientHistory, setClientHistory] = useState(null);
  const [viewings, setViewings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");

  const [filters, setFilters] = useState({ city: "", minPrice: "", maxPrice: "", status: "active" });
  const [newProperty, setNewProperty] = useState({ title: "", address: "", city: "", state: "", zipCode: "", price: "", bedrooms: "0", bathrooms: "0", sqFt: "0", propertyType: "house", description: "", agentId: "" });
  const [newViewing, setNewViewing] = useState({ propertyId: "", clientId: "", viewingDate: "" });
  const [newClient, setNewClient] = useState({ fullName: "", email: "", phone: "", clientType: "buyer", budgetMin: "", budgetMax: "" });
  const [newAgent, setNewAgent] = useState({ fullName: "", email: "", phone: "", licenseNumber: "" });
  const [updatePropertyStatus, setUpdatePropertyStatus] = useState({ propertyId: "", status: "active" });

  useEffect(() => {
    async function loadInitial() {
      try {
        const [u, a, s] = await Promise.all([api.getUsers(), api.getAgents(), api.getSummary()]);
        setUsers(u);
        setAgents(a);
        setSummary(s);
      } catch (err) {
        setError("Failed to load data: " + err.message);
      }
    }
    loadInitial();
  }, []);

  async function handleSearch() {
    try {
      setLoading(true);
      const props = await api.getProperties(filters);
      setProperties(props);
      setError("");
    } catch (err) {
      setError("Search failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadAnalytics() {
    try {
      setLoading(true);
      const [agentPerf, trends] = await Promise.all([api.getAgentPerformance(), api.getMarketTrends()]);
      setAgentPerformance(agentPerf);
      setMarketTrends(trends);
      setError("");
    } catch (err) {
      setError("Failed to load analytics: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddProperty() {
    try {
      if (!newProperty.title || !newProperty.city || !newProperty.price || !newProperty.agentId) {
        setError("Please fill all required fields");
        return;
      }
      setLoading(true);
      await api.addProperty({
        ...newProperty,
        price: parseInt(newProperty.price),
        bedrooms: parseInt(newProperty.bedrooms) || 0,
        bathrooms: parseFloat(newProperty.bathrooms) || 0,
        sqFt: parseInt(newProperty.sqFt) || 0,
        agentId: parseInt(newProperty.agentId),
      });
      setNewProperty({ title: "", address: "", city: "", state: "", zipCode: "", price: "", bedrooms: "0", bathrooms: "0", sqFt: "0", propertyType: "house", description: "", agentId: "" });
      await handleSearch();
      setError("");
    } catch (err) {
      setError("Failed to add property: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddViewing() {
    try {
      if (!newViewing.propertyId || !newViewing.clientId || !newViewing.viewingDate) {
        setError("Please fill all viewing fields");
        return;
      }
      setLoading(true);
      await api.addViewing({
        propertyId: parseInt(newViewing.propertyId),
        clientId: parseInt(newViewing.clientId),
        viewingDate: newViewing.viewingDate,
        notes: "",
      });
      setNewViewing({ propertyId: "", clientId: "", viewingDate: "" });
      setError("");
      alert("Viewing scheduled successfully!");
    } catch (err) {
      setError("Failed to schedule viewing: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleClientHistory() {
    try {
      if (!selectedUserId) {
        setError("Please select a client");
        return;
      }
      setLoading(true);
      const history = await api.getClientHistory(selectedUserId);
      setClientHistory(history);
      setError("");
    } catch (err) {
      setError("Failed to load client history: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadViewings() {
    try {
      setLoading(true);
      const viewingsList = await api.getViewings();
      setViewings(viewingsList);
      setError("");
    } catch (err) {
      setError("Failed to load viewings: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddClient() {
    try {
      if (!newClient.fullName || !newClient.email) {
        setError("Please fill name and email");
        return;
      }
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: newClient.fullName,
          email: newClient.email,
          phone: newClient.phone,
          role: "client",
          clientType: newClient.clientType,
          budgetMin: newClient.budgetMin ? parseInt(newClient.budgetMin) : null,
          budgetMax: newClient.budgetMax ? parseInt(newClient.budgetMax) : null,
        }),
      });
      if (!response.ok) throw new Error("Failed to add client");
      setNewClient({ fullName: "", email: "", phone: "", clientType: "buyer", budgetMin: "", budgetMax: "" });
      const [u] = await Promise.all([api.getUsers()]);
      setUsers(u);
      setError("");
      alert("Client added successfully!");
    } catch (err) {
      setError("Failed to add client: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddAgent() {
    try {
      if (!newAgent.fullName || !newAgent.email) {
        setError("Please fill name and email");
        return;
      }
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: newAgent.fullName,
          email: newAgent.email,
          phone: newAgent.phone,
          licenseNumber: newAgent.licenseNumber,
          role: "agent",
        }),
      });
      if (!response.ok) throw new Error("Failed to add agent");
      setNewAgent({ fullName: "", email: "", phone: "", licenseNumber: "" });
      const [a] = await Promise.all([api.getAgents()]);
      setAgents(a);
      setError("");
      alert("Agent added successfully!");
    } catch (err) {
      setError("Failed to add agent: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePropertyStatus() {
    try {
      if (!updatePropertyStatus.propertyId) {
        setError("Please select a property");
        return;
      }
      setLoading(true);
      await api.updateProperty(updatePropertyStatus.propertyId, { status: updatePropertyStatus.status });
      setUpdatePropertyStatus({ propertyId: "", status: "active" });
      await handleSearch();
      setError("");
      alert("Property status updated!");
    } catch (err) {
      setError("Failed to update property: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>🏠 Real Estate Portal</h1>
          <p>Modern Property Management & Analytics</p>
        </div>
      </header>

      <nav className="nav-tabs">
        <button className={`tab-btn ${tab === "browse" ? "active" : ""}`} onClick={() => setTab("browse")}>
          🔍 Browse
        </button>
        <button className={`tab-btn ${tab === "analytics" ? "active" : ""}`} onClick={() => { setTab("analytics"); handleLoadAnalytics(); }}>
          📊 Analytics
        </button>
        <button className={`tab-btn ${tab === "manage" ? "active" : ""}`} onClick={() => setTab("manage")}>
          ➕ Manage
        </button>
        <button className={`tab-btn ${tab === "viewings" ? "active" : ""}`} onClick={() => { setTab("viewings"); handleLoadViewings(); }}>
          📅 Viewings
        </button>
        <button className={`tab-btn ${tab === "history" ? "active" : ""}`} onClick={() => setTab("history")}>
          👤 History
        </button>
      </nav>

      <main className="container">
        {error && <div className="error-banner">{error}</div>}
        {loading && <div className="loading">Loading...</div>}

        {summary && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{summary.active_listings}</div>
              <div className="stat-label">Active Listings</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{summary.sold_properties}</div>
              <div className="stat-label">Sold</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">₹{(summary.total_commissions || 0).toLocaleString('en-IN')}</div>
              <div className="stat-label">Commissions</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{summary.properties_viewed}</div>
              <div className="stat-label">Viewed</div>
            </div>
          </div>
        )}

        {tab === "browse" && (
          <div>
            <div className="card">
              <h2>Search Properties</h2>
              <div className="form-grid">
                <input placeholder="City" value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value })} />
                <input type="number" placeholder="Min Price" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
                <input type="number" placeholder="Max Price" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
                <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
              <button className="btn-primary" onClick={handleSearch} disabled={loading}>
                🔍 Search Properties
              </button>
            </div>

            <div className="card">
              <h2>Available Properties ({properties.length})</h2>
              {properties.length === 0 ? (
                <p className="empty-state">No properties found. Try adjusting your filters.</p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Location</th>
                        <th>Price</th>
                        <th>Beds/Baths</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Agent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {properties.map((p) => (
                        <tr key={p.id}>
                          <td><strong>{p.title}</strong></td>
                          <td>{p.city}, {p.state}</td>
                          <td className="price">₹{p.price.toLocaleString('en-IN')}</td>
                          <td>{p.bedrooms}/{p.bathrooms}</td>
                          <td>{p.property_type}</td>
                          <td><span className={`badge ${p.status}`}>{p.status}</span></td>
                          <td>{p.agent_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "analytics" && (
          <div>
            <div className="card">
              <h2>👨‍💼 Agent Performance</h2>
              {agentPerformance.length === 0 ? (
                <p className="empty-state">No agent data available.</p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Agent</th>
                        <th>Sales</th>
                        <th>Commission</th>
                        <th>Avg Sale</th>
                        <th>Active</th>
                        <th>Viewings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agentPerformance.map((a) => (
                        <tr key={a.id}>
                          <td><strong>{a.agent_name}</strong></td>
                          <td>{a.total_sales}</td>
                          <td className="price">₹{(a.total_commission || 0).toLocaleString('en-IN')}</td>
                          <td>₹{(a.avg_sale_price || 0).toLocaleString('en-IN')}</td>
                          <td>{a.active_listings}</td>
                          <td>{a.total_viewings}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="card">
              <h2>📈 Market Trends</h2>
              {marketTrends.length === 0 ? (
                <p className="empty-state">No market data available.</p>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>City</th>
                        <th>Type</th>
                        <th>Total</th>
                        <th>Sold</th>
                        <th>Avg Sold</th>
                        <th>Price Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marketTrends.map((t, idx) => (
                        <tr key={idx}>
                          <td><strong>{t.city}</strong></td>
                          <td>{t.property_type}</td>
                          <td>{t.total_properties}</td>
                          <td>{t.sold_count}</td>
                          <td className="price">₹{(t.avg_sold_price || 0).toLocaleString('en-IN')}</td>
                          <td>₹{(t.min_price || 0).toLocaleString('en-IN')} - ₹{(t.max_price || 0).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "manage" && (
          <div>
            <div className="card">
              <h2>➕ Add New Property</h2>
              <div className="form-grid">
                <input placeholder="Title*" value={newProperty.title} onChange={(e) => setNewProperty({ ...newProperty, title: e.target.value })} />
                <input placeholder="Address" value={newProperty.address} onChange={(e) => setNewProperty({ ...newProperty, address: e.target.value })} />
                <input placeholder="City*" value={newProperty.city} onChange={(e) => setNewProperty({ ...newProperty, city: e.target.value })} />
                <input placeholder="State" value={newProperty.state} onChange={(e) => setNewProperty({ ...newProperty, state: e.target.value })} />
                <input placeholder="Zip Code" value={newProperty.zipCode} onChange={(e) => setNewProperty({ ...newProperty, zipCode: e.target.value })} />
                <input type="number" placeholder="Price*" value={newProperty.price} onChange={(e) => setNewProperty({ ...newProperty, price: e.target.value })} />
                <input type="number" placeholder="Bedrooms (e.g., 3)" value={newProperty.bedrooms} onChange={(e) => setNewProperty({ ...newProperty, bedrooms: e.target.value })} />
                <input type="number" step="0.5" placeholder="Bathrooms (e.g., 2.5)" value={newProperty.bathrooms} onChange={(e) => setNewProperty({ ...newProperty, bathrooms: e.target.value })} />
                <input type="number" placeholder="Sq Ft (e.g., 1500)" value={newProperty.sqFt} onChange={(e) => setNewProperty({ ...newProperty, sqFt: e.target.value })} />
                <select value={newProperty.propertyType} onChange={(e) => setNewProperty({ ...newProperty, propertyType: e.target.value })}>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="land">Land</option>
                </select>
                <select value={newProperty.agentId} onChange={(e) => setNewProperty({ ...newProperty, agentId: e.target.value })}>
                  <option value="">Select Agent*</option>
                  {agents.map((a) => <option key={a.id} value={a.id}>{a.full_name}</option>)}
                </select>
              </div>
              <button className="btn-primary" onClick={handleAddProperty} disabled={loading}>
                ✅ Add Listing
              </button>
            </div>

            <div className="card">
              <h2>👥 Add New Client</h2>
              <div className="form-grid">
                <input placeholder="Full Name*" value={newClient.fullName} onChange={(e) => setNewClient({ ...newClient, fullName: e.target.value })} />
                <input type="email" placeholder="Email*" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} />
                <input type="tel" placeholder="Phone" value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} />
                <select value={newClient.clientType} onChange={(e) => setNewClient({ ...newClient, clientType: e.target.value })}>
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                  <option value="both">Both</option>
                </select>
                <input type="number" placeholder="Budget Min" value={newClient.budgetMin} onChange={(e) => setNewClient({ ...newClient, budgetMin: e.target.value })} />
                <input type="number" placeholder="Budget Max" value={newClient.budgetMax} onChange={(e) => setNewClient({ ...newClient, budgetMax: e.target.value })} />
              </div>
              <button className="btn-primary" onClick={handleAddClient} disabled={loading}>
                👤 Add Client
              </button>
            </div>

            <div className="card">
              <h2>🏢 Add New Agent</h2>
              <div className="form-grid">
                <input placeholder="Full Name*" value={newAgent.fullName} onChange={(e) => setNewAgent({ ...newAgent, fullName: e.target.value })} />
                <input type="email" placeholder="Email*" value={newAgent.email} onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })} />
                <input type="tel" placeholder="Phone" value={newAgent.phone} onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value })} />
                <input placeholder="License Number" value={newAgent.licenseNumber} onChange={(e) => setNewAgent({ ...newAgent, licenseNumber: e.target.value })} />
              </div>
              <button className="btn-primary" onClick={handleAddAgent} disabled={loading}>
                🏢 Add Agent
              </button>
            </div>

            <div className="card">
              <h2>📅 Schedule Viewing</h2>
              <div className="form-grid">
                <select value={newViewing.propertyId} onChange={(e) => setNewViewing({ ...newViewing, propertyId: e.target.value })}>
                  <option value="">Select Property</option>
                  {properties.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
                <select value={newViewing.clientId} onChange={(e) => setNewViewing({ ...newViewing, clientId: e.target.value })}>
                  <option value="">Select Client</option>
                  {users.filter(u => u.role === 'client').map((u) => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                </select>
                <input type="datetime-local" value={newViewing.viewingDate} onChange={(e) => setNewViewing({ ...newViewing, viewingDate: e.target.value })} />
              </div>
              <button className="btn-primary" onClick={handleAddViewing} disabled={loading}>
                📞 Schedule Viewing
              </button>
            </div>

            <div className="card">
              <h2>🏠 Update Property Status</h2>
              <div className="form-grid">
                <select value={updatePropertyStatus.propertyId} onChange={(e) => setUpdatePropertyStatus({ ...updatePropertyStatus, propertyId: e.target.value })}>
                  <option value="">Select Property</option>
                  {properties.map((p) => <option key={p.id} value={p.id}>{p.title} ({p.status})</option>)}
                </select>
                <select value={updatePropertyStatus.status} onChange={(e) => setUpdatePropertyStatus({ ...updatePropertyStatus, status: e.target.value })}>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="sold">Sold ✅</option>
                  <option value="off_market">Off Market ❌</option>
                </select>
              </div>
              <button className="btn-primary" onClick={handleUpdatePropertyStatus} disabled={loading}>
                💾 Update Status
              </button>
            </div>
          </div>
        )}

        {tab === "viewings" && (
          <div className="card">
            <h2>📅 All Scheduled Viewings</h2>
            <button className="btn-primary" onClick={handleLoadViewings} disabled={loading} style={{ marginBottom: "1.5rem" }}>
              🔄 Refresh Viewings
            </button>
            {viewings.length === 0 ? (
              <p className="empty-state">No scheduled viewings yet.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Client</th>
                      <th>Date & Time</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewings.map((v) => (
                      <tr key={v.id}>
                        <td><strong>{v.property_title}</strong><br/><small>{v.address}</small></td>
                        <td>{v.client_name}<br/><small>{v.email}</small></td>
                        <td>{new Date(v.viewing_date).toLocaleString()}</td>
                        <td>{v.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "history" && (
          <div className="card">
            <h2>👤 Client Interaction History</h2>
            <div className="form-grid" style={{ marginBottom: "1.5rem" }}>
              <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
                <option value="">-- Select client --</option>
                {users.filter(u => u.role === 'client').map((u) => (
                  <option key={u.id} value={u.id}>{u.full_name}</option>
                ))}
              </select>
              <button className="btn-primary" onClick={handleClientHistory} disabled={loading || !selectedUserId}>
                📋 Load History
              </button>
            </div>

            {clientHistory && (
              <div className="history-card">
                <div className="history-header">
                  <h3>{clientHistory.client_name}</h3>
                  <span className="badge info">{clientHistory.client_type}</span>
                </div>
                <div className="history-grid">
                  <div className="history-item">
                    <span className="label">Email</span>
                    <span className="value">{clientHistory.email}</span>
                  </div>
                  <div className="history-item">
                    <span className="label">Budget</span>
                    <span className="value">₹{(clientHistory.budget_min || 0).toLocaleString('en-IN')} - ₹{(clientHistory.budget_max || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="history-item">
                    <span className="label">Viewings</span>
                    <span className="value highlight">{clientHistory.viewings_count}</span>
                  </div>
                  <div className="history-item">
                    <span className="label">Purchases</span>
                    <span className="value highlight">{clientHistory.purchases_count}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}