
import { useEffect, useState } from "react";
import "./App.css";

const API = `${import.meta.env.VITE_API_URL}/api`;
const authInputStyle = { boxSizing: "border-box", width: "100%", border: "1px solid #d8e1ea", borderRadius: 10, padding: "13px 14px", marginBottom: 14, fontSize: 15, outlineColor: "#087e8b" };
const authLinkStyle = { border: 0, background: "none", color: "#087e8b", fontWeight: 700, cursor: "pointer", padding: 4 };

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [buses, setBuses] = useState([]);
  const [notices, setNotices] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
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

  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [driverBus, setDriverBus] = useState("");
  const [editingDriverId, setEditingDriverId] = useState(null);

  useEffect(() => {
    fetchBuses();
    fetchNotices();
    fetchDrivers();
  }, []);

  async function fetchBuses() {
    try {
      const response = await fetch(`${API}/buses`);
      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setBuses(data);
      } else {
        setMessage("Unable to load buses.");
      }
    } catch {
      setMessage("Cannot connect to the backend.");
    }
  }

  async function fetchNotices() {
    try {
      const response = await fetch(`${API}/notices`);
      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setNotices(data);
      }
    } catch (error) {
      console.error("Unable to load notices:", error);
    }
  }

  async function fetchDrivers() {
    try {
      const response = await fetch(`${API}/drivers`);
      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setDrivers(data);
      }
    } catch (error) {
      console.error("Unable to load drivers:", error);
    }
  }

  function openPage(page) {
    setActivePage(page);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    if (!window.confirm("Are you sure you want to delete this bus?")) {
      return;
    }

    try {
      const response = await fetch(`${API}/buses/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Could not delete bus.");
        return;
      }

      if (routeBusId === id) {
        setRouteBusId("");
        setStartPoint("");
        setDestination("");
        setRouteStops([{ stopName: "", arrivalTime: "" }]);
      }

      if (driverBus === id) {
        setDriverBus("");
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
        setMessage(data.message || data.error || "Status update failed.");
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
        setMessage(data.message || data.error || "Could not post notice.");
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

      setMessage("Notice deleted successfully!");
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteDriver(id) {
    if (!window.confirm("Are you sure you want to delete this driver?")) {
      return;
    }

    try {
      const response = await fetch(`${API}/drivers/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || data.error || "Unable to delete driver.");
        return;
      }

      if (editingDriverId === id) {
        resetDriverForm();
      }

      setMessage("Driver deleted successfully!");
      await fetchDrivers();
    } catch {
      setMessage("Unable to connect to the backend.");
    }
  }

  function selectRouteBus(id) {
    setRouteBusId(id);

    const selectedBus = buses.find((bus) => bus._id === id);

    if (selectedBus) {
      setStartPoint(selectedBus.startPoint || "");
      setDestination(selectedBus.destination || "");
      setRouteStops(
        selectedBus.stops?.length
          ? selectedBus.stops.map((stop) => ({
              stopName: stop.stopName || "",
              arrivalTime: stop.arrivalTime || "",
            }))
          : [{ stopName: "", arrivalTime: "" }]
      );
    }
  }

  function viewRoute(bus) {
    const stopDetails = bus.stops?.length
      ? bus.stops
          .map(
            (stop, index) =>
              `${index + 1}. ${stop.stopName} — ${stop.arrivalTime}`
          )
          .join("\n")
      : "No stops added yet.";

    window.alert(
      `BUS ROUTE DETAILS\n\n` +
        `Bus Number: ${bus.busNumber}\n` +
        `Registration: ${bus.registrationNumber}\n\n` +
        `Starting Point: ${bus.startPoint || "Not set"}\n` +
        `Destination: ${bus.destination || "Not set"}\n\n` +
        `STOPS & ARRIVAL TIMES\n${stopDetails}`
    );
  }

  function updateStop(index, field, value) {
    setRouteStops((previous) =>
      previous.map((stop, i) =>
        i === index ? { ...stop, [field]: value } : stop
      )
    );
  }

  function addStop() {
    setRouteStops((previous) => [
      ...previous,
      { stopName: "", arrivalTime: "" },
    ]);
  }

  function removeStop(index) {
    setRouteStops((previous) =>
      previous.filter((_, i) => i !== index)
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
        body: JSON.stringify({
          startPoint,
          destination,
          stops: routeStops,
        }),
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

  const activeBuses = buses.filter(
    (bus) => bus.status === "Active"
  ).length;

  const inactiveBuses = buses.filter(
    (bus) => bus.status === "Inactive"
  ).length;

  const maintenanceBuses = buses.filter(
    (bus) => bus.status === "Maintenance"
  ).length;

  const recentNotices = notices.slice(0, 3);

  function renderNotice(notice) {
    return (
      <article className="notice-card" key={notice._id}>
        <div className="notice-heading">
          <h3>{notice.title}</h3>
          <span
            className={`priority-${(
              notice.priority || "Normal"
            ).toLowerCase()}`}
          >
            {notice.priority || "Normal"}
          </span>
        </div>

        <p>{notice.message}</p>

        {notice.alternativeBus && (
          <p>
            <strong>Alternative bus:</strong> {notice.alternativeBus}
          </p>
        )}
      </article>
    );
  }

  async function submitAuth(e) {
    e.preventDefault();
    setAuthMessage("");
    setAuthBusy(true);
    try {
      const endpoint = authMode === "signup" ? "register" : "login";
      const payload = authMode === "signup"
        ? { name: authName.trim(), email: authEmail.trim(), password: authPassword }
        : { email: authEmail.trim(), password: authPassword };
      const response = await fetch(`${API}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        setAuthMessage(data.message || data.error || "Something went wrong. Please try again.");
        return;
      }
      if (authMode === "signup") {
        setAuthMode("login");
        setAuthAudience("student");
        setAuthPassword("");
        setAuthMessage("Account created! Please log in.");
        return;
      }
      const user = data.user || data.account || { email: authEmail.trim(), role: data.role || "student" };
      const role = user.role || data.role || "student";
      if (authAudience === "admin" && role !== "admin") {
        setAuthMessage("This account is not an admin account.");
        return;
      }
      if (authAudience === "student" && role === "admin") {
        setAuthMessage("Please use Admin Access to sign in with this account.");
        return;
      }
      setCurrentUser({ ...user, email: user.email || authEmail.trim(), role });
      setIsAuthenticated(true);
      setAuthPassword("");
      if (role === "admin") {
        setActivePage("dashboard");
        fetchBuses(); fetchNotices(); fetchDrivers();
      }
    } catch {
      setAuthMessage("Cannot connect to the backend. Make sure your server is running.");
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

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 0.85fr)", background: "#f4f7fb", fontFamily: "Inter, Arial, sans-serif" }}>
        <section style={{ background: "linear-gradient(145deg, #102a43, #176b87)", color: "white", padding: "clamp(28px, 6vw, 80px)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div><div style={{ fontSize: 42 }}>🚌</div><h1 style={{ fontSize: "clamp(32px, 4vw, 54px)", lineHeight: 1.1, marginBottom: 16 }}>CampusTrack</h1><p style={{ fontSize: 18, lineHeight: 1.7, maxWidth: 440, color: "#d9edf5" }}>Your campus journey, made simpler.</p></div>
          <div style={{ maxWidth: 440 }}><h2 style={{ fontSize: 26 }}>Move smarter around campus.</h2><p style={{ lineHeight: 1.7, color: "#d9edf5" }}>Check bus routes, follow transport notices, and stay updated on your campus commute.</p><div style={{ marginTop: 28, opacity: .8 }}>Campus Transport Management System</div></div>
        </section>
        <section style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <form onSubmit={submitAuth} style={{ background: "white", width: "100%", maxWidth: 420, padding: "clamp(24px, 4vw, 42px)", borderRadius: 22, boxShadow: "0 18px 55px rgba(16,42,67,.12)" }}>
            <p style={{ color: "#16809a", fontWeight: 700, letterSpacing: 1.5, fontSize: 12, marginBottom: 8 }}>WELCOME TO CAMPUSTRACK</p>
            <h2 style={{ color: "#102a43", fontSize: 30, margin: "0 0 8px" }}>{authMode === "signup" ? "Create your account" : authAudience === "admin" ? "Admin access" : "Welcome back"}</h2>
            <p style={{ color: "#64748b", marginTop: 0, marginBottom: 24 }}>{authMode === "signup" ? "Sign up as a student to get started." : "Sign in to continue to your transport portal."}</p>
            {authMode === "signup" && <input value={authName} onChange={e => setAuthName(e.target.value)} placeholder="Full name" required style={authInputStyle} />}
            <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder="College email address" required style={authInputStyle} />
            <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder="Password" minLength={6} required style={authInputStyle} />
            {authMessage && <p role="alert" style={{ color: authMessage.toLowerCase().includes("created") ? "#15803d" : "#b42318", fontSize: 14, lineHeight: 1.5 }}>{authMessage}</p>}
            <button type="submit" disabled={authBusy} style={{ width: "100%", border: 0, borderRadius: 10, padding: 14, background: "#087e8b", color: "white", fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 8 }}>{authBusy ? "Please wait…" : authMode === "signup" ? "Create account" : "Sign in"}</button>
            {authAudience === "student" && <p style={{ textAlign: "center", color: "#64748b", fontSize: 14, marginTop: 22 }}>{authMode === "login" ? "New to CampusTrack? " : "Already have an account? "}<button type="button" onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setAuthMessage(""); }} style={authLinkStyle}>{authMode === "login" ? "Create account" : "Sign in"}</button></p>}
            <div style={{ borderTop: "1px solid #e5eaf0", marginTop: 22, paddingTop: 18, textAlign: "center" }}><button type="button" onClick={() => { setAuthAudience(authAudience === "student" ? "admin" : "student"); setAuthMode("login"); setAuthMessage(""); }} style={authLinkStyle}>{authAudience === "student" ? "Admin access" : "← Back to student login"}</button></div>
          </form>
        </section>
      </div>
    );
  }

  if (currentUser?.role !== "admin") {
    return (
      <div style={{ minHeight: "100vh", background: "#f4f7fb", fontFamily: "Inter, Arial, sans-serif", color: "#102a43" }}>
        <header style={{ background: "#102a43", color: "white", padding: "22px clamp(20px, 5vw, 64px)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}><div><div style={{ fontSize: 12, letterSpacing: 2, color: "#9edce5" }}>CAMPUS TRANSPORT</div><h1 style={{ margin: "6px 0 0" }}>🚌 CampusTrack</h1></div><button onClick={logout} style={{ border: "1px solid #9edce5", background: "transparent", color: "white", padding: "10px 16px", borderRadius: 9, cursor: "pointer" }}>Log out</button></header>
        <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px" }}><h2>Hi{currentUser?.name ? `, ${currentUser.name}` : " there"}! 👋</h2><p style={{ color: "#64748b" }}>Here are the latest campus transport updates.</p><h3 style={{ marginTop: 30 }}>Available buses & routes</h3>{buses.length === 0 ? <p style={{ background: "white", padding: 20, borderRadius: 12 }}>No bus information available yet.</p> : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>{buses.map(bus => <article key={bus._id} style={{ background: "white", padding: 20, borderRadius: 14, boxShadow: "0 5px 20px rgba(16,42,67,.06)" }}><h3 style={{ marginTop: 0 }}>🚌 {bus.busNumber}</h3><p><b>Route:</b> {bus.startPoint || "Not set"} → {bus.destination || "Not set"}</p><p><b>Status:</b> {bus.status || "Active"}</p><p><b>Registration:</b> {bus.registrationNumber}</p>{bus.stops?.length > 0 && <div><b>Stops</b>{bus.stops.map((stop, i) => <p key={i} style={{ margin: "8px 0", color: "#64748b" }}>{stop.stopName} · {stop.arrivalTime}</p>)}</div>}</article>)}</div>}<h3 style={{ marginTop: 32 }}>📢 Transport notices</h3>{notices.length === 0 ? <p style={{ background: "white", padding: 20, borderRadius: 12 }}>No notices at the moment.</p> : notices.map(n => <article key={n._id} style={{ background: "white", padding: 18, borderRadius: 12, marginBottom: 12 }}><b>{n.title}</b><p>{n.message}</p>{n.alternativeBus && <p><b>Alternative bus:</b> {n.alternativeBus}</p>}<small>Priority: {n.priority || "Normal"}</small></article>)}</main>
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
          <button
            className={activePage === "dashboard" ? "active" : ""}
            onClick={() => openPage("dashboard")}
          >
            ▦ Dashboard
          </button>

          <button
            className={activePage === "bus-management" ? "active" : ""}
            onClick={() => openPage("bus-management")}
          >
            🚌 Bus Management
          </button>

          <button
            className={activePage === "route-manager" ? "active" : ""}
            onClick={() => openPage("route-manager")}
          >
            📍 Routes & Stops
          </button>

          <button
            className={activePage === "driver-details" ? "active" : ""}
            onClick={() => openPage("driver-details")}
          >
            👤 Driver Details
          </button>

          <button
            className={activePage === "notice-board" ? "active" : ""}
            onClick={() => openPage("notice-board")}
          >
            📢 Notice Board
          </button>

          <button
            className={activePage === "campus-fleet" ? "active" : ""}
            onClick={() => openPage("campus-fleet")}
          >
            🚐 Campus Fleet
          </button>
        </nav>

        <div className="sidebar-footer">
          <span>●</span> System Online
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div>
            <h1>
              {activePage === "dashboard" && "Dashboard"}
              {activePage === "bus-management" && "Bus Management"}
              {activePage === "route-manager" && "Routes & Stops"}
              {activePage === "driver-details" && "Driver Details"}
              {activePage === "notice-board" && "Notice Board"}
              {activePage === "campus-fleet" && "Campus Fleet"}
            </h1>
            <p>
              {activePage === "dashboard" &&
                "Your campus transport overview at a glance."}
              {activePage === "bus-management" &&
                "Register and manage campus buses."}
              {activePage === "route-manager" &&
                "Manage bus routes, stops and arrival times."}
              {activePage === "driver-details" &&
                "Manage drivers and their assigned buses."}
              {activePage === "notice-board" &&
                "Publish and manage transport announcements."}
              {activePage === "campus-fleet" &&
                "View your fleet and manage bus status."}
            </p>
          </div>
          <span className="admin-badge">Admin Panel</span>
        </header>

        {message && (
          <div className="message">
            <span>{message}</span>
            <button
              type="button"
              onClick={() => setMessage("")}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        {activePage === "dashboard" && (
          <>
            <section className="stats-grid">
              <div className="stat-card">
                <p>Total Buses</p>
                <h2>{buses.length}</h2>
                <span>Registered campus buses</span>
              </div>

              <div className="stat-card">
                <p>Active Buses</p>
                <h2>{activeBuses}</h2>
                <span>Ready for service</span>
              </div>

              <div className="stat-card">
                <p>Total Drivers</p>
                <h2>{drivers.length}</h2>
                <span>Registered drivers</span>
              </div>

              <div className="stat-card">
                <p>Maintenance</p>
                <h2>{maintenanceBuses}</h2>
                <span>Under maintenance</span>
              </div>
            </section>

            <section className="section-card">
              <div className="section-heading">
                <div>
                  <h2>📢 Latest Transport Notices</h2>
                  <p>Stay updated with campus transport announcements.</p>
                </div>
                <button onClick={() => openPage("notice-board")}>
                  View All Notices
                </button>
              </div>

              <div className="notice-list">
                {recentNotices.length === 0 ? (
                  <p className="empty-state">
                    No notices yet. New announcements will appear here.
                  </p>
                ) : (
                  recentNotices.map(renderNotice)
                )}
              </div>
            </section>

            <section className="section-card">
              <div className="section-heading">
                <div>
                  <h2>🚌 Quick Overview</h2>
                  <p>Jump straight to the section you need.</p>
                </div>
              </div>

              <div className="driver-list">
                <button
                  className="section-card"
                  onClick={() => openPage("bus-management")}
                >
                  🚌 Manage Buses
                </button>
                <button
                  className="section-card"
                  onClick={() => openPage("route-manager")}
                >
                  📍 Manage Routes
                </button>
                <button
                  className="section-card"
                  onClick={() => openPage("driver-details")}
                >
                  👤 Manage Drivers
                </button>
              </div>
            </section>
          </>
        )}

        {activePage === "bus-management" && (
          <>
            <section className="section-card">
              <div className="section-heading">
                <div>
                  <h2>➕ Add New Bus</h2>
                  <p>Register a bus in the campus transport system.</p>
                </div>
              </div>

              <form className="bus-form" onSubmit={addBus}>
                <input
                  type="text"
                  placeholder="Bus Number (e.g. BUS-01)"
                  value={busNumber}
                  onChange={(e) => setBusNumber(e.target.value)}
                  required
                />
                <input
                  type="text"
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
              <div className="section-heading">
                <div>
                  <h2>🚌 Registered Buses</h2>
                  <p>{buses.length} buses in the system.</p>
                </div>
              </div>

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
                      <th>Bus Number</th>
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
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Maintenance">Maintenance</option>
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
            <div className="section-heading">
              <div>
                <h2>📍 Route & Stop Manager</h2>
                <p>Set the route and arrival time for each bus.</p>
              </div>
            </div>

            <form className="route-form" onSubmit={saveRoute}>
              <label htmlFor="routeBus">Select Bus</label>
              <select
                id="routeBus"
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
                    aria-label={`Arrival time for stop ${index + 1}`}
                    value={stop.arrivalTime}
                    onChange={(e) =>
                      updateStop(index, "arrivalTime", e.target.value)
                    }
                    required
                  />
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => removeStop(index)}
                    disabled={routeStops.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <div className="route-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={addStop}
                >
                  + Add Stop
                </button>
                <button type="submit">Save Route</button>
              </div>
            </form>

            <div className="saved-routes">
              <h3>🗺️ Saved Bus Routes</h3>
              {buses.filter((bus) => bus.startPoint && bus.destination).length ===
              0 ? (
                <p className="empty-state">No routes saved yet.</p>
              ) : (
                buses
                  .filter((bus) => bus.startPoint && bus.destination)
                  .map((bus) => (
                    <div className="saved-route-card" key={bus._id}>
                      <h4>
                        {bus.busNumber}: {bus.startPoint} → {bus.destination}
                      </h4>
                      <div className="route-timeline">
                        <div className="timeline-stop">
                          <span className="timeline-dot" />
                          <div>
                            <strong>{bus.startPoint}</strong>
                            <p>Starting point</p>
                          </div>
                        </div>

                        {(bus.stops || []).map((stop, index) => (
                          <div
                            className="timeline-stop"
                            key={`${bus._id}-${index}`}
                          >
                            <span className="timeline-dot" />
                            <div>
                              <strong>{stop.stopName}</strong>
                              <p>Arrival: {stop.arrivalTime}</p>
                            </div>
                          </div>
                        ))}

                        <div className="timeline-stop">
                          <span className="timeline-dot" />
                          <div>
                            <strong>{bus.destination}</strong>
                            <p>Destination</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </section>
        )}

        {activePage === "driver-details" && (
          <>
            <section className="section-card">
              <div className="section-heading">
                <div>
                  <h2>{editingDriverId ? "✏️ Edit Driver" : "➕ Add Driver"}</h2>
                  <p>Enter driver details and assign a campus bus.</p>
                </div>
              </div>

              <form className="bus-form" onSubmit={saveDriver}>
                <input
                  type="text"
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
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={resetDriverForm}
                  >
                    Cancel Edit
                  </button>
                )}
              </form>
            </section>

            <section className="section-card">
              <div className="section-heading">
                <div>
                  <h2>👤 Registered Drivers</h2>
                  <p>{drivers.length} drivers in the system.</p>
                </div>
              </div>

              <div className="driver-list">
                {drivers.length === 0 ? (
                  <p className="empty-state">No drivers added yet.</p>
                ) : (
                  drivers.map((driver) => (
                    <article className="driver-card" key={driver._id}>
                      <div className="driver-card-heading">
                        <div>
                          <h3>{driver.name}</h3>
                          <p>
                            <strong>Phone:</strong>{" "}
                            <a href={`tel:${driver.phoneNumber}`}>
                              {driver.phoneNumber}
                            </a>
                          </p>
                        </div>
                        <span className="admin-badge">Driver</span>
                      </div>

                      <div className="driver-details-grid">
                        <p>
                          <strong>Bus Number:</strong>{" "}
                          {driver.bus?.busNumber || "Assigned bus unavailable"}
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
                      </div>

                      <div className="driver-card-actions">
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => editDriver(driver)}
                        >
                          Edit Driver
                        </button>
                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => deleteDriver(driver._id)}
                        >
                          Delete Driver
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          </>
        )}

        {activePage === "notice-board" && (
          <>
            <section className="section-card">
              <div className="section-heading">
                <div>
                  <h2>📢 Post a Transport Notice</h2>
                  <p>Share delays, changes and important announcements.</p>
                </div>
              </div>

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
                  required
                  rows="4"
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
                  <option value="Normal">Normal Priority</option>
                  <option value="Important">Important</option>
                  <option value="Urgent">Urgent</option>
                </select>
                <button type="submit">Post Notice</button>
              </form>
            </section>

            <section className="section-card">
              <div className="section-heading">
                <div>
                  <h2>All Notices</h2>
                  <p>{notices.length} announcements.</p>
                </div>
              </div>

              <div className="notice-list">
                {notices.length === 0 ? (
                  <p className="empty-state">No notices posted yet.</p>
                ) : (
                  notices.map((notice) => (
                    <div key={notice._id}>
                      {renderNotice(notice)}
                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => deleteNotice(notice._id)}
                      >
                        Delete Notice
                      </button>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}

        {activePage === "campus-fleet" && (
          <section className="section-card">
            <div className="section-heading">
              <div>
                <h2>🚐 Campus Fleet</h2>
                <p>View bus details, routes and operating status.</p>
              </div>
              <span>{filteredBuses.length} buses</span>
            </div>

            <input
              className="search-input"
              placeholder="Search by bus number, registration, status or route..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {filteredBuses.length === 0 ? (
              <p className="empty-state">No matching buses found.</p>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Bus Number</th>
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
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Maintenance">Maintenance</option>
                          </select>
                        </td>
                        <td>
                          {bus.startPoint && bus.destination
                            ? `${bus.startPoint} → ${bus.destination}`
                            : "Not set"}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="view-route-button"
                            onClick={() => viewRoute(bus)}
                          >
                            View Route
                          </button>
                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => {
                              selectRouteBus(bus._id);
                              openPage("route-manager");
                            }}
                          >
                            Edit Route
                          </button>
                          <button
                            type="button"
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
            )}
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
