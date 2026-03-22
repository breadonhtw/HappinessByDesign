import React, { memo } from "react";

import { alpha } from "./designSystem";

function StatBlock({ align = "left", option, votes, percentage }) {
  return (
    <div className="split-vote-bar__stat" data-align={align}>
      <div className="split-vote-bar__label">
        {align === "right" ? null : (
          <span className="split-vote-bar__emoji">{option.emoji}</span>
        )}
        <span className="split-vote-bar__name" style={{ "--stat-color": option.color }}>
          {option.label}
        </span>
        {align === "right" ? (
          <span className="split-vote-bar__emoji">{option.emoji}</span>
        ) : null}
      </div>
      <div className="split-vote-bar__pct">{percentage}%</div>
      <div className="split-vote-bar__votes">{votes} votes</div>
    </div>
  );
}

export function SplitVoteBarSkeleton() {
  return (
    <div data-testid="split-vote-bar-skeleton" className="vt-panel vt-panel--inset split-vote-bar__skeleton">
      <div className="split-vote-bar__skeleton-stats">
        {[0, 1].map((index) => (
          <div
            key={index}
            className="split-vote-bar__skeleton-stat"
            data-align={index === 1 ? "right" : "left"}
          >
            <div
              className="voting-loading-block"
              style={{ width: "72%", height: 14, marginBottom: 8, borderRadius: 999 }}
            />
            <div
              className="voting-loading-block"
              style={{ width: 52, height: 18, marginBottom: 6, borderRadius: 999 }}
            />
            <div
              className="voting-loading-block"
              style={{ width: 64, height: 12, borderRadius: 999 }}
            />
          </div>
        ))}
      </div>
      <div className="split-vote-bar__skeleton-track">
        <div
          className="voting-loading-block"
          style={{ width: "100%", height: "100%", borderRadius: 0 }}
        />
      </div>
    </div>
  );
}

function SplitVoteBar({
  optionA,
  optionB,
  votesA,
  votesB,
  pctA,
  pctB,
  choice,
}) {
  const selectedCenter =
    choice === "a" ? Math.max(12, pctA / 2) : Math.min(88, 100 - pctB / 2);
  const selectedColor = choice === "a" ? optionA.color : optionB.color;

  return (
    <div
      data-testid="split-vote-bar"
      className="vt-panel vt-panel--inset split-vote-bar"
      style={{
        "--selected-center": `${selectedCenter}%`,
        "--selected-gradient": `linear-gradient(135deg, ${selectedColor}, ${alpha(
          selectedColor,
          0.84,
        )})`,
        "--selected-shadow": `0 10px 22px ${alpha(selectedColor, 0.2)}`,
        "--selected-line": alpha(selectedColor, 0.6),
      }}
    >
      <div className="split-vote-bar__stats">
        <StatBlock option={optionA} votes={votesA} percentage={pctA} />
        <StatBlock align="right" option={optionB} votes={votesB} percentage={pctB} />
      </div>

      <div className="split-vote-bar__track-wrap">
        <div
          data-testid="selected-choice-marker"
          data-choice={choice}
          className="split-vote-bar__marker"
        >
          <div className="split-vote-bar__marker-chip">Your pick</div>
          <div className="split-vote-bar__marker-line" />
        </div>

        <div className="split-vote-bar__track">
          <div
            data-testid="split-segment-a"
            className="split-vote-bar__segment split-vote-bar__segment--a"
            style={{
              "--segment-width": `${pctA}%`,
              "--segment-gradient": `linear-gradient(90deg, ${alpha(
                optionA.color,
                0.98,
              )}, ${alpha(optionA.color, 0.84)})`,
            }}
          />
          <div
            data-testid="split-segment-b"
            className="split-vote-bar__segment split-vote-bar__segment--b"
            style={{
              "--segment-width": `${pctB}%`,
              "--segment-gradient": `linear-gradient(270deg, ${alpha(
                optionB.color,
                0.98,
              )}, ${alpha(optionB.color, 0.84)})`,
            }}
          />
          <div
            aria-hidden="true"
            className="split-vote-bar__divider"
            style={{ "--divider-left": `${pctA}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default memo(SplitVoteBar);
