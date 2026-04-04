import { TRAIL_STOPS_BY_ID } from "./trailStops";

export const SCENARIOS = {
  1: {
    title: "Yap or Nap?",
    location: TRAIL_STOPS_BY_ID[1].scenarioLocation,
    stationNum: 1,
    prompt:
      "It's Friday evening. A monthly potluck starts downstairs. Do you...",
    optionA: {
      detail: "Head downstairs and talk to people over dinner.",
      emoji: "🍲",
      label: "Join the potluck",
      color: "#5F6FA8",
      bg: "#EAF0FF",
    },
    optionB: {
      detail: "Lie down, doomscroll, and keep the night to yourself.",
      emoji: "📱",
      label: "Stay in and switch off",
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
      detail: "Say yes, join the game, and start interacting.",
      emoji: "🏀",
      label: "Meet someone new",
      color: "#5F6FA8",
      bg: "#EAF0FF",
    },
    optionB: {
      detail: "Pass, say you're busy, and head home to chill.",
      emoji: "🛁",
      label: "Keep to yourself",
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
      detail: "Ask what they’re studying and share the table.",
      emoji: "📚",
      label: "Start a conversation",
      color: "#5F6FA8",
      bg: "#EAF0FF",
    },
    optionB: {
      detail: "Put in your AirPods and keep locking in alone.",
      emoji: "🎧",
      label: "Stay focused solo",
      color: "#3F6048",
      bg: "#E5EEE8",
    },
    votes: { a: 52, b: 63 },
  },
};
