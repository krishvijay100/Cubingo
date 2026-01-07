(function () {
  function computeMedian(times) {
    if (!times || times.length === 0) {
      return null;
    }
    const sorted = [...times].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
    }
    return sorted[mid];
  }

  function computeAo5(times) {
    if (!times || times.length < 5) {
      return null;
    }
    const lastFive = times.slice(-5);
    const sum = lastFive.reduce((total, value) => total + value, 0);
    return Math.round(sum / lastFive.length);
  }

  function formatTime(ms) {
    if (ms === null || ms === undefined) {
      return "--";
    }
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    if (minutes > 0) {
      return `${minutes}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
    }
    return `${seconds}.${String(centiseconds).padStart(2, "0")}`;
  }

  function formatDate(iso) {
    if (!iso) {
      return "--";
    }
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
      return "--";
    }
    return date.toLocaleDateString();
  }

  function getLocalDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function daysBetweenKeys(olderKey, newerKey) {
    if (!olderKey || !newerKey) {
      return 0;
    }
    const [oy, om, od] = olderKey.split("-").map(Number);
    const [ny, nm, nd] = newerKey.split("-").map(Number);
    const older = new Date(oy, om - 1, od);
    const newer = new Date(ny, nm - 1, nd);
    const diffMs = newer.getTime() - older.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }

  window.CubeStats = {
    computeMedian,
    computeAo5,
    formatTime,
    formatDate,
    getLocalDateKey,
    daysBetweenKeys
  };
})();
