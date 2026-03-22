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
      name: /^Choose Option A: Stop for a quick chat$/i,
    })
    const optionB = screen.getByRole("button", {
      name: /^Choose Option B: Say "Hi" then grab your coffee and go$/i,
    })

    fireEvent.pointerEnter(optionA)
    fireEvent.focus(optionB)

    expect(handleChoiceIntent).toHaveBeenCalledTimes(2)
    expect(screen.getByText("Stop for a quick chat")).toBeTruthy()
    expect(screen.getByText('Say "Hi" then grab your coffee and go')).toBeTruthy()
    expect(optionA.getAttribute("aria-label")).toBe("Choose Option A: Stop for a quick chat")
    expect(optionB.getAttribute("aria-label")).toBe(
      'Choose Option B: Say "Hi" then grab your coffee and go',
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
      name: /^Choose Option A: Stop for a quick chat$/i,
    })
    const optionB = screen.getByRole("button", {
      name: /^Choose Option B: Say "Hi" then grab your coffee and go$/i,
    })

    fireEvent.click(optionA)

    expect(handleChoice).toHaveBeenCalledWith("a")
    expect(optionA.disabled).toBe(true)
    expect(optionB.disabled).toBe(true)
    expect(optionA.getAttribute("data-selected")).toBe("true")
    expect(optionB.getAttribute("data-selected")).toBe("false")
    expect(optionB.getAttribute("data-inactive")).toBe("true")
    expect(screen.getByText("Stop for a quick chat")).toBeTruthy()
    expect(screen.getByText('Say "Hi" then grab your coffee and go')).toBeTruthy()
  })
})
