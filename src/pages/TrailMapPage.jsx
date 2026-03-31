import React, { useEffect, useMemo, useState } from "react";

import { alpha, votingTheme } from "../components/voting/designSystem";
import "../components/voting/voting.css";
import "./trailMap.css";
import { TRAIL_STOPS, TRAIL_STOPS_BY_ID } from "../data/trailStops";
import { navigateToUrl } from "../lib/location";

const VALID_STOP_IDS = new Set(TRAIL_STOPS.map((stop) => stop.id));

const STOP_GROUPS = [
  {
    id: "cc",
    label: "Mountbatten Community Club",
    stops: TRAIL_STOPS.filter((stop) => stop.building === "cc"),
  },
  {
    id: "nearby",
    label: "Nearby Venues",
    stops: TRAIL_STOPS.filter((stop) => stop.building === "library"),
  },
  {
    id: "destination",
    label: "Final Destination",
    stops: TRAIL_STOPS.filter((stop) => stop.kind === "destination"),
  },
];

function buildGoogleMapsDirectionsUrl(destination) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

function getGoogleMapsUrl(stop) {
  if (stop.googleMapsUrl) {
    return stop.googleMapsUrl;
  }

  return buildGoogleMapsDirectionsUrl(stop.googleMapsDestination);
}

function GoogleMapsMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 64 72"
      className="trail-map-summary__maps-logo"
    >
      <defs>
        <clipPath id="google-maps-pin-shape">
          <path d="M32 4C19.85 4 10 13.85 10 26c0 15.22 17.48 24.05 21.28 44.01.11.58.6.99 1.22.99s1.11-.41 1.22-.99C36.52 50.05 54 41.22 54 26 54 13.85 44.15 4 32 4Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#google-maps-pin-shape)">
        <rect x="0" y="0" width="64" height="72" fill="#34A853" />
        <polygon points="0,0 34,0 22,26 0,26" fill="#EA4335" />
        <polygon points="18,26 42,0 64,0 40,28" fill="#1A73E8" />
        <polygon points="18,26 40,28 24,50 8,34" fill="#FBBC04" />
        <polygon points="40,28 64,0 64,30 50,44" fill="#4285F4" opacity="0.9" />
      </g>
      <circle cx="32" cy="27" r="11" fill="#fff" />
    </svg>
  );
}

