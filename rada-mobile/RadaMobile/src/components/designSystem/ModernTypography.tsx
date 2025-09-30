import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { modernTypography, modernColors } from './modernTheme';
import { useTheme } from './DynamicTheme';

interface ModernTextProps {
  children: React.ReactNode;
  variant?: keyof typeof modernTypography;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'success' | 'warning' | 'error';
  weight?: '300' | '400' | '500' | '600' | '700' | '800';
  align?: 'left' | 'center' | 'right' | 'justify';
  gradient?: boolean;
  animated?: boolean;
  style?: TextStyle;
  numberOfLines?: number;
  onPress?: () => void;
}

export const ModernText: React.FC<ModernTextProps> = ({
  children,
  variant = 'body',
  size = 'medium',
  color = 'primary',
  weight,
  align = 'left',
  gradient = false,
  animated = false,
  style,
  numberOfLines,
  onPress,
}) => {
  const { colors, isDarkMode } = useTheme();

  const getBaseStyle = () => {
    if (variant in modernTypography) {
      const variantStyles = modernTypography[variant as keyof typeof modernTypography];
      if (typeof variantStyles === 'object' && size in variantStyles) {
        return variantStyles[size as keyof typeof variantStyles];
      }
    }
    return modernTypography.body.medium;
  };

  const getTextColor = () => {
    switch (color) {
      case 'primary':
        return isDarkMode ? colors.text?.primary || colors.neutral[50] : colors.text?.primary || colors.neutral[900];
      case 'secondary':
        return isDarkMode ? colors.text?.secondary || colors.neutral[300] : colors.text?.secondary || colors.neutral[600];
      case 'tertiary':
        return isDarkMode ? colors.text?.tertiary || colors.neutral[400] : colors.text?.tertiary || colors.neutral[500];
      case 'accent':
        return colors.primary[500];
      case 'success':
        return colors.success[500];
      case 'warning':
        return colors.warning[500];
      case 'error':
        return colors.error[500];
      default:
        return isDarkMode ? colors.neutral[50] : colors.neutral[900];
    }
  };

  const baseStyle = getBaseStyle();
  const textColor = getTextColor();

  const textStyle: TextStyle = {
    ...baseStyle,
    color: textColor,
    textAlign: align,
    ...(weight && { fontWeight: weight }),
    ...style,
  };

  if (gradient) {
    // For gradient text, we'd need a library like react-native-linear-gradient
    // For now, we'll use the accent color
    textStyle.color = colors.primary[500];
  }

  return (
    <Text
      style={textStyle}
      numberOfLines={numberOfLines}
      onPress={onPress}
    >
      {children}
    </Text>
  );
};

export const ModernHeading: React.FC<Omit<ModernTextProps, 'variant'> & {
  level: 1 | 2 | 3 | 4 | 5 | 6;
}> = ({ level, children, ...props }) => {
  const getVariantForLevel = () => {
    switch (level) {
      case 1:
        return 'display' as const;
      case 2:
        return 'headline' as const;
      case 3:
        return 'title' as const;
      case 4:
        return 'title' as const;
      case 5:
        return 'label' as const;
      case 6:
        return 'label' as const;
      default:
        return 'headline' as const;
    }
  };

  const getSizeForLevel = () => {
    switch (level) {
      case 1:
        return 'large' as const;
      case 2:
        return 'medium' as const;
      case 3:
        return 'large' as const;
      case 4:
        return 'medium' as const;
      case 5:
        return 'large' as const;
      case 6:
        return 'medium' as const;
      default:
        return 'medium' as const;
    }
  };

  return (
    <ModernText
      variant={getVariantForLevel()}
      size={getSizeForLevel()}
      weight="600"
      {...props}
    >
      {children}
    </ModernText>
  );
};

export const ResponsiveText: React.FC<ModernTextProps & {
  breakpoints?: {
    sm?: TextStyle;
    md?: TextStyle;
    lg?: TextStyle;
  };
}> = ({ breakpoints, style, ...props }) => {
  // This would require dimension tracking for full responsiveness
  // For now, we'll apply base styles
  return <ModernText style={style} {...props} />;
};

export const AnimatedText: React.FC<ModernTextProps & {
  animationType?: 'typewriter' | 'fade' | 'slide' | 'bounce';
  delay?: number;
}> = ({ animationType = 'fade', delay = 0, children, ...props }) => {
  // This would require Animated.Text implementation
  // For now, return standard text
  return <ModernText {...props}>{children}</ModernText>;
};

export const GradientText: React.FC<ModernTextProps & {
  gradientColors?: string[];
}> = ({ gradientColors, children, ...props }) => {
  // This would require react-native-linear-gradient or similar
  // For now, use accent color
  return (
    <ModernText color="accent" {...props}>
      {children}
    </ModernText>
  );
};

// Pre-defined text components for common use cases
export const DisplayText: React.FC<Omit<ModernTextProps, 'variant'>> = (props) => (
  <ModernText variant="display" weight="700" {...props} />
);

export const HeadlineText: React.FC<Omit<ModernTextProps, 'variant'>> = (props) => (
  <ModernText variant="headline" weight="600" {...props} />
);

export const TitleText: React.FC<Omit<ModernTextProps, 'variant'>> = (props) => (
  <ModernText variant="title" weight="500" {...props} />
);

export const BodyText: React.FC<Omit<ModernTextProps, 'variant'>> = (props) => (
  <ModernText variant="body" {...props} />
);

export const LabelText: React.FC<Omit<ModernTextProps, 'variant'>> = (props) => (
  <ModernText variant="label" weight="500" {...props} />
);

export const CaptionText: React.FC<Omit<ModernTextProps, 'variant'>> = (props) => (
  <ModernText variant="body" size="small" color="secondary" {...props} />
);

// Utility function for text scaling
export const getResponsiveFontSize = (baseSize: number, scaleFactor: number = 1) => {
  // This would use device dimensions for proper scaling
  return baseSize * scaleFactor;
};

// Text style presets
export const textPresets = StyleSheet.create({
  hero: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -2,
    lineHeight: 56,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: 0.15,
    lineHeight: 26,
    opacity: 0.8,
  },
  overline: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  button: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.25,
    textTransform: 'uppercase',
  },
  link: {
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

export default {
  ModernText,
  ModernHeading,
  ResponsiveText,
  AnimatedText,
  GradientText,
  DisplayText,
  HeadlineText,
  TitleText,
  BodyText,
  LabelText,
  CaptionText,
  textPresets,
  getResponsiveFontSize,
};