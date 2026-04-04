import React, { memo, useState } from "react";

import { alpha, panelStyles, votingTheme } from "./designSystem";
import { AGE_RANGE_OPTIONS } from "../../lib/voting";

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
  ariaLabel,
  choice,
  scenarioOption,
  hintDelay,
  isDisabled,
  isSelected,
  isDimmed,
  onChoice,
  onChoiceIntent,
}) {
  const isIdle = !isDisabled;
  const isInactive = isDimmed || isDisabled;
  const optionLabel = choice === "other" ? "Other" : `Option ${choice.toUpperCase()}`;

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={isDisabled}
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
          <div className="tap-option__label">{optionLabel}</div>
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

const OTHER_OPTION = {
  short: "Share another response in your own words",
  emoji: "✍️",
  label: "Something else",
  color: "#8A5A44",
  bg: "#F3E8DD",
};

function buildResponseSummary(selectedChoice, scenario) {
  if (selectedChoice === "a") {
    return "Option A";
  }

  if (selectedChoice === "b") {
    return "Option B";
  }

  return scenario.optionOther?.label || OTHER_OPTION.label;
}

function TapCard({ scenario, submitting = false, onSubmitResponse, onChoiceIntent }) {
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [ageRange, setAgeRange] = useState("");
  const [otherText, setOtherText] = useState("");
  const [validationError, setValidationError] = useState("");
  const promptSections = formatPromptSections(scenario.prompt);
  const optionOther = scenario.optionOther ?? OTHER_OPTION;

  const handleChoice = (choice) => {
    if (submitting) {
      return;
    }

    setSelectedChoice(choice);
    setValidationError("");
  };

  const handleSubmit = () => {
    if (!selectedChoice || submitting) {
      return;
    }

    const trimmedOtherText = otherText.trim();

    if (selectedChoice === "other" && !trimmedOtherText) {
      setValidationError("Please share your other response before submitting.");
      return;
    }

    setValidationError("");
    onSubmitResponse({
      choice: selectedChoice,
      ageRange: ageRange || undefined,
      otherText: selectedChoice === "other" ? trimmedOtherText : undefined,
    });
  };

  const isSelectingA = selectedChoice === "a";
  const isSelectingB = selectedChoice === "b";
  const isSelectingOther = selectedChoice === "other";
  const isInteractionDisabled = submitting;
  const submitDisabled =
    !selectedChoice ||
    submitting ||
    (selectedChoice === "other" && otherText.trim().length === 0);
  const selectedSummary = selectedChoice
    ? buildResponseSummary(selectedChoice, scenario)
    : "";

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
              ariaLabel={`Choose Option A: ${scenario.optionA.short}`}
              isDisabled={isInteractionDisabled}
              isSelected={isSelectingA}
              isDimmed={selectedChoice !== null && !isSelectingA}
              onChoice={handleChoice}
              onChoiceIntent={onChoiceIntent}
            />
            <TapOption
              choice="b"
              scenarioOption={scenario.optionB}
              hintDelay="0.45s"
              ariaLabel={`Choose Option B: ${scenario.optionB.short}`}
              isDisabled={isInteractionDisabled}
              isSelected={isSelectingB}
              isDimmed={selectedChoice !== null && !isSelectingB}
              onChoice={handleChoice}
              onChoiceIntent={onChoiceIntent}
            />
            <TapOption
              choice="other"
              scenarioOption={optionOther}
              hintDelay="0.9s"
              ariaLabel={`Choose Other: ${optionOther.short}`}
              isDisabled={isInteractionDisabled}
              isSelected={isSelectingOther}
              isDimmed={selectedChoice !== null && !isSelectingOther}
              onChoice={handleChoice}
              onChoiceIntent={onChoiceIntent}
            />
          </div>

          {selectedChoice ? (
            <div className="vt-panel vt-panel--inset tap-card__survey">
              <div className="tap-card__survey-header">
                <div className="vt-chip tap-card__survey-chip">
                  <span className="vt-eyebrow">Selected response</span>
                </div>
                <div className="tap-card__survey-selection">{selectedSummary}</div>
              </div>

              <div className="tap-card__survey-section">
                <div className="tap-card__survey-label">Optional age range</div>
                <div className="tap-card__age-grid" role="group" aria-label="Optional age range">
                  {AGE_RANGE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className="vt-chip tap-card__age-button"
                      data-selected={ageRange === option.value}
                      onClick={() => setAgeRange(option.value)}
                      aria-pressed={ageRange === option.value}
                      aria-label={`Select age range ${option.label}`}
                    >
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedChoice === "other" ? (
                <div className="tap-card__survey-section">
                  <label className="tap-card__survey-label" htmlFor={`other-response-${scenario.stationNum}`}>
                    Tell us what you would choose instead
                  </label>
                  <textarea
                    id={`other-response-${scenario.stationNum}`}
                    className="tap-card__survey-textarea"
                    value={otherText}
                    onChange={(event) => {
                      setOtherText(event.target.value);
                      if (validationError) {
                        setValidationError("");
                      }
                    }}
                    rows={4}
                    placeholder="Share your response in your own words."
                  />
                </div>
              ) : null}

              <p className="tap-card__survey-note">
                Age range is optional and anonymous.
                {selectedChoice === "other"
                  ? " Your written response is required for this option."
                  : ""}
              </p>

              {validationError ? (
                <div role="alert" className="tap-card__survey-error">
                  {validationError}
                </div>
              ) : null}

              <button
                type="button"
                className="tap-card__submit"
                disabled={submitDisabled}
                onClick={handleSubmit}
              >
                {submitting ? "Submitting..." : "Submit response"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default memo(TapCard);
