import { useState, useRef, useEffect } from "react";

const SCENARIOS = {
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

function SwipeCard({ scenario, onChoice }) {
  const startX = useRef(0);
  const currentDelta = useRef(0);
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [exitDir, setExitDir] = useState(null);
  const threshold = 70;

  const getClientX = (e) => (e.touches ? e.touches[0].clientX : e.clientX);

  const handleStart = (e) => {
    startX.current = getClientX(e);
    setIsDragging(true);
  };
  const handleMove = (e) => {
    if (!isDragging) return;
    currentDelta.current = getClientX(e) - startX.current;
    setOffset(currentDelta.current);
  };
  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (currentDelta.current > threshold) {
      setExitDir("right");
      setTimeout(() => onChoice("a"), 380);
    } else if (currentDelta.current < -threshold) {
      setExitDir("left");
      setTimeout(() => onChoice("b"), 380);
    } else {
      setOffset(0);
    }
    currentDelta.current = 0;
  };

  const rotation = offset * 0.06;
  const leftGlow = Math.max(0, Math.min(1, -offset / threshold));
  const rightGlow = Math.max(0, Math.min(1, offset / threshold));
  const translateX = exitDir === "right" ? 500 : exitDir === "left" ? -500 : offset;
  const exitRot = exitDir === "right" ? 15 : exitDir === "left" ? -15 : rotation;

  return (
    <div
      style={{
        position: "relative",
        minHeight: "65vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 16px",
        overflow: "hidden",
      }}
    >
      {/* Side glow indicators */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 80,
          background: `linear-gradient(to right, rgba(196,90,60,${leftGlow * 0.2}), transparent)`,
          pointerEvents: "none",
          transition: isDragging ? "none" : "background 0.3s",
          zIndex: 2,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 80,
          background: `linear-gradient(to left, rgba(107,143,94,${rightGlow * 0.2}), transparent)`,
          pointerEvents: "none",
          transition: isDragging ? "none" : "background 0.3s",
          zIndex: 2,
        }}
      />

      {/* Side labels */}
      <div
        style={{
          position: "absolute",
          left: 8,
          top: "50%",
          transform: "translateY(-50%)",
          textAlign: "center",
          opacity: leftGlow > 0.15 ? leftGlow : 0.2,
          transition: isDragging ? "none" : "opacity 0.3s",
          zIndex: 3,
          pointerEvents: "none",
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 2 }}>{scenario.optionB.emoji}</div>
        <div style={{ fontFamily: "'Chillax', sans-serif", fontSize: 12, color: "#c45a3c", fontWeight: 700, width: 56 }}>
          {scenario.optionB.label}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 8,
          top: "50%",
          transform: "translateY(-50%)",
          textAlign: "center",
          opacity: rightGlow > 0.15 ? rightGlow : 0.2,
          transition: isDragging ? "none" : "opacity 0.3s",
          zIndex: 3,
          pointerEvents: "none",
        }}
      >
        <div style={{ fontSize: 28, marginBottom: 2 }}>{scenario.optionA.emoji}</div>
        <div style={{ fontFamily: "'Chillax', sans-serif", fontSize: 12, color: "#6b8f5e", fontWeight: 700, width: 56 }}>
          {scenario.optionA.label}
        </div>
      </div>

      {/* Card */}
      <div
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
        onMouseDown={handleStart}
        onMouseMove={(e) => isDragging && handleMove(e)}
        onMouseUp={handleEnd}
        onMouseLeave={() => isDragging && handleEnd()}
        style={{
          width: "86%",
          maxWidth: 360,
          transform: `translateX(${translateX}px) rotate(${exitRot}deg)`,
          transition: isDragging ? "none" : "all 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)",
          opacity: exitDir ? 0 : 1,
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
          touchAction: "pan-y",
          zIndex: 5,
        }}
      >
        <div
          style={{
            background: "#fffbf5",
            borderRadius: 24,
            padding: "36px 24px 30px",
            border: "2px solid #e8ddd0",
            boxShadow: `0 ${12 + Math.abs(offset) * 0.05}px ${30 + Math.abs(offset) * 0.1}px rgba(0,0,0,${0.07 + Math.abs(offset) * 0.0003})`,
          }}
        >
          {/* Decorative top */}
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div
              style={{
                display: "inline-block",
                padding: "4px 16px",
                background: "#f5ead6",
                borderRadius: 20,
                fontFamily: "'Chillax', sans-serif",
                fontSize: 12,
                color: "#b8a089",
                fontWeight: 600,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              Station {scenario.stationNum}
            </div>
          </div>

          <div
            style={{
              fontFamily: "'Sigmar', cursive",
              fontSize: 30,
              color: "#c45a3c",
              fontStyle: "italic",
              textAlign: "center",
              marginBottom: 20,
              lineHeight: 1.15,
            }}
          >
            {scenario.title}
          </div>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "0 20px 20px" }}>
            <div style={{ flex: 1, height: 1, background: "#e8ddd0" }} />
            <div style={{ fontSize: 14, color: "#d4c4a8" }}>✦</div>
            <div style={{ flex: 1, height: 1, background: "#e8ddd0" }} />
          </div>

          <p
            style={{
              fontFamily: "'Chillax', sans-serif",
              fontSize: 17,
              color: "#4a3f35",
              lineHeight: 1.75,
              textAlign: "center",
              margin: "0 0 28px",
            }}
          >
            {scenario.prompt}
          </p>

          {/* Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                background: rightGlow > 0.2 ? scenario.optionA.bg : "#fafaf5",
                borderRadius: 16,
                border: `2px solid ${rightGlow > 0.2 ? scenario.optionA.color : "#ede6db"}`,
                transition: isDragging ? "none" : "all 0.3s",
              }}
            >
              <div style={{ fontSize: 24, flexShrink: 0 }}>{scenario.optionA.emoji}</div>
              <div>
                <div style={{ fontFamily: "'Chillax', sans-serif", fontSize: 13, color: scenario.optionA.color, fontWeight: 700, marginBottom: 1 }}>
                  Option A — Swipe right →
                </div>
                <div style={{ fontFamily: "'Chillax', sans-serif", fontSize: 14, color: "#4a3f35", lineHeight: 1.5 }}>
                  {scenario.optionA.short}
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 16px",
                background: leftGlow > 0.2 ? scenario.optionB.bg : "#fafaf5",
                borderRadius: 16,
                border: `2px solid ${leftGlow > 0.2 ? scenario.optionB.color : "#ede6db"}`,
                transition: isDragging ? "none" : "all 0.3s",
              }}
            >
              <div style={{ fontSize: 24, flexShrink: 0 }}>{scenario.optionB.emoji}</div>
              <div>
                <div style={{ fontFamily: "'Chillax', sans-serif", fontSize: 13, color: scenario.optionB.color, fontWeight: 700, marginBottom: 1 }}>
                  ← Swipe left — Option B
                </div>
                <div style={{ fontFamily: "'Chillax', sans-serif", fontSize: 14, color: "#4a3f35", lineHeight: 1.5 }}>
                  {scenario.optionB.short}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom swipe hint */}
      <div
        style={{
          marginTop: 20,
          textAlign: "center",
          fontFamily: "'Chillax', sans-serif",
          fontSize: 15,
          color: "#c4b49e",
          fontWeight: 600,
          animation: "pulse 2s ease-in-out infinite",
        }}
      >
        ← swipe the card to choose →
      </div>
    </div>
  );
}

