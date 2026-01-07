(function () {
  const storage = window.CubeStorage;
  const stats = window.CubeStats;
  const ALGORITHMS = window.CUBE_ALGS || [];

  const state = storage.loadState();

  function makeEmptyStats() {
    return {
      attempts: 0,
      timesMs: [],
      dnfs: 0,
      bestMs: null,
      medianMs: null,
      ao5Ms: null,
      lastPracticedISO: "",
      history: []
    };
  }

  function ensureAlgStats(algId) {
    if (!state.stats[algId]) {
      state.stats[algId] = makeEmptyStats();
      return;
    }
    const entry = state.stats[algId];
    entry.attempts = Number(entry.attempts) || 0;
    entry.timesMs = Array.isArray(entry.timesMs) ? entry.timesMs : [];
    entry.dnfs = Number(entry.dnfs) || 0;
    entry.bestMs = typeof entry.bestMs === "number" ? entry.bestMs : null;
    entry.medianMs = typeof entry.medianMs === "number" ? entry.medianMs : null;
    entry.ao5Ms = typeof entry.ao5Ms === "number" ? entry.ao5Ms : null;
    entry.lastPracticedISO = entry.lastPracticedISO || "";
    entry.history = Array.isArray(entry.history) ? entry.history : [];
  }

  function initState() {
    ALGORITHMS.forEach((alg) => {
      if (typeof state.learned[alg.id] !== "boolean") {
        state.learned[alg.id] = false;
      }
      ensureAlgStats(alg.id);
    });
    state.level = getLevelFromXp(state.xp);
    storage.saveState(state);
  }

  function getAlgById(id) {
    return ALGORITHMS.find((alg) => alg.id === id) || null;
  }

  function getAlgsByType(type) {
    return ALGORITHMS.filter((alg) => alg.type === type);
  }

  function getAlgStats(id) {
    ensureAlgStats(id);
    return state.stats[id];
  }

  function setLearned(id, value) {
    state.learned[id] = Boolean(value);
    storage.saveState(state);
  }

  function addDaysKey(dateKey, delta) {
    const [year, month, day] = dateKey.split("-").map(Number);
    const next = new Date(year, month - 1, day + delta);
    return stats.getLocalDateKey(next);
  }

  function updateStreak(now) {
    const todayKey = stats.getLocalDateKey(now);
    const lastKey = state.streak.lastActiveISODate;

    if (!lastKey) {
      state.streak.current = 1;
    } else if (lastKey === todayKey) {
      state.streak.current = state.streak.current || 1;
    } else if (lastKey === addDaysKey(todayKey, -1)) {
      state.streak.current = (state.streak.current || 0) + 1;
    } else {
      state.streak.current = 1;
    }

    state.streak.best = Math.max(state.streak.best || 0, state.streak.current || 0);
    state.streak.lastActiveISODate = todayKey;
  }

  function updateDailySolves(now) {
    const todayKey = stats.getLocalDateKey(now);
    if (state.daily.dateISO !== todayKey) {
      state.daily.dateISO = todayKey;
      state.daily.solves = 0;
    }
    state.daily.solves += 1;
  }

  function updateDerivedStats(entry) {
    if (entry.timesMs.length > 0) {
      entry.bestMs = Math.min(...entry.timesMs);
    } else {
      entry.bestMs = null;
    }
    entry.medianMs = stats.computeMedian(entry.timesMs);
    entry.ao5Ms = stats.computeAo5(entry.timesMs);
  }

  function recomputeStatsFromHistory(entry) {
    entry.attempts = entry.history.length;
    entry.dnfs = entry.history.filter((item) => item.dnf).length;
    const valid = entry.history.filter((item) => !item.dnf && typeof item.timeMs === "number").slice().reverse();
    entry.timesMs = valid.map((item) => item.timeMs);
    entry.lastPracticedISO = entry.history.length ? entry.history[0].iso : "";
    updateDerivedStats(entry);
  }

  function getTargetMs(type) {
    return type === "PLL" ? 18000 : 25000;
  }

  function getRecommendationWeight(alg, entry, weighting) {
    const attempts = entry.attempts || 0;
    const attemptFactor = 1 / Math.sqrt(attempts + 1);

    const todayKey = stats.getLocalDateKey(new Date());
    const lastKey = entry.lastPracticedISO ? stats.getLocalDateKey(new Date(entry.lastPracticedISO)) : "";
    const daysSince = lastKey ? stats.daysBetweenKeys(lastKey, todayKey) : 30;
    const recencyFactor = Math.min(daysSince / 14, 1.5);

    const targetMs = getTargetMs(alg.type);
    const speedBase = entry.medianMs || entry.ao5Ms || targetMs;
    const speedFactor = Math.min(speedBase / targetMs, 2);

    const a = weighting.attempt ?? 0.5;
    const b = weighting.recency ?? 0.3;
    const c = weighting.speed ?? 0.2;
    return a * attemptFactor + b * recencyFactor + c * speedFactor;
  }

  function pickRecommendedAlg(algs, userState = state) {
    const weighting = userState.settings.practiceWeighting || { attempt: 0.5, recency: 0.3, speed: 0.2 };
    const weights = algs.map((alg) => {
      const entry = getAlgStats(alg.id);
      return getRecommendationWeight(alg, entry, weighting);
    });

    const totalWeight = weights.reduce((sum, value) => sum + value, 0);
    if (totalWeight <= 0) {
      return algs[Math.floor(Math.random() * algs.length)] || null;
    }

    let roll = Math.random() * totalWeight;
    for (let i = 0; i < algs.length; i += 1) {
      roll -= weights[i];
      if (roll <= 0) {
        return algs[i];
      }
    }
    return algs[algs.length - 1] || null;
  }

  function getWeakestAlg(algs) {
    const weighting = state.settings.practiceWeighting || { attempt: 0.5, recency: 0.3, speed: 0.2 };
    let best = null;
    let bestWeight = -Infinity;
    algs.forEach((alg) => {
      const entry = getAlgStats(alg.id);
      const weight = getRecommendationWeight(alg, entry, weighting);
      if (weight > bestWeight) {
        bestWeight = weight;
        best = alg;
      }
    });
    return best;
  }

  function getMasteryTier(entry, type) {
    const attempts = entry.attempts || 0;
    const ao5 = entry.ao5Ms;
    if (attempts < 5) {
      return "New";
    }
    if (attempts >= 5 && !ao5) {
      return "Practicing";
    }

    const consistentThreshold = type === "PLL" ? 18000 : 25000;
    const masteredThreshold = type === "PLL" ? 14000 : 20000;
    const lastKey = entry.lastPracticedISO ? stats.getLocalDateKey(new Date(entry.lastPracticedISO)) : "";
    const todayKey = stats.getLocalDateKey(new Date());
    const daysSince = lastKey ? stats.daysBetweenKeys(lastKey, todayKey) : 999;

    if (attempts >= 50 && ao5 && ao5 < masteredThreshold && daysSince <= 14) {
      return "Mastered";
    }
    if (attempts >= 20 && ao5 && ao5 < consistentThreshold) {
      return "Consistent";
    }
    return "Practicing";
  }

  function getMasteryMultiplier(tier) {
    switch (tier) {
      case "Practicing":
        return 1.1;
      case "Consistent":
        return 1.2;
      case "Mastered":
        return 1.3;
      default:
        return 1.0;
    }
  }

  function computeXp(alg, entry, timeMs, prevMedian, prevBest) {
    const tier = getMasteryTier(entry, alg.type);
    const multiplier = getMasteryMultiplier(tier);
    let xp = 10;

    if (prevMedian && timeMs < prevMedian) {
      xp += 5;
    }
    if (prevBest && timeMs < prevBest * 1.1) {
      xp += 5;
    }
    return Math.round(xp * multiplier);
  }

  function getLevelFromXp(xp) {
    return Math.floor((xp || 0) / 500) + 1;
  }

  function getXpProgress() {
    const level = getLevelFromXp(state.xp);
    const baseXp = (level - 1) * 500;
    const xpInto = state.xp - baseXp;
    return {
      level,
      xpInto,
      nextLevel: 500,
      progress: Math.min(xpInto / 500, 1)
    };
  }

  function recordSolve(algId, timeMs, isDnf) {
    const alg = getAlgById(algId);
    if (!alg) {
      return null;
    }

    const entry = getAlgStats(algId);
    const now = new Date();
    const nowIso = now.toISOString();
    const prevMedian = entry.medianMs;
    const prevBest = entry.bestMs;

    entry.attempts += 1;
    entry.lastPracticedISO = nowIso;
    entry.history.unshift({
      timeMs: isDnf ? null : timeMs,
      dnf: Boolean(isDnf),
      iso: nowIso
    });

    if (isDnf) {
      entry.dnfs += 1;
    } else {
      entry.timesMs.push(timeMs);
      const earned = computeXp(alg, entry, timeMs, prevMedian, prevBest);
      state.xp += earned;
      state.level = getLevelFromXp(state.xp);
    }

    updateDerivedStats(entry);
    updateStreak(now);
    updateDailySolves(now);
    storage.saveState(state);
    return entry;
  }

  function deleteHistoryEntry(algId, index) {
    const entry = getAlgStats(algId);
    if (!entry.history[index]) {
      return;
    }
    entry.history.splice(index, 1);
    recomputeStatsFromHistory(entry);
    storage.saveState(state);
  }

  function resetAlgStats(algId) {
    state.stats[algId] = makeEmptyStats();
    storage.saveState(state);
  }

  function resetAllStats() {
    Object.keys(state.stats).forEach((algId) => {
      state.stats[algId] = makeEmptyStats();
    });
    storage.saveState(state);
  }

  function resetAllProgress() {
    const fresh = storage.resetState();
    Object.keys(state).forEach((key) => {
      delete state[key];
    });
    Object.assign(state, fresh);
    initState();
  }

  function overwriteState(imported) {
    const normalized = storage.mergeState(imported);
    Object.keys(state).forEach((key) => {
      delete state[key];
    });
    Object.assign(state, normalized);
    initState();
  }

  function getSummary() {
    let totalAttempts = 0;
    let totalDnfs = 0;
    ALGORITHMS.forEach((alg) => {
      const entry = getAlgStats(alg.id);
      totalAttempts += entry.attempts || 0;
      totalDnfs += entry.dnfs || 0;
    });

    return {
      totalAttempts,
      totalDnfs,
      todaySolves: state.daily.solves || 0,
      xp: state.xp || 0,
      level: state.level || 1,
      streak: state.streak
    };
  }

  function renderPattern(container, pattern, size = "sm") {
    if (!container) {
      return;
    }
    container.innerHTML = "";
    const grid = document.createElement("div");
    grid.className = `face-grid${size === "lg" ? " lg" : ""}`;
    pattern.forEach((value) => {
      const cell = document.createElement("div");
      cell.className = `sticker${value ? " y" : ""}`;
      grid.appendChild(cell);
    });
    container.appendChild(grid);
  }

  initState();

  window.CubeApp = {
    state,
    algorithms: ALGORITHMS,
    getAlgById,
    getAlgsByType,
    getAlgStats,
    setLearned,
    recordSolve,
    deleteHistoryEntry,
    resetAlgStats,
    resetAllStats,
    resetAllProgress,
    overwriteState,
    getSummary,
    getLevelFromXp,
    getXpProgress,
    getMasteryTier,
    pickRecommendedAlg,
    getRecommendationWeight,
    getWeakestAlg,
    renderPattern
  };
})();
