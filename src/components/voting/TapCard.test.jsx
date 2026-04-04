import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SCENARIOS } from "../../data/scenarios";
import TapCard from "./TapCard";

describe("TapCard option emphasis", () => {
  it("keeps option labels and text accessible during hover and focus intent", () => {
    const handleSubmitResponse = vi.fn();
    const handleChoiceIntent = vi.fn();

    render(
      <TapCard
        scenario={SCENARIOS[2]}
        onSubmitResponse={handleSubmitResponse}
        onChoiceIntent={handleChoiceIntent}
      />,
    );

    const optionA = screen.getByRole("button", {
      name: /^Choose Option A: Meet someone new\. Say yes, join the game, and start interacting\.$/i,
    });
    const optionB = screen.getByRole("button", {
      name: /^Choose Option B: Keep to yourself\. Pass, say you're busy, and head home to chill\.$/i,
    });
    const optionOther = screen.getByRole("button", {
      name: /^Choose Other: Choose another response\. Share what you'd do instead\.$/i,
    });

    fireEvent.pointerEnter(optionA);
    fireEvent.focus(optionB);
    fireEvent.pointerEnter(optionOther);

    expect(handleChoiceIntent).toHaveBeenCalledTimes(3);
    expect(screen.getByText("Meet someone new")).toBeTruthy();
    expect(screen.getByText("Say yes, join the game, and start interacting.")).toBeTruthy();
    expect(screen.getByText("Keep to yourself")).toBeTruthy();
    expect(screen.getByText("Pass, say you're busy, and head home to chill.")).toBeTruthy();
    expect(screen.getByText("Choose another response")).toBeTruthy();
    expect(screen.getByText("Share what you'd do instead.")).toBeTruthy();
    expect(optionA.getAttribute("aria-label")).toBe(
      "Choose Option A: Meet someone new. Say yes, join the game, and start interacting.",
    );
    expect(optionB.getAttribute("aria-label")).toBe(
      "Choose Option B: Keep to yourself. Pass, say you're busy, and head home to chill.",
    );
    expect(optionOther.getAttribute("aria-label")).toBe(
      "Choose Other: Choose another response. Share what you'd do instead.",
    );
  });

  it("keeps the selection editable before final submit", () => {
    const handleSubmitResponse = vi.fn();
    const handleChoiceIntent = vi.fn();

    render(
      <TapCard
        scenario={SCENARIOS[2]}
        onSubmitResponse={handleSubmitResponse}
        onChoiceIntent={handleChoiceIntent}
      />,
    );

    const optionA = screen.getByRole("button", {
      name: /^Choose Option A: Meet someone new\. Say yes, join the game, and start interacting\.$/i,
    });
    const optionB = screen.getByRole("button", {
      name: /^Choose Option B: Keep to yourself\. Pass, say you're busy, and head home to chill\.$/i,
    });
    const optionOther = screen.getByRole("button", {
      name: /^Choose Other: Choose another response\. Share what you'd do instead\.$/i,
    });

    fireEvent.click(optionA);
    fireEvent.click(optionOther);
    fireEvent.click(optionB);

    expect(handleSubmitResponse).not.toHaveBeenCalled();
    expect(optionA.disabled).toBe(false);
    expect(optionB.disabled).toBe(false);
    expect(optionOther.disabled).toBe(false);
    expect(optionA.getAttribute("data-selected")).toBe("false");
    expect(optionB.getAttribute("data-selected")).toBe("true");
    expect(optionOther.getAttribute("data-selected")).toBe("false");
    expect(screen.getByText("Selected response")).toBeTruthy();
    expect(screen.getAllByText("Keep to yourself").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByRole("button", { name: "Submit response" })).toBeTruthy();
  });

  it("allows A/B submission without age range and sends the structured payload", () => {
    const handleSubmitResponse = vi.fn();

    render(
      <TapCard
        scenario={SCENARIOS[1]}
        onSubmitResponse={handleSubmitResponse}
        onChoiceIntent={() => {}}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /^Choose Option A: Join the potluck\. Head downstairs and talk to people over dinner\.$/i,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Submit response" }));

    expect(handleSubmitResponse).toHaveBeenCalledWith({ choice: "a" });
  });

  it("requires written text before submitting Other", () => {
    const handleSubmitResponse = vi.fn();

    render(
      <TapCard
        scenario={SCENARIOS[1]}
        onSubmitResponse={handleSubmitResponse}
        onChoiceIntent={() => {}}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /^Choose Other: Choose another response\. Share what you'd do instead\.$/i,
      }),
    );

    expect(screen.getByRole("button", { name: "Submit response" }).disabled).toBe(true);

    fireEvent.change(
      screen.getByLabelText("Tell us what you would choose instead"),
      {
        target: { value: "I'd talk for a while, then head off." },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "Submit response" }));

    expect(handleSubmitResponse).toHaveBeenCalledWith({
      choice: "other",
      otherText: "I'd talk for a while, then head off.",
    });
  });
});
