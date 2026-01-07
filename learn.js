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

  getAlgsByType("OLL").forEach((alg) => createCard(alg, ollList));
  getAlgsByType("PLL").forEach((alg) => createCard(alg, pllList));
})();
