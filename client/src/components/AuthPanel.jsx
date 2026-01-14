import { useState } from "react";
import { login, register } from "../api/auth.js";

export default function AuthPanel({ onAuthed }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password);
      }
      onAuthed();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card" style={{ maxWidth: "420px", margin: "40px auto" }}>
      <h2 style={{ marginBottom: "12px" }}>{mode === "login" ? "Log in" : "Create account"}</h2>
      <p className="section-sub" style={{ marginBottom: "16px" }}>
        {mode === "login" ? "Access your saved progress." : "Start saving your progress in the cloud."}
      </p>
      <form className="field" onSubmit={handleSubmit}>
        <label className="field">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="field">
          Password
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error ? <p style={{ color: "var(--danger)", fontSize: "13px" }}>{error}</p> : null}
        <button className="btn primary" type="submit" disabled={busy}>
          {busy ? "Please wait" : mode === "login" ? "Log in" : "Create account"}
        </button>
      </form>
      <div style={{ marginTop: "12px", fontSize: "13px" }}>
        {mode === "login" ? "Need an account? " : "Already have an account? "}
        <button
          type="button"
          className="btn ghost"
          style={{ padding: "4px 10px", marginLeft: "6px" }}
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "Create one" : "Log in"}
        </button>
      </div>
    </section>
  );
}