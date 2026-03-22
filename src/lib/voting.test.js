import { describe, expect, it } from "vitest"

import { SCENARIOS } from "../data/scenarios"
import {
  getOrderedStationIds,
  getStationEntryContext,
  isTrailComplete,
  parseRequestedStation,
} from "./voting"

function markComplete(station, choice = "a") {
  window.localStorage.setItem(`voted_station_${station}`, "true")
  window.localStorage.setItem(`voted_station_${station}_choice`, choice)
}

describe("voting progression helpers", () => {
  it("returns ordered station ids from scenarios", () => {
    expect(getOrderedStationIds(SCENARIOS)).toEqual([1, 2, 3])
  })

  it("detects invalid requested stations", () => {
    expect(parseRequestedStation("99", SCENARIOS)).toEqual({
      station: 1,
      invalidStation: true,
      fallbackStation: 1,
    })
    expect(parseRequestedStation("2", SCENARIOS)).toEqual({
      station: 2,
      invalidStation: false,
      fallbackStation: 1,
    })
  })

  it("derives first, prior, and next incomplete stations", () => {
    markComplete(1)

    expect(getStationEntryContext(3, SCENARIOS)).toMatchObject({
      currentStation: 3,
      firstIncompleteStation: 2,
      priorIncompleteStation: 2,
      nextIncompleteStation: null,
      isCurrentCompleted: false,
      isTrailComplete: false,
    })
  })

  it("keeps later completed stations while still reporting the earliest prior gap", () => {
    markComplete(2, "b")

    expect(getStationEntryContext(2, SCENARIOS)).toMatchObject({
      currentStation: 2,
      completedStations: [2],
      firstIncompleteStation: 1,
      priorIncompleteStation: 1,
      nextIncompleteStation: 3,
      isCurrentCompleted: true,
      isTrailComplete: false,
    })
  })

  it("reports mixed completion gaps when station 3 is done but station 2 is not", () => {
    markComplete(1)
    markComplete(3, "b")

    expect(getStationEntryContext(3, SCENARIOS)).toMatchObject({
      currentStation: 3,
      completedStations: [1, 3],
      firstIncompleteStation: 2,
      priorIncompleteStation: 2,
      nextIncompleteStation: null,
      isCurrentCompleted: true,
      isTrailComplete: false,
    })
  })

  it("marks the trail complete only when every station is done", () => {
    expect(isTrailComplete(SCENARIOS)).toBe(false)

    markComplete(1)
    markComplete(2, "b")
    markComplete(3)

    expect(isTrailComplete(SCENARIOS)).toBe(true)
    expect(getStationEntryContext(3, SCENARIOS)).toMatchObject({
      isCurrentCompleted: true,
      isTrailComplete: true,
      firstIncompleteStation: null,
    })
  })
})
