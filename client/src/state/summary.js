import { ALGORITHMS } from "../data/algs.js";
import { getLevelFromXp } from "./cubeState.js";

function getSummary(state) {
  let totalAttempts = 0;
  let totalDnfs = 0;

  ALGORITHMS.forEach((alg) => {
    const entry = state.stats[alg.id];
    if (!entry) {
      return;
    }
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

function getXpProgress(state) {
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

export { getSummary, getXpProgress };
