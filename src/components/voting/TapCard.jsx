import React from "react"
import { useState } from "react"

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

function TapOption({
  choice,
  scenarioOption,
  hintDelay,
  isSelected,
  isDimmed,
  isCommitted,
  onPressStart,
  onPressEnd,
  onPressCancel,
}) {
  const isIdle = !isSelected && !isCommitted
  const isInactive = isDimmed || isCommitted

  return (
    <button
      type="button"
      aria-label={`Choose Option ${choice.toUpperCase()}: ${scenarioOption.short}`}
      aria-disabled={isCommitted ? "true" : undefined}
      onPointerDown={() => onPressStart(choice)}
      onPointerUp={() => onPressEnd(choice)}
      onPointerLeave={() => onPressCancel(choice)}
      onPointerCancel={() => onPressCancel(choice)}
      onKeyDown={(event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault()
          onPressStart(choice)
        }
      }}
      onKeyUp={(event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault()
          onPressEnd(choice)
        }
      }}
      onBlur={() => onPressCancel(choice)}
      style={{
        ...panelStyles.inset,
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "15px 16px",
        textAlign: "left",
        cursor: isCommitted ? "default" : "pointer",
        background: isSelected
          ? `linear-gradient(135deg, ${scenarioOption.bg}, ${alpha(
              scenarioOption.color,
              0.2,
            )})`
          : alpha(votingTheme.colors.surfaceStrong, 0.62),
        borderColor: isSelected
          ? alpha(scenarioOption.color, 0.58)
          : alpha(votingTheme.colors.borderStrong, 0.45),
        boxShadow: isSelected
          ? `0 14px 26px ${alpha(scenarioOption.color, 0.14)}, inset 0 1px 0 ${alpha(votingTheme.colors.white, 0.78)}`
          : panelStyles.inset.boxShadow,
        transform: isSelected ? "translateY(-2px) scale(1.02)" : "scale(1)",
        opacity: isInactive ? 0.7 : 1,
        transition: "all 0.2s ease",
        appearance: "none",
        outline: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flex: 1,
        }}
      >
        <div
          aria-hidden="true"
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            background: alpha(
              scenarioOption.color,
              isSelected ? 0.26 : 0.16,
            ),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
            flexShrink: 0,
            transform: isSelected ? "scale(1.06)" : "scale(1)",
            transition: "all 0.2s ease",
            animation: isIdle
              ? `tapCueBob 2.4s ease-in-out ${hintDelay} infinite`
              : "none",
          }}
        >
          {scenarioOption.emoji}
        </div>
        <div>
        <div
          style={{
            fontFamily: votingTheme.fonts.body,
            fontSize: 13,
            color: scenarioOption.color,
            fontWeight: 700,
            marginBottom: 2,
          }}
        >
          Option {choice.toUpperCase()}
        </div>
        <div
          style={{
            fontFamily: votingTheme.fonts.body,
            fontSize: 14,
            color: votingTheme.colors.text,
            lineHeight: 1.5,
          }}
        >
          {scenarioOption.short}
        </div>
        </div>
      </div>
      <div
        aria-hidden="true"
        style={{
          position: "relative",
          width: 28,
          height: 28,
          flexShrink: 0,
          marginLeft: 8,
          opacity: isInactive ? 0.55 : 1,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `1px solid ${alpha(scenarioOption.color, isSelected ? 0.36 : 0.28)}`,
            background: alpha(scenarioOption.color, 0.06),
            animation: isIdle
              ? `tapCueRing 2.4s ease-out ${hintDelay} infinite`
              : "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 8,
            borderRadius: "50%",
            background: scenarioOption.color,
            boxShadow: `0 0 0 4px ${alpha(scenarioOption.color, isSelected ? 0.18 : 0.1)}`,
            transform: isSelected ? "scale(1.15)" : "scale(1)",
            transition: "transform 0.2s ease",
          }}
        />
      </div>
    </button>
  )
}

export default function TapCard({ scenario, onChoice }) {
  const [pressedChoice, setPressedChoice] = useState(null)
  const [committedChoice, setCommittedChoice] = useState(null)
  const promptSections = formatPromptSections(scenario.prompt)

  const handlePressStart = (choice) => {
    if (committedChoice !== null) return
    setPressedChoice(choice)
  }

  const handlePressEnd = (choice) => {
    if (committedChoice !== null || pressedChoice !== choice) return

    setCommittedChoice(choice)
    setPressedChoice(choice)
    onChoice(choice)
  }

  const handlePressCancel = (choice) => {
    if (committedChoice !== null) return
    setPressedChoice((current) => (current === choice ? null : current))
  }

  const activeChoice = committedChoice ?? pressedChoice
  const isSelectingA = activeChoice === "a"
  const isSelectingB = activeChoice === "b"
  const isInteractionLocked = activeChoice !== null

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
          width: "100%",
          maxWidth: 392,
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
            boxShadow: votingTheme.shadow.panelStrong,
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

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <TapOption
              choice="a"
              scenarioOption={scenario.optionA}
              hintDelay="0s"
              isSelected={isSelectingA}
              isDimmed={isInteractionLocked && !isSelectingA}
              isCommitted={committedChoice !== null}
              onPressStart={handlePressStart}
              onPressEnd={handlePressEnd}
              onPressCancel={handlePressCancel}
            />
            <TapOption
              choice="b"
              scenarioOption={scenario.optionB}
              hintDelay="0.45s"
              isSelected={isSelectingB}
              isDimmed={isInteractionLocked && !isSelectingB}
              isCommitted={committedChoice !== null}
              onPressStart={handlePressStart}
              onPressEnd={handlePressEnd}
              onPressCancel={handlePressCancel}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
