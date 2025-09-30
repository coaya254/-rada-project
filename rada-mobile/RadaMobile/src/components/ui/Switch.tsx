import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary';
}

export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  label,
  disabled = false,
  size = 'medium',
  color = 'primary',
}) => {
  const { colors, spacing, typography } = useTheme();
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value, animatedValue]);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          width: 44,
          height: 24,
          thumbSize: 20,
          fontSize: typography.sizes.sm,
        };
      case 'large':
        return {
          width: 60,
          height: 32,
          thumbSize: 28,
          fontSize: typography.sizes.md,
        };
      default:
        return {
          width: 52,
          height: 28,
          thumbSize: 24,
          fontSize: typography.sizes.base,
        };
    }
  };

  const { width, height, thumbSize, fontSize } = getSizeStyles();

  const getColorStyles = () => {
    const activeColor = color === 'primary' ? colors.primary.main : colors.secondary.blue;
    const inactiveColor = colors.border.medium;

    return { activeColor, inactiveColor };
  };

  const { activeColor, inactiveColor } = getColorStyles();

  const trackColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveColor, activeColor],
  });

  const thumbTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, width - thumbSize - 2],
  });

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      opacity: disabled ? 0.6 : 1,
    },
    switch: {
      width,
      height,
      borderRadius: height / 2,
      justifyContent: 'center',
      marginRight: label ? spacing.sm : 0,
    },
    thumb: {
      width: thumbSize,
      height: thumbSize,
      borderRadius: thumbSize / 2,
      backgroundColor: colors.background.card,
      shadowColor: colors.text.primary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 3,
    },
    label: {
      fontSize,
      color: colors.text.primary,
      fontWeight: typography.weights.normal,
      flex: 1,
    },
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => !disabled && onValueChange(!value)}
      activeOpacity={0.7}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
    >
      <Animated.View
        style={[
          styles.switch,
          { backgroundColor: trackColor }
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              transform: [{ translateX: thumbTranslateX }],
            },
          ]}
        />
      </Animated.View>

      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
};

export default Switch;