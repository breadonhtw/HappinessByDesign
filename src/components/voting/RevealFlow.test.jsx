import React from "react"
import { act, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { SCENARIOS } from "../../data/scenarios"
import RevealFlow from "./RevealFlow"

function buildScenario(votes) {
  return {
    ...SCENARIOS[1],
    votes,
  }
}

describe("RevealFlow results infographic", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("waits until phase 2 to render the split vote bar", () => {
    render(
      <RevealFlow
        scenario={buildScenario({ a: 47, b: 68 })}
        choice="a"
        countsLoading={false}
      />,
    )

    expect(screen.queryByTestId("split-vote-bar")).toBeNull()

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByTestId("split-vote-bar")).toBeTruthy()
  })

  it("renders a single infographic split bar with counts and selected marker", () => {
    render(
      <RevealFlow
        scenario={buildScenario({ a: 47, b: 68 })}
        choice="a"
        countsLoading={false}
      />,
    )

    act(() => {
      vi.advanceTimersByTime(1200)
    })

    expect(screen.getByTestId("split-vote-bar")).toBeTruthy()
    expect(screen.getByTestId("selected-choice-marker").getAttribute("data-choice")).toBe(
      "a",
    )
    expect(screen.getByText("41%")).toBeTruthy()
    expect(screen.getByText("59%")).toBeTruthy()
    expect(screen.getByText("47 votes")).toBeTruthy()
    expect(screen.getByText("68 votes")).toBeTruthy()
  })

  it("renders a single-bar skeleton when counts are still loading", () => {
    render(
      <RevealFlow
        scenario={buildScenario({ a: 47, b: 68 })}
        choice="b"
        countsLoading={true}
      />,
    )

    expect(screen.queryByTestId("split-vote-bar-skeleton")).toBeNull()

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(screen.getByTestId("split-vote-bar-skeleton")).toBeTruthy()
    expect(screen.queryByTestId("split-vote-bar")).toBeNull()
  })

  it("handles skewed and even splits without dropping labels", () => {
    const { rerender } = render(
      <RevealFlow
        scenario={buildScenario({ a: 1, b: 9 })}
        choice="b"
        countsLoading={false}
      />,
    )

    act(() => {
      vi.advanceTimersByTime(1200)
    })

    expect(screen.getByText("10%")).toBeTruthy()
    expect(screen.getByText("90%")).toBeTruthy()
    expect(screen.getByText("1 votes")).toBeTruthy()
    expect(screen.getByText("9 votes")).toBeTruthy()

    rerender(
      <RevealFlow
        scenario={buildScenario({ a: 5, b: 5 })}
        choice="a"
        countsLoading={false}
      />,
    )

    act(() => {
      vi.runOnlyPendingTimers()
      vi.advanceTimersByTime(1200)
    })

    expect(screen.getAllByText("50%").length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText("5 votes").length).toBeGreaterThanOrEqual(2)
  })
})
