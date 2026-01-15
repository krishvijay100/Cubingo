import { useEffect, useMemo, useState } from "react";
import { CUBE_OLL, CUBE_PLL } from "../data/algs.js";
import { loadCubeState } from "../state/cubeState.js";
import { getSummary, getXpProgress } from "../state/summary.js";
import { getWeakestAlg } from "../state/weakest.js";

export default function HomePage() {
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

  const summary = useMemo(() => {
    if (!state) {
      return null;
    }
    return getSummary(state);
  }, [state]);

  const xpProgress = useMemo(() => {
    if (!state) {
      return null;
    }
    return getXpProgress(state);
  }, [state]);

  const weakest = useMemo(() => {
    if (!state) {
      return null;
    }
    return getWeakestAlg(state, [...CUBE_OLL, ...CUBE_PLL]);
  }, [state]);

  if (isLoading || !state || !summary || !xpProgress) {
    return (
      <section className="card">
        <p>Loading overview...</p>
      </section>
    );
  }

  const attempts = summary.totalAttempts || 0;
  const dnfRate = attempts ? Math.round((summary.totalDnfs / attempts) * 100) : 0;

  return (
    <>
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
            <span className="value">{summary.streak.current || 0}</span>
            <span className="sub">
              Best streak: <span>{summary.streak.best || 0}</span>
            </span>
          </div>
          <div className="metric">
            <span className="label">Level</span>
            <span className="value">{xpProgress.level}</span>
            <div className="progress">
              <div className="progress-bar" style={{ width: `${xpProgress.progress * 100}%` }}></div>
            </div>
            <span className="sub">{summary.xp} XP</span>
          </div>
        </div>
      </section>
      <section className="summary-grid">
        <div className="card tight">
          <p className="eyebrow">Today</p>
          <h2>{summary.todaySolves} solves</h2>
          <p className="section-sub">Solve once to keep your streak alive.</p>
        </div>
        <div className="card tight">
          <p className="eyebrow">Total</p>
          <h2>{attempts} solves</h2>
          <p className="section-sub">Includes DNFs for honest stats.</p>
        </div>
        <div className="card tight">
          <p className="eyebrow">Weakest focus</p>
          <h2>{weakest ? weakest.name : "--"}</h2>
          <p className="section-sub">
            {weakest ? `${weakest.type} needs attention` : "No data yet."}
          </p>
        </div>
        <div className="card tight">
          <p className="eyebrow">DNF rate</p>
          <h2>{dnfRate}%</h2>
          <p className="section-sub">{summary.totalDnfs} DNFs logged.</p>
        </div>
      </section>
    </>
  );
}
