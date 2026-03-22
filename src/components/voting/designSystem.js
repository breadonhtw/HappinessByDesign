export const votingTheme = {
  fonts: {
    brand: "'Fraunces', serif",
    display: "'Fraunces', serif",
    body: "'Instrument Sans', sans-serif",
  },
  colors: {
    pageTop: "#FDF9F2",
    pageBottom: "#F4EBDD",
    surface: "#FAF4EA",
    surfaceStrong: "#FFFCF7",
    surfaceMuted: "#F2E7D7",
    surfaceSoft: "#F0E6DA",
    border: "#DCCDBB",
    borderStrong: "#BCA897",
    text: "#3E2218",
    textMuted: "#5A3428",
    textSoft: "#7A594A",
    textFaint: "#A48473",
    clay: "#75070C",
    clayDark: "#4C0609",
    brass: "#4F6815",
    moss: "#4F6815",
    white: "#ffffff",
  },
  radius: {
    shell: 32,
    panel: 28,
    card: 24,
    block: 20,
    chip: 999,
  },
  shadow: {
    shell: "0 28px 60px rgba(62, 34, 24, 0.12)",
    panel:
      "0 18px 34px rgba(62, 34, 24, 0.09), inset 0 1px 0 rgba(255, 255, 255, 0.72)",
    panelStrong:
      "0 20px 40px rgba(62, 34, 24, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.82)",
    inset: "inset 0 1px 0 rgba(255, 255, 255, 0.8)",
    button: "0 14px 28px rgba(117, 7, 12, 0.26)",
  },
}

export function alpha(hex, opacity) {
  const value = hex.replace("#", "")
  const normalized =
    value.length === 3
      ? value
          .split("")
          .map((char) => char + char)
          .join("")
      : value

  const int = Number.parseInt(normalized, 16)
  const r = (int >> 16) & 255
  const g = (int >> 8) & 255
  const b = int & 255

  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

export const panelStyles = {
  shell: {
    background: `linear-gradient(180deg, ${votingTheme.colors.pageTop}, ${votingTheme.colors.pageBottom})`,
    border: `1px solid ${alpha(votingTheme.colors.borderStrong, 0.58)}`,
    boxShadow: votingTheme.shadow.shell,
    borderRadius: votingTheme.radius.shell,
  },
  base: {
    background: `linear-gradient(180deg, ${votingTheme.colors.surfaceStrong}, ${votingTheme.colors.surface})`,
    border: `1px solid ${votingTheme.colors.border}`,
    boxShadow: votingTheme.shadow.panel,
    borderRadius: votingTheme.radius.panel,
  },
  strong: {
    background: `linear-gradient(180deg, ${votingTheme.colors.surfaceStrong}, ${votingTheme.colors.surface})`,
    border: `1px solid ${votingTheme.colors.borderStrong}`,
    boxShadow: votingTheme.shadow.panelStrong,
    borderRadius: votingTheme.radius.panel,
  },
  inset: {
    background: votingTheme.colors.surfaceSoft,
    border: `1px solid ${alpha(votingTheme.colors.borderStrong, 0.52)}`,
    boxShadow: votingTheme.shadow.inset,
    borderRadius: votingTheme.radius.block,
  },
  chip: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 14px",
    borderRadius: votingTheme.radius.chip,
    background: votingTheme.colors.surfaceSoft,
    border: `1px solid ${alpha(votingTheme.colors.borderStrong, 0.54)}`,
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.72)",
  },
}

export const textStyles = {
  eyebrow: {
    fontFamily: votingTheme.fonts.body,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 2.4,
    textTransform: "uppercase",
    color: votingTheme.colors.textFaint,
  },
  sectionTitle: {
    fontFamily: votingTheme.fonts.display,
    color: votingTheme.colors.text,
    fontStyle: "italic",
    lineHeight: 1.15,
  },
  body: {
    fontFamily: votingTheme.fonts.body,
    color: votingTheme.colors.textMuted,
    lineHeight: 1.7,
  },
  promptLead: {
    fontFamily: votingTheme.fonts.body,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 0.6,
    lineHeight: 1.5,
    color: votingTheme.colors.textSoft,
  },
  promptFocus: {
    fontFamily: votingTheme.fonts.display,
    fontSize: 22,
    fontStyle: "italic",
    lineHeight: 1.35,
    color: votingTheme.colors.clayDark,
  },
  promptQuestion: {
    fontFamily: votingTheme.fonts.body,
    fontSize: 15,
    fontWeight: 600,
    lineHeight: 1.55,
    color: votingTheme.colors.textMuted,
  },
  label: {
    fontFamily: votingTheme.fonts.body,
    fontWeight: 700,
  },
}