function AnimatedBar({ percentage, color, delay = 0 }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(percentage), delay + 50);
    return () => clearTimeout(t);
  }, [percentage, delay]);
  return (
    <div style={{ height: 36, background: "#f0e6d8", borderRadius: 18, overflow: "hidden", position: "relative" }}>
      <div
        style={{
          height: "100%",
          width: `${width}%`,
          background: `linear-gradient(90deg, ${color}, ${color}dd)`,
          borderRadius: 18,
          transition: "width 1.4s cubic-bezier(0.22, 0.8, 0.22, 1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingRight: width > 18 ? 12 : 0,
        }}
      >
        {width > 18 && (
          <span style={{ fontFamily: "'Chillax', sans-serif", fontSize: 16, color: "#fff", fontWeight: 700 }}>
            {percentage}%
          </span>
        )}
      </div>
      {width <= 18 && width > 0 && (
        <span
          style={{
            position: "absolute",
            left: `calc(${width}% + 8px)`,
            top: "50%",
            transform: "translateY(-50%)",
            fontFamily: "'Chillax', sans-serif",
            fontSize: 16,
            color: "#8b7355",
            fontWeight: 700,
          }}
        >
          {percentage}%
        </span>
      )}
    </div>
  );
}

function EvidenceCard({ option, evidence, isOpen, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        background: isOpen ? option.bg : "#fffbf5",
        borderRadius: 18,
        border: `2px solid ${isOpen ? option.color : "#e8ddd0"}`,
        overflow: "hidden",
        transition: "all 0.35s ease",
        cursor: "pointer",
      }}
    >
      <div style={{ padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: isOpen ? option.color : "#f5ead6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              transition: "background 0.3s",
            }}
          >
            {option.emoji}
          </div>
          <div>
            <div style={{ fontFamily: "'Chillax', sans-serif", fontSize: 16, color: option.color, fontWeight: 700 }}>
              {option.label}
            </div>
            <div style={{ fontFamily: "'Chillax', sans-serif", fontSize: 11, color: "#b8a089", fontStyle: "italic" }}>
              Tap to {isOpen ? "collapse" : "reveal the research"}
            </div>
          </div>
        </div>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: isOpen ? option.color : "#f0e6d8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s",
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: isOpen ? "#fff" : "#b8a089",
              transform: isOpen ? "rotate(180deg)" : "rotate(0)",
              transition: "transform 0.3s",
              display: "block",
            }}
          >
            ▼
          </span>
        </div>
      </div>

      <div
        style={{
          maxHeight: isOpen ? 220 : 0,
          overflow: "hidden",
          transition: "max-height 0.4s ease",
        }}
      >
        <div style={{ padding: "0 18px 18px" }}>
          <div style={{ height: 1, background: `${option.color}33`, marginBottom: 14 }} />
          <div
            style={{
              fontFamily: "'Sigmar', cursive",
              fontSize: 16,
              color: "#4a3f35",
              fontStyle: "italic",
              marginBottom: 8,
              lineHeight: 1.3,
            }}
          >
            {evidence.title}
          </div>
          <p
            style={{
              fontFamily: "'Chillax', sans-serif",
              fontSize: 13,
              color: "#5a4e42",
              lineHeight: 1.7,
              margin: "0 0 10px",
            }}
          >
            {evidence.finding}
          </p>
          <div
            style={{
              display: "inline-block",
              padding: "4px 12px",
              background: `${option.color}15`,
              borderRadius: 20,
              fontFamily: "'Chillax', sans-serif",
              fontSize: 12,
              color: option.color,
              fontWeight: 600,
            }}
          >
            {evidence.source}
          </div>
        </div>
      </div>
    </div>
  );
}

