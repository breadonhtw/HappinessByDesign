import { cleanup } from "@testing-library/react"
import { afterEach, beforeAll } from "vitest"

beforeAll(() => {
  Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: () => {},
  })

  if (!window.requestIdleCallback) {
    window.requestIdleCallback = (callback) =>
      window.setTimeout(
        () => callback({ didTimeout: false, timeRemaining: () => 0 }),
        1,
      )
  }

  if (!window.cancelIdleCallback) {
    window.cancelIdleCallback = (id) => window.clearTimeout(id)
  }
})

afterEach(() => {
  cleanup()
  window.localStorage.clear()
  window.history.replaceState({}, "", "/")
})
