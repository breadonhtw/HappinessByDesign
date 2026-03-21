import { useEffect, useRef, useState } from "react";

import RevealFlow from "../components/voting/RevealFlow";
import SwipeCard from "../components/voting/SwipeCard";
import { VOTE_API_CONFIG_ERROR, VOTE_API_URL } from "../config";
import { SCENARIOS } from "../data/scenarios";
import {
  buildInitialCounts,
  isValidChoice,
  markStationVote,
  normalizeCounts,
  readPendingSyncMap,
  readStoredChoice,
  updatePendingSync,
} from "../lib/voting";

export default function VotingPage() {
  const [station, setStation] = useState(1);
  const [choice, setChoice] = useState(null);
  const [liveCounts, setLiveCounts] = useState(() => buildInitialCounts(SCENARIOS));
  const [countsLoading, setCountsLoading] = useState(true);
  const [pendingSyncs, setPendingSyncs] = useState(() =>
    readPendingSyncMap(SCENARIOS),
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [countsError, setCountsError] = useState("");
  const scenario = SCENARIOS[station];
  const topRef = useRef(null);

  // Read station from URL param on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = parseInt(params.get("station"));
    if (s >= 1 && s <= 3) setStation(s);
  }, []);

  // Fetch live vote counts on mount
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

  // On first load, if already voted, restore that state
  useEffect(() => {
    setChoice(readStoredChoice(station));
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
      setPendingSyncs((current) => ({ ...current, [stationId]: selectedChoice }));
      setSubmitError(message);
      return false;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch(VOTE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ station: stationId, choice: selectedChoice }),
      });

      if (!response.ok) {
        throw new Error(`Vote sync failed (${response.status}).`);
      }

      updatePendingSync(stationId, null);
      setPendingSyncs((current) => ({ ...current, [stationId]: null }));
      return true;
    } catch {
      updatePendingSync(stationId, selectedChoice);
      setPendingSyncs((current) => ({ ...current, [stationId]: selectedChoice }));
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

    // Optimistically update local counts
    setLiveCounts((current) => {
      const updated = { ...current };
      updated[station] = { ...updated[station] };
      updated[station][c] = (updated[station][c] || 0) + 1;
      return updated;
    });

    await submitVote({ station, choice: c });
  };

  const goToStation = (s) => {
    setStation(s);
    setSubmitError("");
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleRetrySync = async () => {
    const pendingChoice = pendingSyncs[station];

    if (!pendingChoice) {
      return;
    }

    setSubmitError("");
    const synced = await submitVote({ station, choice: pendingChoice });

    if (!synced) {
      return;
    }

    markStationVote(station, pendingChoice);
  };

  // Build scenario with live counts
  const currentScenario = {
    ...scenario,
    votes: liveCounts ? liveCounts[station] : scenario.votes,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5ead6",
        fontFamily: "sans-serif",
        maxWidth: 480,
        margin: "0 auto",
        paddingBottom: 40,
      }}
    >
      <div ref={topRef} />

      {/* Header */}
      <div style={{ padding: "28px 20px 6px", textAlign: "center" }}>
        <div
          style={{
            fontFamily: "'Sigmar', cursive",
            fontSize: 22,
            color: "#c45a3c",
            fontStyle: "italic",
            marginBottom: 2,
          }}
        >
          The Connection Trail
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontFamily: "'Chillax', sans-serif",
            fontSize: 14,
            color: "#8b7355",
            fontWeight: 600,
          }}
        >
          <span style={{ width: 24, height: 1, background: "#d4c4a8" }} />
          Station {currentScenario.stationNum} — {currentScenario.location}
          <span style={{ width: 24, height: 1, background: "#d4c4a8" }} />
        </div>
      </div>

      {/* Progress bar */}
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: "14px 40px 20px",
          justifyContent: "center",
        }}
      >
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            onClick={() => goToStation(s)}
            style={{
              flex: 1,
              maxWidth: 80,
              height: 6,
              borderRadius: 3,
              border: "none",
              background: station >= s ? "#c45a3c" : "#e8ddd0",
              cursor: "pointer",
              transition: "background 0.3s",
              padding: 0,
            }}
          />
        ))}
      </div>

      {(countsError || submitError || pendingSyncs[station]) && (
        <div style={{ padding: "0 20px 16px" }}>
          <div
            style={{
              background: "#fffbf5",
              borderRadius: 18,
              border: "2px solid #e8ddd0",
              padding: "14px 16px",
            }}
          >
            {countsError && (
              <p
                style={{
                  margin: "0 0 8px",
                  fontFamily: "'Chillax', sans-serif",
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "#8b7355",
                  fontWeight: 600,
                }}
              >
                {countsError}
              </p>
            )}
            {(submitError || pendingSyncs[station]) && (
              <p
                style={{
                  margin: 0,
                  fontFamily: "'Chillax', sans-serif",
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "#c45a3c",
                  fontWeight: 700,
                }}
              >
                {submitError ||
                  "This vote is waiting to sync with the server."}
              </p>
            )}
            {pendingSyncs[station] && (
              <button
                onClick={handleRetrySync}
                disabled={submitting}
                style={{
                  marginTop: 12,
                  border: "none",
                  borderRadius: 12,
                  background: submitting ? "#d9cdbf" : "#c45a3c",
                  color: "#fff",
                  padding: "10px 14px",
                  fontFamily: "'Chillax', sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                {submitting ? "Retrying..." : "Retry vote sync"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {!choice ? (
        <SwipeCard scenario={currentScenario} onChoice={handleChoice} />
      ) : (
        <RevealFlow
          scenario={currentScenario}
          choice={choice}
          countsLoading={countsLoading}
        />
      )}

      {/* Next station button */}
      {choice && station < 3 && (
        <div
          style={{
            padding: "8px 20px",
            animation: "fadeUp 0.6s ease-out 4.5s both",
          }}
        >
          <button
            onClick={() => goToStation(station + 1)}
            style={{
              width: "100%",
              padding: "16px",
              background: "linear-gradient(135deg, #c45a3c, #d4694e)",
              border: "none",
              borderRadius: 18,
              color: "#fff",
              fontFamily: "'Chillax', sans-serif",
              fontSize: 20,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(196,90,60,0.3)",
              letterSpacing: 0.5,
            }}
          >
            Walk to Station {station + 1} →
          </button>
        </div>
      )}

      {/* Final station CTA */}
      {choice && station === 3 && (
        <div
          style={{
            padding: "8px 20px",
            animation: "fadeUp 0.6s ease-out 4.5s both",
          }}
        >
          <div
            style={{
              background: "#fffbf5",
              borderRadius: 24,
              padding: "28px 24px",
              border: "2px solid #e8ddd0",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 10 }}>🎴</div>
            <div
              style={{
                fontFamily: "'Sigmar', cursive",
                fontSize: 22,
                color: "#4a3f35",
                fontStyle: "italic",
                marginBottom: 8,
                lineHeight: 1.2,
              }}
            >
              Head to Dakota Breeze RN Lobby
            </div>
            <p
              style={{
                fontFamily: "'Chillax', sans-serif",
                fontSize: 14,
                color: "#6b5e4f",
                lineHeight: 1.7,
                margin: "0 0 4px",
              }}
            >
              Pick up your Quest Card, leave a commitment on the reflection
              wall, and take the first step toward connection.
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          padding: "28px 20px 16px",
          fontFamily: "'Chillax', sans-serif",
          fontSize: 12,
          color: "#c4b49e",
          lineHeight: 1.7,
        }}
      >
        The Connection Trail — UTS2110 Happiness by Design
        <br />
        Group 3 × Dakota Breeze Residents' Network
      </div>
    </div>
  );
}
