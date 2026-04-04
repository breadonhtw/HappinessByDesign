export const AGE_RANGE_OPTIONS = [
  { value: "under-18", label: "Under 18" },
  { value: "18-24", label: "18-24" },
  { value: "25-34", label: "25-34" },
  { value: "35-44", label: "35-44" },
  { value: "45-54", label: "45-54" },
  { value: "55-64", label: "55-64" },
  { value: "65-plus", label: "65+" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

const VALID_CHOICES = new Set(["a", "b", "other"]);
const VALID_AGE_RANGES = new Set(
  AGE_RANGE_OPTIONS.map((option) => option.value),
);

function getScenarioKeys(scenarios) {
  return Object.keys(scenarios);
}

function votedKey(station) {
  return `voted_station_${station}`;
}

function votedChoiceKey(station) {
  return `voted_station_${station}_choice`;
}

function votedResponseKey(station) {
  return `voted_station_${station}_response`;
}

function pendingSyncKey(station) {
  return `pending_vote_sync_${station}`;
}

export function isValidChoice(choice) {
  return VALID_CHOICES.has(choice);
}

export function isValidAgeRange(ageRange) {
  return VALID_AGE_RANGES.has(ageRange);
}

function normalizeOptionalString(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

export function normalizeStoredResponse(response) {
  if (!response) {
    return null;
  }

  if (typeof response === "string") {
    return isValidChoice(response) ? { choice: response } : null;
  }

  if (typeof response !== "object") {
    return null;
  }

  const choice = normalizeOptionalString(response.choice).toLowerCase();

  if (!isValidChoice(choice)) {
    return null;
  }

  const ageRange = normalizeOptionalString(response.ageRange);
  const otherText = normalizeOptionalString(response.otherText);

  if (ageRange && !isValidAgeRange(ageRange)) {
    return null;
  }

  if (choice === "other" && !otherText) {
    return null;
  }

  const normalized = { choice };

  if (ageRange) {
    normalized.ageRange = ageRange;
  }

  if (choice === "other") {
    normalized.otherText = otherText;
  }

  return normalized;
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
  return readStoredResponse(station)?.choice ?? null;
}

export function readStoredResponse(station) {
  try {
    const storedResponse = localStorage.getItem(votedResponseKey(station));

    if (storedResponse) {
      const parsedResponse = normalizeStoredResponse(JSON.parse(storedResponse));

      if (parsedResponse) {
        return parsedResponse;
      }
    }

    if (localStorage.getItem(votedKey(station)) !== "true") {
      return null;
    }

    const storedChoice = normalizeOptionalString(
      localStorage.getItem(votedChoiceKey(station)),
    ).toLowerCase();

    return isValidChoice(storedChoice) ? { choice: storedChoice } : null;
  } catch {
    return null;
  }
}

export function hasCompletedStation(station) {
  return readStoredResponse(station) !== null;
}

export function markStationVote(station, response) {
  const normalizedResponse = normalizeStoredResponse(response);

  if (!normalizedResponse) {
    return;
  }

  try {
    localStorage.setItem(votedKey(station), "true");
    localStorage.setItem(votedChoiceKey(station), normalizedResponse.choice);
    localStorage.setItem(
      votedResponseKey(station),
      JSON.stringify(normalizedResponse),
    );
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
      const storedResponse = localStorage.getItem(pendingSyncKey(key));

      if (!storedResponse) {
        pending[key] = null;
        continue;
      }

      let parsedResponse = null;

      try {
        parsedResponse = JSON.parse(storedResponse);
      } catch {
        parsedResponse = storedResponse;
      }

      pending[key] = normalizeStoredResponse(parsedResponse);
    } catch {
      pending[key] = null;
    }
  }

  return pending;
}

export function updatePendingSync(station, response) {
  try {
    const normalizedResponse = normalizeStoredResponse(response);

    if (normalizedResponse) {
      localStorage.setItem(
        pendingSyncKey(station),
        JSON.stringify(normalizedResponse),
      );
    } else {
      localStorage.removeItem(pendingSyncKey(station));
    }
  } catch {
    // Ignore storage failures; retry remains available until the page reloads.
  }
}
