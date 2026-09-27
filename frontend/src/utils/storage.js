// localStorage helpers. Storage can be unavailable (private mode) or hold malformed
// JSON, so every read falls back to a default instead of crashing the page.

const HISTORY_KEY = 'predictionHistory';
const MAX_HISTORY = 50;

export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or disabled: the app keeps working without persistence.
  }
}

export function getCurrentUser() {
  return readJSON('user', null);
}

export function setCurrentUser(user) {
  if (user) writeJSON('user', user);
  else {
    try {
      localStorage.removeItem('user');
    } catch {
      // ignore
    }
  }
}

function ownerOf(entry) {
  return entry.userEmail || 'anonymous';
}

function currentOwner() {
  return getCurrentUser()?.email || 'anonymous';
}

export function getUserHistory() {
  const owner = currentOwner();
  return readJSON(HISTORY_KEY, []).filter(entry => ownerOf(entry) === owner);
}

export function addHistoryEntry(symptoms, result) {
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userEmail: currentOwner(),
    date: new Date().toISOString(),
    symptoms,
    result,
  };
  writeJSON(HISTORY_KEY, [entry, ...readJSON(HISTORY_KEY, [])].slice(0, MAX_HISTORY));
  return entry;
}

export function removeHistoryEntry(id) {
  writeJSON(HISTORY_KEY, readJSON(HISTORY_KEY, []).filter(entry => entry.id !== id));
}

export function clearUserHistory() {
  const owner = currentOwner();
  writeJSON(HISTORY_KEY, readJSON(HISTORY_KEY, []).filter(entry => ownerOf(entry) !== owner));
}
