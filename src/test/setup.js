import { cleanup } from "@testing-library/react"
import { afterEach, beforeAll } from "vitest"

beforeAll(() => {
  Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value: () => {},
  })
})

afterEach(() => {
  cleanup()
  window.localStorage.clear()
  window.history.replaceState({}, "", "/")
})
