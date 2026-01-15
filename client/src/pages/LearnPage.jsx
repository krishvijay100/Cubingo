import { useEffect, useMemo, useState } from "react";
import { CUBE_OLL, CUBE_PLL } from "../data/algs.js";
import PatternGrid from "../components/PatternGrid.jsx";
import { loadCubeState, saveCubeState } from "../state/cubeState.js";

const OLL_CATEGORIES = [
  { title: "Cross", ids: [21, 22, 23, 24, 25, 26, 27] },
  { title: "T-Shapes", ids: [33, 45] },
  { title: "Squares", ids: [5, 6] },
  { title: "C-Shapes", ids: [34, 46] },
  { title: "W-Shapes", ids: [36, 38] },
  { title: "Corners Correct, Edges Flipped", ids: [28, 57] },
  { title: "P-Shapes", ids: [31, 32, 43, 44] },
  { title: "I-Shapes", ids: [51, 52, 55, 56] },
  { title: "Fish Shapes", ids: [9, 10, 35, 37] },
  { title: "Knight Shapes", ids: [13, 14, 15, 16] },
  { title: "Awkward Shapes", ids: [29, 30, 41, 42] },
  { title: "L-Shapes", ids: [47, 48, 49, 50, 53, 54] },
  { title: "Lightning Bolts", ids: [7, 8, 11, 12, 39, 40] },
  { title: "Dot", ids: [1, 2, 3, 4, 17, 18, 19, 20] }
];

const OLL_BY_ID = new Map(CUBE_OLL.map((alg) => [alg.id, alg]));

export default function LearnPage() {
  const [state, setState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    let isMounted = true;
    loadCubeState()
      .then((loaded) => {
        if (isMounted) {
          setState(loaded);
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

  const selectedAlg = useMemo(() => {
    if (!selectedId) {
      return null;
    }
    return CUBE_OLL.find((alg) => alg.id === selectedId) || CUBE_PLL.find((alg) => alg.id === selectedId);
  }, [selectedId]);

  async function updateLearned(algId, isLearned) {
    setState((prev) => {
      if (!prev) {
        return prev;
      }
      const next = {
        ...prev,
        learned: {
          ...prev.learned,
          [algId]: Boolean(isLearned)
        }
      };
      saveCubeState(next);
      return next;
    });
  }

  if (isLoading || !state) {
    return (
      <section className="card">
        <p>Loading learn data...</p>
      </section>
    );
  }

  return (
    <>
      <section>
        <p className="eyebrow">Algorithm library</p>
        <h1>Learn OLL and PLL</h1>
        <p className="section-sub">
          Browse every case, mark learned algorithms, and watch the detail panel update as you
          explore.
        </p>
      </section>
      <section className="split learn-split">
        <div>
          <h2 className="section-title" id="oll">OLL Library</h2>
          <p className="section-sub">57 orientation cases.</p>
          {OLL_CATEGORIES.map((category) => (
            <div key={category.title} className="oll-category">
              <h3 className="oll-category-title">{category.title}</h3>
              <div className="card-grid">
                {category.ids.map((num) => {
                  const id = `OLL_${String(num).padStart(2, "0")}`;
                  const alg = OLL_BY_ID.get(id);
                  if (!alg) {
                    return null;
                  }
                  const isLearned = Boolean(state.learned[alg.id]);
                  return (
                    <div key={alg.id} className="card alg-card">
                      <PatternGrid pattern={alg.pattern} />
                      <div className="info">
                        <h3>{alg.name}</h3>
                      </div>
                      <div className="actions">
                        <label className="toggle">
                          <input
                            type="checkbox"
                            checked={isLearned}
                            onChange={(event) => updateLearned(alg.id, event.target.checked)}
                          />
                          Learned
                        </label>
                        <button
                          className="btn"
                          type="button"
                          onClick={() => setSelectedId(alg.id)}
                        >
                          Open
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          <h2 className="section-title" id="pll">PLL Library</h2>
          <p className="section-sub">21 permutation cases.</p>
          <div className="card-grid">
            {CUBE_PLL.map((alg) => {
              const isLearned = Boolean(state.learned[alg.id]);
              return (
                <div key={alg.id} className="card alg-card">
                  <PatternGrid pattern={alg.pattern} />
                  <div className="info">
                    <h3>{alg.name}</h3>
                  </div>
                  <div className="actions">
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={isLearned}
                        onChange={(event) => updateLearned(alg.id, event.target.checked)}
                      />
                      Learned
                    </label>
                    <button
                      className="btn"
                      type="button"
                      onClick={() => setSelectedId(alg.id)}
                    >
                      Open
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <aside className="card detail-panel" id="detail-panel">
          <p className="eyebrow">Algorithm details</p>
          <h2 id="detail-name">{selectedAlg ? selectedAlg.name : "Select a case"}</h2>
          <div id="detail-diagram">
            {selectedAlg ? <PatternGrid pattern={selectedAlg.pattern} size="lg" /> : null}
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              id="detail-learned"
              checked={selectedAlg ? Boolean(state.learned[selectedAlg.id]) : false}
              onChange={(event) => {
                if (selectedAlg) {
                  updateLearned(selectedAlg.id, event.target.checked);
                }
              }}
              disabled={!selectedAlg}
            />
            Mark learned
          </label>
          <div className="field">
            <span className="section-sub">Algorithm</span>
            <p id="detail-alg">{selectedAlg ? selectedAlg.alg : "--"}</p>
          </div>
          <div className="field">
            <span className="section-sub">Setup moves</span>
            <p id="detail-setup">{selectedAlg ? (selectedAlg.setupMoves || "None listed") : "--"}</p>
          </div>
          <div className="field">
            <span className="section-sub">Video</span>
            <iframe
              id="detail-video"
              title="Algorithm video"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              src={selectedAlg ? selectedAlg.youtubeUrl : ""}
            ></iframe>
          </div>
        </aside>
      </section>
    </>
  );
}
