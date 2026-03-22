import React from "react"
import { useEffect, useState } from "react"

import { alpha, panelStyles, votingTheme } from "./designSystem"

function StatBlock({ align = "left", option, votes, percentage }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        textAlign: align,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: align === "right" ? "flex-end" : "flex-start",
          gap: 8,
          marginBottom: 5,
        }}
      >
        {align === "right" ? null : <span style={{ fontSize: 18 }}>{option.emoji}</span>}
        <span
          style={{
            fontFamily: votingTheme.fonts.body,
            fontSize: 14,
            color: option.color,
            fontWeight: 700,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {option.label}
        </span>
        {align === "right" ? <span style={{ fontSize: 18 }}>{option.emoji}</span> : null}
      </div>
      <div
        style={{
          fontFamily: votingTheme.fonts.display,
          fontSize: 22,
          fontStyle: "italic",
          lineHeight: 1,
          color: votingTheme.colors.text,
          marginBottom: 3,
        }}
      >
        {percentage}%
      </div>
      <div
        style={{
          fontFamily: votingTheme.fonts.body,
          fontSize: 12,
          fontWeight: 700,
          color: votingTheme.colors.textSoft,
        }}
      >
        {votes} votes
      </div>
    </div>
  )
}

export function SplitVoteBarSkeleton() {
  return (
    <div
      data-testid="split-vote-bar-skeleton"
      style={{
        ...panelStyles.inset,
        padding: "16px 14px 14px",
        background: alpha(votingTheme.colors.surfaceStrong, 0.74),
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 14,
        }}
      >
        {[0, 1].map((index) => (
          <div key={index} style={{ flex: 1 }}>
            <div
              style={{
                width: "72%",
                height: 14,
                marginLeft: index === 1 ? "auto" : 0,
                marginBottom: 8,
                borderRadius: 999,
                background: `linear-gradient(90deg, ${votingTheme.colors.surfaceMuted}, ${alpha(
                  votingTheme.colors.surfaceStrong,
                  0.95,
                )}, ${votingTheme.colors.surfaceMuted})`,
                animation: "pulse 1.6s ease-in-out infinite",
              }}
            />
            <div
              style={{
                width: 52,
                height: 18,
                marginLeft: index === 1 ? "auto" : 0,
                marginBottom: 6,
                borderRadius: 999,
                background: `linear-gradient(90deg, ${votingTheme.colors.surfaceMuted}, ${alpha(
                  votingTheme.colors.surfaceStrong,
                  0.95,
                )}, ${votingTheme.colors.surfaceMuted})`,
                animation: "pulse 1.6s ease-in-out infinite",
              }}
            />
            <div
              style={{
                width: 64,
                height: 12,
                marginLeft: index === 1 ? "auto" : 0,
                borderRadius: 999,
                background: `linear-gradient(90deg, ${votingTheme.colors.surfaceMuted}, ${alpha(
                  votingTheme.colors.surfaceStrong,
                  0.95,
                )}, ${votingTheme.colors.surfaceMuted})`,
                animation: "pulse 1.6s ease-in-out infinite",
              }}
            />
          </div>
        ))}
      </div>

      <div
        style={{
          position: "relative",
          height: 52,
          borderRadius: 22,
          overflow: "hidden",
          background: `linear-gradient(180deg, ${alpha(
            votingTheme.colors.surfaceStrong,
            0.96,
          )}, ${votingTheme.colors.surfaceSoft})`,
          border: `1px solid ${alpha(votingTheme.colors.borderStrong, 0.35)}`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.14), rgba(255,255,255,0) 35%, rgba(255,255,255,0.18))",
            animation: "pulse 1.6s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  )
}

export default function SplitVoteBar({
  optionA,
  optionB,
  votesA,
  votesB,
  pctA,
  pctB,
  choice,
}) {
  const [displayPctA, setDisplayPctA] = useState(0)
  const [displayPctB, setDisplayPctB] = useState(0)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDisplayPctA(pctA)
      setDisplayPctB(pctB)
    }, 80)

    return () => window.clearTimeout(timer)
  }, [pctA, pctB])

  const selectedCenter =
    choice === "a"
      ? Math.max(12, displayPctA / 2)
      : Math.min(88, 100 - displayPctB / 2)

  const selectedColor = choice === "a" ? optionA.color : optionB.color

  return (
    <div
      data-testid="split-vote-bar"
      style={{
        ...panelStyles.inset,
        padding: "16px 14px 14px",
        background: alpha(votingTheme.colors.surfaceStrong, 0.74),
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <StatBlock option={optionA} votes={votesA} percentage={pctA} />
        <StatBlock align="right" option={optionB} votes={votesB} percentage={pctB} />
      </div>

      <div style={{ position: "relative", paddingTop: 28 }}>
        <div
          data-testid="selected-choice-marker"
          data-choice={choice}
          style={{
            position: "absolute",
            top: 0,
            left: `calc(${selectedCenter}% - 42px)`,
            minWidth: 84,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              padding: "5px 10px",
              borderRadius: 999,
              background: `linear-gradient(135deg, ${selectedColor}, ${alpha(
                selectedColor,
                0.84,
              )})`,
              color: votingTheme.colors.white,
              fontFamily: votingTheme.fonts.body,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 0.4,
              boxShadow: `0 10px 22px ${alpha(selectedColor, 0.2)}`,
            }}
          >
            Your pick
          </div>
          <div
            style={{
              width: 2,
              height: 10,
              background: alpha(selectedColor, 0.6),
            }}
          />
        </div>

        <div
          style={{
            position: "relative",
            height: 52,
            overflow: "hidden",
            borderRadius: 22,
            background: `linear-gradient(180deg, ${alpha(
              votingTheme.colors.surfaceStrong,
              0.96,
            )}, ${votingTheme.colors.surfaceSoft})`,
            border: `1px solid ${alpha(votingTheme.colors.borderStrong, 0.35)}`,
            boxShadow: votingTheme.shadow.inset,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.14), rgba(255,255,255,0) 35%, rgba(255,255,255,0.18))",
              pointerEvents: "none",
            }}
          />
          <div
            data-testid="split-segment-a"
            style={{
              position: "absolute",
              inset: "0 auto 0 0",
              width: `${displayPctA}%`,
              background: `linear-gradient(90deg, ${alpha(optionA.color, 0.98)}, ${alpha(
                optionA.color,
                0.84,
              )})`,
              transition: "width 1s cubic-bezier(0.22, 0.8, 0.22, 1)",
            }}
          />
          <div
            data-testid="split-segment-b"
            style={{
              position: "absolute",
              inset: "0 0 0 auto",
              width: `${displayPctB}%`,
              background: `linear-gradient(270deg, ${alpha(optionB.color, 0.98)}, ${alpha(
                optionB.color,
                0.84,
              )})`,
              transition: "width 1s cubic-bezier(0.22, 0.8, 0.22, 1)",
            }}
          />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 8,
              bottom: 8,
              left: `${displayPctA}%`,
              width: 2,
              borderRadius: 999,
              background: alpha(votingTheme.colors.white, 0.85),
              boxShadow: `0 0 0 2px ${alpha(votingTheme.colors.text, 0.06)}`,
              transform: "translateX(-50%)",
              transition: "left 1s cubic-bezier(0.22, 0.8, 0.22, 1)",
            }}
          />
        </div>
      </div>
    </div>
  )
}
