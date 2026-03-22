import React, { memo, useState } from "react";

import { alpha, panelStyles, votingTheme } from "./designSystem";

function formatPromptSections(prompt) {
  const parts = prompt
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 3) {
    return {
      lead: parts[0],
      focus: parts[1],
      prompt: parts.slice(2).join(" "),
    };
  }

  if (parts.length === 2) {
    return {
      lead: "",
      focus: parts[0],
      prompt: parts[1],
    };
  }

  return {
    lead: "",
    focus: parts[0] || prompt,
    prompt: "",
  };
}

function TapOption({
  choice,
  scenarioOption,
  hintDelay,
  isCommitted,
  isSelected,
  isDimmed,
  onChoice,
  onChoiceIntent,
}) {
  const isIdle = !isCommitted;
  const isInactive = isDimmed || isCommitted;

  return (
    <button
      type="button"
      aria-label={`Choose Option ${choice.toUpperCase()}: ${scenarioOption.short}`}
      disabled={isCommitted}
      className="vt-panel vt-panel--inset tap-option"
      data-idle={isIdle}
      data-inactive={isInactive}
      data-selected={isSelected}
      onPointerEnter={onChoiceIntent}
      onFocus={onChoiceIntent}
      onClick={() => onChoice(choice)}
      style={{
        "--option-color": scenarioOption.color,
        "--option-background": isSelected
          ? `linear-gradient(135deg, ${scenarioOption.bg}, ${alpha(
              scenarioOption.color,
              0.2,
            )})`
          : alpha(votingTheme.colors.surfaceStrong, 0.62),
        "--option-border-color": isSelected
          ? alpha(scenarioOption.color, 0.58)
          : alpha(votingTheme.colors.borderStrong, 0.45),
        "--option-shadow": isSelected
          ? `0 14px 26px ${alpha(scenarioOption.color, 0.14)}, inset 0 1px 0 ${alpha(votingTheme.colors.white, 0.78)}`
          : panelStyles.inset.boxShadow,
        "--option-emoji-background": alpha(
          scenarioOption.color,
          isSelected ? 0.26 : 0.16,
        ),
        "--option-hover-background-start": scenarioOption.bg,
        "--option-hover-background-end": alpha(scenarioOption.color, 0.2),
        "--option-hover-border-color": alpha(scenarioOption.color, 0.58),
        "--option-hover-shadow": `0 14px 26px ${alpha(
          scenarioOption.color,
          0.14,
        )}, inset 0 1px 0 ${alpha(votingTheme.colors.white, 0.78)}`,
        "--option-hover-emoji-background": alpha(scenarioOption.color, 0.26),
        "--option-emoji-scale": isSelected ? 1.06 : 1,
        "--option-indicator-opacity": isInactive ? 0.55 : 1,
        "--option-ring-border": alpha(
          scenarioOption.color,
          isSelected ? 0.36 : 0.28,
        ),
        "--option-ring-background": alpha(scenarioOption.color, 0.06),
        "--option-hover-ring-border": alpha(scenarioOption.color, 0.36),
        "--option-hover-ring-background": alpha(scenarioOption.color, 0.06),
        "--option-indicator-shadow": `0 0 0 4px ${alpha(
          scenarioOption.color,
          isSelected ? 0.18 : 0.1,
        )}`,
        "--option-hover-indicator-shadow": `0 0 0 4px ${alpha(
          scenarioOption.color,
          0.18,
        )}`,
        "--option-dot-scale": isSelected ? 1.15 : 1,
        "--hint-delay": hintDelay,
      }}
    >
      <div className="tap-option__content">
        <div className="tap-option__emoji" aria-hidden="true">
          {scenarioOption.emoji}
        </div>
        <div className="tap-option__copy">
          <div className="tap-option__label">Option {choice.toUpperCase()}</div>
          <div className="tap-option__text">{scenarioOption.short}</div>
        </div>
      </div>

      <div className="tap-option__indicator" aria-hidden="true">
        <div className="tap-option__indicator-ring" />
        <div className="tap-option__indicator-dot" />
      </div>
    </button>
  );
}

function TapCard({ scenario, onChoice, onChoiceIntent }) {
  const [committedChoice, setCommittedChoice] = useState(null);
  const promptSections = formatPromptSections(scenario.prompt);

  const handleChoice = (choice) => {
    if (committedChoice !== null) {
      return;
    }

    setCommittedChoice(choice);
    onChoice(choice);
  };

  const isSelectingA = committedChoice === "a";
  const isSelectingB = committedChoice === "b";
  const isInteractionLocked = committedChoice !== null;

  return (
    <div className="tap-card">
      <div className="tap-card__inner">
        <div className="vt-panel vt-panel--strong tap-card__panel">
          <div className="tap-card__orb" />

          <div className="tap-card__station">
            <div className="vt-chip tap-card__station-chip">
              <span className="vt-eyebrow">Station {scenario.stationNum}</span>
            </div>
          </div>

          <div className="vt-section-title tap-card__title">{scenario.title}</div>

          <div className="tap-card__divider">
            <div className="tap-card__divider-line" />
            <div className="vt-chip tap-card__divider-chip">✦</div>
            <div className="tap-card__divider-line" />
          </div>

          <div className="vt-panel vt-panel--inset tap-card__prompt">
            <div className="tap-card__prompt-copy">
              {promptSections.lead ? (
                <p className="tap-card__prompt-lead">{promptSections.lead}</p>
              ) : null}
              <p className="tap-card__prompt-focus">{promptSections.focus}</p>
              {promptSections.prompt ? (
                <p className="tap-card__prompt-question">{promptSections.prompt}</p>
              ) : null}
            </div>
          </div>

          <div className="tap-card__options">
            <TapOption
              choice="a"
              scenarioOption={scenario.optionA}
              hintDelay="0s"
              isCommitted={committedChoice !== null}
              isSelected={isSelectingA}
              isDimmed={isInteractionLocked && !isSelectingA}
              onChoice={handleChoice}
              onChoiceIntent={onChoiceIntent}
            />
            <TapOption
              choice="b"
              scenarioOption={scenario.optionB}
              hintDelay="0.45s"
              isCommitted={committedChoice !== null}
              isSelected={isSelectingB}
              isDimmed={isInteractionLocked && !isSelectingB}
              onChoice={handleChoice}
              onChoiceIntent={onChoiceIntent}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(TapCard);
