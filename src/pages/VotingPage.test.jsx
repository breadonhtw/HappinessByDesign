import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import App from "../App";

function markComplete(station, choice = "a") {
  window.localStorage.setItem(`voted_station_${station}`, "true");
  window.localStorage.setItem(`voted_station_${station}_choice`, choice);
}

function renderAppAt(path) {
  window.history.replaceState({}, "", path);
  return render(<App />);
}

function buildFetchMock(overrides = {}) {
  const getPayload =
    overrides.getPayload ??
    { 1: { a: 3, b: 0 }, 2: { a: 0, b: 1 }, 3: { a: 0, b: 0 } };

  return vi.fn((_, init) => {
    if (!init?.method || init.method === "GET") {
      return Promise.resolve({
        ok: true,
        json: async () => getPayload,
      });
    }

    if (overrides.postResponse) {
      return Promise.resolve(overrides.postResponse);
    }

    return Promise.resolve({
      ok: true,
      text: async () => JSON.stringify({ success: true }),
    });
  });
}

function getChoiceButton(choice) {
  if (choice.toLowerCase() === "other") {
    return screen.getByRole("button", {
      name: /^Choose Other:/i,
    });
  }

  return screen.getByRole("button", {
    name: new RegExp(`^Choose Option ${choice}:`, "i"),
  });
}

async function submitChoice(choice, options = {}) {
  fireEvent.click(getChoiceButton(choice));

  if (options.ageRange) {
    fireEvent.click(
      screen.getByRole("button", {
        name: `Select age range ${options.ageRange}`,
      }),
    );
  }

  if (options.otherText) {
    fireEvent.change(
      screen.getByLabelText("Tell us what you would choose instead"),
      { target: { value: options.otherText } },
    );
  }

  fireEvent.click(screen.getByRole("button", { name: "Submit response" }));

  await act(async () => {
    await new Promise((resolve) => window.setTimeout(resolve, 20));
  });
}

