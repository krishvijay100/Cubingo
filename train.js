(function () {
  const {
    state,
    getAlgsByType,
    getAlgById,
    renderPattern,
    setLearned,
    recordSolve,
    getAlgStats,
    deleteHistoryEntry
  } = window.CubeApp;
  const { formatTime, formatDate } = window.CubeStats;

  const tabs = document.querySelectorAll(".tab");
  const modeSelect = document.getElementById("mode-select");
  const modeRecommend = document.getElementById("mode-recommend");

  const selectType = document.getElementById("select-type");
  const selectAlg = document.getElementById("select-alg");
  const selectDiagram = document.getElementById("select-diagram");
  const selectSetup = document.getElementById("select-setup");
  const selectNotation = document.getElementById("select-notation");
  const selectLearned = document.getElementById("select-learned");

  const recommendGroup = document.getElementById("recommend-group");
  const recommendNext = document.getElementById("recommend-next");
  const recommendDiagram = document.getElementById("recommend-diagram");
  const recommendSetup = document.getElementById("recommend-setup");
  const recommendNotation = document.getElementById("recommend-notation");
  const recommendLearned = document.getElementById("recommend-learned");

  const timerStatus = document.getElementById("timer-status");
  const timerDisplay = document.getElementById("timer-display");
  const timerStart = document.getElementById("timer-start");
  const timerStop = document.getElementById("timer-stop");
  const acceptButton = document.getElementById("result-accept");
  const dnfButton = document.getElementById("result-dnf");
  const deleteButton = document.getElementById("result-delete");

  const liveStats = document.getElementById("live-stats");
  const historyList = document.getElementById("history-list");

  let currentMode = "select";
  let currentAlgId = null;
  let timerRunning = false;
  let timerArmed = false;
  let timerStartTime = 0;
  let rafId = null;
  let pendingTimeMs = null;

  function setMode(mode) {
    currentMode = mode;
    tabs.forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.mode === mode);
    });
    modeSelect.classList.toggle("is-hidden", mode !== "select");
    modeRecommend.classList.toggle("is-hidden", mode !== "recommend");
  }

  function populateSelectList(type) {
    const algs = getAlgsByType(type);
    selectAlg.innerHTML = "";
    algs.forEach((alg) => {
      const option = document.createElement("option");
      option.value = alg.id;
      option.textContent = alg.name;
      selectAlg.appendChild(option);
    });
    if (algs[0]) {
      currentAlgId = algs[0].id;
      renderCurrentAlg();
    }
  }

  function getCurrentAlg() {
    return currentAlgId ? getAlgById(currentAlgId) : null;
  }

  function updateNotation(textElement, alg) {
    if (state.settings.showAlgorithmNotation) {
      textElement.textContent = alg.alg;
    } else {
      textElement.textContent = "(Hidden in settings)";
    }
  }

  function renderCurrentAlg() {
    const alg = getCurrentAlg();
    if (!alg) {
      return;
    }

    if (currentMode === "select") {
      renderPattern(selectDiagram, alg.pattern, "lg");
      selectSetup.textContent = alg.setupMoves || "None listed";
      updateNotation(selectNotation, alg);
      selectLearned.checked = Boolean(state.learned[alg.id]);
    } else {
      renderPattern(recommendDiagram, alg.pattern, "lg");
      recommendSetup.textContent = alg.setupMoves || "None listed";
      updateNotation(recommendNotation, alg);
      recommendLearned.checked = Boolean(state.learned[alg.id]);
    }

    updateLiveStats();
    renderHistory();
  }

  function updateLiveStats() {
    const alg = getCurrentAlg();
    if (!alg) {
      return;
    }
    const entry = getAlgStats(alg.id);
    const statsData = [
      { label: "Best", value: formatTime(entry.bestMs) },
      { label: "Median", value: formatTime(entry.medianMs) },
      { label: "Ao5", value: formatTime(entry.ao5Ms) },
      { label: "Attempts", value: entry.attempts || 0 },
      { label: "DNFs", value: entry.dnfs || 0 },
      { label: "Last", value: formatDate(entry.lastPracticedISO) }
    ];

    liveStats.innerHTML = "";
    statsData.forEach((item) => {
      const stat = document.createElement("div");
      stat.className = "stat";
      stat.innerHTML = `<div class="eyebrow">${item.label}</div><div>${item.value}</div>`;
      liveStats.appendChild(stat);
    });
  }

  function renderHistory() {
    const alg = getCurrentAlg();
    if (!alg) {
      return;
    }
    const entry = getAlgStats(alg.id);
    historyList.innerHTML = "";
    entry.history.slice(0, 10).forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "history-item";
      const timeLabel = item.dnf ? "DNF" : formatTime(item.timeMs);
      row.innerHTML = `<span>${timeLabel}</span><span>${formatDate(item.iso)}</span>`;
      const button = document.createElement("button");
      button.className = "btn ghost";
      button.textContent = "Delete";
      button.addEventListener("click", () => {
        deleteHistoryEntry(alg.id, index);
        renderCurrentAlg();
      });
      row.appendChild(button);
      historyList.appendChild(row);
    });
  }

  function setTimerStatus(text, className) {
    timerStatus.textContent = text;
    timerStatus.classList.remove("timer-ready", "timer-running");
    if (className) {
      timerStatus.classList.add(className);
    }
  }

  function updateTimerDisplay(ms) {
    timerDisplay.textContent = formatTime(ms || 0);
  }

  function enableResultButtons(enabled) {
    acceptButton.disabled = !enabled;
    dnfButton.disabled = !enabled;
    deleteButton.disabled = !enabled;
  }

  function startTimer() {
    if (timerRunning) {
      return;
    }
    pendingTimeMs = null;
    enableResultButtons(false);
    timerRunning = true;
    timerStartTime = performance.now();
    setTimerStatus("Running", "timer-running");
    const tick = () => {
      if (!timerRunning) {
        return;
      }
      const elapsed = performance.now() - timerStartTime;
      updateTimerDisplay(elapsed);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  }

  function stopTimer() {
    if (!timerRunning) {
      return;
    }
    timerRunning = false;
    cancelAnimationFrame(rafId);
    const elapsed = performance.now() - timerStartTime;
    pendingTimeMs = Math.round(elapsed);
    updateTimerDisplay(pendingTimeMs);
    setTimerStatus("Stopped");
    enableResultButtons(true);
  }

  function clearPending() {
    pendingTimeMs = null;
    updateTimerDisplay(0);
    enableResultButtons(false);
  }

  function saveResult(isDnf) {
    if (!currentAlgId || pendingTimeMs === null) {
      return;
    }
    recordSolve(currentAlgId, pendingTimeMs, isDnf);
    clearPending();
    updateLiveStats();
    renderHistory();
    if (currentMode === "recommend") {
      pickNextRecommendation();
    }
  }

  function pickNextRecommendation() {
    const group = recommendGroup.value;
    const candidates = group === "both" ? [...getAlgsByType("OLL"), ...getAlgsByType("PLL")] : getAlgsByType(group);
    const next = window.CubeApp.pickRecommendedAlg(candidates);
    if (next) {
      currentAlgId = next.id;
      renderCurrentAlg();
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      setMode(tab.dataset.mode);
      renderCurrentAlg();
    });
  });

  selectType.addEventListener("change", () => {
    populateSelectList(selectType.value);
  });

  selectAlg.addEventListener("change", () => {
    currentAlgId = selectAlg.value;
    renderCurrentAlg();
  });

  selectLearned.addEventListener("change", () => {
    if (currentAlgId) {
      setLearned(currentAlgId, selectLearned.checked);
    }
  });

  recommendLearned.addEventListener("change", () => {
    if (currentAlgId) {
      setLearned(currentAlgId, recommendLearned.checked);
    }
  });

  recommendNext.addEventListener("click", () => {
    pickNextRecommendation();
  });

  timerStart.addEventListener("click", () => {
    startTimer();
  });

  timerStop.addEventListener("click", () => {
    stopTimer();
  });

  acceptButton.addEventListener("click", () => saveResult(false));
  dnfButton.addEventListener("click", () => saveResult(true));
  deleteButton.addEventListener("click", clearPending);

  document.addEventListener("keydown", (event) => {
    if (event.code !== "Space") {
      return;
    }
    event.preventDefault();
    if (timerRunning) {
      stopTimer();
      return;
    }
    timerArmed = true;
    setTimerStatus("Ready", "timer-ready");
  });

  document.addEventListener("keyup", (event) => {
    if (event.code !== "Space") {
      return;
    }
    event.preventDefault();
    if (timerArmed && !timerRunning) {
      timerArmed = false;
      startTimer();
    }
  });

  const params = new URLSearchParams(window.location.search);
  const modeParam = params.get("mode");
  const groupParam = params.get("group");
  if (modeParam === "recommend") {
    setMode("recommend");
    recommendGroup.value = groupParam || "both";
  }

  populateSelectList(selectType.value);
  pickNextRecommendation();
})();
