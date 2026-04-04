import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import App from "../App";
import { TRAIL_STOPS_BY_ID } from "../data/trailStops";

function renderAppAt(path) {
  window.history.replaceState({}, "", path);
  return render(<App />);
}

describe("TrailMapPage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the separate map view on /map", () => {
    renderAppAt("/map");

    expect(screen.getByText("Event map")).toBeTruthy();
    expect(screen.getByLabelText("Connection Trail map")).toBeTruthy();
    expect(screen.getByText("Browse the Connection Trail map")).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Open in Google Maps" })).toBeNull();
  });

  it("opens with the requested station selected from the canonical query param", () => {
    renderAppAt("/map?station=2");

    expect(
      screen.getByRole("button", { name: "Open details for Station 2" }).getAttribute(
        "aria-pressed",
      ),
    ).toBe("true");
    expect(screen.getByText("Selected stop")).toBeTruthy();
    expect(screen.getAllByText("Multi-Purpose Hall — Mountbatten CC").length).toBe(2);
  });

  it("normalizes legacy station paths to the canonical /map query format", async () => {
    renderAppAt("/map/station2");

    await waitFor(() => {
      expect(window.location.pathname).toBe("/map");
      expect(window.location.search).toBe("?station=2");
    });

    expect(
      screen.getByRole("button", { name: "Open details for Station 2" }).getAttribute(
        "aria-pressed",
      ),
    ).toBe("true");
  });

  it("updates the url when a map pin is clicked", () => {
    renderAppAt("/map");

    fireEvent.click(screen.getByTestId("map-pin-3"));

    expect(window.location.pathname).toBe("/map");
    expect(window.location.search).toBe("?station=3");
    expect(
      screen.getByRole("button", { name: "Open details for Station 3" }).getAttribute(
        "aria-pressed",
      ),
    ).toBe("true");
    expect(screen.getByRole("link", { name: "Open in Google Maps" })).toBeTruthy();
  });

  it("clears invalid station params back to the base map route", async () => {
    renderAppAt("/map?station=99");

    await waitFor(() => {
      expect(window.location.pathname).toBe("/map");
      expect(window.location.search).toBe("");
    });

    expect(screen.getByText("Browse the Connection Trail map")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Open details for Station 1" }).getAttribute(
        "aria-pressed",
      ),
    ).toBe("false");
  });

  it("shows a Google Maps directions link for the selected station", () => {
    renderAppAt("/map?station=4");

    const mapsLink = screen.getByRole("link", { name: "Open in Google Maps" });

    expect(mapsLink.getAttribute("target")).toBe("_blank");
    expect(mapsLink.getAttribute("href")).toBe(
      "https://www.google.com/maps/search/?api=1&query=90B%20Jln.%20Satu%2C%20Dakota%20Breeze%2C%20Singapore%20392090",
    );
  });

  it("shows the stand preview before the Google Maps cta when a selected station has photo metadata", () => {
    renderAppAt("/map?station=2");

    const helperLabel = screen.getByText("Look for this stand");
    const caption = screen.getByText("Look around Level 1 by the hall entrance.");
    const scrollHint = screen.getByText("Scroll down to find the other stations");
    const mapsLink = screen.getByRole("link", { name: "Open in Google Maps" });

    expect(
      helperLabel.compareDocumentPosition(mapsLink) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      caption.compareDocumentPosition(mapsLink) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      scrollHint.compareDocumentPosition(mapsLink) &
        Node.DOCUMENT_POSITION_PRECEDING,
    ).toBeTruthy();
    expect(
      screen.getByAltText(
        "Physical Connection Trail stand at the Multi-Purpose Hall in Mountbatten Community Club",
      ),
    ).toBeTruthy();
  });

  it("does not show an empty stand preview block when no station is selected", () => {
    renderAppAt("/map");

    expect(screen.queryByText("Look for this stand")).toBeNull();
  });

  it("degrades cleanly when a selected station has no stand photo", () => {
    const originalSrc = TRAIL_STOPS_BY_ID[4].standPhotoSrc;
    const originalAlt = TRAIL_STOPS_BY_ID[4].standPhotoAlt;
    const originalCaption = TRAIL_STOPS_BY_ID[4].standPhotoCaption;

    TRAIL_STOPS_BY_ID[4].standPhotoSrc = "";
    TRAIL_STOPS_BY_ID[4].standPhotoAlt = "";
    TRAIL_STOPS_BY_ID[4].standPhotoCaption = "";

    try {
      renderAppAt("/map?station=4");

      expect(screen.queryByText("Look for this stand")).toBeNull();
      expect(screen.getByRole("link", { name: "Open in Google Maps" })).toBeTruthy();
    } finally {
      TRAIL_STOPS_BY_ID[4].standPhotoSrc = originalSrc;
      TRAIL_STOPS_BY_ID[4].standPhotoAlt = originalAlt;
      TRAIL_STOPS_BY_ID[4].standPhotoCaption = originalCaption;
    }
  });
});
