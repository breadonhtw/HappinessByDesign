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
    googleMapsDestination: "SPARKS Mountbatten CC, 87 Jln. Satu, Singapore 390087",
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Mountbatten%20Community%20Club%2C%2087%20Jln.%20Satu%2C%20Singapore%20390087",
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
    googleMapsDestination:
      "Multi-Purpose Hall Mountbatten CC, 87 Jln. Satu, Singapore 390087",
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Mountbatten%20Community%20Club%2C%2087%20Jln.%20Satu%2C%20Singapore%20390087",
    standPhotoSrc: "/station-stands/station-2.jpg",
    standPhotoAlt:
      "Physical Connection Trail stand at the Multi-Purpose Hall in Mountbatten Community Club",
    standPhotoCaption: "Look around Level 1 by the hall entrance.",
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
    googleMapsDestination:
      "Mountbatten Community Library, 87 Jln. Satu, Singapore 390087",
    googleMapsUrl:
      "https://www.google.com/maps/place/1%C2%B018'34.6%22N+103%C2%B053'19.2%22E/@1.309608,103.88867,17z/data=!3m1!4b1!4m4!3m3!8m2!3d1.309608!4d103.88867!18m1!1e1?entry=ttu&g_ep=EgoyMDI2MDMyNC4wIKXMDSoASAFQAw%3D%3D",
    standPhotoSrc: "/station-stands/station-3.jpg",
    standPhotoAlt:
      "Physical Connection Trail stand near Mountbatten Community Library",
    standPhotoCaption: "Look for the stand around the library entrance area.",
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
    googleMapsDestination:
      "Dakota Breeze Residents' Network Lobby, 90B Jln. Satu, Singapore 392090",
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=90B%20Jln.%20Satu%2C%20Dakota%20Breeze%2C%20Singapore%20392090",
    standPhotoSrc: "/station-stands/station-4.jpg",
    standPhotoAlt:
      "Physical Connection Trail stand at the Dakota Breeze Residents' Network lobby",
    standPhotoCaption: "Look around the Level 1 lobby area.",
  },
];

export const TRAIL_STOPS_BY_ID = Object.fromEntries(
  TRAIL_STOPS.map((stop) => [stop.id, stop]),
);

export function getTrailStop(stationId) {
  return TRAIL_STOPS_BY_ID[stationId] ?? null;
}
