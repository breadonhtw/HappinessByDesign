export const SCENARIOS = {
  1: {
    title: "Friday Evening",
    location: "SPARKS",
    stationNum: 1,
    prompt: "It's Friday evening. You've had a long week of school. Do you...",
    optionA: {
      short: "Join the neighbourhood potluck downstairs",
      emoji: "🍲",
      label: "Join the potluck",
      color: "#6b8f5e",
      bg: "#eef4ea",
    },
    optionB: {
      short: "Order GrabFood and scroll through TikTok alone",
      emoji: "📱",
      label: "Stay in & scroll",
      color: "#c45a3c",
      bg: "#fdf0ec",
    },
    evidenceA: {
      title: "Psychosocial Prosperity",
      source: "Diener, Ng, Harter & Arora (2010)",
      finding:
        "Emotional wellbeing depends on psychosocial prosperity — the quality of your relationships, sense of personal freedom, and opportunities for growth — rather than material comfort.",
    },
    evidenceB: {
      title: "The Loneliness Loop",
      source: "Roberts, Young & David (2024)",
      finding:
        "A 9-year study of 7,000 people found that both active and passive social media use predicted increased loneliness over time, creating a feedback loop: loneliness drives more scrolling, which deepens loneliness.",
    },
    bias: {
      name: "Present Bias",
      description:
        "The tendency to prioritise immediate comfort over the long-term benefits of social engagement.",
      source: "Thaler & Sunstein, 2008",
    },
    votes: { a: 47, b: 68 },
  },
  2: {
    title: "The Kopi Uncle",
    location: "mph / Opp Sheng Siong",
    stationNum: 2,
    prompt: "An uncle at the hawker centre greets you. Do you...",
    optionA: {
      short: "Stop for a quick chat",
      emoji: "💬",
      label: "Stop & chat",
      color: "#6b8f5e",
      bg: "#eef4ea",
    },
    optionB: {
      short: 'Say "Hi" then grab your coffee and go',
      emoji: "☕",
      label: "Grab & go",
      color: "#c45a3c",
      bg: "#fdf0ec",
    },
    evidenceA: {
      title: "The Power of Weak Ties",
      source: "Sandstrom & Dunn (2014)",
      finding:
        "Weak-tie interactions — brief exchanges with acquaintances and strangers — account for ~60% of daily social contact and significantly predict happiness and belonging.",
    },
    evidenceB: {
      title: "Efficiency Over Connection",
      source: "Sandstrom & Dunn (2013)",
      finding:
        "People who chatted socially with a barista reported higher positive affect and greater belonging than those who prioritised efficiency.",
    },
    bias: {
      name: "Status Quo Bias",
      description:
        "The tendency to default to efficiency and routine, even when a small deviation would improve your wellbeing.",
      source: "Samuelson & Zeckhauser, 1988",
    },
    votes: { a: 38, b: 74 },
  },
  3: {
    title: "The Old Friend",
    location: "Community Library",
    stationNum: 3,
    prompt:
      "A friend you haven't seen in months texts asking to meet up. Do you...",
    optionA: {
      short: "Say yes and set a date",
      emoji: "📅",
      label: "Set a date",
      color: "#6b8f5e",
      bg: "#eef4ea",
    },
    optionB: {
      short: "Reply 'See how' — knowing you probably won't",
      emoji: "😅",
      label: "Reply 'see how'",
      color: "#c45a3c",
      bg: "#fdf0ec",
    },
    evidenceA: {
      title: "The Harvard Study",
      source: "Waldinger & Schulz (2023)",
      finding:
        "The world's longest scientific study of happiness (85+ years) found that relationship quality is the single strongest predictor of lifelong health and happiness — above wealth, career, or social class.",
    },
    evidenceB: {
      title: "Why We Don't Choose Happiness",
      source: "Hsee & Hastie (2006)",
      finding:
        "People systematically fail to choose what maximises their happiness — pursuing convenience and avoiding short-term effort at the expense of long-term wellbeing.",
    },
    bias: {
      name: "Medium Maximisation",
      description:
        "Pursuing comfort and convenience instead of the experiences that actually bring lasting happiness.",
      source: "Hsee & Hastie, 2006",
    },
    votes: { a: 52, b: 63 },
  },
};
