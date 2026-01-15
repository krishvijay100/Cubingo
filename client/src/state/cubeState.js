import { CubeStorage } from "../storage/cubeStorage.js";
import { ALGORITHMS } from "../data/algs.js";

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

function ensureAlgStats(state, algId) {
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

function getLevelFromXp(xp) {
  return Math.floor((xp || 0) / 500) + 1;
}

function normalizeState(state) {
  const next = CubeStorage.mergeState(state);

  ALGORITHMS.forEach((alg) => {
    if (typeof next.learned[alg.id] !== "boolean") {
      next.learned[alg.id] = false;
    }
    ensureAlgStats(next, alg.id);
  });

  next.level = getLevelFromXp(next.xp);
  return next;
}

async function loadCubeState() {
  const rawState = await CubeStorage.loadState();
  const normalized = normalizeState(rawState);
  try {
    await CubeStorage.saveState(normalized);
  } catch (error) {
    // Guest mode: ignore save failures when not authenticated.
  }
  return normalized;
}

async function saveCubeState(state) {
  try {
    await CubeStorage.saveState(state);
  } catch (error) {
    // Guest mode: ignore save failures when not authenticated.
  }
}

export { loadCubeState, saveCubeState, normalizeState, getLevelFromXp };
