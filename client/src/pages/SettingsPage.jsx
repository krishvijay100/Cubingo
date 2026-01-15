import { useEffect, useState } from "react";
import { loadCubeState, saveCubeState } from "../state/cubeState.js";
import { overwriteState, resetAllProgress, resetAllStats } from "../state/settingsLogic.js";

function downloadJson(filename, text) {
  const blob = new Blob([text], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function SettingsPage() {
  const [state, setState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [exportText, setExportText] = useState("");
  const [importText, setImportText] = useState("");
  const [importStatus, setImportStatus] = useState("");

  useEffect(() => {
    let isMounted = true;
    loadCubeState()
      .then((loaded) => {
        if (isMounted) {
          setState(loaded);
          setExportText(JSON.stringify(loaded, null, 2));
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  function updateCubeState(updater) {
    setState((prev) => {
      if (!prev) {
        return prev;
      }
      const next = updater(JSON.parse(JSON.stringify(prev)));
      saveCubeState(next);
      setExportText(JSON.stringify(next, null, 2));
      return next;
    });
  }

  function handleExport() {
    if (!state) {
      return;
    }
    setExportText(JSON.stringify(state, null, 2));
  }

  async function handleCopy() {
    handleExport();
    if (!exportText) {
      return;
    }
    await navigator.clipboard.writeText(exportText);
  }

  function handleDownload() {
    handleExport();
    downloadJson("cubeTrainer_v1.json", exportText);
  }

  function handleImport() {
    setImportStatus("");
    try {
      const parsed = JSON.parse(importText || "{}");
      if (confirm("Import JSON and overwrite current data? NOTE: Importing an empty JSON will reset all data")) {
        updateCubeState(() => overwriteState(state, parsed));
        setImportStatus("Import complete.");
      }
    } catch (error) {
      setImportStatus("Invalid JSON.");
    }
  }

  function handleResetStats() {
    if (confirm("Reset all algorithm stats?")) {
      updateCubeState((next) => resetAllStats(next));
    }
  }

  function handleResetAll() {
    if (confirm("Reset everything (XP, streak, stats, learned)?")) {
      updateCubeState(() => resetAllProgress(state));
    }
  }

  if (isLoading || !state) {
    return (
      <section className="card">
        <p>Loading settings...</p>
      </section>
    );
  }

  return (
    <>
      <section>
        <p className="eyebrow">Settings</p>
        <h1>Export, import, and reset</h1>
        <p className="section-sub">Back up your progress, move to another device, or start fresh.</p>
      </section>

      <section className="split">
        <div className="card">
          <h2 className="section-title">Export</h2>
          <textarea value={exportText} readOnly></textarea>
          <div className="hero-actions">
            <button className="btn" type="button" onClick={handleExport}>Generate JSON</button>
            <button className="btn" type="button" onClick={handleCopy}>Copy</button>
            <button className="btn" type="button" onClick={handleDownload}>Download</button>
          </div>
        </div>
        <div className="card">
          <h2 className="section-title">Import</h2>
          <textarea
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            placeholder="Paste your JSON here..."
          ></textarea>
          <div className="hero-actions">
            <button className="btn primary" type="button" onClick={handleImport}>
              Import (overwrite)
            </button>
          </div>
          <p className="section-sub">{importStatus}</p>
        </div>
      </section>

      <section className="split">
        <div className="card">
          <h2 className="section-title">Training</h2>
          <label className="toggle">
            <input
              type="checkbox"
              checked={Boolean(state.settings.showAlgorithmNotation)}
              onChange={(event) => {
                updateCubeState((next) => {
                  next.settings.showAlgorithmNotation = event.target.checked;
                  return next;
                });
              }}
            />
            Show algorithm notation during training
          </label>
        </div>
        <div className="card">
          <h2 className="section-title">Reset</h2>
          <div className="hero-actions">
            <button className="btn" type="button" onClick={handleResetStats}>Reset all stats</button>
            <button className="btn ghost" type="button" onClick={handleResetAll}>Reset everything</button>
          </div>
        </div>
      </section>
    </>
  );
}
