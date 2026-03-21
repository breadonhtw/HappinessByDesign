import React from "react"
import { useEffect, useState } from "react"

import { alpha, panelStyles, votingTheme } from "./designSystem"

export default function AnimatedBar({ percentage, color, delay = 0 }) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setWidth(percentage), delay + 50)
    return () => clearTimeout(t)
  }, [percentage, delay])

  return (
    <div
      style={{
        ...panelStyles.inset,
        height: 42,
        overflow: "hidden",
        position: "relative",
        background: `linear-gradient(180deg, ${alpha(
          votingTheme.colors.surfaceStrong,
          0.9,
        )}, ${votingTheme.colors.surfaceSoft})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0) 35%, rgba(255,255,255,0.18))",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          height: "100%",
          width: `${width}%`,
          background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.88)})`,
          borderRadius: votingTheme.radius.block,
          transition: "width 1.4s cubic-bezier(0.22, 0.8, 0.22, 1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingRight: width > 20 ? 12 : 0,
          boxShadow: `inset 0 1px 0 ${alpha(votingTheme.colors.white, 0.3)}`,
        }}
      >
        {width > 20 && (
          <span
            style={{
              minWidth: 46,
              textAlign: "center",
              padding: "4px 8px",
              borderRadius: votingTheme.radius.chip,
              background: alpha(votingTheme.colors.white, 0.18),
              fontFamily: votingTheme.fonts.body,
              fontSize: 14,
              color: votingTheme.colors.white,
              fontWeight: 700,
            }}
          >
            {percentage}%
          </span>
        )}
      </div>
      {width <= 20 && width > 0 && (
        <span
          style={{
            position: "absolute",
            left: `calc(${width}% + 8px)`,
            top: "50%",
            transform: "translateY(-50%)",
            minWidth: 46,
            textAlign: "center",
            padding: "4px 8px",
            borderRadius: votingTheme.radius.chip,
            background: alpha(votingTheme.colors.surfaceStrong, 0.9),
            border: `1px solid ${alpha(votingTheme.colors.borderStrong, 0.42)}`,
            fontFamily: votingTheme.fonts.body,
            fontSize: 13,
            color: votingTheme.colors.textMuted,
            fontWeight: 700,
            boxShadow: votingTheme.shadow.inset,
          }}
        >
          {percentage}%
        </span>
      )}
    </div>
  )
}
