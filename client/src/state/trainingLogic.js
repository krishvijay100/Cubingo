import {
  computeMedian,
  computeAo5,
  getLocalDateKey,
  daysBetweenKeys
} from "../utils/statsUtils.js";
import { getLevelFromXp } from "../state/cubeState.js";

function getTargetMs(type) {
  return type === "PLL" ? 18000 : 25000;
}

function getRecommendationWeight(alg, entry, weighting) {
  const attempts = entry.attempts || 0;
  const attemptFactor = 1 / Math.sqrt(attempts + 1);

  const todayKey = getLocalDateKey(new Date());
  const lastKey = entry.lastPracticedISO ? getLocalDateKey(new Date(entry.lastPracticedISO)) : "";
  const daysSince = lastKey ? daysBetweenKeys(lastKey, todayKey) : 30;
  const recencyFactor = Math.min(daysSince / 14, 1.5);

  const targetMs = getTargetMs(alg.type);
  const speedBase = entry.medianMs || entry.ao5Ms || targetMs;
  const speedFactor = Math.min(speedBase / targetMs, 2);

  const a = weighting.attempt ?? 0.5;
  const b = weighting.recency ?? 0.3;
  const c = weighting.speed ?? 0.2;

  return a * attemptFactor + b * recencyFactor + c * speedFactor;
}

function pickRecommendedAlg(algs, state) {
  const weighting = state.settings.practiceWeighting || { attempt: 0.5, recency: 0.3, speed: 0.2 };
  const weights = algs.map((alg) => {
    return getRecommendationWeight(alg, state.stats[alg.id], weighting);
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
  const lastKey = entry.lastPracticedISO ? getLocalDateKey(new Date(entry.lastPracticedISO)) : "";
  const todayKey = getLocalDateKey(new Date());
  const daysSince = lastKey ? daysBetweenKeys(lastKey, todayKey) : 999;

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

function updateDerivedStats(entry) {
  if (entry.timesMs.length > 0) {
    entry.bestMs = Math.min(...entry.timesMs);
  } else {
    entry.bestMs = null;
  }
  entry.medianMs = computeMedian(entry.timesMs);
  entry.ao5Ms = computeAo5(entry.timesMs);
}

function updateStreak(state, now) {
  const todayKey = getLocalDateKey(now);
  const lastKey = state.streak.lastActiveISODate;

  if (!lastKey) {
    state.streak.current = 1;
  } else if (lastKey === todayKey) {
    state.streak.current = state.streak.current || 1;
  } else if (lastKey === getLocalDateKey(new Date(now.getTime() - 24 * 60 * 60 * 1000))) {
    state.streak.current = (state.streak.current || 0) + 1;
  } else {
    state.streak.current = 1;
  }

  state.streak.best = Math.max(state.streak.best || 0, state.streak.current || 0);
  state.streak.lastActiveISODate = todayKey;
}

function updateDailySolves(state, now) {
  const todayKey = getLocalDateKey(now);
  if (state.daily.dateISO !== todayKey) {
    state.daily.dateISO = todayKey;
    state.daily.solves = 0;
  }
  state.daily.solves += 1;
}

function recordSolve(state, alg, timeMs, isDnf) {
  const entry = state.stats[alg.id];
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
  updateStreak(state, now);
  updateDailySolves(state, now);

  return entry;
}

function deleteHistoryEntry(state, algId, index) {
  const entry = state.stats[algId];
  if (!entry || !entry.history[index]) {
    return;
  }

  entry.history.splice(index, 1);
  entry.attempts = entry.history.length;
  entry.dnfs = entry.history.filter((item) => item.dnf).length;
  const valid = entry.history.filter((item) => !item.dnf && typeof item.timeMs === "number").slice().reverse();
  entry.timesMs = valid.map((item) => item.timeMs);
  entry.lastPracticedISO = entry.history.length ? entry.history[0].iso : "";
  updateDerivedStats(entry);
}

function resetAlgStats(state, algId) {
  if (!state.stats[algId]) {
    return;
  }
  state.stats[algId] = {
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

export {
  getRecommendationWeight,
  pickRecommendedAlg,
  getMasteryTier,
  recordSolve,
  deleteHistoryEntry,
  resetAlgStats
};
