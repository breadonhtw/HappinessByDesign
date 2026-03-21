import { useEffect, useRef, useState } from "react"

import {
  alpha,
  panelStyles,
  textStyles,
  votingTheme,
} from "../components/voting/designSystem"
import RevealFlow from "../components/voting/RevealFlow"
import SwipeCard from "../components/voting/SwipeCard"
import { VOTE_API_CONFIG_ERROR, VOTE_API_URL } from "../config"
import { SCENARIOS } from "../data/scenarios"
import {
  buildInitialCounts,
  isValidChoice,
  markStationVote,
  normalizeCounts,
  readPendingSyncMap,
  readStoredChoice,
  updatePendingSync,
} from "../lib/voting"

const stationRail = [1, 2, 3]

export default function VotingPage() {
  const [station, setStation] = useState(1)
  const [choice, setChoice] = useState(null)
  const [liveCounts, setLiveCounts] = useState(() => buildInitialCounts(SCENARIOS))
  const [countsLoading, setCountsLoading] = useState(true)
  const [pendingSyncs, setPendingSyncs] = useState(() =>
    readPendingSyncMap(SCENARIOS),
  )
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [countsError, setCountsError] = useState("")
  const scenario = SCENARIOS[station]
  const topRef = useRef(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const s = parseInt(params.get("station"))
    if (s >= 1 && s <= 3) setStation(s)
  }, [])

  useEffect(() => {
    if (!VOTE_API_URL) {
      setCountsError(
        VOTE_API_CONFIG_ERROR ||
          "Voting API is not configured. Live vote sync is disabled.",
      )
      setCountsLoading(false)
      return undefined
    }

    const controller = new AbortController()

    fetch(VOTE_API_URL, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) {
          throw new Error(`Failed to fetch live vote counts (${r.status}).`)
        }

        return r.json()
      })
      .then((data) => {
        setLiveCounts(normalizeCounts(data, SCENARIOS))
        setCountsError("")
        setCountsLoading(false)
      })
      .catch((error) => {
        if (error.name === "AbortError") {
          return
        }

        setLiveCounts(buildInitialCounts(SCENARIOS))
        setCountsError(
          "Live vote counts could not be loaded. Showing the last bundled counts.",
        )
        setCountsLoading(false)
      })

    return () => controller.abort()
  }, [])

  useEffect(() => {
    setChoice(readStoredChoice(station))
  }, [station])

  const submitVote = async ({ station: stationId, choice: selectedChoice }) => {
    if (!isValidChoice(selectedChoice)) {
      setSubmitError("Invalid vote selection.")
      return false
    }

    if (!VOTE_API_URL) {
      const message =
        VOTE_API_CONFIG_ERROR ||
        "Voting API is not configured. Your choice is saved only on this device."
      updatePendingSync(stationId, selectedChoice)
      setPendingSyncs((current) => ({ ...current, [stationId]: selectedChoice }))
      setSubmitError(message)
      return false
    }

    setSubmitting(true)
    setSubmitError("")

    try {
      const response = await fetch(VOTE_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ station: stationId, choice: selectedChoice }),
      })

      if (!response.ok) {
        throw new Error(`Vote sync failed (${response.status}).`)
      }

      updatePendingSync(stationId, null)
      setPendingSyncs((current) => ({ ...current, [stationId]: null }))
      return true
    } catch {
      updatePendingSync(stationId, selectedChoice)
      setPendingSyncs((current) => ({ ...current, [stationId]: selectedChoice }))
      setSubmitError(
        "Your choice is saved on this device, but the vote server did not confirm it. Retry to sync it.",
      )
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const handleChoice = async (c) => {
    if (submitting || choice) {
      return
    }

    setChoice(c)
    setSubmitError("")

    markStationVote(station, c)

    setLiveCounts((current) => {
      const updated = { ...current }
      updated[station] = { ...updated[station] }
      updated[station][c] = (updated[station][c] || 0) + 1
      return updated
    })

    await submitVote({ station, choice: c })
  }

  const goToStation = (s) => {
    setStation(s)
    setSubmitError("")
    topRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleRetrySync = async () => {
    const pendingChoice = pendingSyncs[station]

    if (!pendingChoice) {
      return
    }

    setSubmitError("")
    const synced = await submitVote({ station, choice: pendingChoice })

    if (!synced) {
      return
    }

    markStationVote(station, pendingChoice)
  }

  const currentScenario = {
    ...scenario,
    votes: liveCounts ? liveCounts[station] : scenario.votes,
  }

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
                Station {currentScenario.stationNum} · {currentScenario.location}
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
                const isCurrent = station === s
                const isPast = station > s

                return (
                  <button
                    key={s}
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
                          isCurrent || isPast
                            ? `linear-gradient(90deg, ${votingTheme.colors.clayDark}, ${votingTheme.colors.clay})`
                            : alpha(votingTheme.colors.borderStrong, 0.35),
                        boxShadow:
                          isCurrent || isPast
                            ? `0 6px 14px ${alpha(votingTheme.colors.clayDark, 0.18)}`
                            : "none",
                        padding: 0,
                      }}
                    />
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {(countsError || submitError || pendingSyncs[station]) && (
          <div style={{ padding: "0 20px 16px" }}>
            <div
              style={{
                ...panelStyles.base,
                position: "relative",
                overflow: "hidden",
                padding: "16px 16px 16px 18px",
                borderRadius: votingTheme.radius.card,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 5,
                  background: `linear-gradient(180deg, ${votingTheme.colors.brass}, ${votingTheme.colors.clay})`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: -34,
                  right: -22,
                  width: 104,
                  height: 104,
                  borderRadius: "50%",
                  background: alpha(votingTheme.colors.clay, 0.06),
                }}
              />
              {countsError && (
                <p
                  style={{
                    ...textStyles.body,
                    margin: "0 0 10px",
                    fontSize: 13,
                    fontWeight: 600,
                    color: votingTheme.colors.textMuted,
                  }}
                >
                  {countsError}
                </p>
              )}
              {(submitError || pendingSyncs[station]) && (
                <p
                  style={{
                    ...textStyles.body,
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 700,
                    color: votingTheme.colors.clay,
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
                    marginTop: 14,
                    border: `1px solid ${alpha(votingTheme.colors.clayDark, 0.18)}`,
                    borderRadius: 16,
                    background: submitting
                      ? alpha(votingTheme.colors.borderStrong, 0.55)
                      : `linear-gradient(135deg, ${votingTheme.colors.clayDark}, ${votingTheme.colors.clay})`,
                    color: votingTheme.colors.white,
                    padding: "11px 16px",
                    fontFamily: votingTheme.fonts.body,
                    fontSize: 13,
                    fontWeight: 700,
                    boxShadow: submitting ? "none" : votingTheme.shadow.button,
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                >
                  {submitting ? "Retrying..." : "Retry vote sync"}
                </button>
              )}
            </div>
          </div>
        )}

        {!choice ? (
          <SwipeCard scenario={currentScenario} onChoice={handleChoice} />
        ) : (
          <RevealFlow
            scenario={currentScenario}
            choice={choice}
            countsLoading={countsLoading}
          />
        )}

        {choice && station < 3 && (
          <div
            style={{
              padding: "8px 20px 0",
              animation: "fadeUp 0.6s ease-out 4.5s both",
            }}
          >
            <button
              onClick={() => goToStation(station + 1)}
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
              Walk to Station {station + 1} →
            </button>
          </div>
        )}

        {choice && station === 3 && (
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
        )}

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
  )
}
