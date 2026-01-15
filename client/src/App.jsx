import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthPanel from "./components/AuthPanel.jsx";
import Layout from "./components/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import LearnPage from "./pages/LearnPage.jsx";
import TrainPage from "./pages/TrainPage.jsx";
import StatsPage from "./pages/StatsPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import { fetchMe, logout } from "./api/auth.js";

export default function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadCurrentUser() {
    try {
      const data = await fetchMe();
      setUser(data.user || null);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCurrentUser();
  }, []);

  async function handleLogout() {
    await logout();
    setUser(null);
  }

  if (isLoading) {
    return (
      <div style={{ padding: "32px" }}>
        <p>Loading...</p>
      </div>
    );
  }

  const routesKey = user ? user.id : "guest";

  return (
    <BrowserRouter>
      <Layout user={user} onLogout={handleLogout}>
        {!user ? <AuthPanel onAuthed={loadCurrentUser} /> : null}
        <div key={routesKey}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/train" element={<TrainPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
      </Layout>
    </BrowserRouter>
  );
}