function RevealFlow({ scenario, choice }) {
  const [phase, setPhase] = useState(0);
  const [openA, setOpenA] = useState(false);
  const [openB, setOpenB] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 200),
      setTimeout(() => setPhase(2), 1000),
      setTimeout(() => setPhase(3), 2600),
      setTimeout(() => setPhase(4), 4000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const total = (scenario.votes.a || 0) + (scenario.votes.b || 0);
  const pctA = total > 0 ? Math.round(((scenario.votes.a || 0) / total) * 100) : 50;
  const pctB = total > 0 ? 100 - pctA : 50;
  const chosen = choice === "a" ? scenario.optionA : scenario.optionB;
  const chosenCount = choice === "a" ? (scenario.votes.a || 0) : (scenario.votes.b || 0);

  return (
    <div style={{ padding: "0 20px" }}>
      {/* Phase 1 — Confirmation */}
      <div
        style={{
          opacity: phase >= 1 ? 1 : 0,
          transform: `translateY(${phase >= 1 ? 0 : 30}px)`,
          transition: "all 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)",
          textAlign: "center",
          marginBottom: 28,
          padding: "30px 16px",
          background: "#fffbf5",
          borderRadius: 24,
          border: "2px solid #e8ddd0",
        }}
      >
        <div style={{ fontSize: 48, marginBottom: 10 }}>{chosen.emoji}</div>
        <div
          style={{
            fontFamily: "'Sigmar', cursive",
            fontSize: 24,
            color: "#4a3f35",
            fontStyle: "italic",
            marginBottom: 6,
            lineHeight: 1.2,
          }}
        >
          You chose to {chosen.label.toLowerCase()}
        </div>
        <div
          style={{
            fontFamily: "'Chillax', sans-serif",
            fontSize: 16,
            color: chosen.color,
            fontWeight: 600,
          }}
        >
          You and {chosenCount} others made this choice
        </div>
      </div>

      {/* Phase 2 — Vote bars */}
      <div
        style={{
          opacity: phase >= 2 ? 1 : 0,
          transform: `translateY(${phase >= 2 ? 0 : 30}px)`,
          transition: "all 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) 0.15s",
          marginBottom: 28,
          background: "#fffbf5",
          borderRadius: 24,
          padding: "24px 20px",
          border: "2px solid #e8ddd0",
        }}
      >
        <div
          style={{
            fontFamily: "'Sigmar', cursive",
            fontSize: 18,
            color: "#4a3f35",
            fontStyle: "italic",
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          How everyone voted
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 18 }}>{scenario.optionA.emoji}</span>
              <span style={{ fontFamily: "'Chillax', sans-serif", fontSize: 15, color: scenario.optionA.color, fontWeight: 700 }}>
                {scenario.optionA.label}
              </span>
            </div>
            <span style={{ fontFamily: "'Chillax', sans-serif", fontSize: 14, color: "#8b7355", fontWeight: 600 }}>
              {scenario.votes.a} votes
            </span>
          </div>
          {phase >= 2 && <AnimatedBar percentage={pctA} color={scenario.optionA.color} delay={300} />}
        </div>

        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 18 }}>{scenario.optionB.emoji}</span>
              <span style={{ fontFamily: "'Chillax', sans-serif", fontSize: 15, color: scenario.optionB.color, fontWeight: 700 }}>
                {scenario.optionB.label}
              </span>
            </div>
            <span style={{ fontFamily: "'Chillax', sans-serif", fontSize: 14, color: "#8b7355", fontWeight: 600 }}>
              {scenario.votes.b} votes
            </span>
          </div>
          {phase >= 2 && <AnimatedBar percentage={pctB} color={scenario.optionB.color} delay={600} />}
        </div>
      </div>

      {/* Phase 3 — Evidence cards */}
      <div
        style={{
          opacity: phase >= 3 ? 1 : 0,
          transform: `translateY(${phase >= 3 ? 0 : 30}px)`,
          transition: "all 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)",
          marginBottom: 28,
        }}
      >
        <div
          style={{
            fontFamily: "'Sigmar', cursive",
            fontSize: 20,
            color: "#4a3f35",
            fontStyle: "italic",
            textAlign: "center",
            marginBottom: 6,
          }}
        >
          What does the research say?
        </div>
        <div
          style={{
            fontFamily: "'Chillax', sans-serif",
            fontSize: 13,
            color: "#c4b49e",
            textAlign: "center",
            marginBottom: 16,
            fontWeight: 600,
          }}
        >
          Tap each card to reveal the evidence
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <EvidenceCard
            option={scenario.optionA}
            evidence={scenario.evidenceA}
            isOpen={openA}
            onToggle={() => setOpenA(!openA)}
          />
          <EvidenceCard
            option={scenario.optionB}
            evidence={scenario.evidenceB}
            isOpen={openB}
            onToggle={() => setOpenB(!openB)}
          />
        </div>
      </div>

      {/* Phase 4 — Bias callout */}
      <div
        style={{
          opacity: phase >= 4 ? 1 : 0,
          transform: `translateY(${phase >= 4 ? 0 : 30}px)`,
          transition: "all 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            position: "relative",
            background: "#fffbf5",
            borderRadius: 24,
            padding: "24px 22px",
            border: "2px dashed #d4c4a8",
            overflow: "hidden",
          }}
        >
          {/* Decorative accent */}
          <div
            style={{
              position: "absolute",
              top: -30,
              right: -30,
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "rgba(196,90,60,0.05)",
            }}
          />
          <div
            style={{
              fontFamily: "'Chillax', sans-serif",
              fontSize: 12,
              color: "#c4b49e",
              letterSpacing: 3,
              textTransform: "uppercase",
              marginBottom: 6,
              fontWeight: 700,
            }}
          >
            💡 Did you know?
          </div>
          <div
            style={{
              fontFamily: "'Sigmar', cursive",
              fontSize: 22,
              color: "#c45a3c",
              fontStyle: "italic",
              marginBottom: 10,
              lineHeight: 1.2,
            }}
          >
            This is called {scenario.bias.name}
          </div>
          <p
            style={{
              fontFamily: "'Chillax', sans-serif",
              fontSize: 14,
              color: "#5a4e42",
              lineHeight: 1.7,
              margin: "0 0 10px",
            }}
          >
            {scenario.bias.description}
          </p>
          <div
            style={{
              display: "inline-block",
              padding: "5px 14px",
              background: "#f5ead6",
              borderRadius: 20,
              fontFamily: "'Chillax', sans-serif",
              fontSize: 13,
              color: "#8b7355",
              fontWeight: 600,
            }}
          >
            — {scenario.bias.source}
          </div>
        </div>
      </div>
    </div>
  );
}

