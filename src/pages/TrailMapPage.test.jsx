import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import App from "../App";

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
});
