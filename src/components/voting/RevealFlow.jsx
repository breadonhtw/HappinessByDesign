import React, { memo, useEffect, useState } from "react";

import { REVEAL_CONTENT } from "../../data/revealContent";
import { alpha } from "./designSystem";
import EvidenceCard from "./EvidenceCard";
import SplitVoteBar, { SplitVoteBarSkeleton } from "./SplitVoteBar";

function LoadingBlock({ width = "100%", height = 16, borderRadius = 10 }) {
  return (
    <div className="voting-loading-block" style={{ width, height, borderRadius }} />
  );
}

function RevealFlow({ scenario, choice, countsLoading }) {
  const [showResults, setShowResults] = useState(false);
  const [openA, setOpenA] = useState(false);
  const [openB, setOpenB] = useState(false);

  const total = (scenario.votes.a || 0) + (scenario.votes.b || 0);
  const pctA = total > 0 ? Math.round(((scenario.votes.a || 0) / total) * 100) : 50;
  const pctB = total > 0 ? 100 - pctA : 50;
  const chosen = choice === "a" ? scenario.optionA : scenario.optionB;
  const revealContent = REVEAL_CONTENT[scenario.stationNum];
  const chosenCount = Math.max(
    0,
    (choice === "a" ? scenario.votes.a || 0 : scenario.votes.b || 0) - 1,
  );

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setShowResults(true);
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, []);

  return (
    <div className="reveal-flow">
      <div className="reveal-flow__stage reveal-flow__stage--1">
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
          <div className="reveal-flow__hero-title">
            You chose to {chosen.label.toLowerCase()}
          </div>
          <div className="reveal-flow__hero-meta">
            {countsLoading ? (
              <LoadingBlock width={228} height={22} borderRadius={999} />
            ) : (
              `You and ${chosenCount} others made this choice`
            )}
          </div>
        </div>
      </div>

      <div className="reveal-flow__stage reveal-flow__stage--2">
        <div className="vt-panel vt-panel--base reveal-flow__section">
          <div className="reveal-flow__section-title">How everyone voted</div>
          {!showResults ? null : countsLoading ? (
            <SplitVoteBarSkeleton />
          ) : (
            <SplitVoteBar
              optionA={scenario.optionA}
              optionB={scenario.optionB}
              votesA={scenario.votes.a}
              votesB={scenario.votes.b}
              pctA={pctA}
              pctB={pctB}
              choice={choice}
            />
          )}
        </div>
      </div>

      <div className="reveal-flow__stage reveal-flow__stage--3">
        <div className="reveal-flow__research">
          <div className="vt-section-title reveal-flow__research-title">
            What does the research say?
          </div>
          <div className="reveal-flow__research-copy">
            Tap each card to reveal the evidence
          </div>
        </div>

        <div className="reveal-flow__cards">
          <EvidenceCard
            option={scenario.optionA}
            evidence={revealContent.evidenceA}
            isOpen={openA}
            onToggle={() => setOpenA((current) => !current)}
          />
          <EvidenceCard
            option={scenario.optionB}
            evidence={revealContent.evidenceB}
            isOpen={openB}
            onToggle={() => setOpenB((current) => !current)}
          />
        </div>
      </div>

      <div className="reveal-flow__stage reveal-flow__stage--4">
        <div className="vt-panel vt-panel--strong reveal-flow__bias">
          <div className="reveal-flow__bias-orb" />
          <div className="vt-chip reveal-flow__bias-chip">
            <span className="vt-eyebrow">Did you know?</span>
          </div>
          <div className="vt-section-title reveal-flow__bias-title">
            This is called {revealContent.bias.name}
          </div>
          <p className="vt-body reveal-flow__bias-copy">
            {revealContent.bias.description}
          </p>
          <div className="vt-chip reveal-flow__bias-source">
            <span>{revealContent.bias.source}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(RevealFlow);
