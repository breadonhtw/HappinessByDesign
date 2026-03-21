export default function EvidenceCard({ option, evidence, isOpen, onToggle }) {
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
      <div
        style={{
          padding: "16px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
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
            <div
              style={{
                fontFamily: "'Chillax', sans-serif",
                fontSize: 16,
                color: option.color,
                fontWeight: 700,
              }}
            >
              {option.label}
            </div>
            <div
              style={{
                fontFamily: "'Chillax', sans-serif",
                fontSize: 11,
                color: "#b8a089",
                fontStyle: "italic",
              }}
            >
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
          <div
            style={{
              height: 1,
              background: `${option.color}33`,
              marginBottom: 14,
            }}
          />
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
