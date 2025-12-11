// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";

const API_BASE_URL = "http://localhost:8888";

/* ========== SIDEBAR ========== */

const AdminSidebar = ({ activeSection, onSelectSection }) => {
  const items = [
    { key: "dashboard", label: "Dashboard" },
    { key: "products", label: "Products" },
    { key: "orders", label: "Orders" },
    { key: "users", label: "Users" },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <div className="logo-pill">SS</div>
        <div>
          <div className="sidebar-brand">ShopSphere</div>
          <div className="sidebar-sub">Admin Panel</div>
        </div>
      </div>

      <ul className="sidebar-menu">
        {items.map((item) => (
          <li
            key={item.key}
            onClick={() => onSelectSection(item.key)}
            className={activeSection === item.key ? "active" : ""}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </aside>
  );
};

/* ========== DASHBOARD HOME ========== */

const DashboardHome = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!res.ok) {
          const txt = await res.text();
          console.error("Dashboard API error:", res.status, txt);
          throw new Error("Failed to load dashboard data");
        }

        const data = await res.json();
        setSummary(data || {});
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-grid">
        <p className="panel-subtitle">Loading dashboard...</p>
      </div>
    );
  }

  if (!summary || error) {
    return (
      <div className="dashboard-grid">
        <p className="panel-subtitle">{error || "No dashboard data."}</p>
      </div>
    );
  }

  const {
    totalOrders = 0,
    totalProducts = 0,
    ordersByStatus = {},
    recentOrders = [],
    lowStockProducts = [],
  } = summary;

  // ✅ only these 2 – no totalRevenue / successfulPayments now
  const stats = [
    {
      label: "Total Orders",
      value: totalOrders,
      chip: "All orders",
    },
    {
      label: "Active Products",
      value: totalProducts,
      chip: "Catalog",
    },
  ];

  const statusLabels = [
    { key: "pending", label: "Pending" },
    { key: "processing", label: "Processing" },
    { key: "confirmed", label: "Confirmed" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
    { key: "cancelled", label: "Cancelled" },
    { key: "expired", label: "Expired" },
  ];

  return (
    <div className="dashboard-grid">
      {/* Stats row */}
      <section className="stat-grid">
        {stats.map((stat) => (
          <article key={stat.label} className="stat-card">
            <h3>{stat.label}</h3>
            <p className="stat-value">{stat.value}</p>
            <span className="stat-chip">{stat.chip}</span>
          </article>
        ))}
      </section>

      {/* Orders by status + low stock */}
      <section className="lower-grid">
        <article className="panel panel-main">
          <div className="panel-header">
            <h3>Orders by Status</h3>
            <span className="panel-tag">Live</span>
          </div>

          <div className="orders-status-list">
            {statusLabels.map((s) => {
              const val = ordersByStatus?.[s.key] ?? 0;
              return (
                <div key={s.key} className="orders-status-row">
                  <span className="orders-status-name">{s.label}</span>
                  <span className="orders-status-count">{val}</span>
                </div>
              );
            })}
          </div>
        </article>

        <article className="panel panel-side">
          <div className="panel-header">
            <h3>Low Stock Alerts</h3>
            <span className="panel-tag soft">Qty ≤ 5</span>
          </div>

          {lowStockProducts && lowStockProducts.length > 0 ? (
            <ul className="low-stock-list">
              {lowStockProducts.map((item) => (
                <li key={item.productId} className="low-stock-item">
                  <div>
                    <p className="low-stock-name">{item.productName}</p>
                    <p className="low-stock-subtitle">ID: {item.productId}</p>
                  </div>
                  <span
                    className={`low-stock-badge ${
                      item.productQuantity != null && item.productQuantity <= 2
                        ? "critical"
                        : ""
                    }`}
                  >
                    {item.productQuantity} left
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="panel-subtitle">No low stock items.</p>
          )}
        </article>
      </section>

      {/* Recent orders */}
      <section className="panel panel-full" style={{ marginTop: "20px" }}>
        <div className="panel-header">
          <div>
            <h3>Recent Orders</h3>
            <p className="panel-subtitle">Latest 5 orders</p>
          </div>
        </div>

        {recentOrders && recentOrders.length > 0 ? (
          <table className="panel-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Placed At</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.orderId}>
                  <td>#ORD-{o.orderId}</td>
                  <td>{o.customerName}</td>
                  <td>
                    ₹{Number(o.totalAmount || 0).toLocaleString("en-IN")}
                  </td>
                  <td>
                    <span
                      className={`status-pill status-${o.orderStatus?.toLowerCase()}`}
                    >
                      {o.orderStatus}
                    </span>
                  </td>
                  <td>
                    {o.placedAt
                      ? new Date(o.placedAt).toLocaleString("en-IN")
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="panel-subtitle">No recent orders.</p>
        )}
      </section>
    </div>
  );
};

/* ========== PRODUCTS VIEW ========== */

const ProductsView = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE_URL}/api/products`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!res.ok) throw new Error("Failed to load products");

        const data = await res.json();
        setProducts(data || []);
      } catch (err) {
        console.error("Products error:", err);
        setError("Could not load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const getProductId = (p) => p.productId ?? p.product_id;

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) throw new Error("Delete failed");

      setProducts((prev) => prev.filter((p) => getProductId(p) !== id));
    } catch (err) {
      console.error(err);
      alert("Could not delete product.");
    }
  };

  const handleEditChange = (field, value) => {
    setEditingProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!editingProduct) return;
    const id = getProductId(editingProduct);
    if (!id) {
      alert("Invalid product id.");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(editingProduct),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Update failed:", res.status, text);
        throw new Error(text || `Update failed (status ${res.status})`);
      }

      const updated = await res.json();

      setProducts((prev) =>
        prev.map((p) => (getProductId(p) === id ? updated : p))
      );
      setEditingProduct(null);
    } catch (err) {
      console.error(err);
      alert("Could not save product.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="panel">
        <p className="panel-subtitle">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel">
        <p className="panel-subtitle">{error}</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="panel">
        <p className="panel-subtitle">No products found.</p>
      </div>
    );
  }

  return (
    <section className="panel panel-full">
      <div className="panel-header">
        <div>
          <h3>Products</h3>
          <p className="panel-subtitle">
            Showing {products.length} product
            {products.length > 1 ? "s" : ""}.
          </p>
        </div>
      </div>

      <table className="panel-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>MRP</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Brand</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const id = getProductId(p);
            return (
              <tr key={id}>
                <td>{id}</td>
                <td>{p.productName}</td>
                <td>
                  {p.productMrp != null
                    ? `₹${Number(p.productMrp).toLocaleString("en-IN")}`
                    : "-"}
                </td>
                <td>
                  {p.productPrice != null
                    ? `₹${Number(p.productPrice).toLocaleString("en-IN")}`
                    : "-"}
                </td>
                <td>{p.productQuantity != null ? p.productQuantity : "-"}</td>
                <td>{p.brand || "-"}</td>
                <td>
                  <button
                    className="table-btn"
                    onClick={() => setEditingProduct(p)}
                  >
                    Edit
                  </button>
                  <button
                    className="table-btn danger"
                    onClick={() => handleDelete(id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {editingProduct && (
        <div className="edit-panel">
          <h4>Edit Product #{getProductId(editingProduct)}</h4>
          <div className="edit-grid">
            <label>
              Name
              <input
                type="text"
                value={editingProduct.productName || ""}
                onChange={(e) =>
                  handleEditChange("productName", e.target.value)
                }
              />
            </label>
            <label>
              MRP
              <input
                type="number"
                value={editingProduct.productMrp || ""}
                onChange={(e) =>
                  handleEditChange("productMrp", Number(e.target.value))
                }
              />
            </label>
            <label>
              Price
              <input
                type="number"
                value={editingProduct.productPrice || ""}
                onChange={(e) =>
                  handleEditChange("productPrice", Number(e.target.value))
                }
              />
            </label>
            <label>
              Quantity
              <input
                type="number"
                value={editingProduct.productQuantity || ""}
                onChange={(e) =>
                  handleEditChange("productQuantity", Number(e.target.value))
                }
              />
            </label>
            <label>
              Brand
              <input
                type="text"
                value={editingProduct.brand || ""}
                onChange={(e) => handleEditChange("brand", e.target.value)}
              />
            </label>
          </div>

          <div className="edit-actions">
            <button
              className="table-btn secondary"
              onClick={() => setEditingProduct(null)}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="table-btn"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

/* ========== ORDERS VIEW ========== */

const OrdersView = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE_URL}/api/orders`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Orders API error:", res.status, text);

          if (res.status === 403) {
            setError(
              "You are not authorized to view orders. Login as ADMIN/SELLER."
            );
          } else {
            setError("Could not load orders.");
          }
          return;
        }

        const data = await res.json();
        setOrders(data || []);
      } catch (err) {
        console.error("Orders error:", err);
        setError("Could not load orders (network error).");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getOrderId = (o) => o.orderId ?? o.order_id;

  if (loading) {
    return (
      <div className="panel">
        <p className="panel-subtitle">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel">
        <p className="panel-subtitle">{error}</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="panel">
        <p className="panel-subtitle">No orders found.</p>
      </div>
    );
  }

  return (
    <section className="panel panel-full">
      <div className="panel-header">
        <div>
          <h3>Orders</h3>
          <p className="panel-subtitle">
            Showing {orders.length} order{orders.length > 1 ? "s" : ""}.
          </p>
        </div>
      </div>

      <table className="panel-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>User ID</th>
            <th>Total</th>
            <th>Status</th>
            <th>Placed At</th>
            <th>Payment Method</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => {
            const id = getOrderId(o);
            return (
              <tr key={id}>
                <td>#ORD-{id}</td>
                <td>{o.userId}</td>
                <td>
                  {o.totalAmount != null
                    ? `₹${Number(o.totalAmount).toLocaleString("en-IN")}`
                    : "-"}
                </td>
                <td>
                  <span
                    className={`status-pill status-${o.orderStatus?.toLowerCase()}`}
                  >
                    {o.orderStatus}
                  </span>
                </td>
                <td>
                  {o.placedAt
                    ? new Date(o.placedAt).toLocaleString("en-IN")
                    : "-"}
                </td>
                <td>{o.paymentMethod || "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
};

/* ========== USERS VIEW ========== */

const UsersView = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE_URL}/api/users`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Users API error:", res.status, text);

          if (res.status === 403) {
            setError("You are not authorized to view users. Login as ADMIN.");
          } else {
            setError("Could not load users.");
          }
          return;
        }

        const data = await res.json();
        setUsers(data || []);
      } catch (err) {
        console.error("Users error:", err);
        setError("Could not load users (network error).");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const getUserId = (u) => u.userId ?? u.user_id;

  if (loading) {
    return (
      <div className="panel">
        <p className="panel-subtitle">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel">
        <p className="panel-subtitle">{error}</p>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="panel">
        <p className="panel-subtitle">No users found.</p>
      </div>
    );
  }

  return (
    <section className="panel panel-full">
      <div className="panel-header">
        <div>
          <h3>Users</h3>
          <p className="panel-subtitle">
            Showing {users.length} user{users.length > 1 ? "s" : ""}.
          </p>
        </div>
      </div>

      <table className="panel-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const id = getUserId(u);
            return (
              <tr key={id}>
                <td>{id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>{u.role}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
};

/* ========== MAIN ADMIN DASHBOARD ========== */

const AdminDashboard = () => {
  const [section, setSection] = useState("dashboard");

  return (
    <div className="admin-container">
      <AdminSidebar activeSection={section} onSelectSection={setSection} />
      <main className="admin-main">
        {section === "dashboard" && <DashboardHome />}
        {section === "products" && <ProductsView />}
        {section === "orders" && <OrdersView />}
        {section === "users" && <UsersView />}
      </main>
    </div>
  );
};

export default AdminDashboard;


