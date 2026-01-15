import { useState } from "react";
import { login, register } from "../api/auth.js";

export default function AuthPanel({ onAuthed }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isLogin = mode === "login";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isLogin) {
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

  function toggleMode() {
    setMode(isLogin ? "register" : "login");
  }

  const headingText = isLogin ? "Log in" : "Create account";
  const helperText = isLogin
    ? "Access your saved progress."
    : "Start saving your progress in the cloud.";
  const switchText = isLogin ? "Need an account?" : "Already have an account?";
  const switchButtonText = isLogin ? "Create one" : "Log in";
  const submitText = busy ? "Please wait" : headingText;

  return (
    <section className="card" style={{ maxWidth: "420px", margin: "40px auto" }}>
      <h2 style={{ marginBottom: "12px" }}>{headingText}</h2>
      <p className="section-sub" style={{ marginBottom: "16px" }}>
        {helperText}
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
          {submitText}
        </button>
      </form>
      <div style={{ marginTop: "12px", fontSize: "13px" }}>
        {switchText}{" "}
        <button
          type="button"
          className="btn ghost"
          style={{ padding: "4px 10px", marginLeft: "6px" }}
          onClick={toggleMode}
        >
          {switchButtonText}
        </button>
      </div>
    </section>
  );
}