function parseStationValue(value) {
  if (value === null || value === "") {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return VALID_STOP_IDS.has(parsed) ? parsed : null;
}

function readMapSelectionFromLocation(currentLocation = window.location) {
  const { hash, pathname, search } = currentLocation;
  const params = new URLSearchParams(search);
  const queryStation = parseStationValue(params.get("station"));
  const hashMatch =
    hash.match(/station[=\s/_-]*(\d+)/i) ?? hash.match(/^#(\d+)$/);
  const pathMatch = pathname.match(/\/map\/station(?:[/_-]?)(\d+)$/i);

  const queryHasStation = params.has("station");
  const hashHasStation = hash.length > 0;
  const isLegacyPath = /^\/map\/station/i.test(pathname);
  const hashStation = hashMatch ? parseStationValue(hashMatch[1]) : null;
  const pathStation = pathMatch ? parseStationValue(pathMatch[1]) : null;
  const selectedStation = queryStation ?? hashStation ?? pathStation ?? null;
  const canonicalUrl = selectedStation ? `/map?station=${selectedStation}` : "/map";
  const shouldNormalize =
    pathname !== "/map" ||
    hash.length > 0 ||
    (queryHasStation && queryStation === null) ||
    (isLegacyPath && pathStation === null) ||
    (!queryHasStation && hashHasStation) ||
    (!queryHasStation && isLegacyPath);

  return {
    selectedStation,
    canonicalUrl,
    shouldNormalize,
  };
}

function formatFloorBadge(floor) {
  return floor?.replace("Level ", "L") ?? "";
}

function MapPin({ stop, isActive, onSelect }) {
  const { x, y } = stop.mapPosition;
  const dy = isActive ? -5 : 0;
  const strokeColor = alpha(votingTheme.colors.surfaceStrong, 0.9);
  const badgeOnLeft = stop.badgeSide === "left";
  const badgeX = badgeOnLeft ? x - 40 : x + 12;
  const badgeTextX = badgeOnLeft ? x - 26 : x + 26;

  const handleKeyDown = (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    onSelect();
  };

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`View Station ${stop.id} on map`}
      data-testid={`map-pin-${stop.id}`}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      style={{ cursor: "pointer", outline: "none" }}
    >
      <ellipse
        cx={x}
        cy={y + 30}
        rx={7}
        ry={3}
        fill={alpha(votingTheme.colors.text, 0.16)}
      />
      <g
        style={{
          transform: `translateY(${dy}px)`,
          transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <path
          d={`M${x},${y + 26} C${x - 2},${y + 19} ${x - 15},${y + 5} ${x - 15},${y - 5}
              A15,15 0 1,1 ${x + 15},${y - 5}
              C${x + 15},${y + 5} ${x + 2},${y + 19} ${x},${y + 26}Z`}
          fill={stop.mapColor}
          stroke={strokeColor}
          strokeWidth="2.5"
          style={{
            filter: isActive
              ? `drop-shadow(0 10px 16px ${alpha(stop.mapColor, 0.32)})`
              : `drop-shadow(0 4px 7px ${alpha(votingTheme.colors.text, 0.14)})`,
          }}
        />
        <circle
          cx={x}
          cy={y - 5}
          r={8.5}
          fill={votingTheme.colors.surfaceStrong}
        />
        <text
          x={x}
          y={y - 1}
          textAnchor="middle"
          fill={stop.mapColor}
          fontWeight="800"
          fontSize="12"
          fontFamily={votingTheme.fonts.body}
        >
          {stop.id}
        </text>

        {stop.floor ? (
          <g>
            <rect
              x={badgeX}
              y={y - 22}
              width={28}
              height={14}
              rx={4}
              fill={stop.mapColor}
              opacity={isActive ? 1 : 0.9}
            />
            <text
              x={badgeTextX}
              y={y - 12.5}
              textAnchor="middle"
              fill={votingTheme.colors.surfaceStrong}
              fontSize="7.5"
              fontWeight="700"
              fontFamily={votingTheme.fonts.body}
            >
              {formatFloorBadge(stop.floor)}
            </text>
          </g>
        ) : null}
      </g>

      {isActive ? (
        <circle
          cx={x}
          cy={y - 5}
          r={20}
          fill="none"
          stroke={stop.mapColor}
          strokeWidth="2.5"
          opacity="0.35"
        >
          <animate
            attributeName="r"
            from="18"
            to="36"
            dur="1.3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            from="0.5"
            to="0"
            dur="1.3s"
            repeatCount="indefinite"
          />
        </circle>
      ) : null}
    </g>
  );
}

function FloorBracket({ x1, y1, x2, y2, isEitherActive }) {
  const mx = Math.min(x1, x2) - 18;
  const bracketColor = alpha(votingTheme.colors.textSoft, isEitherActive ? 0.75 : 0.42);

  return (
    <g opacity={isEitherActive ? 0.8 : 0.5} style={{ transition: "opacity 0.3s ease" }}>
      <line
        x1={x1 - 14}
        y1={y1}
        x2={mx}
        y2={y1}
        stroke={bracketColor}
        strokeWidth="1"
        strokeDasharray="3 2"
      />
      <line
        x1={mx}
        y1={y1}
        x2={mx}
        y2={y2}
        stroke={bracketColor}
        strokeWidth="1"
        strokeDasharray="3 2"
      />
      <line
        x1={mx}
        y1={y2}
        x2={x2 - 14}
        y2={y2}
        stroke={bracketColor}
        strokeWidth="1"
        strokeDasharray="3 2"
      />
      <text
        x={mx - 5}
        y={(y1 + y2) / 2 + 3}
        textAnchor="middle"
        fill={bracketColor}
        fontSize="6"
        fontWeight="700"
        fontFamily={votingTheme.fonts.body}
        transform={`rotate(-90, ${mx - 5}, ${(y1 + y2) / 2 + 3})`}
      >
        SAME BLDG
      </text>
    </g>
  );
}

export default function TrailMapPage() {
  const [activeStation, setActiveStation] = useState(
    () => readMapSelectionFromLocation().selectedStation,
  );

  useEffect(() => {
    const syncFromLocation = () => {
      const { canonicalUrl, selectedStation, shouldNormalize } =
        readMapSelectionFromLocation();

      setActiveStation(selectedStation);

      if (shouldNormalize) {
        navigateToUrl(canonicalUrl, { replace: true });
      }
    };

    syncFromLocation();

    window.addEventListener("popstate", syncFromLocation);
    window.addEventListener("hashchange", syncFromLocation);

    return () => {
      window.removeEventListener("popstate", syncFromLocation);
      window.removeEventListener("hashchange", syncFromLocation);
    };
  }, []);

  const activeStop = activeStation ? TRAIL_STOPS_BY_ID[activeStation] ?? null : null;
  const ccActive = activeStation === 1 || activeStation === 2;

  const setSelectedStation = (nextStation) => {
    const normalizedStation = VALID_STOP_IDS.has(nextStation) ? nextStation : null;

    setActiveStation(normalizedStation);
    navigateToUrl(
      normalizedStation ? `/map?station=${normalizedStation}` : "/map",
    );
  };

  const selectedCard = useMemo(() => {
    if (activeStop) {
      return {
        eyebrow: activeStop.kind === "destination" ? "Final destination" : "Selected stop",
        title: activeStop.name,
        body:
          activeStop.kind === "destination"
            ? "This is the final in-person stop for the Connection Trail."
            : "This stop is part of the Connection Trail voting journey.",
      };
    }

    return {
      eyebrow: "Trail overview",
      title: "Browse the Connection Trail map",
      body:
        "Tap a pin or choose a stop below to see where each Connection Trail venue sits within the Mountbatten and Dakota area.",
    };
  }, [activeStop]);

  const googleMapsUrl = activeStop ? getGoogleMapsUrl(activeStop) : null;

  return (
    <div className="voting-app trail-map-app">
      <div className="voting-shell trail-map-shell">
        <div className="voting-shell__glow" />

        <div className="voting-header trail-map-header">
          <div className="voting-brand">The Connection Trail</div>

          <div className="voting-station-wrap">
            <span className="voting-station-line" />
            <div className="vt-chip voting-station-chip">
              <span>Event map</span>
            </div>
            <span className="voting-station-line" />
          </div>
        </div>

        <div className="trail-map-summary">
          <div className="vt-panel vt-panel--base trail-map-summary__panel">
            <div className="vt-eyebrow trail-map-summary__eyebrow">
              {selectedCard.eyebrow}
            </div>
            <div className="trail-map-summary__heading-row">
              <div className="vt-section-title trail-map-summary__title">
                {selectedCard.title}
              </div>
              {activeStop ? (
                <button
                  type="button"
                  className="trail-map-summary__clear"
                  onClick={() => setSelectedStation(null)}
                >
                  Clear selection
                </button>
              ) : null}
            </div>
            <p className="vt-body trail-map-summary__body">{selectedCard.body}</p>
            {activeStop ? (
              <div className="trail-map-summary__meta">
                <div className="vt-chip trail-map-summary__meta-chip">
                  <span>Station {activeStop.id}</span>
                </div>
                {activeStop.floor ? (
                  <div className="vt-chip trail-map-summary__meta-chip">
                    <span>{activeStop.floor}</span>
                  </div>
                ) : null}
                <div className="vt-chip trail-map-summary__meta-chip">
                  <span>{activeStop.address}</span>
                </div>
              </div>
            ) : null}
            {googleMapsUrl ? (
              <a
                className="trail-map-summary__maps-link"
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Open in Google Maps"
              >
                <span className="trail-map-summary__maps-mark-wrap">
                  <GoogleMapsMark />
                </span>
                <span className="trail-map-summary__maps-copy">
                  <span className="trail-map-summary__maps-kicker">Open in</span>
                  <span className="trail-map-summary__maps-brand">Google Maps</span>
                </span>
                <span aria-hidden="true" className="trail-map-summary__maps-arrow">
                  ↗
                </span>
              </a>
            ) : null}
          </div>
        </div>

        <div className="trail-map-layout">
          <div className="trail-map-layout__canvas">
            <div className="vt-panel vt-panel--strong trail-map-canvas">
              <svg
                viewBox="0 0 700 560"
                aria-label="Connection Trail map"
                className="trail-map-canvas__svg"
              >
                <defs>
                  <linearGradient id="trail-map-bg" x1="0" y1="0" x2="0.7" y2="1">
                    <stop offset="0%" stopColor="#FBF4E8" />
                    <stop offset="100%" stopColor="#F1E1C9" />
                  </linearGradient>
                  <linearGradient id="trail-map-river" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#9CB6C2" />
                    <stop offset="100%" stopColor="#7994A2" />
                  </linearGradient>
                  <pattern
                    id="trail-map-dots"
                    width="16"
                    height="16"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle
                      cx="8"
                      cy="8"
                      r="0.8"
                      fill={alpha(votingTheme.colors.borderStrong, 0.18)}
                    />
                  </pattern>
                </defs>

                <rect width="700" height="560" fill="url(#trail-map-bg)" />
                <rect width="700" height="560" fill="url(#trail-map-dots)" />

                <rect
                  x="612"
                  y="0"
                  width="55"
                  height="560"
                  fill="url(#trail-map-river)"
                  opacity="0.55"
                />
                <rect
                  x="620"
                  y="0"
                  width="40"
                  height="560"
                  fill="#B8CDD6"
                  opacity="0.22"
                />
                {[60, 160, 270, 370, 460].map((ry) => (
                  <path
                    key={ry}
                    d={`M622,${ry} Q636,${ry - 5} 650,${ry}`}
                    stroke="#8EABB7"
                    strokeWidth="1"
                    fill="none"
                    opacity="0.35"
                  >
                    <animate
                      attributeName="d"
                      values={`M622,${ry} Q636,${ry - 5} 650,${ry};M622,${ry} Q636,${ry + 5} 650,${ry};M622,${ry} Q636,${ry - 5} 650,${ry}`}
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </path>
                ))}
                <text
                  x="640"
                  y="290"
                  textAnchor="middle"
                  fill={alpha(votingTheme.colors.textSoft, 0.75)}
                  fontSize="7.5"
                  fontWeight="700"
                  fontFamily={votingTheme.fonts.body}
                  letterSpacing="2.5"
                  transform="rotate(90, 640, 290)"
                >
                  GEYLANG RIVER
                </text>

                <rect x="0" y="55" width="612" height="32" fill="#D7C6B2" rx="2" />
                <line
                  x1="0"
                  y1="71"
                  x2="612"
                  y2="71"
                  stroke={alpha(votingTheme.colors.textSoft, 0.38)}
                  strokeWidth="1"
                  strokeDasharray="10 7"
                />
                <text
                  x="300"
                  y="68"
                  textAnchor="middle"
                  fill={alpha(votingTheme.colors.textSoft, 0.72)}
                  fontSize="7.5"
                  fontWeight="700"
                  fontFamily={votingTheme.fonts.body}
                  letterSpacing="2"
                >
                  GUILLEMARD ROAD
                </text>

                <rect x="0" y="492" width="612" height="32" fill="#D7C6B2" rx="2" />
                <line
                  x1="0"
                  y1="508"
                  x2="612"
                  y2="508"
                  stroke={alpha(votingTheme.colors.textSoft, 0.38)}
                  strokeWidth="1"
                  strokeDasharray="10 7"
                />
                <text
                  x="430"
                  y="512"
                  textAnchor="middle"
                  fill={alpha(votingTheme.colors.textSoft, 0.72)}
                  fontSize="7.5"
                  fontWeight="700"
                  fontFamily={votingTheme.fonts.body}
                  letterSpacing="2"
                >
                  OLD AIRPORT ROAD
                </text>

                <rect x="55" y="55" width="26" height="470" fill="#E2D6C7" rx="2" />
                <line
                  x1="68"
                  y1="55"
                  x2="68"
                  y2="525"
                  stroke={alpha(votingTheme.colors.textSoft, 0.34)}
                  strokeWidth="1"
                  strokeDasharray="8 6"
                />
                <text
                  x="68"
                  y="270"
                  textAnchor="middle"
                  fill={alpha(votingTheme.colors.textSoft, 0.65)}
                  fontSize="7"
                  fontWeight="700"
                  fontFamily={votingTheme.fonts.body}
                  letterSpacing="2"
                  transform="rotate(-90, 68, 270)"
                >
                  CASSIA LINK
                </text>

                <rect x="83" y="432" width="530" height="24" fill="#E2D6C7" rx="2" />
                <line
                  x1="83"
                  y1="444"
                  x2="613"
                  y2="444"
                  stroke={alpha(votingTheme.colors.textSoft, 0.34)}
                  strokeWidth="1"
                  strokeDasharray="8 6"
                />
                <text
                  x="440"
                  y="448"
                  textAnchor="middle"
                  fill={alpha(votingTheme.colors.textSoft, 0.65)}
                  fontSize="7"
                  fontWeight="700"
                  fontFamily={votingTheme.fonts.body}
                  letterSpacing="2"
                >
                  JALAN DUA
                </text>

                <rect x="188" y="87" width="22" height="345" fill="#F0E7DC" rx="2" />
                <rect x="210" y="152" width="340" height="22" fill="#F0E7DC" rx="2" />

                <rect x="240" y="200" width="150" height="110" rx="10" fill="#DDE3D1" />
                <rect x="410" y="200" width="85" height="80" rx="8" fill="#E3E9D9" />
                <rect x="96" y="96" width="78" height="52" rx="8" fill="#E3E9D9" />
                <rect x="96" y="280" width="75" height="50" rx="8" fill="#E8EBDD" />

                <rect
                  x="113"
                  y="348"
                  width="124"
                  height="82"
                  rx="6"
                  fill="none"
                  stroke={ccActive ? alpha(votingTheme.colors.brass, 0.75) : "transparent"}
                  strokeWidth={ccActive ? "2" : "0"}
                  strokeDasharray="5 3"
                  opacity={ccActive ? 0.85 : 0}
                  style={{ transition: "all 0.3s ease" }}
                />
                <rect x="115" y="350" width="120" height="78" rx="5" fill="#CAB69C" />
                <rect x="118" y="353" width="114" height="72" rx="4" fill="#D7C8B7" />
                {[0, 1, 2, 3].map((col) =>
                  [0, 1].map((row) => (
                    <rect
                      key={`cc-${col}-${row}`}
                      x={126 + col * 25}
                      y={362 + row * 26}
                      width={17}
                      height={11}
                      rx={2}
                      fill="#B49E84"
                      opacity="0.55"
                    />
                  )),
                )}
                <text
                  x="175"
                  y="462"
                  textAnchor="middle"
                  fill={alpha(votingTheme.colors.textSoft, 0.84)}
                  fontSize="6.5"
                  fontWeight="700"
                  fontFamily={votingTheme.fonts.body}
                  letterSpacing="0.5"
                >
                  MOUNTBATTEN CC
                </text>

                <FloorBracket
                  x1={TRAIL_STOPS_BY_ID[1].mapPosition.x}
                  y1={TRAIL_STOPS_BY_ID[1].mapPosition.y}
                  x2={TRAIL_STOPS_BY_ID[2].mapPosition.x}
                  y2={TRAIL_STOPS_BY_ID[2].mapPosition.y}
                  isEitherActive={ccActive}
                />

                <rect x="268" y="338" width="82" height="52" rx="4" fill="#C4D1BF" />
                <rect x="270" y="340" width="78" height="48" rx="3" fill="#D5DDCF" />
                {[0, 1, 2].map((col) =>
                  [0, 1].map((row) => (
                    <rect
                      key={`lib-${col}-${row}`}
                      x={278 + col * 22}
                      y={348 + row * 18}
                      width={14}
                      height={9}
                      rx={2}
                      fill="#A9BCA0"
                      opacity="0.65"
                    />
                  )),
                )}
                <text
                  x="309"
                  y="404"
                  textAnchor="middle"
                  fill={alpha(votingTheme.colors.textSoft, 0.78)}
                  fontSize="6"
                  fontWeight="700"
                  fontFamily={votingTheme.fonts.body}
                  letterSpacing="0.3"
                >
                  COMMUNITY LIBRARY
                </text>

                <rect x="478" y="93" width="120" height="52" rx="5" fill="#D5C6B2" />
                <rect x="481" y="96" width="114" height="46" rx="4" fill="#E1D4C4" />
                {[0, 1, 2, 3, 4].map((col) =>
                  [0, 1].map((row) => (
                    <rect
                      key={`db-${col}-${row}`}
                      x={488 + col * 20}
                      y={103 + row * 17}
                      width={12}
                      height={8}
                      rx={1.5}
                      fill={row === 0 ? "#C38E62" : "#C8B59F"}
                      opacity={row === 0 ? 0.4 : 0.7}
                    />
                  )),
                )}
                <text
                  x="538"
                  y="158"
                  textAnchor="middle"
                  fill={alpha(votingTheme.colors.textSoft, 0.78)}
                  fontSize="6.5"
                  fontWeight="700"
                  fontFamily={votingTheme.fonts.body}
                  letterSpacing="0.3"
                >
                  DAKOTA BREEZE
                </text>

                <rect x="98" y="98" width="68" height="42" rx="4" fill="#D6D9CD" />
                <rect x="130" y="210" width="42" height="55" rx="4" fill="#DED9D0" />
                <rect x="490" y="310" width="50" height="50" rx="4" fill="#DED9D0" />
                <rect x="380" y="350" width="55" height="40" rx="4" fill="#DED9D0" />
                <rect x="540" y="390" width="50" height="35" rx="4" fill="#DED9D0" />
                <rect x="300" y="460" width="65" height="24" rx="3" fill="#DED9D0" />
                <rect x="460" y="460" width="50" height="26" rx="3" fill="#DED9D0" />
                <rect x="350" y="96" width="48" height="38" rx="4" fill="#DED9D0" />
                <rect x="250" y="96" width="40" height="35" rx="4" fill="#DED9D0" />

                {TRAIL_STOPS.map((stop) => (
                  <MapPin
                    key={stop.id}
                    stop={stop}
                    isActive={activeStation === stop.id}
                    onSelect={() =>
                      setSelectedStation(activeStation === stop.id ? null : stop.id)
                    }
                  />
                ))}

                <g transform="translate(650, 38)">
                  <circle
                    cx="0"
                    cy="0"
                    r="16"
                    fill={alpha(votingTheme.colors.surfaceStrong, 0.84)}
                    stroke={alpha(votingTheme.colors.textSoft, 0.38)}
                    strokeWidth="0.7"
                  />
                  <text
                    x="0"
                    y="-3"
                    textAnchor="middle"
                    fill={votingTheme.colors.text}
                    fontSize="8"
                    fontWeight="800"
                    fontFamily={votingTheme.fonts.body}
                  >
                    N
                  </text>
                  <path
                    d="M0,1 L-3,8 L0,5 L3,8 Z"
                    fill={alpha(votingTheme.colors.brass, 0.76)}
                  />
                </g>

                <g transform="translate(530, 506)">
                  <rect
                    x="-30"
                    y="-9"
                    width="60"
                    height="18"
                    rx="4"
                    fill="#C38E62"
                    opacity="0.84"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill={votingTheme.colors.surfaceStrong}
                    fontSize="7"
                    fontWeight="800"
                    fontFamily={votingTheme.fonts.body}
                  >
                    CC8 Dakota
                  </text>
                </g>
              </svg>
            </div>
          </div>

          <div className="trail-map-layout__sidebar">
            <div className="vt-panel vt-panel--base trail-map-panel">
              <div className="vt-eyebrow trail-map-panel__eyebrow">Stations</div>
              <div className="trail-map-station-groups">
                {STOP_GROUPS.map((group) => (
                  <div key={group.id} className="trail-map-station-group">
                    <div className="trail-map-station-group__title">{group.label}</div>
                    <div className="trail-map-station-group__items">
                      {group.stops.map((stop) => {
                        const isActive = activeStation === stop.id;

                        return (
                          <button
                            key={stop.id}
                            type="button"
                            className="trail-map-stop-button"
                            aria-pressed={isActive}
                            aria-label={`Open details for Station ${stop.id}`}
                            onClick={() =>
                              setSelectedStation(isActive ? null : stop.id)
                            }
                          >
                            <span
                              className="trail-map-stop-button__marker"
                              style={{
                                "--stop-marker": stop.mapColor,
                                "--stop-glow": alpha(stop.mapColor, 0.28),
                              }}
                            >
                              {stop.id}
                            </span>
                            <span className="trail-map-stop-button__copy">
                              <span className="trail-map-stop-button__name">{stop.name}</span>
                              <span className="trail-map-stop-button__meta">
                                {stop.floor ? `${stop.floor} · ` : ""}
                                {stop.address}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="voting-footer">
          <div className="voting-footer__line" />
          The Connection Trail — UTS2110 Happiness by Design
          <br />
          Group 3 × Dakota Breeze Residents&apos; Network
        </div>
      </div>
    </div>
  );
}