describe("VotingPage QR progression", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a non-interactive progress tracker for the current and upcoming stations", async () => {
    renderAppAt("/vote?station=1");

    expect(
      screen.getByRole("list", {
        name: "Trail progress: 0 of 3 stations completed",
      }),
    ).toBeTruthy();
    expect(screen.queryByLabelText("Go to Station 1")).toBeNull();
    expect(screen.getByLabelText("Station 1: current")).toBeTruthy();
    expect(
      screen.getByLabelText("Station 1: current").getAttribute("aria-current"),
    ).toBe("step");
    expect(screen.getByLabelText("Station 2: upcoming")).toBeTruthy();
    expect(screen.getByLabelText("Station 3: upcoming")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /^Choose Option A:/i }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /^Choose Option B:/i }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /^Choose Other:/i }),
    ).toBeTruthy();
    expect(screen.queryByText("Tap an option to choose")).toBeNull();
    expect(screen.queryByText(/swipe/i)).toBeNull();

    await submitChoice("B");

    await waitFor(() => {
      expect(screen.getByText(/The Loneliness Loop/i)).toBeTruthy();
    });
  });

  it("shows prior-station guidance for out-of-order QR entry", async () => {
    renderAppAt("/vote?station=2");

    expect(
      screen.getByText("Station 1 is still incomplete"),
    ).toBeTruthy();
    expect(screen.getByText("Go to Station 1 first")).toBeTruthy();
    expect(screen.queryByText(/Continue to Station/i)).toBeNull();
    expect(screen.queryByText(/Head to Station/i)).toBeNull();
    expect(screen.getByTestId("station-marker-1").getAttribute("data-state")).toBe(
      "upcoming",
    );
    expect(screen.getByTestId("station-marker-2").getAttribute("data-state")).toBe(
      "current",
    );
    expect(screen.getByTestId("connector-from-1").getAttribute("data-state")).toBe(
      "empty",
    );
    expect(screen.getByTestId("connector-from-2").getAttribute("data-state")).toBe(
      "empty",
    );
  });

  it("does not show the final completion card when last station is done first", async () => {
    markComplete(3);
    renderAppAt("/vote?station=3");

    expect(
      screen.getByText("Station 1 is still incomplete"),
    ).toBeTruthy();
    expect(
      screen.queryByText("Head to Dakota Breeze Residential Network Lobby"),
    ).toBeNull();
    expect(screen.getByTestId("station-marker-3").getAttribute("data-state")).toBe(
      "completed-current",
    );
    expect(screen.getByTestId("connector-from-1").getAttribute("data-state")).toBe(
      "empty",
    );
    expect(screen.getByTestId("connector-from-2").getAttribute("data-state")).toBe(
      "empty",
    );
  });

  it("shows completed-station guidance without duplicating the primary next-step CTA", async () => {
    markComplete(1);
    renderAppAt("/vote?station=1");

    expect(
      screen.getByText("You've already completed Station 1"),
    ).toBeTruthy();
    expect(screen.queryByText("Continue to Station 2")).toBeNull();
    expect(screen.getByText("Head to Station 2")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Go to Station 2" })).toBeTruthy();
  });

  it("shows an invalid-link notice and safe fallback for malformed QR params", async () => {
    renderAppAt("/vote?station=99");

    expect(screen.getByText("QR link check")).toBeTruthy();
    expect(
      screen.getByText(/This QR code points to an invalid station/i),
    ).toBeTruthy();
    expect(screen.getByText(/Station 1 · SPARKS/i)).toBeTruthy();
    expect(screen.getByLabelText("Station 1: current")).toBeTruthy();
  });

  it("restores station view with browser back navigation", async () => {
    const user = userEvent.setup();
    markComplete(1);
    renderAppAt("/vote?station=1");

    await user.click(screen.getByRole("button", { name: "Go to Station 2" }));
    expect(screen.getByText(/Station 2 · Mountbatten CC MPH/i)).toBeTruthy();

    await act(async () => {
      window.history.back();
    });

    await waitFor(() => {
      expect(screen.getByText(/Station 1 · SPARKS/i)).toBeTruthy();
    });
  });

  it("updates guidance when storage changes in another tab", async () => {
    markComplete(1);
    renderAppAt("/vote?station=2");

    expect(screen.queryByText("You've already completed Station 2")).toBeNull();

    markComplete(2, "b");
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "voted_station_2",
        newValue: "true",
      }),
    );

    await waitFor(() => {
      expect(
        screen.getByText("You've already completed Station 2"),
      ).toBeTruthy();
    });
    expect(screen.getByLabelText("Station 1: completed")).toBeTruthy();
    expect(
      screen.getByLabelText("Station 2: completed, current station"),
    ).toBeTruthy();
    expect(screen.getByTestId("station-marker-2").getAttribute("data-state")).toBe(
      "completed-current",
    );
    expect(screen.getByTestId("connector-from-1").getAttribute("data-state")).toBe(
      "filled",
    );
    expect(screen.getByTestId("connector-from-2").getAttribute("data-state")).toBe(
      "filled",
    );
  });

  it("shows completed progress for finished stations", async () => {
    markComplete(1);
    renderAppAt("/vote?station=2");

    expect(screen.getByLabelText("Station 1: completed")).toBeTruthy();
    expect(screen.getByLabelText("Station 2: current")).toBeTruthy();
    expect(screen.getByLabelText("Station 3: upcoming")).toBeTruthy();
    expect(screen.getByTestId("station-marker-1").getAttribute("data-state")).toBe(
      "completed",
    );
    expect(screen.getByTestId("station-marker-2").getAttribute("data-state")).toBe(
      "current",
    );
    expect(screen.getByTestId("connector-from-1").getAttribute("data-state")).toBe(
      "filled",
    );
    expect(screen.getByTestId("connector-from-2").getAttribute("data-state")).toBe(
      "empty",
    );
  });

  it("shows raw completion for station 2 while guidance still points back to station 1", async () => {
    markComplete(2, "b");
    renderAppAt("/vote?station=2");

    expect(screen.getByText("Station 1 is still incomplete")).toBeTruthy();
    expect(screen.getByText("Go to Station 1 first")).toBeTruthy();
    expect(screen.queryByText(/Head to Station/i)).toBeNull();
    expect(screen.getByTestId("station-marker-1").getAttribute("data-state")).toBe(
      "upcoming",
    );
    expect(screen.getByTestId("station-marker-2").getAttribute("data-state")).toBe(
      "completed-current",
    );
    expect(screen.getByTestId("connector-from-1").getAttribute("data-state")).toBe(
      "empty",
    );
    expect(screen.getByTestId("connector-from-2").getAttribute("data-state")).toBe(
      "filled",
    );
  });

  it("shows station 3 as completed while preserving the earliest prior-gap guidance", async () => {
    markComplete(1);
    markComplete(3, "b");
    renderAppAt("/vote?station=3");

    expect(screen.getByText("Station 2 is still incomplete")).toBeTruthy();
    expect(screen.getByText("Go to Station 2 first")).toBeTruthy();
    expect(screen.queryByText(/Head to Station/i)).toBeNull();
    expect(
      screen.queryByText("Head to Dakota Breeze Residential Network Lobby"),
    ).toBeNull();
    expect(screen.getByTestId("station-marker-1").getAttribute("data-state")).toBe(
      "completed",
    );
    expect(screen.getByTestId("station-marker-2").getAttribute("data-state")).toBe(
      "upcoming",
    );
    expect(screen.getByTestId("station-marker-3").getAttribute("data-state")).toBe(
      "completed-current",
    );
    expect(screen.getByTestId("connector-from-1").getAttribute("data-state")).toBe(
      "filled",
    );
    expect(screen.getByTestId("connector-from-2").getAttribute("data-state")).toBe(
      "empty",
    );
  });

  it("shows a final map CTA after completing station 3 and routes to the destination map", async () => {
    const user = userEvent.setup();
    markComplete(1);
    markComplete(2);
    renderAppAt("/vote?station=3");

    await submitChoice("A");

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Open final destination map" }),
      ).toBeTruthy();
    });

    await user.click(
      screen.getByRole("button", { name: "Open final destination map" }),
    );

    await waitFor(() => {
      expect(window.location.pathname).toBe("/map");
      expect(window.location.search).toBe("?station=4");
      expect(screen.getByText("Final destination")).toBeTruthy();
      expect(screen.getAllByText("Dakota Breeze RN Lobby").length).toBeGreaterThan(0);
    });
  });

  it("submits votes as a CORS-simple text payload after final form submit", async () => {
    const fetchMock = buildFetchMock();

    vi.stubGlobal("fetch", fetchMock);

    renderAppAt("/vote?station=1");

    await submitChoice("A");

    const postCall = fetchMock.mock.calls.find(([, init]) => init?.method === "POST");

    expect(postCall).toBeTruthy();
    expect(postCall[1].headers["Content-Type"]).toBe("text/plain;charset=utf-8");
    expect(postCall[1].body).toBe(JSON.stringify({ station: 1, choice: "a" }));
  });

  it("shows a sync error when the vote API returns success false", async () => {
    const fetchMock = buildFetchMock({
      postResponse: {
        ok: true,
        text: async () => JSON.stringify({ success: false }),
      },
    });

    vi.stubGlobal("fetch", fetchMock);

    renderAppAt("/vote?station=1");

    await submitChoice("A");

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeTruthy();
    });

    expect(
      screen.getByText(
        "Your response is saved on this device, but the vote server did not confirm it. Retry to sync it.",
      ),
    ).toBeTruthy();
  });

  it("does not submit on initial option tap until the final form submit", async () => {
    const fetchMock = buildFetchMock();

    vi.stubGlobal("fetch", fetchMock);

    renderAppAt("/vote?station=1");

    fireEvent.pointerDown(getChoiceButton("A"));
    fireEvent.click(getChoiceButton("A"));

    expect(
      fetchMock.mock.calls.find(([, init]) => init?.method === "POST"),
    ).toBeUndefined();
    expect(screen.getByRole("button", { name: "Submit response" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Submit response" }));

    await waitFor(() => {
      const postCalls = fetchMock.mock.calls.filter(([, init]) => init?.method === "POST");
      expect(postCalls.length).toBe(1);
      expect(postCalls[0][1].body).toBe(JSON.stringify({ station: 1, choice: "a" }));
    });
  });

  it("requires text for Other and submits age range plus otherText", async () => {
    const fetchMock = buildFetchMock();

    vi.stubGlobal("fetch", fetchMock);

    renderAppAt("/vote?station=2");

    fireEvent.click(getChoiceButton("Other"));
    expect(screen.getByRole("button", { name: "Submit response" }).disabled).toBe(true);

    await submitChoice("Other", {
      ageRange: "18-24",
      otherText: "I'd join for a bit, then head off.",
    });

    await waitFor(() => {
      expect(screen.getByText("Thanks for sharing another path")).toBeTruthy();
    });

    const postCall = fetchMock.mock.calls.find(([, init]) => init?.method === "POST");
    expect(postCall[1].body).toBe(
      JSON.stringify({
        station: 2,
        choice: "other",
        ageRange: "18-24",
        otherText: "I'd join for a bit, then head off.",
      }),
    );
  });
});
