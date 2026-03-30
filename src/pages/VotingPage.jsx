import React, {
  Suspense,
  lazy,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

import { alpha, votingTheme } from "../components/voting/designSystem";
import RevealFlowFallback from "../components/voting/RevealFlowFallback";
import StationProgressIndicator from "../components/voting/StationProgressIndicator";
import TapCard from "../components/voting/TapCard";
import "../components/voting/voting.css";
import { VOTE_API_CONFIG_ERROR, VOTE_API_URL } from "../config";
import { SCENARIOS } from "../data/scenarios";
import {
  buildInitialCounts,
  getOrderedStationIds,
  getStationEntryContext,
  isValidChoice,
  markStationVote,
  normalizeCounts,
  parseRequestedStation,
  readStoredChoice,
  updatePendingSync,
} from "../lib/voting";
import { useLocationSearchParams } from "../lib/location";

const stationRail = getOrderedStationIds(SCENARIOS);
const lastStation = stationRail[stationRail.length - 1] ?? (stationRail[0] ?? 1);

const loadRevealFlow = () => import("../components/voting/RevealFlow");
const RevealFlow = lazy(loadRevealFlow);
let revealFlowPreloadPromise = null;

function preloadRevealFlow() {
  if (!revealFlowPreloadPromise) {
    revealFlowPreloadPromise = loadRevealFlow();
  }

  return revealFlowPreloadPromise;
}

function scheduleIdlePreload(callback) {
  if (typeof window.requestIdleCallback === "function") {
    const idleId = window.requestIdleCallback(callback, { timeout: 600 });
    return () => window.cancelIdleCallback(idleId);
  }

  const timeoutId = window.setTimeout(callback, 250);
  return () => window.clearTimeout(timeoutId);
}

function buildGuidance(entryContext) {
  if (entryContext.priorIncompleteStation !== null) {
    return {
      accent: votingTheme.colors.clay,
      eyebrow: "Complete the trail in order",
      title: `Station ${entryContext.priorIncompleteStation} is still incomplete`,
      body: `You're viewing Station ${entryContext.currentStation}, but you have not completed Station ${entryContext.priorIncompleteStation} yet.`,
      actionLabel: `Go to Station ${entryContext.priorIncompleteStation} first`,
      actionStation: entryContext.priorIncompleteStation,
    };
  }

  if (
    entryContext.isCurrentCompleted &&
    entryContext.nextIncompleteStation !== null
  ) {
    return {
      accent: votingTheme.colors.brass,
      eyebrow: "Already completed",
      title: `You've already completed Station ${entryContext.currentStation}`,
      body: `You can revisit this stop or continue with Station ${entryContext.nextIncompleteStation}.`,
      actionLabel: `Continue to Station ${entryContext.nextIncompleteStation}`,
      actionStation: entryContext.nextIncompleteStation,
    };
  }

  if (entryContext.isCurrentCompleted) {
    return {
      accent: votingTheme.colors.brass,
      eyebrow: "Already completed",
      title: `Station ${entryContext.currentStation} is done`,
      body: "All stations on this device are already completed.",
      actionLabel: "",
      actionStation: null,
    };
  }

  return null;
}

const PageNotice = memo(function PageNotice({
  role,
  eyebrow,
  body,
  tone,
  accent,
  title,
  actionLabel,
  onAction,
}) {
  if (tone === "guidance") {
    return (
      <div className="status-panel-wrap">
        <div
          className="vt-panel vt-panel--base guidance-panel"
          style={{
            "--notice-accent": accent,
            "--notice-background": `linear-gradient(180deg, ${alpha(
              votingTheme.colors.surfaceStrong,
              0.98,
            )}, ${alpha(accent, 0.08)})`,
            "--notice-bar-background": `linear-gradient(180deg, ${accent}, ${alpha(
              accent,
              0.35,
            )})`,
            "--notice-button-border": alpha(accent, 0.24),
            "--notice-button-background": alpha(accent, 0.12),
          }}
        >
          <div className="guidance-panel__bar" />
          <div className="vt-eyebrow guidance-panel__eyebrow">{eyebrow}</div>
          <div className="guidance-panel__title">{title}</div>
          <p className="vt-body guidance-panel__body">{body}</p>
          {actionLabel ? (
            <button
              type="button"
              className="guidance-panel__action"
              onClick={onAction}
            >
              {actionLabel}
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="status-panel-wrap">
      <div
        role={role}
        className={`vt-panel vt-panel--base status-panel status-panel--${tone}`}
      >
        <div className="vt-eyebrow status-panel__eyebrow">{eyebrow}</div>
        <p className="vt-body status-panel__body">{body}</p>
      </div>
    </div>
  );
});

export default function VotingPage() {
  const [searchParams, setSearchParams] = useLocationSearchParams();
  const requestedStationState = useMemo(
    () => parseRequestedStation(searchParams.get("station"), SCENARIOS),
    [searchParams],
  );
  const station = requestedStationState.station;
  const [choice, setChoice] = useState(() => readStoredChoice(station));
  const [liveCounts, setLiveCounts] = useState(() =>
    buildInitialCounts(SCENARIOS),
  );
  const [countsLoading, setCountsLoading] = useState(true);
  const [invalidStationNotice, setInvalidStationNotice] = useState(
    requestedStationState.invalidStation
      ? requestedStationState.fallbackStation
      : null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [countsError, setCountsError] = useState("");
  const [, bumpVoteStateVersion] = useReducer(
    (value) => value + 1,
    0,
  );
  const topRef = useRef(null);
  const previousStationRef = useRef(station);
  const scenario = useMemo(() => SCENARIOS[station], [station]);
  const entryContext = getStationEntryContext(station, SCENARIOS);
  const guidance = buildGuidance(entryContext);
  const hasPriorGap = entryContext.priorIncompleteStation !== null;
  const nextStationCta =
    entryContext.isCurrentCompleted && !hasPriorGap
      ? entryContext.nextIncompleteStation
      : null;
  const nextStationScenario =
    nextStationCta !== null ? SCENARIOS[nextStationCta] ?? null : null;
  const showGuidanceAction =
    guidance?.actionStation !== null && nextStationCta === null;
  const currentScenario = useMemo(
    () => ({
      ...scenario,
      votes: liveCounts?.[station] ?? scenario.votes,
    }),
    [liveCounts, scenario, station],
  );

  useEffect(() => {
    if (!requestedStationState.invalidStation) {
      return;
    }

    setInvalidStationNotice(requestedStationState.fallbackStation);
    setChoice(readStoredChoice(station));
    setSearchParams(
      (currentParams) => {
        const nextParams = new URLSearchParams(currentParams);
        nextParams.set("station", String(station));
        return nextParams;
      },
      { replace: true },
    );
  }, [
    requestedStationState.fallbackStation,
    requestedStationState.invalidStation,
    setSearchParams,
    station,
  ]);

  useEffect(() => {
    if (!VOTE_API_URL) {
      setCountsError(
        VOTE_API_CONFIG_ERROR ||
          "Voting API is not configured. Live vote sync is disabled.",
      );
      setCountsLoading(false);
      return undefined;
    }

    const controller = new AbortController();

    fetch(VOTE_API_URL, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch live vote counts (${response.status}).`);
        }

        return response.json();
      })
      .then((data) => {
        setLiveCounts(normalizeCounts(data, SCENARIOS));
        setCountsError("");
        setCountsLoading(false);
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          return;
        }

        setLiveCounts(buildInitialCounts(SCENARIOS));
        setCountsError(
          "Live vote counts could not be loaded. Showing the last bundled counts.",
        );
        setCountsLoading(false);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    setChoice(readStoredChoice(station));
  }, [station]);

  useEffect(() => {
    const handleStorage = (event) => {
      // Synthetic StorageEvents in tests may omit storageArea; accept them
      // as long as the key matches this feature's localStorage namespace.
      if (event.storageArea && event.storageArea !== window.localStorage) {
        return;
      }

      if (event.key !== null && !event.key.startsWith("voted_station_")) {
        return;
      }

      setChoice(readStoredChoice(station));
      bumpVoteStateVersion();
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [station]);

  useEffect(() => {
    if (previousStationRef.current === station) {
      return;
    }

    previousStationRef.current = station;
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [station]);

  useEffect(() => scheduleIdlePreload(() => preloadRevealFlow()), []);

  const goToStation = useCallback(
    (nextStation) => {
      setInvalidStationNotice(null);
      setChoice(readStoredChoice(nextStation));
      setSearchParams((currentParams) => {
        const nextParams = new URLSearchParams(currentParams);
        nextParams.set("station", String(nextStation));
        return nextParams;
      });
    },
    [setSearchParams],
  );
  const nextStepCard =
    choice && nextStationCta !== null
      ? {
          eyebrow:
            nextStationCta === station + 1 ? "Next stop" : "Continue the trail",
          title: `Head to Station ${nextStationCta}`,
          body: nextStationScenario
            ? `Your next reflection is at ${nextStationScenario.location}.`
            : "Open the next station to continue your Connection Trail journey.",
          actionLabel:
            nextStationCta === station + 1
              ? `Go to Station ${nextStationCta}`
              : `Continue to Station ${nextStationCta}`,
          onAction: () => goToStation(nextStationCta),
        }
      : null;

  const submitVote = useCallback(async ({ station: stationId, choice: selectedChoice }) => {
    if (!isValidChoice(selectedChoice)) {
      setSubmitError("Invalid vote selection.");
      return false;
    }

    if (!VOTE_API_URL) {
      const message =
        VOTE_API_CONFIG_ERROR ||
        "Voting API is not configured. Your choice is saved only on this device.";
      updatePendingSync(stationId, selectedChoice);
      setSubmitError(message);
      return false;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch(VOTE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({ station: stationId, choice: selectedChoice }),
      });

      const rawResponse = await response.text();
      let payload = null;

      if (rawResponse) {
        try {
          payload = JSON.parse(rawResponse);
        } catch {
          payload = null;
        }
      }

      if (!response.ok) {
        throw new Error(`Vote sync failed (${response.status}).`);
      }

      if (payload?.success === false) {
        throw new Error("Vote sync failed.");
      }

      updatePendingSync(stationId, null);
      return true;
    } catch {
      updatePendingSync(stationId, selectedChoice);
      setSubmitError(
        "Your choice is saved on this device, but the vote server did not confirm it. Retry to sync it.",
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const handleChoice = useCallback(
    async (selectedChoice) => {
      if (submitting || choice) {
        return;
      }

      preloadRevealFlow();
      setChoice(selectedChoice);
      setSubmitError("");

      markStationVote(station, selectedChoice);

      setLiveCounts((current) => {
        const updated = { ...current };
        updated[station] = { ...updated[station] };
        updated[station][selectedChoice] =
          (updated[station][selectedChoice] || 0) + 1;
        return updated;
      });

      await submitVote({ station, choice: selectedChoice });
    },
    [choice, station, submitVote, submitting],
  );

  const finalCardVisible =
    choice && station === lastStation && entryContext.isTrailComplete;
  const completionStepCard = finalCardVisible
    ? {
        eyebrow: "Final stop",
        icon: "🎴",
        title: "Head to Dakota Breeze Residential Network Lobby",
        body: "Finish the trail in person, then follow the three steps below.",
        actions: [
          "Collect your Quest Card",
          "Leave a note on the reflection wall",
          "Take one small step toward connection today",
        ],
        locationLabel: "Dakota Breeze Residential Network Lobby",
      }
    : null;

  return (
    <div className="voting-app">
      <div className="voting-shell">
        <div className="voting-shell__glow" />

        <div ref={topRef} />

        <div className="voting-header">
          <div className="voting-brand">The Connection Trail</div>

          <div className="voting-station-wrap">
            <span className="voting-station-line" />
            <div className="vt-chip voting-station-chip">
              <span>
                Station {currentScenario.stationNum} · {currentScenario.location}
              </span>
            </div>
            <span className="voting-station-line" />
          </div>
        </div>

        <div className="voting-progress">
          <div className="vt-panel vt-panel--base voting-progress__card">
            <StationProgressIndicator
              stationIds={stationRail}
              currentStation={station}
              completedStations={entryContext.completedStations}
            />
          </div>
        </div>

        {invalidStationNotice !== null ? (
          <PageNotice
            tone="brass"
            eyebrow="QR link check"
            body={`This QR code points to an invalid station. Showing Station ${invalidStationNotice} instead.`}
          />
        ) : null}

        {guidance ? (
          <PageNotice
            tone="guidance"
            accent={guidance.accent}
            eyebrow={guidance.eyebrow}
            title={guidance.title}
            body={guidance.body}
            actionLabel={showGuidanceAction ? guidance.actionLabel : ""}
            onAction={
              showGuidanceAction
                ? () => goToStation(guidance.actionStation)
                : undefined
            }
          />
        ) : null}

        {countsError ? (
          <PageNotice
            role="status"
            tone="brass"
            eyebrow="Live count status"
            body={countsError}
          />
        ) : null}

        {submitError ? (
          <PageNotice
            role="alert"
            tone="clay"
            eyebrow="Vote sync status"
            body={submitError}
          />
        ) : null}

        {!choice ? (
          <TapCard
            scenario={scenario}
            onChoice={handleChoice}
            onChoiceIntent={preloadRevealFlow}
          />
        ) : (
          <Suspense
            fallback={<RevealFlowFallback scenario={currentScenario} choice={choice} />}
          >
            <RevealFlow
              scenario={currentScenario}
              choice={choice}
              countsLoading={countsLoading}
              nextStep={nextStepCard}
              completionStep={completionStepCard}
            />
          </Suspense>
        )}

        <div className="voting-footer">
          <div className="voting-footer__line" />
          The Connection Trail — UTS2110 Happiness by Design
          <br />
          Group 3 × Dakota Breeze Residents' Network
        </div>
      </div>
    </div>
  );
}
