import { useEffect, useMemo, useRef, useState } from "react";
import { CUBE_OLL, CUBE_PLL } from "../data/algs.js";
import PatternGrid from "../components/PatternGrid.jsx";
import { loadCubeState, saveCubeState } from "../state/cubeState.js";
import { formatDate, formatTime } from "../utils/statsUtils.js";
import { deleteHistoryEntry, pickRecommendedAlg, recordSolve } from "../state/trainingLogic.js";

const ALL_ALGS = [...CUBE_OLL, ...CUBE_PLL];
const ALG_BY_ID = new Map(ALL_ALGS.map((alg) => [alg.id, alg]));

function cloneState(value) {
  return JSON.parse(JSON.stringify(value));
}

export default function TrainPage() {
  const [state, setState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState("select");
  const [selectedType, setSelectedType] = useState("OLL");
  const [selectedAlgId, setSelectedAlgId] = useState("");
  const [recommendedGroup, setRecommendedGroup] = useState("both");
  const [currentAlgId, setCurrentAlgId] = useState("");

  const [timerStatus, setTimerStatus] = useState("Ready");
  const [timerStatusClass, setTimerStatusClass] = useState("timer-ready");
  const [displayTimeMs, setDisplayTimeMs] = useState(0);
  const [pendingTimeMs, setPendingTimeMs] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTimerArmed, setIsTimerArmed] = useState(false);

  const startTimeRef = useRef(0);
  const rafIdRef = useRef(null);
  const isTimerRunningRef = useRef(false);
  const isTimerArmedRef = useRef(false);
  const lastRecommendGroupRef = useRef(null);

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get("mode");
    const groupParam = params.get("group");

    if (modeParam === "recommend") {
      setMode("recommend");
    }
    if (groupParam === "OLL" || groupParam === "PLL" || groupParam === "both") {
      setRecommendedGroup(groupParam);
    }
  }, []);

  const selectOptions = useMemo(() => {
    return selectedType === "OLL" ? CUBE_OLL : CUBE_PLL;
  }, [selectedType]);

  useEffect(() => {
    if (!selectOptions.length) {
      return;
    }
    if (!selectedAlgId || !ALG_BY_ID.has(selectedAlgId)) {
      setSelectedAlgId(selectOptions[0].id);
    }
  }, [selectOptions, selectedAlgId]);

  useEffect(() => {
    if (mode === "select") {
      setCurrentAlgId(selectedAlgId);
    }
  }, [mode, selectedAlgId]);

  useEffect(() => {
    if (!state || mode !== "recommend") {
      return;
    }
    const groupChanged = lastRecommendGroupRef.current !== recommendedGroup;
    if (!currentAlgId || groupChanged) {
      pickNextRecommendation();
      lastRecommendGroupRef.current = recommendedGroup;
    }
  }, [state, mode, recommendedGroup, currentAlgId]);

  const currentAlg = useMemo(() => {
    return currentAlgId ? ALG_BY_ID.get(currentAlgId) : null;
  }, [currentAlgId]);

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

  function updateLearned(algId, isLearned) {
    updateCubeState((next) => {
      next.learned[algId] = Boolean(isLearned);
      return next;
    });
  }

  function updateTimerStatus(text, className) {
    setTimerStatus(text);
    setTimerStatusClass(className || "");
  }

  function startTimer() {
    if (isTimerRunningRef.current) {
      return;
    }
    setPendingTimeMs(null);
    setIsTimerRunning(true);
    isTimerRunningRef.current = true;
    updateTimerStatus("Running", "timer-running");
    startTimeRef.current = performance.now();

    const tick = () => {
      if (!isTimerRunningRef.current) {
        return;
      }
      const elapsed = performance.now() - startTimeRef.current;
      setDisplayTimeMs(elapsed);
      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);
  }

  function stopTimer() {
    if (!isTimerRunningRef.current) {
      return;
    }
    setIsTimerRunning(false);
    isTimerRunningRef.current = false;
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }
    const elapsed = Math.round(performance.now() - startTimeRef.current);
    setPendingTimeMs(elapsed);
    setDisplayTimeMs(elapsed);
    updateTimerStatus("Stopped");
  }

  function clearPending() {
    setPendingTimeMs(null);
    setDisplayTimeMs(0);
  }

  function saveResult(isDnf) {
    if (!currentAlg || pendingTimeMs === null) {
      return;
    }
    updateCubeState((next) => {
      recordSolve(next, currentAlg, pendingTimeMs, isDnf);
      return next;
    });
    clearPending();
    if (mode === "recommend") {
      pickNextRecommendation();
    }
  }

  function pickNextRecommendation() {
    if (!state) {
      return;
    }
    const candidates =
      recommendedGroup === "both"
        ? [...CUBE_OLL, ...CUBE_PLL]
        : recommendedGroup === "OLL"
          ? CUBE_OLL
          : CUBE_PLL;

    const next = pickRecommendedAlg(candidates, state);
    if (next) {
      setCurrentAlgId(next.id);
    }
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.code !== "Space") {
        return;
      }
      event.preventDefault();
      if (isTimerRunningRef.current) {
        stopTimer();
        return;
      }
      setIsTimerArmed(true);
      isTimerArmedRef.current = true;
      updateTimerStatus("Ready", "timer-ready");
    }

    function handleKeyUp(event) {
      if (event.code !== "Space") {
        return;
      }
      event.preventDefault();
      if (isTimerArmedRef.current && !isTimerRunningRef.current) {
        setIsTimerArmed(false);
        isTimerArmedRef.current = false;
        startTimer();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  if (isLoading || !state) {
    return (
      <section className="card">
        <p>Loading training data...</p>
      </section>
    );
  }

  const currentStats = currentAlg ? state.stats[currentAlg.id] : null;
  const liveStats = currentStats
    ? [
        { label: "Best", value: formatTime(currentStats.bestMs) },
        { label: "Median", value: formatTime(currentStats.medianMs) },
        { label: "Ao5", value: formatTime(currentStats.ao5Ms) },
        { label: "Attempts", value: currentStats.attempts || 0 },
        { label: "DNFs", value: currentStats.dnfs || 0 },
        { label: "Last", value: formatDate(currentStats.lastPracticedISO) }
      ]
    : [];

  const showNotation = Boolean(state.settings.showAlgorithmNotation);
  const notationText = showNotation && currentAlg ? currentAlg.alg : "(Hidden in settings)";

  return (
    <>
      <section>
        <p className="eyebrow">Training</p>
        <h1>Timer practice</h1>
        <p className="section-sub">Hold space bar and release to start. Press space again to stop.</p>
      </section>

      <div className="tabs">
        <button
          className={`tab${mode === "select" ? " active" : ""}`}
          type="button"
          onClick={() => setMode("select")}
        >
          Select &amp; drill
        </button>
        <button
          className={`tab${mode === "recommend" ? " active" : ""}`}
          type="button"
          onClick={() => setMode("recommend")}
        >
          Recommended practice
        </button>
      </div>

      <section id="mode-select" className={`card${mode === "select" ? "" : " is-hidden"}`}>
        <div className="split">
          <div className="field">
            <label htmlFor="select-type">Type</label>
            <select
              id="select-type"
              value={selectedType}
              onChange={(event) => setSelectedType(event.target.value)}
            >
              <option value="OLL">OLL</option>
              <option value="PLL">PLL</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="select-alg">Algorithm</label>
            <select
              id="select-alg"
              value={selectedAlgId}
              onChange={(event) => setSelectedAlgId(event.target.value)}
            >
              {selectOptions.map((alg) => (
                <option key={alg.id} value={alg.id}>
                  {alg.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="toggle">
              <input
                type="checkbox"
                checked={currentAlg ? Boolean(state.learned[currentAlg.id]) : false}
                onChange={(event) => {
                  if (currentAlg) {
                    updateLearned(currentAlg.id, event.target.checked);
                  }
                }}
                disabled={!currentAlg}
              />
              Mark learned
            </label>
          </div>
        </div>
        <div className="split">
          <div>
            <div id="select-diagram">
              {currentAlg ? <PatternGrid pattern={currentAlg.pattern} size="lg" /> : null}
            </div>
            <p className="section-sub">
              Setup moves: <span id="select-setup">{currentAlg ? currentAlg.setupMoves || "None listed" : "--"}</span>
            </p>
            <p className="section-sub">
              Algorithm: <span id="select-name">{currentAlg ? currentAlg.name : "--"}</span>
            </p>
          </div>
          <div>
            <p className="section-sub">Algorithm</p>
            <p id="select-notation">{notationText}</p>
          </div>
        </div>
      </section>

      <section id="mode-recommend" className={`card${mode === "recommend" ? "" : " is-hidden"}`}>
        <div className="split">
          <div className="field">
            <label htmlFor="recommend-group">Group</label>
            <select
              id="recommend-group"
              value={recommendedGroup}
              onChange={(event) => setRecommendedGroup(event.target.value)}
            >
              <option value="both">OLL + PLL</option>
              <option value="OLL">OLL</option>
              <option value="PLL">PLL</option>
            </select>
          </div>
          <div className="field">
            <button className="btn" type="button" onClick={pickNextRecommendation}>
              Next recommended
            </button>
          </div>
          <div className="field">
            <label className="toggle">
              <input
                type="checkbox"
                checked={currentAlg ? Boolean(state.learned[currentAlg.id]) : false}
                onChange={(event) => {
                  if (currentAlg) {
                    updateLearned(currentAlg.id, event.target.checked);
                  }
                }}
                disabled={!currentAlg}
              />
              Mark learned
            </label>
          </div>
        </div>
        <div className="split">
          <div>
            <div id="recommend-diagram">
              {currentAlg ? <PatternGrid pattern={currentAlg.pattern} size="lg" /> : null}
            </div>
            <p className="section-sub">
              Setup moves: <span id="recommend-setup">{currentAlg ? currentAlg.setupMoves || "None listed" : "--"}</span>
            </p>
            <p className="section-sub">
              Algorithm: <span id="recommend-name">{currentAlg ? currentAlg.name : "--"}</span>
            </p>
          </div>
          <div>
            <p className="section-sub">Algorithm</p>
            <p id="recommend-notation">{notationText}</p>
          </div>
        </div>
      </section>

      <section className="split">
        <div className="card">
          <h2 className="section-title">Timer</h2>
          <div className="timer-shell">
            <div className={`timer-status ${timerStatusClass}`}>{timerStatus}</div>
            <div className="timer-display">{formatTime(displayTimeMs)}</div>
            <div className="hero-actions">
              <button className="btn" type="button" onClick={startTimer}>
                Start
              </button>
              <button className="btn" type="button" onClick={stopTimer}>
                Stop
              </button>
            </div>
            <div className="hero-actions">
              <button
                className="btn primary"
                type="button"
                disabled={pendingTimeMs === null}
                onClick={() => saveResult(false)}
              >
                Accept
              </button>
              <button
                className="btn"
                type="button"
                disabled={pendingTimeMs === null}
                onClick={() => saveResult(true)}
              >
                DNF
              </button>
              <button
                className="btn ghost"
                type="button"
                disabled={pendingTimeMs === null}
                onClick={clearPending}
              >
                Delete
              </button>
            </div>
            <p className="section-sub">
              Hold space and release to start. Press space again to stop.
            </p>
          </div>
        </div>
        <div className="card">
          <h2 className="section-title">Live stats</h2>
          <div className="stat-list">
            {liveStats.map((item) => (
              <div key={item.label} className="stat">
                <div className="eyebrow">{item.label}</div>
                <div>{item.value}</div>
              </div>
            ))}
          </div>
          <h3 className="section-title">History</h3>
          <div className="history">
            {currentStats && currentStats.history.length === 0 ? (
              <p className="section-sub">No history yet.</p>
            ) : null}
            {currentStats
              ? currentStats.history.slice(0, 10).map((item, index) => {
                  const timeLabel = item.dnf ? "DNF" : formatTime(item.timeMs);
                  return (
                    <div key={`${item.iso}-${index}`} className="history-item">
                      <span>{timeLabel}</span>
                      <span>{formatDate(item.iso)}</span>
                      <button
                        className="btn ghost"
                        type="button"
                        onClick={() => {
                          updateCubeState((next) => {
                            deleteHistoryEntry(next, currentAlg.id, index);
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
        </div>
      </section>
    </>
  );
}
