const API = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export const api = {
  getUsers: () => request("/users"),
  getProperties: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.city) params.append("city", filters.city);
    if (filters.minPrice) params.append("minPrice", filters.minPrice);
    if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
    if (filters.status) params.append("status", filters.status);
    return request(`/properties?${params}`);
  },
  getProperty: (id) => request(`/properties/${id}`),
  addProperty: (payload) =>
    request("/properties", { method: "POST", body: JSON.stringify(payload) }),
  updateProperty: (id, payload) =>
    request(`/properties/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  getAgents: () => request("/agents"),
  getViewings: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.propertyId) params.append("propertyId", filters.propertyId);
    if (filters.clientId) params.append("clientId", filters.clientId);
    return request(`/viewings?${params}`);
  },
  addViewing: (payload) =>
    request("/viewings", { method: "POST", body: JSON.stringify(payload) }),
  addTransaction: (payload) =>
    request("/transactions", { method: "POST", body: JSON.stringify(payload) }),
  getAgentPerformance: () => request("/analytics/agent-performance"),
  getMarketTrends: () => request("/analytics/market-trends"),
  getAvailableByLocation: () => request("/analytics/available-by-location"),
  getClientHistory: (clientId) =>
    request(`/analytics/client-history/${clientId}`),
  getSummary: () => request("/dashboard/summary"),
};
