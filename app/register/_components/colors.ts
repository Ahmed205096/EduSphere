export const C = {
  primary: "#4edea3",
  onPrimary: "#003824",
  bg: "#09090b",
  surfaceContainerLowest: "#0e0e10",
  surfaceContainerHigh: "#2a2a2c",
  surfaceContainerHighest: "#353437",
  onSurface: "#e5e1e4",
  surface: "#131315",
  onSurfaceVariant: "#bbcabf",
  outlineVariant: "#3c4a42",
  outline: "#86948a",
  error: "#ffb4ab",
  warning: "#fc7c78",
} as const;

export const glassCard: React.CSSProperties = {
  background: "rgba(24,24,27,0.7)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.1)",
};

export const inputBase = (
  focused: boolean,
  C_: typeof C,
): React.CSSProperties => ({
  backgroundColor: C_.surfaceContainerLowest,
  border: `1px solid ${focused ? C_.primary : C_.outlineVariant}`,
  boxShadow: focused ? `0 0 0 1px ${C_.primary}` : "none",
  color: C_.onSurface,
});

export const primaryBtn: React.CSSProperties = {
  backgroundColor: C.primary,
  color: C.onPrimary,
  boxShadow: "0 0 20px rgba(16,185,129,0.2)",
};
