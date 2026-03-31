export const TRAIL_STOPS = [
  {
    id: 1,
    name: "SPARKS — Mountbatten CC",
    shortLabel: "SPARKS",
    scenarioLocation: "Sparks @ Mountbatten CC",
    address: "87 Jln. Satu, Singapore 390087",
    floor: "Level 3",
    building: "cc",
    kind: "scenario",
    mapColor: "#9A4A4F",
    mapPosition: { x: 158, y: 368 },
  },
  {
    id: 2,
    name: "Multi-Purpose Hall — Mountbatten CC",
    shortLabel: "MPH",
    scenarioLocation: "Mountbatten CC MPH",
    address: "87 Jln. Satu, Singapore 390087",
    floor: "Level 1",
    building: "cc",
    kind: "scenario",
    mapColor: "#647892",
    mapPosition: { x: 218, y: 400 },
  },
  {
    id: 3,
    name: "Mountbatten Community Library",
    shortLabel: "Library",
    scenarioLocation: "Community Library",
    address: "Adjacent to Mountbatten CC",
    floor: null,
    building: "library",
    kind: "scenario",
    mapColor: "#5C7D63",
    mapPosition: { x: 310, y: 370 },
  },
  {
    id: 4,
    name: "Dakota Breeze RN Lobby",
    shortLabel: "Dakota Breeze",
    scenarioLocation: "Dakota Breeze Residential Network Lobby",
    address: "90B Jln. Satu, Dakota Breeze, Singapore 392090",
    floor: "Level 1",
    building: "dakota",
    kind: "destination",
    mapColor: "#B77B48",
    mapPosition: { x: 530, y: 128 },
    badgeSide: "left",
  },
];

export const TRAIL_STOPS_BY_ID = Object.fromEntries(
  TRAIL_STOPS.map((stop) => [stop.id, stop]),
);

export function getTrailStop(stationId) {
  return TRAIL_STOPS_BY_ID[stationId] ?? null;
}
