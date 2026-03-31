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

function RevealFlow({
  scenario,
  choice,
  countsLoading,
  nextStep = null,
  completionStep = null,
}) {
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
    }, 550);

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
            <span className="reveal-flow__hero-kicker">Your pick</span>
            <span className="reveal-flow__hero-choice">{chosen.label}</span>
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

      {nextStep ? (
        <div className="reveal-flow__stage reveal-flow__stage--5">
          <div className="vt-panel vt-panel--strong voting-next-card">
            <div className="vt-chip voting-next-card__chip">
              <span className="vt-eyebrow">{nextStep.eyebrow}</span>
            </div>
            <div className="vt-section-title voting-next-card__title">
              {nextStep.title}
            </div>
            <p className="vt-body voting-next-card__body">{nextStep.body}</p>
            <button
              type="button"
              className="voting-next-button"
              onClick={nextStep.onAction}
            >
              {nextStep.actionLabel}
            </button>
          </div>
        </div>
      ) : null}

      {completionStep ? (
        <div
          className={`reveal-flow__stage ${
            nextStep ? "reveal-flow__stage--6" : "reveal-flow__stage--5"
          }`}
        >
          <div className="vt-panel vt-panel--strong voting-final-card">
            <div className="vt-eyebrow voting-final-card__eyebrow">
              {completionStep.eyebrow}
            </div>
            <div className="voting-final-card__icon">{completionStep.icon}</div>
            <div className="vt-section-title voting-final-card__title">
              {completionStep.title}
            </div>
            <p className="vt-body voting-final-card__body">{completionStep.body}</p>
            <div className="voting-final-card__actions">
              {completionStep.actions.map((action, index) => (
                <div
                  key={action}
                  className="vt-panel vt-panel--inset voting-final-card__action"
                >
                  <div className="voting-final-card__action-count">{index + 1}</div>
                  <div className="voting-final-card__action-copy">{action}</div>
                </div>
              ))}
            </div>
            <div className="vt-chip voting-final-card__location">
              <span>{completionStep.locationLabel}</span>
            </div>
            {completionStep.mapActionLabel ? (
              <button
                type="button"
                className="voting-final-card__map-button"
                onClick={completionStep.onMapAction}
              >
                {completionStep.mapActionLabel}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default memo(RevealFlow);
