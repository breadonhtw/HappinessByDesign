import React from "react";
import { alpha } from "./designSystem";

function LoadingBlock({ width = "100%", height = 16, borderRadius = 10 }) {
  return (
    <div
      className="voting-loading-block"
      style={{ width, height, borderRadius }}
    />
  );
}

export default function RevealFlowFallback({ scenario, choice }) {
  const chosen = choice === "a" ? scenario.optionA : scenario.optionB;

  return (
    <div className="reveal-flow reveal-flow--fallback">
      <div className="reveal-flow__stage reveal-flow__stage--entered">
        <div
          className="vt-panel vt-panel--strong reveal-flow__hero"
          style={{
            "--choice-bubble": alpha(chosen.color, 0.12),
            "--choice-icon-background": `linear-gradient(180deg, ${alpha(
              chosen.color,
              0.18,
            )}, ${alpha(chosen.color, 0.1)})`,
            "--choice-icon-border": alpha(chosen.color, 0.28),
            "--choice-text-color": chosen.color,
          }}
        >
          <div className="reveal-flow__hero-orb" />
          <div className="reveal-flow__choice-icon">{chosen.emoji}</div>
          <div className="reveal-flow__hero-title">Loading your result…</div>
          <div className="reveal-flow__hero-meta reveal-flow__hero-meta--pending">
            <LoadingBlock width={228} height={22} borderRadius={999} />
          </div>
        </div>
      </div>

      <div className="reveal-flow__stage reveal-flow__stage--entered">
        <div className="vt-panel vt-panel--base reveal-flow__section">
          <div className="reveal-flow__section-title">How everyone voted</div>
          <div className="reveal-flow__fallback-skeleton">
            <LoadingBlock width="72%" height={14} borderRadius={999} />
            <LoadingBlock width={52} height={18} borderRadius={999} />
            <LoadingBlock width="100%" height={52} borderRadius={22} />
          </div>
        </div>
      </div>
    </div>
  );
}
