(function () {
  const PATTERNS = {
    all: [1, 1, 1, 1, 1, 1, 1, 1, 1],
    dot: [0, 0, 0, 0, 1, 0, 0, 0, 0],
    line: [0, 1, 0, 0, 1, 0, 0, 1, 0],
    cross: [0, 1, 0, 1, 1, 1, 0, 1, 0],
    l: [1, 1, 0, 1, 0, 0, 0, 0, 0],
    t: [0, 1, 0, 1, 1, 1, 0, 0, 0],
    s: [0, 1, 1, 1, 1, 0, 0, 0, 0],
    diag: [1, 0, 0, 0, 1, 0, 0, 0, 1],
    corners: [1, 0, 1, 0, 1, 0, 1, 0, 1]
  };

  const OLL_PATTERN_POOL = [
    PATTERNS.dot,
    PATTERNS.line,
    PATTERNS.cross,
    PATTERNS.l,
    PATTERNS.t,
    PATTERNS.s,
    PATTERNS.diag,
    PATTERNS.corners
  ];

  const OLL_BASE = [
    { id: "OLL_01", type: "OLL", name: "OLL 1", alg: "R U2' R2 F R F' U2' (R' F R F')", youtubeUrl: "https://www.youtube-nocookie.com/embed/Krt5t5X9gTo", setupMoves: "" },
    { id: "OLL_02", type: "OLL", name: "OLL 2", alg: "F (R U R' U') F' f (R U R' U') f'", youtubeUrl: "https://www.youtube-nocookie.com/embed/EyCwdkn03sM", setupMoves: "" },
    { id: "OLL_03", type: "OLL", name: "OLL 3", alg: "f (R U R' U') f' U' F (R U R' U') F'", youtubeUrl: "https://www.youtube-nocookie.com/embed/KdgjbaG0YmI", setupMoves: "" },
    { id: "OLL_04", type: "OLL", name: "OLL 4", alg: "f (R U R' U' f') U F (R U R' U') F'", youtubeUrl: "https://www.youtube-nocookie.com/embed/JlGs-0-RxJk", setupMoves: "" },
    { id: "OLL_05", type: "OLL", name: "OLL 5", alg: "r' U2 R U R' U r", youtubeUrl: "https://www.youtube-nocookie.com/embed/zDAhS61IFlw", setupMoves: "" },
    { id: "OLL_06", type: "OLL", name: "OLL 6", alg: "r U2 R' U' R U' r'", youtubeUrl: "https://www.youtube-nocookie.com/embed/xtuAlp8AAj8", setupMoves: "" },
    { id: "OLL_07", type: "OLL", name: "OLL 7", alg: "r U R' U R U2 r'", youtubeUrl: "https://www.youtube-nocookie.com/embed/Ls-uPCQbjqg", setupMoves: "" },
    { id: "OLL_08", type: "OLL", name: "OLL 8", alg: "r' U' R U' R' U2 r", youtubeUrl: "https://www.youtube-nocookie.com/embed/Vptj1rtxcxA", setupMoves: "" },
    { id: "OLL_09", type: "OLL", name: "OLL 9", alg: "(R U R' U') R' F R2 U R' U' F'", youtubeUrl: "https://www.youtube-nocookie.com/embed/1tkJ78gxtfU", setupMoves: "" },
    { id: "OLL_10", type: "OLL", name: "OLL 10", alg: "(R U R' U) (R' F R F') R U2 R'", youtubeUrl: "https://www.youtube-nocookie.com/embed/RPjJagkkvwM", setupMoves: "" },
    { id: "OLL_11", type: "OLL", name: "OLL 11", alg: "r' R2 U R' U R U2 R' U M'", youtubeUrl: "https://www.youtube-nocookie.com/embed/YsNvf0oUw9U", setupMoves: "" },
    { id: "OLL_12", type: "OLL", name: "OLL 12", alg: "r R2' U' R U' R' U2 R U' M", youtubeUrl: "https://www.youtube-nocookie.com/embed/E5WsvlCzOrM", setupMoves: "" },
    { id: "OLL_13", type: "OLL", name: "OLL 13", alg: "F U (R U2 R') (U' R U R') F'", youtubeUrl: "https://www.youtube-nocookie.com/embed/Xz96dRD2DaI", setupMoves: "" },
    { id: "OLL_14", type: "OLL", name: "OLL 14", alg: "R' F R U R' F' R F U' F'", youtubeUrl: "https://www.youtube-nocookie.com/embed/xEoC4d91yAc", setupMoves: "" },
    { id: "OLL_15", type: "OLL", name: "OLL 15", alg: "(r' U' r) (R' U' R U) (r' U r)", youtubeUrl: "https://www.youtube-nocookie.com/embed/VeG5V1a6pHA", setupMoves: "" },
    { id: "OLL_16", type: "OLL", name: "OLL 16", alg: "(r U r') (R U R' U') (r U' r')", youtubeUrl: "https://www.youtube-nocookie.com/embed/Gar0BFyHWXs", setupMoves: "" },
    { id: "OLL_17", type: "OLL", name: "OLL 17", alg: "(R U R' U) (R' F R F') U2 (R' F R F')", youtubeUrl: "https://www.youtube-nocookie.com/embed/4QtUb6tleZE", setupMoves: "" },
    { id: "OLL_18", type: "OLL", name: "OLL 18", alg: "R U2 R2 F R F' U2 M' U R U' r'", youtubeUrl: "https://www.youtube-nocookie.com/embed/2jrDoX0AQCc", setupMoves: "" },
    { id: "OLL_19", type: "OLL", name: "OLL 19", alg: "r' R U R U R' U' r R2 F R F'", youtubeUrl: "https://www.youtube-nocookie.com/embed/OUTQriBA888", setupMoves: "" },
    { id: "OLL_20", type: "OLL", name: "OLL 20", alg: "r' R U R U R' U' M2 U R U' r'", youtubeUrl: "https://www.youtube-nocookie.com/embed/Mlfmfv8KFOU", setupMoves: "" },
    { id: "OLL_21", type: "OLL", name: "OLL 21", alg: "(R U R' U) (R U' R' U) R U2 R'", youtubeUrl: "https://www.youtube-nocookie.com/embed/LkLCxmV63Sc", setupMoves: "" },
    { id: "OLL_22", type: "OLL", name: "OLL 22", alg: "R U2 (R2 U') (R2 U') R2 U2 R", youtubeUrl: "https://www.youtube-nocookie.com/embed/Z6SYc0MyBnk", setupMoves: "" },
    { id: "OLL_23", type: "OLL", name: "OLL 23", alg: "R2 D R' U2 R D' R' U2 R'", youtubeUrl: "https://www.youtube-nocookie.com/embed/YvgWA5n7-y0", setupMoves: "" },
    { id: "OLL_24", type: "OLL", name: "OLL 24", alg: "r U R' U' r' F R F'", youtubeUrl: "https://www.youtube-nocookie.com/embed/5pmKYnWCNiI", setupMoves: "" },
    { id: "OLL_25", type: "OLL", name: "OLL 25", alg: "F' r U R' U' r' F R", youtubeUrl: "https://www.youtube-nocookie.com/embed/w2pqzFn0KqU", setupMoves: "" },
    { id: "OLL_26", type: "OLL", name: "OLL 26", alg: "R U2 R' U' R U' R'", youtubeUrl: "https://www.youtube-nocookie.com/embed/W4E8fo6-D84", setupMoves: "" },
    { id: "OLL_27", type: "OLL", name: "OLL 27", alg: "R U R' U R U2 R'", youtubeUrl: "https://www.youtube-nocookie.com/embed/83GLN0XmCNA", setupMoves: "" },
    { id: "OLL_28", type: "OLL", name: "OLL 28", alg: "r U R' U' M U R U' R'", youtubeUrl: "https://www.youtube-nocookie.com/embed/blOdiGsmlQQ", setupMoves: "" },
    { id: "OLL_29", type: "OLL", name: "OLL 29", alg: "(R U R' U') (R U' R') (F' U' F) (R U R')", youtubeUrl: "https://www.youtube-nocookie.com/embed/xaSQb6RdIrY", setupMoves: "" },
    { id: "OLL_30", type: "OLL", name: "OLL 30", alg: "r' D' r U' r' D r2 U' r' U r U r'", youtubeUrl: "https://www.youtube-nocookie.com/embed/HSDYQ3F9_GQ", setupMoves: "" },
    { id: "OLL_31", type: "OLL", name: "OLL 31", alg: "R' U' F U R U' R' F' R", youtubeUrl: "https://www.youtube-nocookie.com/embed/d5krfXeAvZ8", setupMoves: "" },
    { id: "OLL_32", type: "OLL", name: "OLL 32", alg: "S R U R' U' R' F R f'", youtubeUrl: "https://www.youtube-nocookie.com/embed/fK4goEB_xPg", setupMoves: "" },
    { id: "OLL_33", type: "OLL", name: "OLL 33", alg: "(R U R' U') (R' F R F')", youtubeUrl: "https://www.youtube-nocookie.com/embed/yw6EhRi2Ylo", setupMoves: "" },
    { id: "OLL_34", type: "OLL", name: "OLL 34", alg: "R U R2 U' R' F R U R U' F'", youtubeUrl: "https://www.youtube-nocookie.com/embed/tOB1D8nmMIs", setupMoves: "" },
    { id: "OLL_35", type: "OLL", name: "OLL 35", alg: "R U2' R2' F R F' R U2' R'", youtubeUrl: "https://www.youtube-nocookie.com/embed/bG14LWhXWCk", setupMoves: "" },
    { id: "OLL_36", type: "OLL", name: "OLL 36", alg: "L' U' L U' L' U L U L F' L' F", youtubeUrl: "https://www.youtube-nocookie.com/embed/6E5tMt6BGog", setupMoves: "" },
    { id: "OLL_37", type: "OLL", name: "OLL 37", alg: "F R U' R' U' R U R' F'", youtubeUrl: "https://www.youtube-nocookie.com/embed/1uNKnyKiFOo", setupMoves: "" },
    { id: "OLL_38", type: "OLL", name: "OLL 38", alg: "R U R' U R U' R' U' (R' F R F')", youtubeUrl: "https://www.youtube-nocookie.com/embed/-OHDLxFILFU", setupMoves: "" },
    { id: "OLL_39", type: "OLL", name: "OLL 39", alg: "L F' L' U' L U F U' L'", youtubeUrl: "https://www.youtube-nocookie.com/embed/frAvYb9HoYo", setupMoves: "" },
    { id: "OLL_40", type: "OLL", name: "OLL 40", alg: "R' F R U R' U' F' U R", youtubeUrl: "https://www.youtube-nocookie.com/embed/fYZxskw2EgI", setupMoves: "" },
    { id: "OLL_41", type: "OLL", name: "OLL 41", alg: "R U R' U R U2 R' F (R U R' U') F'", youtubeUrl: "https://www.youtube-nocookie.com/embed/AmxQNjhBzfk", setupMoves: "" },
    { id: "OLL_42", type: "OLL", name: "OLL 42", alg: "R' U' R U' R' U2 R F (R U R' U') F'", youtubeUrl: "https://www.youtube-nocookie.com/embed/uL5R2Hx2fV8", setupMoves: "" },
    { id: "OLL_43", type: "OLL", name: "OLL 43", alg: "R' U' F' U F R", youtubeUrl: "https://www.youtube-nocookie.com/embed/joYVuCv8p-E", setupMoves: "" },
    { id: "OLL_44", type: "OLL", name: "OLL 44", alg: "F U R U' R' F'", youtubeUrl: "https://www.youtube-nocookie.com/embed/CeqGe0Q1wMg", setupMoves: "" },
    { id: "OLL_45", type: "OLL", name: "OLL 45", alg: "F (R U R' U') F'", youtubeUrl: "https://www.youtube-nocookie.com/embed/3HJQsUqEqyM", setupMoves: "" },
    { id: "OLL_46", type: "OLL", name: "OLL 46", alg: "R' U' R' F R F' U R", youtubeUrl: "https://www.youtube-nocookie.com/embed/AQynWJ4dAjk", setupMoves: "" },
    { id: "OLL_47", type: "OLL", name: "OLL 47", alg: "R' U' (R' F R F') (R' F R F') U R", youtubeUrl: "https://www.youtube-nocookie.com/embed/9Ui1n0UjaCU", setupMoves: "" },
    { id: "OLL_48", type: "OLL", name: "OLL 48", alg: "F (R U R' U') (R U R' U') F'", youtubeUrl: "https://www.youtube-nocookie.com/embed/-yAt0RgMmsY", setupMoves: "" },
    { id: "OLL_49", type: "OLL", name: "OLL 49", alg: "r U' r2 U r2 U r2 U' r", youtubeUrl: "https://www.youtube-nocookie.com/embed/dQrWHwyT8bo", setupMoves: "" },
    { id: "OLL_50", type: "OLL", name: "OLL 50", alg: "r' U r2 U' r2 U' r2 U r'", youtubeUrl: "https://www.youtube-nocookie.com/embed/0jwU3QUs93g", setupMoves: "" },
    { id: "OLL_51", type: "OLL", name: "OLL 51", alg: "F (U R U' R') (U R U' R') F'", youtubeUrl: "https://www.youtube-nocookie.com/embed/6j4D0FHgSOY", setupMoves: "" },
    { id: "OLL_52", type: "OLL", name: "OLL 52", alg: "R' F' U' F U' R U R' U R", youtubeUrl: "https://www.youtube-nocookie.com/embed/ZuRxOkExG8o", setupMoves: "" },
    { id: "OLL_53", type: "OLL", name: "OLL 53", alg: "r' U' R U' R' U R U' R' U2 r", youtubeUrl: "https://www.youtube-nocookie.com/embed/FV3aJg0kmIw", setupMoves: "" },
    { id: "OLL_54", type: "OLL", name: "OLL 54", alg: "r U R' U R U' R' U R U2 r'", youtubeUrl: "https://www.youtube-nocookie.com/embed/gydKjGqInfg", setupMoves: "" },
    { id: "OLL_55", type: "OLL", name: "OLL 55", alg: "R U2 R2 U' R U' R' U2 F R F'", youtubeUrl: "https://www.youtube-nocookie.com/embed/QDehoJhTOtY", setupMoves: "" },
    { id: "OLL_56", type: "OLL", name: "OLL 56", alg: "(r U r') (U R U' R') (U R U' R') (r U' r')", youtubeUrl: "https://www.youtube-nocookie.com/embed/KZkE5GBzS9k", setupMoves: "" },
    { id: "OLL_57", type: "OLL", name: "OLL 57", alg: "(R U R' U') M' U R U' r'", youtubeUrl: "https://www.youtube-nocookie.com/embed/qHvJd0pk41Q", setupMoves: "" }
  ];

  const PLL_BASE = [
    { id: "PLL_Ub", type: "PLL", name: "Ub Perm", alg: "R' U R' U' R3 U' R' U R U R2", youtubeUrl: "https://www.youtube-nocookie.com/embed/mssHbM4JYOc", setupMoves: "" },
    { id: "PLL_Ua", type: "PLL", name: "Ua Perm", alg: "R U R' U R' U' R2 U' R' U R' U R", youtubeUrl: "https://www.youtube-nocookie.com/embed/WNkmbgnvQPU", setupMoves: "" },
    { id: "PLL_Z", type: "PLL", name: "Z Perm", alg: "(M2 U') (M2 U') M' U2 M2 U2 M'", youtubeUrl: "https://www.youtube-nocookie.com/embed/I0haU9Z2MeA", setupMoves: "" },
    { id: "PLL_H", type: "PLL", name: "H Perm", alg: "(M2 U' M2) U2 (M2 U' M2)", youtubeUrl: "https://www.youtube-nocookie.com/embed/pmA8ToRfOXQ", setupMoves: "" },
    { id: "PLL_Aa", type: "PLL", name: "Aa Perm", alg: "x R' U R' D2 R U' R' D2 R2 x'", youtubeUrl: "https://www.youtube-nocookie.com/embed/ibDaGbBp1wY", setupMoves: "" },
    { id: "PLL_Ab", type: "PLL", name: "Ab Perm", alg: "x R2 D2 R U R' D2 R U' R x'", youtubeUrl: "https://www.youtube-nocookie.com/embed/Nd0NvF4PF-g", setupMoves: "" },
    { id: "PLL_E", type: "PLL", name: "E Perm", alg: "x' (R U' R' D) (R U R' D') (R U R' D) (R U' R' D') x", youtubeUrl: "https://www.youtube-nocookie.com/embed/ifo0uz8s4cI", setupMoves: "" },
    { id: "PLL_Ga", type: "PLL", name: "Ga Perm", alg: "R2 U R' U R' U' R U' R2 (D U') R' U R D'", youtubeUrl: "https://www.youtube-nocookie.com/embed/wd4gd8B7QSA", setupMoves: "" },
    { id: "PLL_Gb", type: "PLL", name: "Gb Perm", alg: "D R' U' R (U D') R2 U R' U R U' R U' R2", youtubeUrl: "https://www.youtube-nocookie.com/embed/8fJRWcKSMUk", setupMoves: "" },
    { id: "PLL_Gc", type: "PLL", name: "Gc Perm", alg: "R2 U' R U' R U R' U R2 (D' U) R U' R' D", youtubeUrl: "https://www.youtube-nocookie.com/embed/L8C6nY-Qy3E", setupMoves: "" },
    { id: "PLL_Gd", type: "PLL", name: "Gd Perm", alg: "D' R U R' (U' D) R2 U' R U' R' U R' U R2", youtubeUrl: "https://www.youtube-nocookie.com/embed/ESv6a7Cid6c", setupMoves: "" },
    { id: "PLL_Ra", type: "PLL", name: "Ra Perm", alg: "(R U' R' U') (R U R D) (R' U' R D') R' U2 R'", youtubeUrl: "https://www.youtube-nocookie.com/embed/IGHfp6CgfaA", setupMoves: "" },
    { id: "PLL_Rb", type: "PLL", name: "Rb Perm", alg: "(R' U2) (R U2') R' F (R U R' U') R' F' R2", youtubeUrl: "https://www.youtube-nocookie.com/embed/FwXr8Cawxfg", setupMoves: "" },
    { id: "PLL_Ja", type: "PLL", name: "Ja Perm", alg: "(R' U L') U2 (R U' R') U2 R L", youtubeUrl: "https://www.youtube-nocookie.com/embed/nh9th-AYF_8", setupMoves: "" },
    { id: "PLL_Jb", type: "PLL", name: "Jb Perm", alg: "(R U R' F') (R U R' U') R' F R2 U' R'", youtubeUrl: "https://www.youtube-nocookie.com/embed/QXIIxGzMftw", setupMoves: "" },
    { id: "PLL_T", type: "PLL", name: "T Perm", alg: "(R U R' U') R' F R2 U' R' U' (R U R' F')", youtubeUrl: "https://www.youtube-nocookie.com/embed/PX1R7VW9YTs", setupMoves: "" },
    { id: "PLL_F", type: "PLL", name: "F Perm", alg: "R' U' F' (R U R' U') R' F (R2 U' R' U') (R U R') U R", youtubeUrl: "https://www.youtube-nocookie.com/embed/KLL-Qt9Lm90", setupMoves: "" },
    { id: "PLL_V", type: "PLL", name: "V Perm", alg: "(R' U R' U') y R' F' R2 U' R' U R' F R F", youtubeUrl: "https://www.youtube-nocookie.com/embed/Ud9ZDcS2yRk", setupMoves: "" },
    { id: "PLL_Y", type: "PLL", name: "Y Perm", alg: "F R U' R' U' R U R' F' (R U R' U') (R' F R F')", youtubeUrl: "https://www.youtube-nocookie.com/embed/gC3LvhSAXSA", setupMoves: "" },
    { id: "PLL_Na", type: "PLL", name: "Na Perm", alg: "F' (R U R' U') R' F R2 F (U' R' U') R U F' R'", youtubeUrl: "https://www.youtube-nocookie.com/embed/iNfx--vOxd0", setupMoves: "" },
    { id: "PLL_Nb", type: "PLL", name: "Nb Perm", alg: "r' D' F (r U' r)' F' D r2 U r' U' (r' F r F')", youtubeUrl: "https://www.youtube-nocookie.com/embed/P5yMlQQ3nsM", setupMoves: "" }
  ];

  const OLL_ALGS = OLL_BASE.map((alg, index) => {
    const pattern = OLL_PATTERN_POOL[index % OLL_PATTERN_POOL.length];
    return { ...alg, pattern };
  });

  const PLL_ALGS = PLL_BASE.map((alg) => ({
    ...alg,
    pattern: PATTERNS.all
  }));

  const ALGORITHMS = [...OLL_ALGS, ...PLL_ALGS];

  window.CUBE_ALGS = ALGORITHMS;
  window.CUBE_OLL = OLL_ALGS;
  window.CUBE_PLL = PLL_ALGS;
})();
