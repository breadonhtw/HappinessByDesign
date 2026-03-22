import React from "react";

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

export default function StationProgressIndicator({
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
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
      }}
    >
      {stationIds.map((stationId, index) => {
        const isCurrent = currentStation === stationId;
        const isCompleted = completedStationSet.has(stationId);
        const markerLabel = isCompleted
          ? isCurrent
            ? `Station ${stationId}: completed, current station`
            : `Station ${stationId}: completed`
          : isCurrent
            ? `Station ${stationId}: current`
            : `Station ${stationId}: upcoming`;

        return (
          <React.Fragment key={stationId}>
            <div
              role="listitem"
              aria-label={markerLabel}
              aria-current={isCurrent ? "step" : undefined}
              style={{
                position: "relative",
                flex: "0 0 auto",
                width: 30,
                height: 30,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 12,
                  background:
                    isCurrent && !isCompleted
                      ? alpha(progressAccent, 0.16)
                      : alpha(votingTheme.colors.white, 0.48),
                  boxShadow:
                    isCurrent && !isCompleted
                      ? `0 0 0 4px ${alpha(progressAccent, 0.12)}`
                      : "none",
                }}
              />
              <div
                aria-hidden="true"
                style={{
                  position: "relative",
                  width: 20,
                  height: 20,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isCompleted
                    ? `linear-gradient(180deg, ${alpha(progressAccent, 0.92)}, ${progressAccent})`
                    : votingTheme.colors.surfaceStrong,
                  border: `1px solid ${
                    isCompleted || isCurrent
                      ? alpha(progressAccent, isCompleted ? 0.42 : 0.78)
                      : alpha(votingTheme.colors.borderStrong, 0.55)
                  }`,
                  boxShadow: isCompleted
                    ? `0 8px 18px ${alpha(progressAccent, 0.22)}`
                    : `inset 0 1px 0 ${alpha(votingTheme.colors.white, 0.84)}`,
                }}
              >
                {isCompleted ? (
                  <CheckIcon />
                ) : (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 3,
                      background: isCurrent
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
                style={{
                  flex: 1,
                  position: "relative",
                  height: 2,
                  margin: "0 8px",
                  borderRadius: votingTheme.radius.chip,
                  overflow: "hidden",
                  background: alpha(votingTheme.colors.borderStrong, 0.42),
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: votingTheme.radius.chip,
                    background: `linear-gradient(90deg, ${alpha(progressAccent, 0.92)}, ${progressAccent})`,
                    transform: completedStationSet.has(stationId)
                      ? "scaleX(1)"
                      : "scaleX(0)",
                    transformOrigin: "left center",
                    transition: "transform 0.5s cubic-bezier(0.22, 0.8, 0.22, 1)",
                  }}
                />
              </div>
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
}
