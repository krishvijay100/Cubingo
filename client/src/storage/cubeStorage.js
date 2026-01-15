import { fetchMe, saveProgress } from "../api/progress.js";
import { DEFAULT_STATE, mergeState, clone } from "./defaultState.js";

async function loadState() {
  try {
    const me = await fetchMe();
    if (!me || !me.progress) {
      return clone(DEFAULT_STATE);
    }
    return mergeState(me.progress);
  } catch (error) {
    return clone(DEFAULT_STATE);
  }
}

async function saveState(state) {
  await saveProgress(state);
}

async function resetState() {
  await saveProgress(clone(DEFAULT_STATE));
  return clone(DEFAULT_STATE);
}

export const CubeStorage = {
  DEFAULT_STATE,
  loadState,
  saveState,
  resetState,
  mergeState
};
