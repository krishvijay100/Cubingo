(function () {
  const { state, overwriteState, resetAllProgress, resetAllStats } = window.CubeApp;

  const exportBox = document.getElementById("export-box");
  const importBox = document.getElementById("import-box");
  const importStatus = document.getElementById("import-status");
  const toggleNotation = document.getElementById("toggle-notation");

  function refreshExport() {
    exportBox.value = JSON.stringify(state, null, 2);
  }

  document.getElementById("export-generate").addEventListener("click", refreshExport);

  document.getElementById("export-copy").addEventListener("click", () => {
    refreshExport();
    exportBox.select();
    document.execCommand("copy");
  });

  document.getElementById("export-download").addEventListener("click", () => {
    refreshExport();
    const blob = new Blob([exportBox.value], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "cubeTrainer_v1.json";
    link.click();
    URL.revokeObjectURL(link.href);
  });

  document.getElementById("import-apply").addEventListener("click", () => {
    importStatus.textContent = "";
    try {
      const parsed = JSON.parse(importBox.value || "{}");
      if (confirm("Import JSON and overwrite current data? NOTE: Importing an empty JSON will reset all data")) {
        overwriteState(parsed);
        importStatus.textContent = "Import complete.";
        refreshExport();
      }
    } catch (error) {
      importStatus.textContent = "Invalid JSON.";
    }
  });

  document.getElementById("reset-stats").addEventListener("click", () => {
    if (confirm("Reset all algorithm stats?")) {
      resetAllStats();
      refreshExport();
    }
  });

  document.getElementById("reset-all").addEventListener("click", () => {
    if (confirm("Reset everything (XP, streak, stats, learned)?")) {
      resetAllProgress();
      refreshExport();
    }
  });

  toggleNotation.checked = Boolean(state.settings.showAlgorithmNotation);
  toggleNotation.addEventListener("change", () => {
    state.settings.showAlgorithmNotation = toggleNotation.checked;
    window.CubeStorage.saveState(state);
  });

  refreshExport();
})();
