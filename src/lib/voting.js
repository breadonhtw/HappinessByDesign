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

export function getOrderedStationIds(scenarios) {
  return getScenarioKeys(scenarios)
    .map((key) => Number(key))
    .filter((station) => Number.isInteger(station))
    .sort((a, b) => a - b);
}

export function parseRequestedStation(value, scenarios) {
  const stationIds = getOrderedStationIds(scenarios);
  const fallbackStation = stationIds[0] ?? 1;

  if (value === null || value === "") {
    return {
      station: fallbackStation,
      invalidStation: false,
      fallbackStation,
    };
  }

  const requestedStation = Number.parseInt(value, 10);

  if (stationIds.includes(requestedStation)) {
    return {
      station: requestedStation,
      invalidStation: false,
      fallbackStation,
    };
  }

  return {
    station: fallbackStation,
    invalidStation: true,
    fallbackStation,
  };
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

export function hasCompletedStation(station) {
  return readStoredChoice(station) !== null;
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

export function getCompletedStations(scenarios) {
  return getOrderedStationIds(scenarios).filter((station) =>
    hasCompletedStation(station),
  );
}

export function getFirstIncompleteStation(scenarios) {
  return (
    getOrderedStationIds(scenarios).find(
      (station) => !hasCompletedStation(station),
    ) ?? null
  );
}

export function getNextIncompleteStation(currentStation, scenarios) {
  return (
    getOrderedStationIds(scenarios).find(
      (station) =>
        station > currentStation && !hasCompletedStation(station),
    ) ?? null
  );
}

export function isTrailComplete(scenarios) {
  return getFirstIncompleteStation(scenarios) === null;
}

export function getStationEntryContext(requestedStation, scenarios) {
  const stationIds = getOrderedStationIds(scenarios);
  const fallbackStation = stationIds[0] ?? 1;
  const safeStation = stationIds.includes(requestedStation)
    ? requestedStation
    : fallbackStation;
  const completedStations = getCompletedStations(scenarios);
  const completedStationSet = new Set(completedStations);
  const priorIncompleteStation =
    stationIds.find(
      (station) =>
        station < safeStation && !completedStationSet.has(station),
    ) ?? null;

  return {
    requestedStation: safeStation,
    currentStation: safeStation,
    completedStations,
    firstIncompleteStation:
      stationIds.find((station) => !completedStationSet.has(station)) ?? null,
    priorIncompleteStation,
    isCurrentCompleted: completedStationSet.has(safeStation),
    isTrailComplete:
      stationIds.find((station) => !completedStationSet.has(station)) ===
      undefined,
    nextIncompleteStation:
      stationIds.find(
        (station) =>
          station > safeStation && !completedStationSet.has(station),
      ) ?? null,
  };
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
