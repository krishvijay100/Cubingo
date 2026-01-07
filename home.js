(function () {
  const { getSummary, getXpProgress, getWeakestAlg, getAlgsByType } = window.CubeApp;
  const summary = getSummary();
  const progress = getXpProgress();

  const streakCurrent = document.getElementById("streak-current");
  const streakBest = document.getElementById("streak-best");
  const levelValue = document.getElementById("level-value");
  const xpValue = document.getElementById("xp-value");
  const xpBar = document.getElementById("xp-bar");
  const todaySolves = document.getElementById("today-solves");
  const totalSolves = document.getElementById("total-solves");
  const totalDnfs = document.getElementById("total-dnfs");
  const dnfRate = document.getElementById("dnf-rate");
  const weakestName = document.getElementById("weakest-name");
  const weakestType = document.getElementById("weakest-type");

  streakCurrent.textContent = summary.streak.current || 0;
  streakBest.textContent = summary.streak.best || 0;
  levelValue.textContent = progress.level;
  xpValue.textContent = summary.xp;
  xpBar.style.width = `${progress.progress * 100}%`;

  const attempts = summary.totalAttempts || 0;
  todaySolves.textContent = `${summary.todaySolves} solves`;
  totalSolves.textContent = `${attempts} solves`;
  totalDnfs.textContent = summary.totalDnfs || 0;
  const rate = attempts ? Math.round((summary.totalDnfs / attempts) * 100) : 0;
  dnfRate.textContent = `${rate}%`;

  const weakest = getWeakestAlg([...getAlgsByType("OLL"), ...getAlgsByType("PLL")]);
  if (weakest) {
    weakestName.textContent = weakest.name;
    weakestType.textContent = `${weakest.type} needs attention`;
  }
})();
