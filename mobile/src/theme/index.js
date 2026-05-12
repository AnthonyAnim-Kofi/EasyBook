/**
 * EasyBook Design System
 * Centralized theme tokens — import these instead of hardcoding values.
 */

// ─── Color Palette ───────────────────────────────────────────────────────────

export const colors = {
  // Brand
  primary: '#00A896',
  primaryLight: '#80D4CB',
  primarySurface: '#E0F5F3',
  primaryDark: '#007D6E',

  // Backgrounds
  background: '#F7F7F7',
  backgroundAlt: '#EDE9E8',
  card: '#FFFFFF',
  inputBg: '#FAFAFA',
  inputBgAlt: '#E8F6F5',

  // Text
  text: '#1A1A1A',
  textSecondary: '#555555',
  textTertiary: '#888888',
  textMuted: '#AAAAAA',
  textPlaceholder: '#BBBBBB',

  // Semantic
  error: '#D63031',
  errorBg: '#FFE5E5',
  success: '#00B894',
  successBg: '#E0F8F0',
  warning: '#FFD93D',
  danger: '#FF6B6B',

  // Neutral
  border: '#E0E0E0',
  borderLight: '#F0EDED',
  divider: '#F5F5F5',
  overlay: 'rgba(0,0,0,0.35)',
  overlayLight: 'rgba(0,0,0,0.25)',

  // Star rating
  star: '#FFD93D',

  // White / transparent
  white: '#FFFFFF',
  whiteAlpha75: 'rgba(255,255,255,0.75)',
  whiteAlpha70: 'rgba(255,255,255,0.70)',
  whiteAlpha85: 'rgba(255,255,255,0.85)',
  transparent: 'transparent',

  // Dark promo
  promoBg: '#003D59',
};

// ─── Typography ──────────────────────────────────────────────────────────────

export const typography = {
  // Sizes
  size: {
    xs: 11,
    sm: 12,
    body: 13,
    md: 14,
    lg: 15,
    xl: 16,
    '2xl': 17,
    '3xl': 22,
    '4xl': 28,
    '5xl': 30,
    '6xl': 36,
    display: 48,
  },

  // Weights
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};

// ─── Spacing ─────────────────────────────────────────────────────────────────

export const spacing = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  '2xl': 14,
  '3xl': 16,
  '4xl': 18,
  '5xl': 20,
  '6xl': 22,
  '7xl': 24,
  '8xl': 28,
  '9xl': 32,
  '10xl': 36,
  '11xl': 40,
};

// ─── Border Radius ───────────────────────────────────────────────────────────

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 16,
  '2xl': 18,
  '3xl': 20,
  round: 24,
  pill: 30,
  circle: 9999,
};

// ─── Shadows ─────────────────────────────────────────────────────────────────

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  primary: {
    shadowColor: '#00A896',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  primaryStrong: {
    shadowColor: '#00A896',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
};

// ─── Icon Sizes ──────────────────────────────────────────────────────────────

export const iconSize = {
  xs: 12,
  sm: 13,
  md: 14,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 22,
};

// ─── Convenience Export ──────────────────────────────────────────────────────

const theme = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  iconSize,
};

export default theme;
