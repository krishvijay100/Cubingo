import { requestJson } from "./request.js";

export function fetchMe() {
  return requestJson("/me");
}

export function saveProgress(data) {
  return requestJson("/progress", {
    method: "PUT",
    body: JSON.stringify({ data })
  });
}
