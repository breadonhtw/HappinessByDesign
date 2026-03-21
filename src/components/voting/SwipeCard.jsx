import React from "react"
import { useRef, useState } from "react"

import {
  alpha,
  panelStyles,
  textStyles,
  votingTheme,
} from "./designSystem"

function formatPromptSections(prompt) {
  const parts = prompt
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length >= 3) {
    return {
      lead: parts[0],
      focus: parts[1],
      prompt: parts.slice(2).join(" "),
    }
  }

  if (parts.length === 2) {
    return {
      lead: "",
      focus: parts[0],
      prompt: parts[1],
    }
  }

  return {
    lead: "",
    focus: parts[0] || prompt,
    prompt: "",
  }
}

export default function SwipeCard({ scenario, onChoice }) {
  const startX = useRef(0)
  const currentDelta = useRef(0)
  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [exitDir, setExitDir] = useState(null)
  const threshold = 70
  const promptSections = formatPromptSections(scenario.prompt)

  const getClientX = (e) => (e.touches ? e.touches[0].clientX : e.clientX)

  const handleStart = (e) => {
    startX.current = getClientX(e)
    setIsDragging(true)
  }

  const handleMove = (e) => {
    if (!isDragging) return
    currentDelta.current = getClientX(e) - startX.current
    setOffset(currentDelta.current)
  }

  const handleEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    if (currentDelta.current > threshold) {
      setExitDir("right")
      setTimeout(() => onChoice("a"), 380)
    } else if (currentDelta.current < -threshold) {
      setExitDir("left")
      setTimeout(() => onChoice("b"), 380)
    } else {
      setOffset(0)
    }
    currentDelta.current = 0
  }

  const rotation = offset * 0.06
  const leftGlow = Math.max(0, Math.min(1, -offset / threshold))
  const rightGlow = Math.max(0, Math.min(1, offset / threshold))
  const translateX =
    exitDir === "right" ? 500 : exitDir === "left" ? -500 : offset
  const exitRot =
    exitDir === "right" ? 15 : exitDir === "left" ? -15 : rotation

  const baseShadow = `0 ${16 + Math.abs(offset) * 0.06}px ${38 + Math.abs(offset) * 0.12}px rgba(91, 67, 40, ${0.11 + Math.abs(offset) * 0.00025})`

  return (
    <div
      style={{
        position: "relative",
        minHeight: "65vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 16px 20px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -12,
          top: 32,
          bottom: 32,
          width: 112,
          background: `linear-gradient(to right, ${alpha(
            scenario.optionB.color,
            leftGlow * 0.18,
          )}, transparent)`,
          pointerEvents: "none",
          transition: isDragging ? "none" : "background 0.3s",
          zIndex: 1,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: -12,
          top: 32,
          bottom: 32,
          width: 112,
          background: `linear-gradient(to left, ${alpha(
            scenario.optionA.color,
            rightGlow * 0.18,
          )}, transparent)`,
          pointerEvents: "none",
          transition: isDragging ? "none" : "background 0.3s",
          zIndex: 1,
        }}
      />

      <div
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        onMouseDown={handleStart}
        onMouseMove={(e) => isDragging && handleMove(e)}
        onMouseUp={handleEnd}
        onMouseLeave={() => isDragging && handleEnd()}
        style={{
          width: "100%",
          maxWidth: 392,
          transform: `translateX(${translateX}px) rotate(${exitRot}deg)`,
          transition: isDragging
            ? "none"
            : "all 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)",
          opacity: exitDir ? 0 : 1,
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
          touchAction: "pan-y",
          zIndex: 5,
        }}
      >
        <div
          style={{
            ...panelStyles.strong,
            position: "relative",
            overflow: "hidden",
            padding: "34px 24px 28px",
            borderRadius: 30,
            boxShadow: `${votingTheme.shadow.panelStrong}, ${baseShadow}`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 1,
              borderRadius: 29,
              border: `1px solid ${alpha(votingTheme.colors.white, 0.7)}`,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: -54,
              right: -30,
              width: 154,
              height: 154,
              borderRadius: "50%",
              background: alpha(votingTheme.colors.brass, 0.1),
            }}
          />
          <div
            style={{
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                ...panelStyles.chip,
                padding: "5px 16px",
                minHeight: 32,
                background: alpha(votingTheme.colors.surfaceSoft, 0.9),
              }}
            >
              <span
                style={{
                  ...textStyles.eyebrow,
                  color: votingTheme.colors.textSoft,
                }}
              >
                Station {scenario.stationNum}
              </span>
            </div>
          </div>

          <div
            style={{
              ...textStyles.sectionTitle,
              fontSize: 32,
              color: votingTheme.colors.clay,
              textAlign: "center",
              marginBottom: 18,
            }}
          >
            {scenario.title}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "0 18px 20px",
            }}
          >
            <div
              style={{
                flex: 1,
                height: 1,
                background: alpha(votingTheme.colors.borderStrong, 0.6),
              }}
            />
            <div
              style={{
                ...panelStyles.chip,
                width: 32,
                height: 32,
                padding: 0,
                color: votingTheme.colors.brass,
                fontSize: 13,
              }}
            >
              ✦
            </div>
            <div
              style={{
                flex: 1,
                height: 1,
                background: alpha(votingTheme.colors.borderStrong, 0.6),
              }}
            />
          </div>

          <div
            style={{
              ...panelStyles.inset,
              padding: "20px 18px 18px",
              marginBottom: 22,
              background: `linear-gradient(180deg, ${alpha(votingTheme.colors.surfaceStrong, 0.92)}, ${alpha(votingTheme.colors.surfaceSoft, 0.68)})`,
            }}
          >
            <div
              style={{
                maxWidth: 272,
                margin: "0 auto",
                display: "grid",
                gap: 8,
                textAlign: "center",
              }}
            >
              {promptSections.lead ? (
                <p
                  style={{
                    ...textStyles.promptLead,
                    margin: 0,
                  }}
                >
                  {promptSections.lead}
                </p>
              ) : null}
              <p
                style={{
                  ...textStyles.promptFocus,
                  margin: 0,
                }}
              >
                {promptSections.focus}
              </p>
              {promptSections.prompt ? (
                <p
                  style={{
                    ...textStyles.promptQuestion,
                    margin: 0,
                  }}
                >
                  {promptSections.prompt}
                </p>
              ) : null}
            </div>
          </div>

          <div
            style={{
              ...panelStyles.chip,
              display: "flex",
              gap: 10,
              minHeight: 36,
              margin: "0 auto 18px",
              width: "fit-content",
              maxWidth: "100%",
              padding: "8px 14px",
              background: alpha(votingTheme.colors.surfaceStrong, 0.78),
            }}
          >
            <span
              style={{
                fontFamily: votingTheme.fonts.body,
                fontSize: 12,
                color: scenario.optionB.color,
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              ← Left for B
            </span>
            <span
              style={{
                width: 1,
                alignSelf: "stretch",
                background: alpha(votingTheme.colors.borderStrong, 0.55),
              }}
            />
            <span
              style={{
                fontFamily: votingTheme.fonts.body,
                fontSize: 12,
                color: scenario.optionA.color,
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              Right for A →
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                ...panelStyles.inset,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "15px 16px",
                background:
                  rightGlow > 0.2
                    ? `linear-gradient(135deg, ${scenario.optionA.bg}, ${alpha(
                        scenario.optionA.color,
                        0.12,
                      )})`
                    : alpha(votingTheme.colors.surfaceStrong, 0.62),
                borderColor:
                  rightGlow > 0.2
                    ? alpha(scenario.optionA.color, 0.52)
                    : alpha(votingTheme.colors.borderStrong, 0.45),
                transition: isDragging ? "none" : "all 0.3s ease",
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  background: alpha(scenario.optionA.color, rightGlow > 0.2 ? 0.22 : 0.16),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  flexShrink: 0,
                }}
              >
                {scenario.optionA.emoji}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: votingTheme.fonts.body,
                    fontSize: 13,
                    color: scenario.optionA.color,
                    fontWeight: 700,
                    marginBottom: 2,
                  }}
                >
                  Option A — Swipe right →
                </div>
                <div
                  style={{
                    fontFamily: votingTheme.fonts.body,
                    fontSize: 14,
                    color: votingTheme.colors.text,
                    lineHeight: 1.5,
                  }}
                >
                  {scenario.optionA.short}
                </div>
              </div>
            </div>
            <div
              style={{
                ...panelStyles.inset,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "15px 16px",
                background:
                  leftGlow > 0.2
                    ? `linear-gradient(135deg, ${scenario.optionB.bg}, ${alpha(
                        scenario.optionB.color,
                        0.12,
                      )})`
                    : alpha(votingTheme.colors.surfaceStrong, 0.62),
                borderColor:
                  leftGlow > 0.2
                    ? alpha(scenario.optionB.color, 0.52)
                    : alpha(votingTheme.colors.borderStrong, 0.45),
                transition: isDragging ? "none" : "all 0.3s ease",
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  background: alpha(scenario.optionB.color, leftGlow > 0.2 ? 0.22 : 0.16),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                  flexShrink: 0,
                }}
              >
                {scenario.optionB.emoji}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: votingTheme.fonts.body,
                    fontSize: 13,
                    color: scenario.optionB.color,
                    fontWeight: 700,
                    marginBottom: 2,
                  }}
                >
                  ← Swipe left — Option B
                </div>
                <div
                  style={{
                    fontFamily: votingTheme.fonts.body,
                    fontSize: 14,
                    color: votingTheme.colors.text,
                    lineHeight: 1.5,
                  }}
                >
                  {scenario.optionB.short}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          ...panelStyles.chip,
          marginTop: 20,
          textAlign: "center",
          fontFamily: votingTheme.fonts.body,
          fontSize: 14,
          color: votingTheme.colors.textSoft,
          fontWeight: 700,
          animation: "pulse 2s ease-in-out infinite",
          padding: "9px 18px",
          background: alpha(votingTheme.colors.surfaceStrong, 0.66),
        }}
      >
        ← swipe the card to choose →
      </div>
    </div>
  )
}
