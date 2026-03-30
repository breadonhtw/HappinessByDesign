import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { SCENARIOS } from "../../data/scenarios"
import TapCard from "./TapCard"

describe("TapCard option emphasis", () => {
  it("keeps option labels and text accessible during hover and focus intent", () => {
    const handleChoice = vi.fn()
    const handleChoiceIntent = vi.fn()

    render(
      <TapCard
        scenario={SCENARIOS[2]}
        onChoice={handleChoice}
        onChoiceIntent={handleChoiceIntent}
      />,
    )

    const optionA = screen.getByRole("button", {
      name: /^Choose Option A: Join the game, have fun, and meet someone new$/i,
    })
    const optionB = screen.getByRole("button", {
      name: /^Choose Option B: Smile, say you're busy, then head home to chill$/i,
    })

    fireEvent.pointerEnter(optionA)
    fireEvent.focus(optionB)

    expect(handleChoiceIntent).toHaveBeenCalledTimes(2)
    expect(screen.getByText("Join the game, have fun, and meet someone new")).toBeTruthy()
    expect(screen.getByText("Smile, say you're busy, then head home to chill")).toBeTruthy()
    expect(optionA.getAttribute("aria-label")).toBe(
      "Choose Option A: Join the game, have fun, and meet someone new",
    )
    expect(optionB.getAttribute("aria-label")).toBe(
      "Choose Option B: Smile, say you're busy, then head home to chill",
    )
  })

  it("locks in the selected option without removing either option sentence", () => {
    const handleChoice = vi.fn()
    const handleChoiceIntent = vi.fn()

    render(
      <TapCard
        scenario={SCENARIOS[2]}
        onChoice={handleChoice}
        onChoiceIntent={handleChoiceIntent}
      />,
    )

    const optionA = screen.getByRole("button", {
      name: /^Choose Option A: Join the game, have fun, and meet someone new$/i,
    })
    const optionB = screen.getByRole("button", {
      name: /^Choose Option B: Smile, say you're busy, then head home to chill$/i,
    })

    fireEvent.click(optionA)

    expect(handleChoice).toHaveBeenCalledWith("a")
    expect(optionA.disabled).toBe(true)
    expect(optionB.disabled).toBe(true)
    expect(optionA.getAttribute("data-selected")).toBe("true")
    expect(optionB.getAttribute("data-selected")).toBe("false")
    expect(optionB.getAttribute("data-inactive")).toBe("true")
    expect(screen.getByText("Join the game, have fun, and meet someone new")).toBeTruthy()
    expect(screen.getByText("Smile, say you're busy, then head home to chill")).toBeTruthy()
  })
})
