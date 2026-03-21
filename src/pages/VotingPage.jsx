import React from "react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  alpha,
  panelStyles,
  textStyles,
  votingTheme,
} from "../components/voting/designSystem";
import RevealFlow from "../components/voting/RevealFlow";
import SwipeCard from "../components/voting/SwipeCard";
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

const stationRail = getOrderedStationIds(SCENARIOS);
const defaultStation = stationRail[0] ?? 1;
const lastStation = stationRail[stationRail.length - 1] ?? defaultStation;

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
      accent: votingTheme.colors.moss,
      eyebrow: "Already completed",
      title: `You've already completed Station ${entryContext.currentStation}`,
      body: `You can revisit this stop or continue with Station ${entryContext.nextIncompleteStation}.`,
      actionLabel: `Continue to Station ${entryContext.nextIncompleteStation}`,
      actionStation: entryContext.nextIncompleteStation,
    };
  }

  if (entryContext.isCurrentCompleted) {
    return {
      accent: votingTheme.colors.moss,
      eyebrow: "Already completed",
      title: `Station ${entryContext.currentStation} is done`,
      body: "All stations on this device are already completed.",
      actionLabel: "",
      actionStation: null,
    };
  }

  return null;
}

export default function VotingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedStationState = parseRequestedStation(
    searchParams.get("station"),
    SCENARIOS,
  );
  const station = requestedStationState.station;
  const [choice, setChoice] = useState(() => readStoredChoice(station));
  const [liveCounts, setLiveCounts] = useState(() =>
    buildInitialCounts(SCENARIOS),
  );
  const [countsLoading, setCountsLoading] = useState(true);
  const [invalidStationNotice, setInvalidStationNotice] = useState(
    requestedStationState.invalidStation ? requestedStationState.fallbackStation : null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [storageRevision, setStorageRevision] = useState(0);
  const [submitError, setSubmitError] = useState("");
  const [countsError, setCountsError] = useState("");
  const topRef = useRef(null);
  const previousStationRef = useRef(station);
  const scenario = SCENARIOS[station];
  const entryContext = getStationEntryContext(station, SCENARIOS);
  const guidance = buildGuidance(entryContext);
  const completedStationSet = new Set(entryContext.completedStations);
  const hasPriorGap = entryContext.priorIncompleteStation !== null;
  const nextStationCta =
    entryContext.isCurrentCompleted && !hasPriorGap
      ? entryContext.nextIncompleteStation
      : null;

  useEffect(() => {
    if (!requestedStationState.invalidStation) {
      return;
    }

    setInvalidStationNotice(requestedStationState.fallbackStation);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("station", String(station));
    setSearchParams(nextParams, { replace: true });
  }, [
    requestedStationState.fallbackStation,
    requestedStationState.invalidStation,
    searchParams,
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
      .then((r) => {
        if (!r.ok) {
          throw new Error(`Failed to fetch live vote counts (${r.status}).`);
        }

        return r.json();
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
  }, [station, storageRevision]);

  useEffect(() => {
    const handleStorage = () => {
      setStorageRevision((current) => current + 1);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    if (previousStationRef.current === station) {
      return;
    }

    previousStationRef.current = station;
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [station]);

  const submitVote = async ({ station: stationId, choice: selectedChoice }) => {
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
  };

  const handleChoice = async (c) => {
    if (submitting || choice) {
      return;
    }

    setChoice(c);
    setSubmitError("");

    markStationVote(station, c);
    setStorageRevision((current) => current + 1);

    setLiveCounts((current) => {
      const updated = { ...current };
      updated[station] = { ...updated[station] };
      updated[station][c] = (updated[station][c] || 0) + 1;
      return updated;
    });

    await submitVote({ station, choice: c });
  };

  const goToStation = (s) => {
    setInvalidStationNotice(null);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("station", String(s));
    setSearchParams(nextParams);
  };

  const currentScenario = {
    ...scenario,
    votes: liveCounts ? liveCounts[station] : scenario.votes,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `radial-gradient(circle at top, ${alpha(votingTheme.colors.white, 0.35)}, transparent 28%), linear-gradient(180deg, ${votingTheme.colors.pageTop}, ${votingTheme.colors.pageBottom})`,
        fontFamily: votingTheme.fonts.body,
        padding: "14px 12px 36px",
      }}
    >
      <div
        style={{
          ...panelStyles.shell,
          position: "relative",
          maxWidth: 520,
          margin: "0 auto",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0) 22%, rgba(255,255,255,0.12) 100%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -72,
            right: -42,
            width: 188,
            height: 188,
            borderRadius: "50%",
            background: alpha(votingTheme.colors.white, 0.18),
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 180,
            left: -74,
            width: 152,
            height: 152,
            borderRadius: "50%",
            background: alpha(votingTheme.colors.clay, 0.06),
            pointerEvents: "none",
          }}
        />

        <div ref={topRef} />

        <div style={{ padding: "30px 20px 10px", position: "relative" }}>
          <div
            style={{
              textAlign: "center",
              fontFamily: votingTheme.fonts.brand,
              fontSize: 26,
              color: votingTheme.colors.clay,
              fontStyle: "italic",
              marginBottom: 14,
              lineHeight: 1.05,
            }}
          >
            The Connection Trail
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <span
              style={{
                width: 28,
                height: 1,
                background: alpha(votingTheme.colors.borderStrong, 0.9),
              }}
            />
            <div
              style={{
                ...panelStyles.chip,
                minHeight: 34,
                padding: "7px 18px",
                background: alpha(votingTheme.colors.surfaceStrong, 0.72),
                backdropFilter: "blur(6px)",
              }}
            >
              <span
                style={{
                  fontFamily: votingTheme.fonts.body,
                  fontSize: 13,
                  color: votingTheme.colors.textMuted,
                  fontWeight: 700,
                  letterSpacing: 0.25,
                }}
              >
                Station {currentScenario.stationNum} ·{" "}
                {currentScenario.location}
              </span>
            </div>
            <span
              style={{
                width: 28,
                height: 1,
                background: alpha(votingTheme.colors.borderStrong, 0.9),
              }}
            />
          </div>
        </div>

        <div style={{ padding: "0 20px 18px" }}>
          <div
            style={{
              ...panelStyles.base,
              padding: "12px 14px",
              borderRadius: votingTheme.radius.card,
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "center",
              }}
            >
              {stationRail.map((s) => {
                const isCurrent = station === s;
                const isCompleted = completedStationSet.has(s);

                return (
                  <button
                    key={s}
                    aria-label={`Go to Station ${s}`}
                    onClick={() => goToStation(s)}
                    style={{
                      flex: 1,
                      maxWidth: 110,
                      padding: "8px 6px",
                      borderRadius: 16,
                      border: `1px solid ${isCurrent ? alpha(votingTheme.colors.clay, 0.45) : alpha(votingTheme.colors.borderStrong, 0.45)}`,
                      background: isCurrent
                        ? alpha(votingTheme.colors.clay, 0.1)
                        : alpha(votingTheme.colors.surfaceStrong, 0.55),
                      cursor: "pointer",
                      transition: "all 0.25s ease",
                    }}
                  >
                    <div
                      style={{
                        height: 7,
                        borderRadius: votingTheme.radius.chip,
                        border: "none",
                        background:
                          isCurrent || isCompleted
                            ? `linear-gradient(90deg, ${votingTheme.colors.clayDark}, ${votingTheme.colors.clay})`
                            : alpha(votingTheme.colors.borderStrong, 0.35),
                        boxShadow:
                          isCurrent || isCompleted
                            ? `0 6px 14px ${alpha(votingTheme.colors.clayDark, 0.18)}`
                            : "none",
                        padding: 0,
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {invalidStationNotice !== null ? (
          <div style={{ padding: "0 20px 18px" }}>
            <div
              style={{
                ...panelStyles.base,
                padding: "12px 14px",
                borderRadius: votingTheme.radius.card,
                background: `linear-gradient(180deg, ${alpha(votingTheme.colors.surfaceStrong, 0.98)}, ${alpha(votingTheme.colors.brass, 0.1)})`,
              }}
            >
              <div
                style={{
                  ...textStyles.eyebrow,
                  color: votingTheme.colors.brass,
                  marginBottom: 6,
                }}
              >
                QR link check
              </div>
              <p
                style={{
                  ...textStyles.body,
                  fontSize: 14,
                  margin: 0,
                }}
              >
                This QR code points to an invalid station. Showing Station{" "}
                {invalidStationNotice} instead.
              </p>
            </div>
          </div>
        ) : null}

        {guidance ? (
          <div style={{ padding: "0 20px 18px" }}>
            <div
              style={{
                ...panelStyles.base,
                position: "relative",
                overflow: "hidden",
                padding: "16px 16px 14px",
                borderRadius: votingTheme.radius.card,
                background: `linear-gradient(180deg, ${alpha(votingTheme.colors.surfaceStrong, 0.98)}, ${alpha(guidance.accent, 0.08)})`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: "0 auto 0 0",
                  width: 4,
                  background: `linear-gradient(180deg, ${guidance.accent}, ${alpha(guidance.accent, 0.35)})`,
                }}
              />
              <div
                style={{
                  ...textStyles.eyebrow,
                  color: guidance.accent,
                  marginBottom: 8,
                }}
              >
                {guidance.eyebrow}
              </div>
              <div
                style={{
                  fontFamily: votingTheme.fonts.body,
                  fontSize: 17,
                  color: votingTheme.colors.text,
                  fontWeight: 700,
                  lineHeight: 1.35,
                  marginBottom: 6,
                }}
              >
                {guidance.title}
              </div>
              <p
                style={{
                  ...textStyles.body,
                  fontSize: 14,
                  margin: 0,
                }}
              >
                {guidance.body}
              </p>
              {guidance.actionStation !== null ? (
                <button
                  onClick={() => goToStation(guidance.actionStation)}
                  style={{
                    marginTop: 12,
                    minHeight: 38,
                    padding: "9px 14px",
                    borderRadius: votingTheme.radius.chip,
                    border: `1px solid ${alpha(guidance.accent, 0.24)}`,
                    background: alpha(guidance.accent, 0.12),
                    color: guidance.accent,
                    fontFamily: votingTheme.fonts.body,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {guidance.actionLabel}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        {countsError ? (
          <div style={{ padding: "0 20px 18px" }}>
            <div
              role="status"
              style={{
                ...panelStyles.base,
                padding: "12px 14px",
                borderRadius: votingTheme.radius.card,
                background: `linear-gradient(180deg, ${alpha(votingTheme.colors.surfaceStrong, 0.98)}, ${alpha(votingTheme.colors.brass, 0.1)})`,
              }}
            >
              <div
                style={{
                  ...textStyles.eyebrow,
                  color: votingTheme.colors.brass,
                  marginBottom: 6,
                }}
              >
                Live count status
              </div>
              <p
                style={{
                  ...textStyles.body,
                  fontSize: 14,
                  margin: 0,
                }}
              >
                {countsError}
              </p>
            </div>
          </div>
        ) : null}

        {submitError ? (
          <div style={{ padding: "0 20px 18px" }}>
            <div
              role="alert"
              style={{
                ...panelStyles.base,
                padding: "12px 14px",
                borderRadius: votingTheme.radius.card,
                background: `linear-gradient(180deg, ${alpha(votingTheme.colors.surfaceStrong, 0.98)}, ${alpha(votingTheme.colors.clay, 0.08)})`,
              }}
            >
              <div
                style={{
                  ...textStyles.eyebrow,
                  color: votingTheme.colors.clay,
                  marginBottom: 6,
                }}
              >
                Vote sync status
              </div>
              <p
                style={{
                  ...textStyles.body,
                  fontSize: 14,
                  margin: 0,
                }}
              >
                {submitError}
              </p>
            </div>
          </div>
        ) : null}

        {!choice ? (
          <SwipeCard scenario={currentScenario} onChoice={handleChoice} />
        ) : (
          <RevealFlow
            scenario={currentScenario}
            choice={choice}
            countsLoading={countsLoading}
          />
        )}

        {choice && nextStationCta !== null && (
          <div
            style={{
              padding: "8px 20px 0",
              animation: "fadeUp 0.6s ease-out 4.5s both",
            }}
          >
            <button
              onClick={() => goToStation(nextStationCta)}
              style={{
                width: "100%",
                padding: "18px 18px",
                background: `linear-gradient(135deg, ${votingTheme.colors.clayDark}, ${votingTheme.colors.clay})`,
                border: `1px solid ${alpha(votingTheme.colors.clayDark, 0.18)}`,
                borderRadius: 22,
                color: votingTheme.colors.white,
                fontFamily: votingTheme.fonts.body,
                fontSize: 19,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: votingTheme.shadow.button,
                letterSpacing: 0.2,
              }}
            >
              {nextStationCta === station + 1
                ? `Walk to Station ${nextStationCta} →`
                : `Continue to Station ${nextStationCta} →`}
            </button>
          </div>
        )}

        {choice &&
          station === lastStation &&
          (entryContext.isTrailComplete ? (
            <div
              style={{
                padding: "8px 20px 0",
                animation: "fadeUp 0.6s ease-out 4.5s both",
              }}
            >
              <div
                style={{
                  ...panelStyles.strong,
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: votingTheme.radius.panel,
                  padding: "30px 24px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 1,
                    borderRadius: votingTheme.radius.panel - 1,
                    border: `1px solid ${alpha(votingTheme.colors.white, 0.72)}`,
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    width: 62,
                    height: 62,
                    margin: "0 auto 14px",
                    borderRadius: 20,
                    background: `linear-gradient(180deg, ${alpha(votingTheme.colors.clay, 0.14)}, ${alpha(votingTheme.colors.brass, 0.18)})`,
                    border: `1px solid ${alpha(votingTheme.colors.borderStrong, 0.5)}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 34,
                    boxShadow: votingTheme.shadow.inset,
                  }}
                >
                  🎴
                </div>
                <div
                  style={{
                    ...textStyles.sectionTitle,
                    fontSize: 24,
                    marginBottom: 10,
                  }}
                >
                  Head to Dakota Breeze RN Lobby
                </div>
                <p
                  style={{
                    ...textStyles.body,
                    fontSize: 14,
                    margin: "0 auto",
                    maxWidth: 320,
                  }}
                >
                  Pick up your Quest Card, leave a commitment on the reflection
                  wall, and take the first step toward connection.
                </p>
              </div>
            </div>
          ) : null)}

        <div
          style={{
            textAlign: "center",
            padding: "30px 20px 18px",
            fontFamily: votingTheme.fonts.body,
            fontSize: 12,
            color: votingTheme.colors.textFaint,
            lineHeight: 1.7,
          }}
        >
          <div
            style={{
              width: 88,
              height: 1,
              margin: "0 auto 14px",
              background: alpha(votingTheme.colors.borderStrong, 0.8),
            }}
          />
          The Connection Trail — UTS2110 Happiness by Design
          <br />
          Group 3 × Dakota Breeze Residents' Network
        </div>
      </div>
    </div>
  );
}
