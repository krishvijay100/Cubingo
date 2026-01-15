import { useEffect, useState } from "react";
import { loadCubeState, saveCubeState } from "../state/cubeState.js";
import { resetAllProgress, resetAllStats } from "../state/settingsLogic.js";

export default function SettingsPage() {
  const [state, setState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    loadCubeState()
      .then((loaded) => {
        if (isMounted) {
          setState(loaded);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  function updateCubeState(updater) {
    setState((prev) => {
      if (!prev) {
        return prev;
      }
      const next = updater(JSON.parse(JSON.stringify(prev)));
      saveCubeState(next);
      return next;
    });
  }

  function handleResetStats() {
    if (confirm("Reset all algorithm stats?")) {
      updateCubeState((next) => resetAllStats(next));
    }
  }

  function handleResetAll() {
    if (confirm("Reset everything (XP, streak, stats, learned)?")) {
      updateCubeState(() => resetAllProgress(state));
    }
  }

  if (isLoading || !state) {
    return (
      <section className="card">
        <p>Loading settings...</p>
      </section>
    );
  }

  return (
    <>
      <section>
        <p className="eyebrow">Settings</p>
        <h1>Account settings</h1>
        <p className="section-sub">Your progress is saved to your account automatically.</p>
      </section>

      <section className="split">
        <div className="card">
          <h2 className="section-title">Training</h2>
          <label className="toggle">
            <input
              type="checkbox"
              checked={Boolean(state.settings.showAlgorithmNotation)}
              onChange={(event) => {
                updateCubeState((next) => {
                  next.settings.showAlgorithmNotation = event.target.checked;
                  return next;
                });
              }}
            />
            Show algorithm notation during training
          </label>
        </div>
        <div className="card">
          <h2 className="section-title">Reset</h2>
          <div className="hero-actions">
            <button className="btn" type="button" onClick={handleResetStats}>Reset all stats</button>
            <button className="btn ghost" type="button" onClick={handleResetAll}>Reset everything</button>
          </div>
        </div>
      </section>
    </>
  );
}
