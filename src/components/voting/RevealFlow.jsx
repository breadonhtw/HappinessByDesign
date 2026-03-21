import { useEffect, useState } from "react";

import AnimatedBar from "./AnimatedBar";
import EvidenceCard from "./EvidenceCard";

function LoadingBlock({ width = "100%", height = 16, borderRadius = 10 }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: "#f0e6d8",
        animation: "pulse 1.6s ease-in-out infinite",
      }}
    />
  );
}

export default function RevealFlow({ scenario, choice, countsLoading }) {
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
  const pctA =
    total > 0 ? Math.round(((scenario.votes.a || 0) / total) * 100) : 50;
  const pctB = total > 0 ? 100 - pctA : 50;
  const chosen = choice === "a" ? scenario.optionA : scenario.optionB;
  const chosenCount = Math.max(
    0,
    (choice === "a" ? scenario.votes.a || 0 : scenario.votes.b || 0) - 1,
  );

  return (
    <div style={{ padding: "0 20px" }}>
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
          {countsLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: 4,
              }}
            >
              <LoadingBlock width={220} height={20} borderRadius={999} />
            </div>
          ) : (
            `You and ${chosenCount} others made this choice`
          )}
        </div>
      </div>

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

        {countsLoading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {[scenario.optionA, scenario.optionB].map((option) => (
              <div key={option.label}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 18 }}>{option.emoji}</span>
                    <span
                      style={{
                        fontFamily: "'Chillax', sans-serif",
                        fontSize: 15,
                        color: option.color,
                        fontWeight: 700,
                      }}
                    >
                      {option.label}
                    </span>
                  </div>
                  <LoadingBlock width={88} height={18} borderRadius={999} />
                </div>
                <LoadingBlock width="100%" height={36} borderRadius={18} />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 18 }}>{scenario.optionA.emoji}</span>
                  <span
                    style={{
                      fontFamily: "'Chillax', sans-serif",
                      fontSize: 15,
                      color: scenario.optionA.color,
                      fontWeight: 700,
                    }}
                  >
                    {scenario.optionA.label}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: "'Chillax', sans-serif",
                    fontSize: 14,
                    color: "#8b7355",
                    fontWeight: 600,
                  }}
                >
                  {scenario.votes.a} votes
                </span>
              </div>
              {phase >= 2 && (
                <AnimatedBar
                  percentage={pctA}
                  color={scenario.optionA.color}
                  delay={300}
                />
              )}
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 18 }}>{scenario.optionB.emoji}</span>
                  <span
                    style={{
                      fontFamily: "'Chillax', sans-serif",
                      fontSize: 15,
                      color: scenario.optionB.color,
                      fontWeight: 700,
                    }}
                  >
                    {scenario.optionB.label}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: "'Chillax', sans-serif",
                    fontSize: 14,
                    color: "#8b7355",
                    fontWeight: 600,
                  }}
                >
                  {scenario.votes.b} votes
                </span>
              </div>
              {phase >= 2 && (
                <AnimatedBar
                  percentage={pctB}
                  color={scenario.optionB.color}
                  delay={600}
                />
              )}
            </div>
          </>
        )}
      </div>

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