const API_URL =
  "https://script.google.com/macros/s/AKfycbyfZyvX1mmQX6LxD2P92pO0DeoFDtd-W-iq_pa0ueUNAN7iHW7ZUgDndFFdlFBqgibWiQ/exec";

export default function VotingPage() {
  const [station, setStation] = useState(1);
  const [choice, setChoice] = useState(null);
  const [liveCounts, setLiveCounts] = useState({
    1: { a: SCENARIOS[1].votes.a, b: SCENARIOS[1].votes.b },
    2: { a: SCENARIOS[2].votes.a, b: SCENARIOS[2].votes.b },
    3: { a: SCENARIOS[3].votes.a, b: SCENARIOS[3].votes.b },
  });
  const [submitting, setSubmitting] = useState(false);
  const scenario = SCENARIOS[station];
  const topRef = useRef(null);

  // Read station from URL param on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = parseInt(params.get("station"));
    if (s >= 1 && s <= 3) setStation(s);
  }, []);

  // Fetch live vote counts on mount
  useEffect(() => {
    fetch(API_URL)
      .then((r) => r.json())
      .then((data) => setLiveCounts(data))
      .catch(() => {
        // Fallback to hardcoded counts if fetch fails
        setLiveCounts({
          1: { a: SCENARIOS[1].votes.a, b: SCENARIOS[1].votes.b },
          2: { a: SCENARIOS[2].votes.a, b: SCENARIOS[2].votes.b },
          3: { a: SCENARIOS[3].votes.a, b: SCENARIOS[3].votes.b },
        });
      });
  }, []);

  // Check if already voted at this station
  const hasVoted = () => {
    try {
      return localStorage.getItem(`voted_station_${station}`) === "true";
    } catch {
      return false;
    }
  };

  // On first load, if already voted, restore that state
  useEffect(() => {
    if (hasVoted()) {
      const prev = localStorage.getItem(`voted_station_${station}_choice`);
      if (prev) setChoice(prev);
    } else {
      setChoice(null);
    }
  }, [station]);

  const handleChoice = (c) => {
    setChoice(c);

    // Mark as voted in localStorage
    try {
      localStorage.setItem(`voted_station_${station}`, "true");
      localStorage.setItem(`voted_station_${station}_choice`, c);
    } catch {}

    // Optimistically update local counts
    if (liveCounts) {
      const updated = { ...liveCounts };
      updated[station] = { ...updated[station] };
      updated[station][c] = (updated[station][c] || 0) + 1;
      setLiveCounts(updated);
    }

    // Submit vote to Google Sheets
    setSubmitting(true);
    fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ station, choice: c }),
    })
      .catch(() => {}) // Silent fail — optimistic update already applied
      .finally(() => setSubmitting(false));
  };

  const goToStation = (s) => {
    setStation(s);
    // Check if previously voted at this station
    try {
      const prev = localStorage.getItem(`voted_station_${s}_choice`);
      if (prev && localStorage.getItem(`voted_station_${s}`) === "true") {
        setChoice(prev);
      } else {
        setChoice(null);
      }
    } catch {
      setChoice(null);
    }
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Build scenario with live counts
  const currentScenario = {
    ...scenario,
    votes: liveCounts ? liveCounts[station] : scenario.votes,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5ead6",
        fontFamily: "sans-serif",
        maxWidth: 480,
        margin: "0 auto",
        paddingBottom: 40,
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Sigmar&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.cdnfonts.com/css/chillax"
        rel="stylesheet"
      />
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
      `}</style>

      <div ref={topRef} />

      {/* Header */}
      <div style={{ padding: "28px 20px 6px", textAlign: "center" }}>
        <div
          style={{
            fontFamily: "'Sigmar', cursive",
            fontSize: 22,
            color: "#c45a3c",
            fontStyle: "italic",
            marginBottom: 2,
          }}
        >
          The Connection Trail
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontFamily: "'Chillax', sans-serif",
            fontSize: 14,
            color: "#8b7355",
            fontWeight: 600,
          }}
        >
          <span style={{ width: 24, height: 1, background: "#d4c4a8" }} />
          Station {currentScenario.stationNum} — {currentScenario.location}
          <span style={{ width: 24, height: 1, background: "#d4c4a8" }} />
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ display: "flex", gap: 6, padding: "14px 40px 20px", justifyContent: "center" }}>
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            onClick={() => goToStation(s)}
            style={{
              flex: 1,
              maxWidth: 80,
              height: 6,
              borderRadius: 3,
              border: "none",
              background: station >= s ? "#c45a3c" : "#e8ddd0",
              cursor: "pointer",
              transition: "background 0.3s",
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Content */}
      {!choice ? (
        <SwipeCard scenario={currentScenario} onChoice={handleChoice} />
      ) : (
        <RevealFlow scenario={currentScenario} choice={choice} />
      )}

      {/* Next station button */}
      {choice && station < 3 && (
        <div style={{ padding: "8px 20px", animation: "fadeUp 0.6s ease-out 4.5s both" }}>
          <button
            onClick={() => goToStation(station + 1)}
            style={{
              width: "100%",
              padding: "16px",
              background: "linear-gradient(135deg, #c45a3c, #d4694e)",
              border: "none",
              borderRadius: 18,
              color: "#fff",
              fontFamily: "'Chillax', sans-serif",
              fontSize: 20,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(196,90,60,0.3)",
              letterSpacing: 0.5,
            }}
          >
            Walk to Station {station + 1} →
          </button>
        </div>
      )}

      {/* Final station CTA */}
      {choice && station === 3 && (
        <div style={{ padding: "8px 20px", animation: "fadeUp 0.6s ease-out 4.5s both" }}>
          <div
            style={{
              background: "#fffbf5",
              borderRadius: 24,
              padding: "28px 24px",
              border: "2px solid #e8ddd0",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 10 }}>🎴</div>
            <div
              style={{
                fontFamily: "'Sigmar', cursive",
                fontSize: 22,
                color: "#4a3f35",
                fontStyle: "italic",
                marginBottom: 8,
                lineHeight: 1.2,
              }}
            >
              Head to Dakota Breeze RN Lobby
            </div>
            <p
              style={{
                fontFamily: "'Chillax', sans-serif",
                fontSize: 14,
                color: "#6b5e4f",
                lineHeight: 1.7,
                margin: "0 0 4px",
              }}
            >
              Pick up your Quest Card, leave a commitment on the reflection wall, and take the first step toward connection.
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          padding: "28px 20px 16px",
          fontFamily: "'Chillax', sans-serif",
          fontSize: 12,
          color: "#c4b49e",
          lineHeight: 1.7,
        }}
      >
        The Connection Trail — UTS2110 Happiness by Design
        <br />
        Group 3 × Dakota Breeze Residents' Network
      </div>
    </div>
  );
}
