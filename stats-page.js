(function () {
  const {
    getAlgsByType,
    getAlgStats,
    renderPattern,
    getMasteryTier,
    resetAlgStats,
    deleteHistoryEntry
  } = window.CubeApp;
  const { formatTime, formatDate } = window.CubeStats;

  const summaryWrap = document.getElementById("stats-summary");
  const ollBody = document.getElementById("oll-table-body");
  const pllBody = document.getElementById("pll-table-body");

  const detailName = document.getElementById("stats-name");
  const detailDiagram = document.getElementById("stats-diagram");
  const detailTier = document.getElementById("stats-tier");
  const detailGrid = document.getElementById("stats-detail-grid");
  const detailHistory = document.getElementById("stats-history");
  const resetButton = document.getElementById("stats-reset");

  let currentId = null;

  function renderSummary() {
    const summary = window.CubeApp.getSummary();
    const cards = [
      { label: "Total solves", value: summary.totalAttempts },
      { label: "Total DNF", value: summary.totalDnfs },
      { label: "Level", value: summary.level },
      { label: "XP", value: summary.xp },
      { label: "Streak", value: summary.streak.current },
      { label: "Best streak", value: summary.streak.best }
    ];
    summaryWrap.innerHTML = "";
    cards.forEach((card) => {
      const item = document.createElement("div");
      item.className = "card tight";
      item.innerHTML = `<p class="eyebrow">${card.label}</p><h2>${card.value}</h2>`;
      summaryWrap.appendChild(item);
    });
  }

  function renderTable(target, algs) {
    target.innerHTML = "";
    algs.forEach((alg) => {
      const entry = getAlgStats(alg.id);
      const tier = getMasteryTier(entry, alg.type);
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${alg.name}</td>
        <td>${entry.attempts || 0}</td>
        <td>${formatTime(entry.bestMs)}</td>
        <td>${formatTime(entry.medianMs)}</td>
        <td>${formatTime(entry.ao5Ms)}</td>
        <td>${formatDate(entry.lastPracticedISO)}</td>
        <td><span class="badge ${tier.toLowerCase()}">${tier}</span></td>
      `;
      row.addEventListener("click", () => openDetail(alg.id));
      target.appendChild(row);
    });
  }

  function openDetail(id) {
    const alg = [...getAlgsByType("OLL"), ...getAlgsByType("PLL")].find((item) => item.id === id);
    if (!alg) {
      return;
    }
    currentId = id;
    const entry = getAlgStats(id);
    detailName.textContent = alg.name;
    renderPattern(detailDiagram, alg.pattern, "lg");
    const tier = getMasteryTier(entry, alg.type);
    detailTier.innerHTML = `<span class="badge ${tier.toLowerCase()}">${tier}</span>`;

    const details = [
      { label: "Attempts", value: entry.attempts || 0 },
      { label: "DNFs", value: entry.dnfs || 0 },
      { label: "Best", value: formatTime(entry.bestMs) },
      { label: "Median", value: formatTime(entry.medianMs) },
      { label: "Ao5", value: formatTime(entry.ao5Ms) },
      { label: "Last", value: formatDate(entry.lastPracticedISO) }
    ];

    detailGrid.innerHTML = "";
    details.forEach((item) => {
      const stat = document.createElement("div");
      stat.className = "stat";
      stat.innerHTML = `<div class="eyebrow">${item.label}</div><div>${item.value}</div>`;
      detailGrid.appendChild(stat);
    });

    detailHistory.innerHTML = "";
    entry.history.slice(0, 10).forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "history-item";
      row.innerHTML = `<span>${item.dnf ? "DNF" : formatTime(item.timeMs)}</span><span>${formatDate(item.iso)}</span>`;
      const button = document.createElement("button");
      button.className = "btn ghost";
      button.textContent = "Delete";
      button.addEventListener("click", () => {
        deleteHistoryEntry(id, index);
        openDetail(id);
        renderSummary();
        renderTable(ollBody, getAlgsByType("OLL"));
        renderTable(pllBody, getAlgsByType("PLL"));
      });
      row.appendChild(button);
      detailHistory.appendChild(row);
    });

    resetButton.disabled = false;
  }

  resetButton.addEventListener("click", () => {
    if (!currentId) {
      return;
    }
    resetAlgStats(currentId);
    openDetail(currentId);
    renderSummary();
    renderTable(ollBody, getAlgsByType("OLL"));
    renderTable(pllBody, getAlgsByType("PLL"));
  });

  renderSummary();
  renderTable(ollBody, getAlgsByType("OLL"));
  renderTable(pllBody, getAlgsByType("PLL"));
})();
