const DEFAULT_STATE = {
  learned: {},
  stats: {},
  xp: 0,
  level: 1,
  streak: {
    current: 0,
    best: 0,
    lastActiveISODate: ""
  },
  settings: {
    timerMode: "spacebar",
    showAlgorithmNotation: true,
    practiceWeighting: {
      attempt: 0.5,
      recency: 0.3,
      speed: 0.2
    }
  },
  daily: {
    dateISO: "",
    solves: 0
  }
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeState(saved) {
  const base = clone(DEFAULT_STATE);
  if (!saved || typeof saved !== "object") {
    return base;
  }

  base.learned = saved.learned && typeof saved.learned === "object" ? saved.learned : {};
  base.stats = saved.stats && typeof saved.stats === "object" ? saved.stats : {};
  base.xp = Number(saved.xp) || 0;
  base.level = Number(saved.level) || 1;
  base.streak = { ...base.streak, ...(saved.streak || {}) };
  base.settings = { ...base.settings, ...(saved.settings || {}) };
  base.settings.practiceWeighting = {
    ...base.settings.practiceWeighting,
    ...((saved.settings && saved.settings.practiceWeighting) || {})
  };
  base.daily = { ...base.daily, ...(saved.daily || {}) };
  return base;
}

export { DEFAULT_STATE, mergeState, clone };