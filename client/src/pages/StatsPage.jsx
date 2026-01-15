import { useEffect, useMemo, useState } from "react";
import { CUBE_OLL, CUBE_PLL } from "../data/algs.js";
import PatternGrid from "../components/PatternGrid.jsx";
import { loadCubeState, saveCubeState } from "../state/cubeState.js";
import { formatDate, formatTime } from "../utils/statsUtils.js";
import { deleteHistoryEntry, getMasteryTier, resetAlgStats } from "../state/trainingLogic.js";
import { getSummary } from "../state/summary.js";

const ALL_ALGS = [...CUBE_OLL, ...CUBE_PLL];
const ALG_BY_ID = new Map(ALL_ALGS.map((alg) => [alg.id, alg]));

function cloneState(value) {
  return JSON.parse(JSON.stringify(value));
}

export default function StatsPage() {
  const [state, setState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAlgId, setSelectedAlgId] = useState("");

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
      const next = updater(cloneState(prev));
      saveCubeState(next);
      return next;
    });
  }

  const summary = useMemo(() => {
    if (!state) {
      return null;
    }
    return getSummary(state);
  }, [state]);

  const selectedAlg = useMemo(() => {
    return selectedAlgId ? ALG_BY_ID.get(selectedAlgId) : null;
  }, [selectedAlgId]);

  if (isLoading || !state) {
    return (
      <section className="card">
        <p>Loading stats...</p>
      </section>
    );
  }

  function renderRow(alg) {
    const entry = state.stats[alg.id];
    const tier = getMasteryTier(entry, alg.type);
    return (
      <tr key={alg.id} onClick={() => setSelectedAlgId(alg.id)}>
        <td>{alg.name}</td>
        <td>{entry.attempts || 0}</td>
        <td>{formatTime(entry.bestMs)}</td>
        <td>{formatTime(entry.medianMs)}</td>
        <td>{formatTime(entry.ao5Ms)}</td>
        <td>{formatDate(entry.lastPracticedISO)}</td>
        <td>
          <span className={`badge ${tier.toLowerCase()}`}>{tier}</span>
        </td>
      </tr>
    );
  }

  const detailEntry = selectedAlg ? state.stats[selectedAlg.id] : null;
  const detailTier = detailEntry && selectedAlg ? getMasteryTier(detailEntry, selectedAlg.type) : "New";
  const detailStats = detailEntry
    ? [
        { label: "Attempts", value: detailEntry.attempts || 0 },
        { label: "DNFs", value: detailEntry.dnfs || 0 },
        { label: "Best", value: formatTime(detailEntry.bestMs) },
        { label: "Median", value: formatTime(detailEntry.medianMs) },
        { label: "Ao5", value: formatTime(detailEntry.ao5Ms) },
        { label: "Last", value: formatDate(detailEntry.lastPracticedISO) }
      ]
    : [];

  return (
    <>
      <section>
        <p className="eyebrow">Dashboards</p>
        <h1>Stats overview</h1>
        <p className="section-sub">Track progress, mastery tiers, and recent history for every case.</p>
      </section>

      <section className="summary-grid">
        {summary
          ? [
              { label: "Total solves", value: summary.totalAttempts },
              { label: "Total DNF", value: summary.totalDnfs },
              { label: "Level", value: summary.level },
              { label: "XP", value: summary.xp },
              { label: "Streak", value: summary.streak.current },
              { label: "Best streak", value: summary.streak.best }
            ].map((card) => (
              <div key={card.label} className="card tight">
                <p className="eyebrow">{card.label}</p>
                <h2>{card.value}</h2>
              </div>
            ))
          : null}
      </section>

      <section className="split">
        <div>
          <h2 className="section-title">OLL</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Attempts</th>
                  <th>Best</th>
                  <th>Median</th>
                  <th>Ao5</th>
                  <th>Last practiced</th>
                  <th>Tier</th>
                </tr>
              </thead>
              <tbody>{CUBE_OLL.map((alg) => renderRow(alg))}</tbody>
            </table>
          </div>

          <h2 className="section-title">PLL</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Attempts</th>
                  <th>Best</th>
                  <th>Median</th>
                  <th>Ao5</th>
                  <th>Last practiced</th>
                  <th>Tier</th>
                </tr>
              </thead>
              <tbody>{CUBE_PLL.map((alg) => renderRow(alg))}</tbody>
            </table>
          </div>
        </div>
        <aside className="card detail-panel">
          <p className="eyebrow">Algorithm detail</p>
          <h2>{selectedAlg ? selectedAlg.name : "Select a row"}</h2>
          <div>{selectedAlg ? <PatternGrid pattern={selectedAlg.pattern} size="lg" /> : null}</div>
          <div>{selectedAlg ? <span className={`badge ${detailTier.toLowerCase()}`}>{detailTier}</span> : null}</div>
          <div className="stat-list">
            {detailStats.map((item) => (
              <div key={item.label} className="stat">
                <div className="eyebrow">{item.label}</div>
                <div>{item.value}</div>
              </div>
            ))}
          </div>
          <h3 className="section-title">Recent attempts</h3>
          <div className="history">
            {detailEntry && detailEntry.history.length === 0 ? (
              <p className="section-sub">No history yet.</p>
            ) : null}
            {detailEntry
              ? detailEntry.history.slice(0, 10).map((item, index) => {
                  const timeLabel = item.dnf ? "DNF" : formatTime(item.timeMs);
                  return (
                    <div key={`${item.iso}-${index}`} className="history-item">
                      <span>{timeLabel}</span>
                      <span>{formatDate(item.iso)}</span>
                      <button
                        className="btn ghost"
                        type="button"
                        onClick={() => {
                          if (!selectedAlg) {
                            return;
                          }
                          updateCubeState((next) => {
                            deleteHistoryEntry(next, selectedAlg.id, index);
                            return next;
                          });
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  );
                })
              : null}
          </div>
          <button
            className="btn ghost"
            type="button"
            disabled={!selectedAlg}
            onClick={() => {
              if (!selectedAlg) {
                return;
              }
              updateCubeState((next) => {
                resetAlgStats(next, selectedAlg.id);
                return next;
              });
            }}
          >
            Reset this algorithm
          </button>
        </aside>
      </section>
    </>
  );
}
