import { requestJson } from "./request.js";

export function register(email, password) {
  return requestJson("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export function login(email, password) {
  return requestJson("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export function logout() {
  return requestJson("/auth/logout", { method: "POST" });
}

export function fetchMe() {
  return requestJson("/me");
}
