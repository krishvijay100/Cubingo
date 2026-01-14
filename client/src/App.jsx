import { useEffect, useState } from "react";
import AuthPanel from "./components/AuthPanel.jsx";
import { fetchMe, logout } from "./api/auth.js";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadMe() {
    try {
      const data = await fetchMe();
      setUser(data.user || null);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMe();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "32px" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <header className="top-nav">
          <div className="brand">Cubingo</div>
          <nav className="nav-links">
            <a className="active" href="/">Home</a>
            <a href="/learn">Learn</a>
            <a href="/train">Train</a>
            <a href="/stats">Stats</a>
            <a href="/settings">Settings</a>
          </nav>
        </header>
        <main>
          <section className="hero">
            <div>
              <p className="eyebrow">Daily practice</p>
              <h1>Build a daily streak for OLL and PLL</h1>
              <p>
                Study a case, drill the timer, and watch your stats grow. Designed for
                beginners and built for consistency.
              </p>
              <div className="hero-actions">
                <a className="btn primary" href="/train?mode=recommend&group=both">
                  Recommended practice
                </a>
                <a className="btn ghost" href="/learn">
                  Browse algorithms
                </a>
              </div>
            </div>
            <div className="card">
              <div className="metric">
                <span className="label">Current streak</span>
                <span className="value">0</span>
                <span className="sub">
                  Best streak: <span>0</span>
                </span>
              </div>
              <div className="metric">
                <span className="label">Level</span>
                <span className="value">1</span>
                <div className="progress">
                  <div className="progress-bar" style={{ width: "0%" }}></div>
                </div>
                <span className="sub">0 XP</span>
              </div>
            </div>
          </section>
          <AuthPanel onAuthed={loadMe} />
          <section className="summary-grid">
            <div className="card tight">
              <p className="eyebrow">Today</p>
              <h2>0 solves</h2>
              <p className="section-sub">Solve once to keep your streak alive.</p>
            </div>
            <div className="card tight">
              <p className="eyebrow">Total</p>
              <h2>0 solves</h2>
              <p className="section-sub">Includes DNFs for honest stats.</p>
            </div>
            <div className="card tight">
              <p className="eyebrow">Weakest focus</p>
              <h2>--</h2>
              <p className="section-sub">No data yet.</p>
            </div>
            <div className="card tight">
              <p className="eyebrow">DNF rate</p>
              <h2>0%</h2>
              <p className="section-sub">0 DNFs logged.</p>
            </div>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <header className="top-nav">
        <div className="brand">Cubingo</div>
        <nav className="nav-links">
          <a className="active" href="/">Home</a>
          <a href="/learn">Learn</a>
          <a href="/train">Train</a>
          <a href="/stats">Stats</a>
          <a href="/settings">Settings</a>
        </nav>
      </header>
      <main>
        <div className="card" style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: "6px" }}>Logged in</p>
            <p>{user.email}</p>
          </div>
          <button className="btn ghost" type="button" onClick={logout}>
            Log out
          </button>
        </div>
        <section className="hero">
          <div>
            <p className="eyebrow">Daily practice</p>
            <h1>Build a daily streak for OLL and PLL</h1>
            <p>
              Study a case, drill the timer, and watch your stats grow. Designed for
              beginners and built for consistency.
            </p>
            <div className="hero-actions">
              <a className="btn primary" href="/train?mode=recommend&group=both">
                Recommended practice
              </a>
              <a className="btn ghost" href="/learn">
                Browse algorithms
              </a>
            </div>
          </div>
          <div className="card">
            <div className="metric">
              <span className="label">Current streak</span>
              <span className="value">0</span>
              <span className="sub">
                Best streak: <span>0</span>
              </span>
            </div>
            <div className="metric">
              <span className="label">Level</span>
              <span className="value">1</span>
              <div className="progress">
                <div className="progress-bar" style={{ width: "0%" }}></div>
              </div>
              <span className="sub">0 XP</span>
            </div>
          </div>
        </section>
        <section className="summary-grid">
          <div className="card tight">
            <p className="eyebrow">Today</p>
            <h2>0 solves</h2>
            <p className="section-sub">Solve once to keep your streak alive.</p>
          </div>
          <div className="card tight">
            <p className="eyebrow">Total</p>
            <h2>0 solves</h2>
            <p className="section-sub">Includes DNFs for honest stats.</p>
          </div>
          <div className="card tight">
            <p className="eyebrow">Weakest focus</p>
            <h2>--</h2>
            <p className="section-sub">No data yet.</p>
          </div>
          <div className="card tight">
            <p className="eyebrow">DNF rate</p>
            <h2>0%</h2>
            <p className="section-sub">0 DNFs logged.</p>
          </div>
        </section>
      </main>
    </>
  );
}
