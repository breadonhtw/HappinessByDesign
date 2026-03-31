import { TRAIL_STOPS_BY_ID } from "./trailStops";

export const SCENARIOS = {
  1: {
    title: "Yap or Nap?",
    location: TRAIL_STOPS_BY_ID[1].scenarioLocation,
    stationNum: 1,
    prompt:
      "It's Friday evening. A monthly potluck starts downstairs. Do you...",
    optionA: {
      short: "Join the monthly potluck downstairs",
      emoji: "🍲",
      label: "Join them",
      color: "#5F6FA8",
      bg: "#EAF0FF",
    },
    optionB: {
      short: "Lie down, doomscroll, and stay in for the night",
      emoji: "📱",
      label: "My bed calls",
      color: "#3F6048",
      bg: "#E5EEE8",
    },
    votes: { a: 47, b: 68 },
  },
  2: {
    title: "You Know Ball?",
    location: TRAIL_STOPS_BY_ID[2].scenarioLocation,
    stationNum: 2,
    prompt: "At the court, a group playing basketball asks you in. Do you...",
    optionA: {
      short: "Join the game, have fun, and meet someone new",
      emoji: "🏀",
      label: "Join them",
      color: "#5F6FA8",
      bg: "#EAF0FF",
    },
    optionB: {
      short: "Smile, say you're busy, then head home to chill",
      emoji: "🛁",
      label: "Im good..",
      color: "#3F6048",
      bg: "#E5EEE8",
    },
    votes: { a: 38, b: 74 },
  },
  3: {
    title: "Study Sesh?",
    location: TRAIL_STOPS_BY_ID[3].scenarioLocation,
    stationNum: 3,
    prompt: "At the library, someone asks to share your table. Do you...",
    optionA: {
      short: "Ask what they're studying and start talking",
      emoji: "📚",
      label: "Study Jio?",
      color: "#5F6FA8",
      bg: "#EAF0FF",
    },
    optionB: {
      short: "Put in your AirPods and keep locking in solo",
      emoji: "🎧",
      label: "I gotta lock in",
      color: "#3F6048",
      bg: "#E5EEE8",
    },
    votes: { a: 52, b: 63 },
  },
};
