import { Link, NavLink } from "react-router-dom";

export default function Layout({ children, user, onLogout }) {
  return (
    <>
      <header className="top-nav">
        <div className="brand">Cubingo</div>
        <nav className="nav-links">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/learn">Learn</NavLink>
          <NavLink to="/train">Train</NavLink>
          <NavLink to="/stats">Stats</NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </nav>
      </header>
      <main>
        {user ? (
          <div
            className="card"
            style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <div>
              <p className="eyebrow" style={{ marginBottom: "6px" }}>
                Logged in
              </p>
              <p>{user.email}</p>
            </div>
            <button className="btn ghost" type="button" onClick={onLogout}>
              Log out
            </button>
          </div>
        ) : null}
        {children}
      </main>
    </>
  );
}