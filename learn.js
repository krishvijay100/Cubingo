(function () {
  const { state, renderPattern, getAlgsByType, setLearned, getAlgById } = window.CubeApp;

  const ollList = document.getElementById("oll-list");
  const pllList = document.getElementById("pll-list");
  const detailName = document.getElementById("detail-name");
  const detailDiagram = document.getElementById("detail-diagram");
  const detailAlg = document.getElementById("detail-alg");
  const detailSetup = document.getElementById("detail-setup");
  const detailVideo = document.getElementById("detail-video");
  const detailLearned = document.getElementById("detail-learned");

  let currentId = null;

  function createCard(alg, container) {
    const card = document.createElement("div");
    card.className = "card alg-card";

    const diagramWrap = document.createElement("div");
    renderPattern(diagramWrap, alg.pattern);

    const info = document.createElement("div");
    info.className = "info";
    const title = document.createElement("h3");
    title.textContent = alg.name;
    info.appendChild(title);

    const actions = document.createElement("div");
    actions.className = "actions";

    const learnedLabel = document.createElement("label");
    learnedLabel.className = "toggle";
    const learnedInput = document.createElement("input");
    learnedInput.type = "checkbox";
    learnedInput.checked = Boolean(state.learned[alg.id]);
    learnedInput.addEventListener("change", () => {
      setLearned(alg.id, learnedInput.checked);
      if (currentId === alg.id) {
        detailLearned.checked = learnedInput.checked;
      }
    });
    learnedLabel.appendChild(learnedInput);
    learnedLabel.appendChild(document.createTextNode("Learned"));

    const openButton = document.createElement("button");
    openButton.className = "btn";
    openButton.textContent = "Open";
    openButton.addEventListener("click", () => openDetail(alg.id));

    actions.appendChild(learnedLabel);
    actions.appendChild(openButton);

    card.appendChild(diagramWrap);
    card.appendChild(info);
    card.appendChild(actions);
    container.appendChild(card);
  }

  function openDetail(id) {
    const alg = getAlgById(id);
    if (!alg) {
      return;
    }
    currentId = id;
    detailName.textContent = alg.name;
    renderPattern(detailDiagram, alg.pattern, "lg");
    detailAlg.textContent = alg.alg;
    detailSetup.textContent = alg.setupMoves || "None listed";
    detailVideo.src = alg.youtubeUrl;
    detailLearned.checked = Boolean(state.learned[id]);
  }

  detailLearned.addEventListener("change", () => {
    if (!currentId) {
      return;
    }
    setLearned(currentId, detailLearned.checked);
    const alg = getAlgById(currentId);
    if (!alg) {
      return;
    }
    document.querySelectorAll(".alg-card").forEach((card) => {
      const title = card.querySelector("h3");
      const checkbox = card.querySelector("input[type='checkbox']");
      if (title && checkbox && title.textContent === alg.name) {
        checkbox.checked = detailLearned.checked;
      }
    });
  });

  const ollAlgs = getAlgsByType("OLL");
  const ollById = new Map(ollAlgs.map((alg) => [alg.id, alg]));
  const ollCategories = [
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

  function createCategory({ title, ids }) {
    const wrapper = document.createElement("div");
    wrapper.className = "oll-category";

    const heading = document.createElement("h3");
    heading.className = "oll-category-title";
    heading.textContent = title;

    const grid = document.createElement("div");
    grid.className = "card-grid";

    ids.forEach((num) => {
      const id = `OLL_${String(num).padStart(2, "0")}`;
      const alg = ollById.get(id);
      if (alg) {
        createCard(alg, grid);
      }
    });

    wrapper.appendChild(heading);
    wrapper.appendChild(grid);
    ollList.appendChild(wrapper);
  }

  ollCategories.forEach((category) => createCategory(category));
  getAlgsByType("PLL").forEach((alg) => createCard(alg, pllList));
})();
