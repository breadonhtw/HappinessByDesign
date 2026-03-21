import React from "react"
import {
  alpha,
  panelStyles,
  textStyles,
  votingTheme,
} from "./designSystem"

export default function EvidenceCard({ option, evidence, isOpen, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        ...panelStyles.base,
        position: "relative",
        overflow: "hidden",
        borderRadius: votingTheme.radius.card,
        borderColor: isOpen
          ? alpha(option.color, 0.48)
          : alpha(votingTheme.colors.borderStrong, 0.54),
        background: isOpen
          ? `linear-gradient(180deg, ${alpha(option.color, 0.08)}, ${option.bg})`
          : `linear-gradient(180deg, ${votingTheme.colors.surfaceStrong}, ${votingTheme.colors.surface})`,
        transition: "all 0.35s ease",
        cursor: "pointer",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -38,
          right: -24,
          width: 118,
          height: 118,
          borderRadius: "50%",
          background: alpha(option.color, isOpen ? 0.12 : 0.06),
          transition: "background 0.3s ease",
        }}
      />

      <div
        style={{
          padding: "17px 18px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              background: isOpen
                ? alpha(option.color, 0.18)
                : alpha(votingTheme.colors.surfaceMuted, 0.95),
              border: `1px solid ${isOpen ? alpha(option.color, 0.28) : alpha(votingTheme.colors.borderStrong, 0.38)}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 21,
              transition: "all 0.3s ease",
              boxShadow: votingTheme.shadow.inset,
            }}
          >
            {option.emoji}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: votingTheme.fonts.body,
                fontSize: 16,
                color: option.color,
                fontWeight: 700,
                marginBottom: 3,
              }}
            >
              {option.label}
            </div>
            <div
              style={{
                fontFamily: votingTheme.fonts.body,
                fontSize: 11,
                color: votingTheme.colors.textSoft,
                fontStyle: "italic",
              }}
            >
              Tap to {isOpen ? "collapse" : "reveal the research"}
            </div>
          </div>
        </div>
        <div
          style={{
            ...panelStyles.chip,
            width: 34,
            height: 34,
            padding: 0,
            background: isOpen
              ? alpha(option.color, 0.18)
              : alpha(votingTheme.colors.surfaceStrong, 0.88),
            borderColor: isOpen
              ? alpha(option.color, 0.3)
              : alpha(votingTheme.colors.borderStrong, 0.4),
            flexShrink: 0,
            transition: "all 0.3s ease",
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: isOpen ? option.color : votingTheme.colors.textSoft,
              transform: isOpen ? "rotate(180deg)" : "rotate(0)",
              transition: "transform 0.3s ease",
              display: "block",
            }}
          >
            ▼
          </span>
        </div>
      </div>

      <div
        style={{
          maxHeight: isOpen ? 240 : 0,
          overflow: "hidden",
          transition: "max-height 0.4s ease",
        }}
      >
        <div style={{ padding: "0 18px 18px" }}>
          <div
            style={{
              height: 1,
              background: alpha(option.color, 0.22),
              marginBottom: 16,
            }}
          />
          <div
            style={{
              ...panelStyles.inset,
              padding: "16px 16px 14px",
              background: alpha(votingTheme.colors.surfaceStrong, 0.74),
            }}
          >
            <div
              style={{
                ...textStyles.sectionTitle,
                fontSize: 17,
                marginBottom: 8,
              }}
            >
              {evidence.title}
            </div>
            <p
              style={{
                ...textStyles.body,
                fontSize: 13,
                margin: "0 0 12px",
                color: votingTheme.colors.textMuted,
              }}
            >
              {evidence.finding}
            </p>
            <div
              style={{
                ...panelStyles.chip,
                display: "inline-flex",
                padding: "5px 12px",
                background: alpha(option.color, 0.1),
                borderColor: alpha(option.color, 0.18),
              }}
            >
              <span
                style={{
                  fontFamily: votingTheme.fonts.body,
                  fontSize: 12,
                  color: option.color,
                  fontWeight: 700,
                }}
              >
                {evidence.source}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
