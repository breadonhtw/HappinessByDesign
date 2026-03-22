import React, { memo } from "react";

import { alpha, votingTheme } from "./designSystem";

function EvidenceCard({ option, evidence, isOpen, onToggle }) {
  return (
    <button
      type="button"
      className="evidence-card"
      aria-expanded={isOpen}
      onClick={onToggle}
      style={{
        "--evidence-color": option.color,
        "--evidence-border-color": isOpen
          ? alpha(option.color, 0.48)
          : alpha(votingTheme.colors.borderStrong, 0.54),
        "--evidence-background": isOpen
          ? `linear-gradient(180deg, ${alpha(option.color, 0.08)}, ${option.bg})`
          : `linear-gradient(180deg, ${votingTheme.colors.surfaceStrong}, ${votingTheme.colors.surface})`,
        "--evidence-orb-color": alpha(option.color, isOpen ? 0.12 : 0.06),
        "--evidence-emoji-border": isOpen
          ? alpha(option.color, 0.28)
          : alpha(votingTheme.colors.borderStrong, 0.38),
        "--evidence-emoji-background": isOpen
          ? alpha(option.color, 0.18)
          : alpha(votingTheme.colors.surfaceMuted, 0.95),
        "--evidence-chevron-border": isOpen
          ? alpha(option.color, 0.3)
          : alpha(votingTheme.colors.borderStrong, 0.4),
        "--evidence-chevron-background": isOpen
          ? alpha(option.color, 0.18)
          : alpha(votingTheme.colors.surfaceStrong, 0.88),
        "--evidence-chevron-color": isOpen
          ? option.color
          : votingTheme.colors.textSoft,
        "--evidence-chevron-rotation": isOpen ? "180deg" : "0deg",
        "--evidence-body-rows": isOpen ? "1fr" : "0fr",
        "--evidence-divider": alpha(option.color, 0.22),
        "--evidence-source-background": alpha(option.color, 0.1),
        "--evidence-source-border": alpha(option.color, 0.18),
      }}
    >
      <div className="evidence-card__orb" />

      <div className="evidence-card__summary">
        <div className="evidence-card__summary-main">
          <div className="evidence-card__emoji">{option.emoji}</div>
          <div className="evidence-card__copy">
            <div className="evidence-card__title">{option.label}</div>
            <div className="evidence-card__hint">
              Tap to {isOpen ? "collapse" : "reveal the research"}
            </div>
          </div>
        </div>

        <div className="vt-chip evidence-card__chevron">
          <span>▼</span>
        </div>
      </div>

      <div className="evidence-card__body-wrap">
        <div>
          <div className="evidence-card__body">
            <div className="evidence-card__divider" />
            <div className="vt-panel vt-panel--inset evidence-card__panel">
              <div className="vt-section-title evidence-card__panel-title">
                {evidence.title}
              </div>
              <p className="vt-body evidence-card__panel-copy">
                {evidence.finding}
              </p>
              <div className="vt-chip evidence-card__source">
                <span>{evidence.source}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

export default memo(EvidenceCard);
