import React from "react"
import { act } from "react"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import App from "../App"

function markComplete(station, choice = "a") {
  window.localStorage.setItem(`voted_station_${station}`, "true")
  window.localStorage.setItem(`voted_station_${station}_choice`, choice)
}

function renderAppAt(path) {
  window.history.replaceState({}, "", path)
  return render(<App />)
}

describe("VotingPage QR progression", () => {
  it("shows prior-station guidance for out-of-order QR entry", async () => {
    renderAppAt("/vote?station=2")

    expect(
      screen.getByText("Station 1 is still incomplete"),
    ).toBeTruthy()
    expect(screen.getByText("Go to Station 1 first")).toBeTruthy()
    expect(screen.queryByText(/Continue to Station/i)).toBeNull()
    expect(screen.queryByText(/Walk to Station/i)).toBeNull()
  })

  it("does not show the final completion card when last station is done first", async () => {
    markComplete(3)
    renderAppAt("/vote?station=3")

    expect(
      screen.getByText("Station 1 is still incomplete"),
    ).toBeTruthy()
    expect(
      screen.queryByText("Head to Dakota Breeze RN Lobby"),
    ).toBeNull()
  })

  it("shows continue guidance for a completed station only when prior stations are done", async () => {
    markComplete(1)
    renderAppAt("/vote?station=1")

    expect(
      screen.getByText("You've already completed Station 1"),
    ).toBeTruthy()
    expect(screen.getAllByText("Continue to Station 2").length).toBeGreaterThan(0)
  })

  it("shows an invalid-link notice and safe fallback for malformed QR params", async () => {
    renderAppAt("/vote?station=99")

    expect(screen.getByText("QR link check")).toBeTruthy()
    expect(
      screen.getByText(/This QR code points to an invalid station/i),
    ).toBeTruthy()
    expect(screen.getByText(/Station 1 · SPARKS/i)).toBeTruthy()
  })

  it("restores station view with browser back navigation", async () => {
    const user = userEvent.setup()
    renderAppAt("/vote?station=1")

    await user.click(screen.getByLabelText("Go to Station 2"))
    expect(screen.getByText(/Station 2 · mph \/ Opp Sheng Siong/i)).toBeTruthy()

    await act(async () => {
      window.history.back()
    })

    await waitFor(() => {
      expect(screen.getByText(/Station 1 · SPARKS/i)).toBeTruthy()
    })
  })

  it("updates guidance when storage changes in another tab", async () => {
    markComplete(1)
    renderAppAt("/vote?station=2")

    expect(screen.queryByText("You've already completed Station 2")).toBeNull()

    markComplete(2, "b")
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "voted_station_2",
        newValue: "true",
      }),
    )

    await waitFor(() => {
      expect(
        screen.getByText("You've already completed Station 2"),
      ).toBeTruthy()
    })
  })
})
