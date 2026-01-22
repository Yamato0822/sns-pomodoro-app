/** @type {const} */
const themeColors = {
  // Primary: Vibrant teal for focus and actions
  primary: { light: '#0891b2', dark: '#06b6d4' },
  // Background: Clean white/dark
  background: { light: '#ffffff', dark: '#0f172a' },
  // Surface: Slightly elevated from background
  surface: { light: '#f8fafc', dark: '#1e293b' },
  // Foreground: High contrast text
  foreground: { light: '#0f172a', dark: '#f1f5f9' },
  // Muted: Secondary text
  muted: { light: '#64748b', dark: '#cbd5e1' },
  // Border: Subtle dividers
  border: { light: '#e2e8f0', dark: '#334155' },
  // Success: Green for completed tasks
  success: { light: '#10b981', dark: '#34d399' },
  // Warning: Orange for breaks/warnings
  warning: { light: '#f97316', dark: '#fb923c' },
  // Error: Red for errors
  error: { light: '#ef4444', dark: '#f87171' },
  // Accent colors for timer states
  focus: { light: '#3b82f6', dark: '#60a5fa' },
  break: { light: '#06b6d4', dark: '#22d3ee' },
};

module.exports = { themeColors };
