import React, { memo } from "react";

import { AGE_RANGE_OPTIONS } from "../../lib/voting";

function renderAgeRangeLabel(ageRange) {
  return (
    AGE_RANGE_OPTIONS.find((option) => option.value === ageRange)?.label ??
    ageRange
  );
}

function OtherResponseFlow({
  response,
  nextStep = null,
  completionStep = null,
}) {
  return (
    <div className="reveal-flow">
      <div className="reveal-flow__stage reveal-flow__stage--1">
        <div className="vt-panel vt-panel--strong other-response-card">
          <div className="other-response-card__orb" />
          <div className="other-response-card__icon">💬</div>
          <div className="vt-chip other-response-card__chip">
            <span className="vt-eyebrow">Your response</span>
          </div>
          <div className="vt-section-title other-response-card__title">
            Thanks for sharing another path
          </div>
          <p className="vt-body other-response-card__body">
            Your response has been recorded. Thank you for sharing your
            experience and helping others see different perspectives!
          </p>
          {response.otherText ? (
            <div className="vt-panel vt-panel--inset other-response-card__quote">
              <div className="other-response-card__quote-copy">
                {response.otherText}
              </div>
            </div>
          ) : null}
          {response.ageRange ? (
            <div className="vt-chip other-response-card__meta">
              <span>Age range: {renderAgeRangeLabel(response.ageRange)}</span>
            </div>
          ) : null}
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
            <p className="vt-body voting-final-card__body">
              {completionStep.body}
            </p>
            <div className="voting-final-card__actions">
              {completionStep.actions.map((action, index) => (
                <div
                  key={action}
                  className="vt-panel vt-panel--inset voting-final-card__action"
                >
                  <div className="voting-final-card__action-count">
                    {index + 1}
                  </div>
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

export default memo(OtherResponseFlow);
