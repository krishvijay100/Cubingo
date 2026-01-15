import { getRecommendationWeight } from "./trainingLogic.js";

function getWeakestAlg(state, algs) {
  const weighting = state.settings.practiceWeighting || { attempt: 0.5, recency: 0.3, speed: 0.2 };
  let best = null;
  let bestWeight = -Infinity;

  algs.forEach((alg) => {
    const entry = state.stats[alg.id];
    const weight = getRecommendationWeight(alg, entry, weighting);
    if (weight > bestWeight) {
      bestWeight = weight;
      best = alg;
    }
  });

  return best;
}

export { getWeakestAlg };