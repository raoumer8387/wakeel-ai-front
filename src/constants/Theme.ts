export const Colors = {
  // Primary brand colors
  primary: '#2D2B55',       // Deep navy/indigo for logo bg & headings
  primaryLight: '#4A4880',  // Lighter shade
  secondary: '#C9A96E',     // Warm gold accent
  
  // Background
  background: '#FAFAF7',    // Warm off-white / cream
  surface: '#FFFFFF',       // White cards
  
  // Text
  text: '#1A1A2E',          // Near-black for headings
  textSecondary: '#5A5A7A', // Muted text
  textMuted: '#8E8EA0',     // Very muted text
  
  // Feature card accents
  featureBlue: '#E8EDF5',      // Know your rights - blue tint
  featureBlueBorder: '#C5D0E6',
  featureBlueText: '#2D2B55',

  featureGreen: '#E6F5ED',     // AI-drafted petitions - green tint
  featureGreenBorder: '#B8E0CC',
  featureGreenText: '#0F7B46',

  featurePeach: '#FDF0E8',     // Dual AI agent - peach tint
  featurePeachBorder: '#F5D5BF',
  featurePeachText: '#C05621',

  // Badge colors
  badgeBg: '#F3F3F0',
  badgeBorder: '#E2E2DB',
  badgeText: '#3A3A50',

  // Button
  buttonBg: '#F5EDE0',        // Warm beige for Google button
  buttonText: '#1A1A2E',

  // Misc
  border: '#E8E8E2',
  error: '#ef4444',
  link: '#2D2B55',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const Typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#1A1A2E',
  },
  h2: {
    fontSize: 22,
    fontWeight: '600' as const,
    color: '#1A1A2E',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '500' as const,
    color: '#5A5A7A',
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: '#5A5A7A',
  },
  caption: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: '#8E8EA0',
  },
};
