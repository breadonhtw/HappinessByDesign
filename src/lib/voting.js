const VALID_CHOICES = new Set(["a", "b"]);

function getScenarioKeys(scenarios) {
  return Object.keys(scenarios);
}

function votedKey(station) {
  return `voted_station_${station}`;
}

function votedChoiceKey(station) {
  return `voted_station_${station}_choice`;
}

function pendingSyncKey(station) {
  return `pending_vote_sync_${station}`;
}

export function isValidChoice(choice) {
  return VALID_CHOICES.has(choice);
}

export function buildInitialCounts(scenarios) {
  const initialCounts = {};

  for (const key of getScenarioKeys(scenarios)) {
    initialCounts[key] = {
      a: scenarios[key].votes.a,
      b: scenarios[key].votes.b,
    };
  }

  return initialCounts;
}

export function normalizeCounts(data, scenarios) {
  const fallback = buildInitialCounts(scenarios);
  const normalized = {};

  for (const key of getScenarioKeys(scenarios)) {
    const stationCounts = data?.[key];
    const a = Number(stationCounts?.a);
    const b = Number(stationCounts?.b);

    normalized[key] = {
      a: Number.isFinite(a) && a >= 0 ? a : fallback[key].a,
      b: Number.isFinite(b) && b >= 0 ? b : fallback[key].b,
    };
  }

  return normalized;
}

export function readStoredChoice(station) {
  try {
    if (localStorage.getItem(votedKey(station)) !== "true") {
      return null;
    }

    const storedChoice = localStorage.getItem(votedChoiceKey(station));
    return isValidChoice(storedChoice) ? storedChoice : null;
  } catch {
    return null;
  }
}

export function markStationVote(station, choice) {
  if (!isValidChoice(choice)) {
    return;
  }

  try {
    localStorage.setItem(votedKey(station), "true");
    localStorage.setItem(votedChoiceKey(station), choice);
  } catch {
    // Ignore storage failures; voting should still work for the current session.
  }
}

export function readPendingSyncMap(scenarios) {
  const pending = {};

  for (const key of getScenarioKeys(scenarios)) {
    try {
      const storedChoice = localStorage.getItem(pendingSyncKey(key));
      pending[key] = isValidChoice(storedChoice) ? storedChoice : null;
    } catch {
      pending[key] = null;
    }
  }

  return pending;
}

export function updatePendingSync(station, choice) {
  try {
    if (isValidChoice(choice)) {
      localStorage.setItem(pendingSyncKey(station), choice);
    } else {
      localStorage.removeItem(pendingSyncKey(station));
    }
  } catch {
    // Ignore storage failures; retry remains available until the page reloads.
  }
}
