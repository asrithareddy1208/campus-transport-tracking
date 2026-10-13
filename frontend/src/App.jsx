
import { useEffect, useState } from "react";
import "./App.css";

const API = `${import.meta.env.VITE_API_URL}/api`;

const inputStyle = {
  padding: 12,
  border: "1px solid #d8e1ea",
  borderRadius: 8,
  fontSize: 14,
  boxSizing: "border-box",
  width: "100%",
};

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [notices, setNotices] = useState([]);
  const [message, setMessage] = useState("");

  const [authMode, setAuthMode] = useState("login");
  const [authAudience, setAuthAudience] = useState("student");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  const [busNumber, setBusNumber] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [driverBus, setDriverBus] = useState("");
  const [editingDriverId, setEditingDriverId] = useState(null);

  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [alternativeBus, setAlternativeBus] = useState("");
  const [priority, setPriority] = useState("Normal");

  const [routeBusId, setRouteBusId] = useState("");
  const [startPoint, setStartPoint] = useState("");
  const [destination, setDestination] = useState("");
  const [routeStops, setRouteStops] = useState([
    { stopName: "", arrivalTime: "" },
  ]);

  async function fetchList(endpoint, setter) {
    try {
      const response = await fetch(`${API}/${endpoint}`);
      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setter(data);
      } else {
        console.error(`Unable to load ${endpoint}:`, data);
      }
    } catch (error) {
      console.error(`Unable to load ${endpoint}:`, error);
    }
  }

  function fetchBuses() {
    return fetchList("buses", setBuses);
  }

  function fetchDrivers() {
    return fetchList("drivers", setDrivers);
  }

  function fetchNotices() {
    return fetchList("notices", setNotices);
  }

  useEffect(() => {
    fetchBuses();
    fetchDrivers();
    fetchNotices();
  }, []);

  function openPage(page) {
    setActivePage(page);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitAuth(e) {
    e.preventDefault();
    setAuthMessage("");
    setAuthBusy(true);

    try {
      const endpoint = authMode === "signup" ? "register" : "login";
      const payload =
        authMode === "signup"
          ? {
              name: authName.trim(),
              email: authEmail.trim(),
              password: authPassword,
            }
          : {
              email: authEmail.trim(),
              password: authPassword,
            };

      const response = await fetch(`${API}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setAuthMessage(
          data.message || data.error || "Unable to continue. Please try again."
        );
        return;
      }

      if (authMode === "signup") {
        setAuthMode("login");
        setAuthAudience("student");
        setAuthPassword("");
        setAuthMessage("Account created! Please log in.");
        return;
      }

      const user = data.user || data.account || {
        email: authEmail.trim(),
        role: data.role || "student",
      };

      const role = user.role || data.role || "student";

      if (authAudience === "admin" && role !== "admin") {
        setAuthMessage("This account is not an admin account.");
        return;
      }

      if (authAudience === "student" && role === "admin") {
        setAuthMessage("Please use Admin Access to sign in.");
        return;
      }

      setCurrentUser({
        ...user,
        email: user.email || authEmail.trim(),
        role,
      });

      setIsAuthenticated(true);
      setAuthPassword("");
      setActivePage("dashboard");

      await Promise.all([fetchBuses(), fetchDrivers(), fetchNotices()]);
    } catch {
      setAuthMessage("Cannot connect to the backend. Please try again.");
    } finally {
      setAuthBusy(false);
    }
  }

  function logout() {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAuthMode("login");
    setAuthAudience("student");
    setAuthEmail("");
    setAuthPassword("");
    setAuthMessage("");
  }

  async function addBus(e) {
    e.preventDefault();

    try {
      const response = await fetch(`${API}/buses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          busNumber,
          registrationNumber,
          capacity: Number(capacity),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || data.error || "Could not add bus.");
        return;
      }

      setMessage("Bus added successfully!");
      setBusNumber("");
      setRegistrationNumber("");
      setCapacity("");
      await fetchBuses();
    } catch {
      setMessage("Could not connect to the backend.");
    }
  }

  async function deleteBus(id) {
    if (!window.confirm("Are you sure you want to delete this bus?")) return;

    try {
      const response = await fetch(`${API}/buses/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Could not delete bus.");
        return;
      }

      setMessage("Bus deleted successfully!");
      await Promise.all([fetchBuses(), fetchDrivers()]);
    } catch {
      setMessage("Could not delete bus.");
    }
  }

  async function updateStatus(id, status) {
    try {
      const response = await fetch(`${API}/buses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Status update failed.");
        return;
      }

      setMessage("Bus status updated!");
      await fetchBuses();
    } catch {
      setMessage("Could not update bus status.");
    }
  }

  async function addNotice(e) {
    e.preventDefault();

    try {
      const response = await fetch(`${API}/notices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: noticeTitle,
          message: noticeMessage,
          alternativeBus,
          priority,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Could not post notice.");
        return;
      }

      setMessage("Notice posted successfully!");
      setNoticeTitle("");
      setNoticeMessage("");
      setAlternativeBus("");
      setPriority("Normal");
      await fetchNotices();
    } catch {
      setMessage("Could not post notice.");
    }
  }

  async function deleteNotice(id) {
    try {
      const response = await fetch(`${API}/notices/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Could not delete notice.");
        return;
      }

      setMessage("Notice deleted!");
      await fetchNotices();
    } catch {
      setMessage("Could not delete notice.");
    }
  }

  function resetDriverForm() {
    setDriverName("");
    setDriverPhone("");
    setDriverBus("");
    setEditingDriverId(null);
  }

  async function saveDriver(e) {
    e.preventDefault();

    try {
      const url = editingDriverId
        ? `${API}/drivers/${editingDriverId}`
        : `${API}/drivers`;

      const response = await fetch(url, {
        method: editingDriverId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: driverName.trim(),
          phoneNumber: driverPhone.trim(),
          bus: driverBus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || data.error || "Unable to save driver.");
        return;
      }

      setMessage(data.message || "Driver saved successfully!");
      resetDriverForm();
      await fetchDrivers();
    } catch {
      setMessage("Unable to connect to the backend.");
    }
  }

  function editDriver(driver) {
    setDriverName(driver.name || "");
    setDriverPhone(driver.phoneNumber || "");
    setDriverBus(driver.bus?._id || "");
    setEditingDriverId(driver._id);
    openPage("driver-details");
  }

  async function deleteDriver(id) {
    if (!window.confirm("Are you sure you want to delete this driver?")) return;

    try {
      const response = await fetch(`${API}/drivers/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to delete driver.");
        return;
      }

      setMessage("Driver deleted successfully!");
      if (editingDriverId === id) resetDriverForm();
      await fetchDrivers();
    } catch {
      setMessage("Unable to connect to the backend.");
    }
  }

  function selectRouteBus(id) {
    setRouteBusId(id);
    const bus = buses.find((item) => item._id === id);

    if (bus) {
      setStartPoint(bus.startPoint || "");
      setDestination(bus.destination || "");
      setRouteStops(
        bus.stops?.length
          ? bus.stops.map((stop) => ({
              stopName: stop.stopName || "",
              arrivalTime: stop.arrivalTime || "",
            }))
          : [{ stopName: "", arrivalTime: "" }]
      );
    }
  }

  function updateStop(index, field, value) {
    setRouteStops((previous) =>
      previous.map((stop, i) =>
        i === index ? { ...stop, [field]: value } : stop
      )
    );
  }

  async function saveRoute(e) {
    e.preventDefault();

    if (!routeBusId) {
      setMessage("Please select a bus first.");
      return;
    }

    try {
      const response = await fetch(`${API}/buses/${routeBusId}/route`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startPoint, destination, stops: routeStops }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || data.error || "Could not save route.");
        return;
      }

      setMessage("Bus route saved successfully!");
      await Promise.all([fetchBuses(), fetchDrivers()]);
    } catch {
      setMessage("Could not save the route.");
    }
  }

  const filteredBuses = buses.filter((bus) =>
    [
      bus.busNumber,
      bus.registrationNumber,
      bus.status,
      bus.startPoint,
      bus.destination,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const activeBuses = buses.filter((bus) => bus.status === "Active").length;
  const maintenanceBuses = buses.filter(
    (bus) => bus.status === "Maintenance"
  ).length;

  const cardStyle = {
    background: "white",
    padding: 20,
    borderRadius: 14,
    boxShadow: "0 5px 20px rgba(16,42,67,.06)",
    marginBottom: 16,
  };

  const buttonStyle = {
    border: 0,
    borderRadius: 8,
    padding: "10px 14px",
    background: "#087e8b",
    color: "white",
    cursor: "pointer",
    fontWeight: 600,
  };

  function renderDriver(driver, admin = false) {
    return (
      <article key={driver._id} style={cardStyle}>
        <h3>👤 {driver.name}</h3>
        <p>
          <strong>Phone:</strong>{" "}
          <a href={`tel:${driver.phoneNumber}`}>{driver.phoneNumber}</a>
        </p>
        <p>
          <strong>Bus Number:</strong>{" "}
          {driver.bus?.busNumber || "Not assigned"}
        </p>
        <p>
          <strong>Registration:</strong>{" "}
          {driver.bus?.registrationNumber || "—"}
        </p>
        <p>
          <strong>Starting Point:</strong>{" "}
          {driver.bus?.startPoint || "Not set"}
        </p>
        <p>
          <strong>Destination:</strong>{" "}
          {driver.bus?.destination || "Not set"}
        </p>

        {admin && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button style={buttonStyle} onClick={() => editDriver(driver)}>
              Edit Driver
            </button>
            <button
              style={{ ...buttonStyle, background: "#b42318" }}
              onClick={() => deleteDriver(driver._id)}
            >
              Delete Driver
            </button>
          </div>
        )}
      </article>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          background: "#f4f7fb",
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <section
          style={{
            background: "linear-gradient(145deg, #102a43, #176b87)",
            color: "white",
            padding: "clamp(28px, 6vw, 80px)",
          }}
        >
          <h1 style={{ fontSize: 44 }}>🚌 CampusTrack</h1>
          <h2>Your campus journey, made simpler.</h2>
          <p>
            Check bus routes, driver details, transport notices, and campus
            commute updates.
          </p>
        </section>

        <section
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <form
            onSubmit={submitAuth}
            style={{
              background: "white",
              width: "100%",
              maxWidth: 420,
              padding: 32,
              borderRadius: 20,
            }}
          >
            <p style={{ color: "#087e8b", fontWeight: 700 }}>
              WELCOME TO CAMPUSTRACK
            </p>
            <h2>
              {authMode === "signup"
                ? "Create your account"
                : authAudience === "admin"
                  ? "Admin access"
                  : "Welcome back"}
            </h2>

            {authMode === "signup" && (
              <input
                style={{ ...inputStyle, marginBottom: 12 }}
                placeholder="Full name"
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
                required
              />
            )}

            <input
              style={{ ...inputStyle, marginBottom: 12 }}
              type="email"
              placeholder="College email address"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              required
            />

            <input
              style={{ ...inputStyle, marginBottom: 12 }}
              type="password"
              placeholder="Password"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              minLength={6}
              required
            />

            {authMessage && (
              <p style={{ color: "#b42318" }}>{authMessage}</p>
            )}

            <button
              type="submit"
              disabled={authBusy}
              style={{ ...buttonStyle, width: "100%", padding: 14 }}
            >
              {authBusy
                ? "Please wait..."
                : authMode === "signup"
                  ? "Create account"
                  : "Sign in"}
            </button>

            {authAudience === "student" && (
              <p style={{ textAlign: "center", marginTop: 20 }}>
                {authMode === "login"
                  ? "New to CampusTrack? "
                  : "Already have an account? "}
                <button
                  type="button"
                  style={{
                    ...buttonStyle,
                    background: "transparent",
                    color: "#087e8b",
                  }}
                  onClick={() => {
                    setAuthMode(authMode === "login" ? "signup" : "login");
                    setAuthMessage("");
                  }}
                >
                  {authMode === "login" ? "Create account" : "Sign in"}
                </button>
              </p>
            )}

            <div style={{ textAlign: "center", marginTop: 18 }}>
              <button
                type="button"
                style={{
                  ...buttonStyle,
                  background: "transparent",
                  color: "#087e8b",
                }}
                onClick={() => {
                  setAuthAudience(
                    authAudience === "student" ? "admin" : "student"
                  );
                  setAuthMode("login");
                  setAuthMessage("");
                }}
              >
                {authAudience === "student"
                  ? "Admin access"
                  : "← Back to student login"}
              </button>
            </div>
          </form>
        </section>
      </div>
    );
  }

  if (currentUser?.role !== "admin") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f4f7fb",
          fontFamily: "Inter, Arial, sans-serif",
          color: "#102a43",
        }}
      >
        <header
          style={{
            background: "#102a43",
            color: "white",
            padding: "22px 5%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}
        >
          <h1>🚌 CampusTrack</h1>
          <button style={buttonStyle} onClick={logout}>
            Log out
          </button>
        </header>

        <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
          <h2>Hi{currentUser?.name ? `, ${currentUser.name}` : ""}! 👋</h2>
          <p>Here are the latest campus transport updates.</p>

          <h2>🚌 Available Buses & Routes</h2>
          {buses.length === 0 ? (
            <p style={cardStyle}>No bus information available yet.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: 16,
              }}
            >
              {buses.map((bus) => (
                <article key={bus._id} style={cardStyle}>
                  <h3>🚌 {bus.busNumber}</h3>
                  <p>
                    <strong>Route:</strong> {bus.startPoint || "Not set"} →{" "}
                    {bus.destination || "Not set"}
                  </p>
                  <p>
                    <strong>Status:</strong> {bus.status || "Active"}
                  </p>
                  <p>
                    <strong>Registration:</strong> {bus.registrationNumber}
                  </p>
                  {bus.stops?.length > 0 && (
                    <>
                      <strong>Stops</strong>
                      {bus.stops.map((stop, index) => (
                        <p key={index}>
                          {stop.stopName} · {stop.arrivalTime}
                        </p>
                      ))}
                    </>
                  )}
                </article>
              ))}
            </div>
          )}

          <h2 style={{ marginTop: 32 }}>👤 Driver Details</h2>
          <p style={{ color: "#64748b" }}>
            Contact details and assigned routes for campus drivers.
          </p>
          {drivers.length === 0 ? (
            <p style={cardStyle}>
              No driver details available yet. Please check again later.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: 16,
              }}
            >
              {drivers.map((driver) => renderDriver(driver))}
            </div>
          )}

          <h2 style={{ marginTop: 32 }}>📢 Transport Notices</h2>
          {notices.length === 0 ? (
            <p style={cardStyle}>No notices at the moment.</p>
          ) : (
            notices.map((notice) => (
              <article key={notice._id} style={cardStyle}>
                <h3>{notice.title}</h3>
                <p>{notice.message}</p>
                {notice.alternativeBus && (
                  <p>
                    <strong>Alternative bus:</strong> {notice.alternativeBus}
                  </p>
                )}
                <small>Priority: {notice.priority || "Normal"}</small>
              </article>
            ))
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">🚌</span>
          <div>
            <h2>CampusTrack</h2>
            <p>Transport Admin</p>
          </div>
        </div>

        <p className="sidebar-label">MAIN MENU</p>

        <nav className="sidebar-nav">
          {[
            ["dashboard", "▦ Dashboard"],
            ["bus-management", "🚌 Bus Management"],
            ["route-manager", "📍 Routes & Stops"],
            ["driver-details", "👤 Driver Details"],
            ["notice-board", "📢 Notice Board"],
            ["campus-fleet", "🚐 Campus Fleet"],
          ].map(([page, label]) => (
            <button
              key={page}
              className={activePage === page ? "active" : ""}
              onClick={() => openPage(page)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span>●</span> System Online
        </div>
        <button style={buttonStyle} onClick={logout}>
          Log out
        </button>
      </aside>

      <main className="main-content">
        <header className="header">
          <div>
            <h1>
              {{
                dashboard: "Dashboard",
                "bus-management": "Bus Management",
                "route-manager": "Routes & Stops",
                "driver-details": "Driver Details",
                "notice-board": "Notice Board",
                "campus-fleet": "Campus Fleet",
              }[activePage]}
            </h1>
            <p>Manage your campus transport system.</p>
          </div>
          <span className="admin-badge">Admin Panel</span>
        </header>

        {message && (
          <div className="message">
            {message}
            <button onClick={() => setMessage("")}>×</button>
          </div>
        )}

        {activePage === "dashboard" && (
          <>
            <section className="stats-grid">
              <div className="stat-card">
                <p>Total Buses</p>
                <h2>{buses.length}</h2>
              </div>
              <div className="stat-card">
                <p>Active Buses</p>
                <h2>{activeBuses}</h2>
              </div>
              <div className="stat-card">
                <p>Total Drivers</p>
                <h2>{drivers.length}</h2>
              </div>
              <div className="stat-card">
                <p>Maintenance</p>
                <h2>{maintenanceBuses}</h2>
              </div>
            </section>

            <section className="section-card">
              <h2>📢 Latest Transport Notices</h2>
              {notices.slice(0, 3).map((notice) => (
                <article key={notice._id} style={cardStyle}>
                  <h3>{notice.title}</h3>
                  <p>{notice.message}</p>
                </article>
              ))}
              <button
                style={buttonStyle}
                onClick={() => openPage("notice-board")}
              >
                View All Notices
              </button>
            </section>
          </>
        )}

        {activePage === "bus-management" && (
          <>
            <section className="section-card">
              <h2>➕ Add New Bus</h2>
              <form className="bus-form" onSubmit={addBus}>
                <input
                  placeholder="Bus Number"
                  value={busNumber}
                  onChange={(e) => setBusNumber(e.target.value)}
                  required
                />
                <input
                  placeholder="Registration Number"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Bus Capacity"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  min="1"
                  required
                />
                <button type="submit">Add Bus</button>
              </form>
            </section>

            <section className="section-card">
              <h2>🚌 Registered Buses ({buses.length})</h2>
              <input
                className="search-input"
                placeholder="Search buses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Bus</th>
                      <th>Registration</th>
                      <th>Capacity</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBuses.map((bus) => (
                      <tr key={bus._id}>
                        <td>{bus.busNumber}</td>
                        <td>{bus.registrationNumber}</td>
                        <td>{bus.capacity}</td>
                        <td>
                          <select
                            value={bus.status || "Active"}
                            onChange={(e) =>
                              updateStatus(bus._id, e.target.value)
                            }
                          >
                            <option>Active</option>
                            <option>Inactive</option>
                            <option>Maintenance</option>
                          </select>
                        </td>
                        <td>
                          <button
                            className="secondary-button"
                            onClick={() => {
                              selectRouteBus(bus._id);
                              openPage("route-manager");
                            }}
                          >
                            Edit Route
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => deleteBus(bus._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {activePage === "route-manager" && (
          <section className="section-card">
            <h2>📍 Route & Stop Manager</h2>
            <form className="route-form" onSubmit={saveRoute}>
              <label>Select Bus</label>
              <select
                value={routeBusId}
                onChange={(e) => selectRouteBus(e.target.value)}
                required
              >
                <option value="">Choose a bus</option>
                {buses.map((bus) => (
                  <option key={bus._id} value={bus._id}>
                    {bus.busNumber} — {bus.registrationNumber}
                  </option>
                ))}
              </select>

              <div className="route-endpoints">
                <input
                  placeholder="Starting Point"
                  value={startPoint}
                  onChange={(e) => setStartPoint(e.target.value)}
                  required
                />
                <input
                  placeholder="Destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                />
              </div>

              <h3>Stops & Arrival Times</h3>
              {routeStops.map((stop, index) => (
                <div className="route-stop-row" key={index}>
                  <input
                    placeholder={`Stop ${index + 1} name`}
                    value={stop.stopName}
                    onChange={(e) =>
                      updateStop(index, "stopName", e.target.value)
                    }
                    required
                  />
                  <input
                    type="time"
                    value={stop.arrivalTime}
                    onChange={(e) =>
                      updateStop(index, "arrivalTime", e.target.value)
                    }
                    required
                  />
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={routeStops.length === 1}
                    onClick={() =>
                      setRouteStops((previous) =>
                        previous.filter((_, i) => i !== index)
                      )
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setRouteStops((previous) => [
                    ...previous,
                    { stopName: "", arrivalTime: "" },
                  ])
                }
              >
                + Add Stop
              </button>
              <button type="submit">Save Route</button>
            </form>

            <h3>🗺️ Saved Bus Routes</h3>
            {buses
              .filter((bus) => bus.startPoint && bus.destination)
              .map((bus) => (
                <article key={bus._id} style={cardStyle}>
                  <h4>
                    {bus.busNumber}: {bus.startPoint} → {bus.destination}
                  </h4>
                  {(bus.stops || []).map((stop, index) => (
                    <p key={index}>
                      {stop.stopName} — {stop.arrivalTime}
                    </p>
                  ))}
                </article>
              ))}
          </section>
        )}

        {activePage === "driver-details" && (
          <>
            <section className="section-card">
              <h2>{editingDriverId ? "✏️ Edit Driver" : "➕ Add Driver"}</h2>
              <form className="bus-form" onSubmit={saveDriver}>
                <input
                  placeholder="Driver Full Name"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  required
                />
                <input
                  type="tel"
                  placeholder="Driver Phone Number"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  pattern="[0-9+() -]{7,20}"
                  required
                />
                <select
                  value={driverBus}
                  onChange={(e) => setDriverBus(e.target.value)}
                  required
                >
                  <option value="">Assign a bus</option>
                  {buses.map((bus) => (
                    <option key={bus._id} value={bus._id}>
                      {bus.busNumber} — {bus.registrationNumber}
                    </option>
                  ))}
                </select>
                <button type="submit">
                  {editingDriverId ? "Update Driver" : "Add Driver"}
                </button>
                {editingDriverId && (
                  <button type="button" onClick={resetDriverForm}>
                    Cancel Edit
                  </button>
                )}
              </form>
            </section>

            <section className="section-card">
              <h2>👤 Registered Drivers ({drivers.length})</h2>
              {drivers.length === 0 ? (
                <p>No drivers added yet.</p>
              ) : (
                drivers.map((driver) => renderDriver(driver, true))
              )}
            </section>
          </>
        )}

        {activePage === "notice-board" && (
          <>
            <section className="section-card">
              <h2>📢 Post a Transport Notice</h2>
              <form className="notice-form" onSubmit={addNotice}>
                <input
                  placeholder="Notice title"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  required
                />
                <textarea
                  placeholder="Write your announcement..."
                  value={noticeMessage}
                  onChange={(e) => setNoticeMessage(e.target.value)}
                  rows="4"
                  required
                />
                <input
                  placeholder="Alternative bus (optional)"
                  value={alternativeBus}
                  onChange={(e) => setAlternativeBus(e.target.value)}
                />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option>Normal</option>
                  <option>Important</option>
                  <option>Urgent</option>
                </select>
                <button type="submit">Post Notice</button>
              </form>
            </section>

            <section className="section-card">
              <h2>All Notices ({notices.length})</h2>
              {notices.map((notice) => (
                <article key={notice._id} style={cardStyle}>
                  <h3>{notice.title}</h3>
                  <p>{notice.message}</p>
                  {notice.alternativeBus && (
                    <p>Alternative bus: {notice.alternativeBus}</p>
                  )}
                  <p>Priority: {notice.priority || "Normal"}</p>
                  <button
                    className="delete-button"
                    onClick={() => deleteNotice(notice._id)}
                  >
                    Delete Notice
                  </button>
                </article>
              ))}
            </section>
          </>
        )}

        {activePage === "campus-fleet" && (
          <section className="section-card">
            <h2>🚐 Campus Fleet</h2>
            <input
              className="search-input"
              placeholder="Search buses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Bus</th>
                    <th>Registration</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th>Route</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBuses.map((bus) => (
                    <tr key={bus._id}>
                      <td>{bus.busNumber}</td>
                      <td>{bus.registrationNumber}</td>
                      <td>{bus.capacity}</td>
                      <td>
                        <select
                          value={bus.status || "Active"}
                          onChange={(e) =>
                            updateStatus(bus._id, e.target.value)
                          }
                        >
                          <option>Active</option>
                          <option>Inactive</option>
                          <option>Maintenance</option>
                        </select>
                      </td>
                      <td>
                        {bus.startPoint || "Not set"} →{" "}
                        {bus.destination || "Not set"}
                      </td>
                      <td>
                        <button
                          className="secondary-button"
                          onClick={() => {
                            selectRouteBus(bus._id);
                            openPage("route-manager");
                          }}
                        >
                          Edit Route
                        </button>
                        <button
                          className="delete-button"
                          onClick={() => deleteBus(bus._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <footer className="app-footer">
          CampusTrack · Campus Transport Management System
        </footer>
      </main>
    </div>
  );
}

export default App;
