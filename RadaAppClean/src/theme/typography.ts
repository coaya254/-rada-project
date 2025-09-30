export const typography = {
  fontSizes: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 22,
    '4xl': 24,
    '5xl': 28,
    '6xl': 32,
  },

  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  lineHeights: {
    tight: 18,
    normal: 20,
    relaxed: 22,
    loose: 24,
    extraLoose: 28,
    superLoose: 32,
  },

  // Text styles from your design
  styles: {
    // Headers
    h1: {
      fontSize: 32,
      fontWeight: '900',
      lineHeight: 36,
      color: '#111827',
    },
    h2: {
      fontSize: 28,
      fontWeight: '900',
      lineHeight: 32,
      color: '#111827',
    },
    h3: {
      fontSize: 24,
      fontWeight: '900',
      lineHeight: 28,
      color: '#111827',
    },
    h4: {
      fontSize: 20,
      fontWeight: '900',
      lineHeight: 24,
      color: '#111827',
    },

    // Body text
    bodyLarge: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 24,
      color: '#374151',
    },
    body: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 22,
      color: '#374151',
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '500',
      lineHeight: 20,
      color: '#6B7280',
    },

    // Button text
    buttonLarge: {
      fontSize: 18,
      fontWeight: '900',
      color: '#FFFFFF',
    },
    button: {
      fontSize: 16,
      fontWeight: '900',
      color: '#FFFFFF',
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
    },

    // Captions and labels
    caption: {
      fontSize: 12,
      fontWeight: '600',
      color: '#6B7280',
    },
    label: {
      fontSize: 12,
      fontWeight: '900',
      color: '#374151',
      letterSpacing: 1,
    },
  }
} as const;