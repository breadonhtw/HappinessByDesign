import { useEffect, useState } from "react"

import {
  alpha,
  panelStyles,
  textStyles,
  votingTheme,
} from "./designSystem"
import AnimatedBar from "./AnimatedBar"
import EvidenceCard from "./EvidenceCard"

function LoadingBlock({ width = "100%", height = 16, borderRadius = 10 }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: `linear-gradient(90deg, ${votingTheme.colors.surfaceMuted}, ${alpha(
          votingTheme.colors.surfaceStrong,
          0.95,
        )}, ${votingTheme.colors.surfaceMuted})`,
        border: `1px solid ${alpha(votingTheme.colors.borderStrong, 0.28)}`,
        animation: "pulse 1.6s ease-in-out infinite",
      }}
    />
  )
}

export default function RevealFlow({ scenario, choice, countsLoading }) {
  const [phase, setPhase] = useState(0)
  const [openA, setOpenA] = useState(false)
  const [openB, setOpenB] = useState(false)

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 2600),
      setTimeout(() => setPhase(4), 4000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const total = (scenario.votes.a || 0) + (scenario.votes.b || 0)
  const pctA =
    total > 0 ? Math.round(((scenario.votes.a || 0) / total) * 100) : 50
  const pctB = total > 0 ? 100 - pctA : 50
  const chosen = choice === "a" ? scenario.optionA : scenario.optionB
  const chosenCount = Math.max(
    0,
    (choice === "a" ? scenario.votes.a || 0 : scenario.votes.b || 0) - 1,
  )

  const phases = [
    {
      visible: phase >= 1,
      delay: "0s",
    },
    {
      visible: phase >= 2,
      delay: "0.15s",
    },
    {
      visible: phase >= 3,
      delay: "0s",
    },
    {
      visible: phase >= 4,
      delay: "0s",
    },
  ]

  return (
    <div style={{ padding: "0 20px 8px" }}>
      <div
        style={{
          opacity: phases[0].visible ? 1 : 0,
          transform: `translateY(${phases[0].visible ? 0 : 30}px)`,
          transition: `all 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) ${phases[0].delay}`,
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            ...panelStyles.strong,
            position: "relative",
            overflow: "hidden",
            padding: "28px 18px",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -40,
              right: -28,
              width: 130,
              height: 130,
              borderRadius: "50%",
              background: alpha(chosen.color, 0.12),
            }}
          />
          <div
            style={{
              width: 66,
              height: 66,
              margin: "0 auto 12px",
              borderRadius: 22,
              background: `linear-gradient(180deg, ${alpha(
                chosen.color,
                0.18,
              )}, ${alpha(chosen.color, 0.1)})`,
              border: `1px solid ${alpha(chosen.color, 0.28)}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              boxShadow: votingTheme.shadow.inset,
            }}
          >
            {chosen.emoji}
          </div>
          <div
            style={{
              ...textStyles.sectionTitle,
              fontSize: 26,
              marginBottom: 8,
            }}
          >
            You chose to {chosen.label.toLowerCase()}
          </div>
          <div
            style={{
              fontFamily: votingTheme.fonts.body,
              fontSize: 15,
              color: chosen.color,
              fontWeight: 700,
            }}
          >
            {countsLoading ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 4,
                }}
              >
                <LoadingBlock width={228} height={22} borderRadius={999} />
              </div>
            ) : (
              `You and ${chosenCount} others made this choice`
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          opacity: phases[1].visible ? 1 : 0,
          transform: `translateY(${phases[1].visible ? 0 : 30}px)`,
          transition: `all 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) ${phases[1].delay}`,
          marginBottom: 24,
        }}
      >
        <div style={{ ...panelStyles.base, padding: "22px 18px 18px" }}>
          <div
            style={{
              ...textStyles.sectionTitle,
              fontSize: 20,
              textAlign: "center",
              marginBottom: 18,
            }}
          >
            How everyone voted
          </div>

          {countsLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[scenario.optionA, scenario.optionB].map((option) => (
                <div
                  key={option.label}
                  style={{
                    ...panelStyles.inset,
                    padding: "14px 14px 12px",
                    background: alpha(votingTheme.colors.surfaceStrong, 0.72),
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{option.emoji}</span>
                      <span
                        style={{
                          fontFamily: votingTheme.fonts.body,
                          fontSize: 15,
                          color: option.color,
                          fontWeight: 700,
                        }}
                      >
                        {option.label}
                      </span>
                    </div>
                    <LoadingBlock width={92} height={18} borderRadius={999} />
                  </div>
                  <LoadingBlock width="100%" height={42} borderRadius={20} />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div
                style={{
                  ...panelStyles.inset,
                  padding: "14px 14px 12px",
                  marginBottom: 14,
                  background: alpha(votingTheme.colors.surfaceStrong, 0.72),
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{scenario.optionA.emoji}</span>
                    <span
                      style={{
                        fontFamily: votingTheme.fonts.body,
                        fontSize: 15,
                        color: scenario.optionA.color,
                        fontWeight: 700,
                      }}
                    >
                      {scenario.optionA.label}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: votingTheme.fonts.body,
                      fontSize: 13,
                      color: votingTheme.colors.textMuted,
                      fontWeight: 700,
                    }}
                  >
                    {scenario.votes.a} votes
                  </span>
                </div>
                {phase >= 2 && (
                  <AnimatedBar
                    percentage={pctA}
                    color={scenario.optionA.color}
                    delay={300}
                  />
                )}
              </div>

              <div
                style={{
                  ...panelStyles.inset,
                  padding: "14px 14px 12px",
                  background: alpha(votingTheme.colors.surfaceStrong, 0.72),
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                    gap: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{scenario.optionB.emoji}</span>
                    <span
                      style={{
                        fontFamily: votingTheme.fonts.body,
                        fontSize: 15,
                        color: scenario.optionB.color,
                        fontWeight: 700,
                      }}
                    >
                      {scenario.optionB.label}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: votingTheme.fonts.body,
                      fontSize: 13,
                      color: votingTheme.colors.textMuted,
                      fontWeight: 700,
                    }}
                  >
                    {scenario.votes.b} votes
                  </span>
                </div>
                {phase >= 2 && (
                  <AnimatedBar
                    percentage={pctB}
                    color={scenario.optionB.color}
                    delay={600}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div
        style={{
          opacity: phases[2].visible ? 1 : 0,
          transform: `translateY(${phases[2].visible ? 0 : 30}px)`,
          transition: "all 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)",
          marginBottom: 24,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div
            style={{
              ...textStyles.sectionTitle,
              fontSize: 21,
              marginBottom: 6,
            }}
          >
            What does the research say?
          </div>
          <div
            style={{
              fontFamily: votingTheme.fonts.body,
              fontSize: 13,
              color: votingTheme.colors.textSoft,
              fontWeight: 700,
            }}
          >
            Tap each card to reveal the evidence
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <EvidenceCard
            option={scenario.optionA}
            evidence={scenario.evidenceA}
            isOpen={openA}
            onToggle={() => setOpenA(!openA)}
          />
          <EvidenceCard
            option={scenario.optionB}
            evidence={scenario.evidenceB}
            isOpen={openB}
            onToggle={() => setOpenB(!openB)}
          />
        </div>
      </div>

      <div
        style={{
          opacity: phases[3].visible ? 1 : 0,
          transform: `translateY(${phases[3].visible ? 0 : 30}px)`,
          transition: "all 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            ...panelStyles.strong,
            position: "relative",
            overflow: "hidden",
            padding: "24px 22px",
            borderStyle: "dashed",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 116,
              height: 116,
              borderRadius: "50%",
              background: alpha(votingTheme.colors.clay, 0.08),
            }}
          />
          <div
            style={{
              ...panelStyles.chip,
              display: "inline-flex",
              padding: "5px 12px",
              marginBottom: 10,
              background: alpha(votingTheme.colors.brass, 0.12),
            }}
          >
            <span style={{ ...textStyles.eyebrow, color: votingTheme.colors.textSoft }}>
              💡 Did you know?
            </span>
          </div>
          <div
            style={{
              ...textStyles.sectionTitle,
              fontSize: 24,
              color: votingTheme.colors.clay,
              marginBottom: 10,
            }}
          >
            This is called {scenario.bias.name}
          </div>
          <p
            style={{
              ...textStyles.body,
              fontSize: 14,
              color: votingTheme.colors.textMuted,
              margin: "0 0 12px",
            }}
          >
            {scenario.bias.description}
          </p>
          <div
            style={{
              ...panelStyles.chip,
              display: "inline-flex",
              padding: "5px 13px",
              background: alpha(votingTheme.colors.surfaceSoft, 0.92),
            }}
          >
            <span
              style={{
                fontFamily: votingTheme.fonts.body,
                fontSize: 12,
                color: votingTheme.colors.textMuted,
                fontWeight: 700,
              }}
            >
              — {scenario.bias.source}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
