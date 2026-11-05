const DEFAULT_STATE = Object.freeze({
  projectName: "ai-sdlc-todoapp",
  apiBaseUrl: "http://localhost:5000",
  databaseMode: "Varsayımsal kalıcı veritabanı",
  focus: "all",
});

const VALID_FOCUS = new Set(["all", "user", "webapp", "api", "storage", "database"]);

export function createState(input = {}) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TypeError("Canvas input must be an object.");
  }

  const projectName = readText(input.projectName, DEFAULT_STATE.projectName, 80);
  const apiBaseUrl = readUrl(input.apiBaseUrl, DEFAULT_STATE.apiBaseUrl);
  const databaseMode = readText(input.databaseMode, DEFAULT_STATE.databaseMode, 120);
  const focus = readFocus(input.focus);

  return { projectName, apiBaseUrl, databaseMode, focus };
}

export function updateFocus(state, focus) {
  const nextFocus = readFocus(focus);
  return { ...state, focus: nextFocus };
}

export function getDefaultState() {
  return { ...DEFAULT_STATE };
}

function readText(value, fallback, maxLength) {
  if (value === undefined) return fallback;
  if (typeof value !== "string" || value.trim().length === 0 || value.length > maxLength) {
    throw new TypeError(`Expected a non-empty string of at most ${maxLength} characters.`);
  }
  return value.trim();
}

function readUrl(value, fallback) {
  if (value === undefined) return fallback;
  if (typeof value !== "string") throw new TypeError("apiBaseUrl must be a URL.");
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    return url.origin;
  } catch {
    throw new TypeError("apiBaseUrl must be an HTTP or HTTPS URL.");
  }
}

function readFocus(value) {
  if (value === undefined) return DEFAULT_STATE.focus;
  if (typeof value !== "string" || !VALID_FOCUS.has(value)) {
    throw new TypeError("focus must identify a supported diagram component.");
  }
  return value;
}
