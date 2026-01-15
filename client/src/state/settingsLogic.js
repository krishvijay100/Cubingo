import { normalizeState } from "./cubeState.js";

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

function resetAllStats(state) {
  Object.keys(state.stats).forEach((algId) => {
    state.stats[algId] = makeEmptyStats();
  });
  return state;
}

function resetAllProgress(state) {
  const fresh = normalizeState({});
  return fresh;
}

function overwriteState(currentState, importedJson) {
  const normalized = normalizeState(importedJson);
  return normalized;
}

export { resetAllStats, resetAllProgress, overwriteState };