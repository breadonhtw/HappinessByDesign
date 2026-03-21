import { useRef, useState } from "react";

export default function SwipeCard({ scenario, onChoice }) {
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
  const translateX =
    exitDir === "right" ? 500 : exitDir === "left" ? -500 : offset;
  const exitRot =
    exitDir === "right" ? 15 : exitDir === "left" ? -15 : rotation;

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
        <div style={{ fontSize: 28, marginBottom: 2 }}>
          {scenario.optionB.emoji}
        </div>
        <div
          style={{
            fontFamily: "'Chillax', sans-serif",
            fontSize: 12,
            color: "#c45a3c",
            fontWeight: 700,
            width: 56,
          }}
        >
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
        <div style={{ fontSize: 28, marginBottom: 2 }}>
          {scenario.optionA.emoji}
        </div>
        <div
          style={{
            fontFamily: "'Chillax', sans-serif",
            fontSize: 12,
            color: "#6b8f5e",
            fontWeight: 700,
            width: 56,
          }}
        >
          {scenario.optionA.label}
        </div>
      </div>

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
          transition: isDragging
            ? "none"
            : "all 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)",
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

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "0 20px 20px",
            }}
          >
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
              <div style={{ fontSize: 24, flexShrink: 0 }}>
                {scenario.optionA.emoji}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Chillax', sans-serif",
                    fontSize: 13,
                    color: scenario.optionA.color,
                    fontWeight: 700,
                    marginBottom: 1,
                  }}
                >
                  Option A — Swipe right →
                </div>
                <div
                  style={{
                    fontFamily: "'Chillax', sans-serif",
                    fontSize: 14,
                    color: "#4a3f35",
                    lineHeight: 1.5,
                  }}
                >
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
              <div style={{ fontSize: 24, flexShrink: 0 }}>
                {scenario.optionB.emoji}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Chillax', sans-serif",
                    fontSize: 13,
                    color: scenario.optionB.color,
                    fontWeight: 700,
                    marginBottom: 1,
                  }}
                >
                  ← Swipe left — Option B
                </div>
                <div
                  style={{
                    fontFamily: "'Chillax', sans-serif",
                    fontSize: 14,
                    color: "#4a3f35",
                    lineHeight: 1.5,
                  }}
                >
                  {scenario.optionB.short}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
