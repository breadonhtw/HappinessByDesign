import React, { memo } from "react";

import { alpha, votingTheme } from "./designSystem";

const progressAccent = votingTheme.colors.moss;

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      style={{ width: 12, height: 12, display: "block" }}
    >
      <path
        d="M3.2 8.3 6.4 11.2 12.8 4.8"
        fill="none"
        stroke={votingTheme.colors.white}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function StationProgressIndicator({
  stationIds,
  currentStation,
  completedStations,
}) {
  const completedStationSet =
    completedStations instanceof Set
      ? completedStations
      : new Set(completedStations);
  const completedCount = stationIds.filter((stationId) =>
    completedStationSet.has(stationId),
  ).length;

  return (
    <div
      role="list"
      aria-label={`Trail progress: ${completedCount} of ${stationIds.length} stations completed`}
      aria-roledescription="progress tracker"
      className="progress-indicator"
    >
      {stationIds.map((stationId, index) => {
        const isCurrent = currentStation === stationId;
        const isCompleted = completedStationSet.has(stationId);
        const markerState = isCompleted
          ? isCurrent
            ? "completed-current"
            : "completed"
          : isCurrent
            ? "current"
            : "upcoming";
        const markerLabel = isCompleted
          ? isCurrent
            ? `Station ${stationId}: completed, current station`
            : `Station ${stationId}: completed`
          : isCurrent
            ? `Station ${stationId}: current`
            : `Station ${stationId}: upcoming`;

        return (
          <div key={stationId} style={{ display: "contents" }}>
            <div
              role="listitem"
              aria-label={markerLabel}
              aria-current={isCurrent ? "step" : undefined}
              data-testid={`station-marker-${stationId}`}
              data-state={markerState}
              className="progress-indicator__marker"
            >
              <div
                aria-hidden="true"
                className="progress-indicator__halo"
                style={{
                  "--marker-halo":
                    isCurrent && !isCompleted
                      ? alpha(progressAccent, 0.16)
                      : alpha(votingTheme.colors.white, 0.48),
                  "--marker-halo-shadow":
                    isCurrent && !isCompleted
                      ? `0 0 0 4px ${alpha(progressAccent, 0.12)}`
                      : "none",
                }}
              />
              <div
                aria-hidden="true"
                className="progress-indicator__core"
                style={{
                  "--marker-background": isCompleted
                    ? `linear-gradient(180deg, ${alpha(progressAccent, 0.92)}, ${progressAccent})`
                    : votingTheme.colors.surfaceStrong,
                  "--marker-border":
                    isCompleted || isCurrent
                      ? alpha(progressAccent, isCompleted ? 0.42 : 0.78)
                      : alpha(votingTheme.colors.borderStrong, 0.55),
                  "--marker-shadow": isCompleted
                    ? `0 8px 18px ${alpha(progressAccent, 0.22)}`
                    : `inset 0 1px 0 ${alpha(votingTheme.colors.white, 0.84)}`,
                }}
              >
                {isCompleted ? (
                  <CheckIcon />
                ) : (
                  <div
                    className="progress-indicator__dot"
                    style={{
                      "--marker-dot": isCurrent
                        ? progressAccent
                        : alpha(votingTheme.colors.borderStrong, 0.55),
                    }}
                  />
                )}
              </div>
            </div>

            {index < stationIds.length - 1 ? (
              <div
                aria-hidden="true"
                data-testid={`connector-from-${stationId}`}
                data-state={completedStationSet.has(stationId) ? "filled" : "empty"}
                className="progress-indicator__connector"
              >
                <div
                  className="progress-indicator__connector-fill"
                  style={{
                    "--connector-scale": completedStationSet.has(stationId)
                      ? 1
                      : 0,
                  }}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default memo(StationProgressIndicator);
