// Mirrors the web app's blue-turquoise design system 1:1
// (orthopedic-opd-ai-test/frontend/src/index.css :root / [data-theme="dark"]),
// so the mobile app reads as the same product, not a reskin.

export const lightColors = {
  primary: '#0369a1',
  primaryDark: '#075985',
  primaryDarker: '#0c4a6e',
  primaryLight: '#e0f2fe',
  primarySoft: '#bae6fd',
  accent: '#0ea5e9',
  accentDark: '#0284c7',

  success: '#059669',
  successLight: '#d1fae5',
  successDark: '#047857',
  warning: '#d97706',
  warningLight: '#fef3c7',
  warningDark: '#b45309',
  danger: '#dc2626',
  dangerLight: '#fee2e2',
  dangerDark: '#b91c1c',
  info: '#6366f1',
  infoLight: '#ede9fe',
  infoDark: '#4f46e5',

  bg: '#eef4f8',
  surface: '#ffffff',
  surface2: '#f3f8fb',
  border: '#dce6ee',
  borderDark: '#b7cadb',

  textPrimary: '#0b1f2e',
  textSecondary: '#45596a',
  textMuted: '#7a92a4',

  tabBarBg: '#071c2e',
  tabBarInactive: '#7a9db0',
} as const;

export const darkColors = {
  primary: '#38bdf8',
  primaryDark: '#0ea5e9',
  primaryDarker: '#0284c7',
  primaryLight: 'rgba(56,189,248,0.16)',
  primarySoft: 'rgba(56,189,248,0.28)',
  accent: '#7dd3fc',
  accentDark: '#38bdf8',

  success: '#34d399',
  successLight: 'rgba(52,211,153,0.16)',
  successDark: '#6ee7b7',
  warning: '#fbbf24',
  warningLight: 'rgba(251,191,36,0.16)',
  warningDark: '#fcd34d',
  danger: '#f87171',
  dangerLight: 'rgba(248,113,113,0.16)',
  dangerDark: '#fca5a5',
  info: '#818cf8',
  infoLight: 'rgba(129,140,248,0.16)',
  infoDark: '#a5b4fc',

  bg: '#071726',
  surface: '#0e202f',
  surface2: '#142c3d',
  border: '#203a4c',
  borderDark: '#2c5164',

  textPrimary: '#e6eff5',
  textSecondary: '#a3bccb',
  textMuted: '#5f7d8f',

  tabBarBg: '#05141f',
  tabBarInactive: '#5f7d8f',
} as const;

export type ThemeColors = typeof lightColors;

export const radius = { sm: 6, md: 10, lg: 16, xl: 24, pill: 999 };
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 };
