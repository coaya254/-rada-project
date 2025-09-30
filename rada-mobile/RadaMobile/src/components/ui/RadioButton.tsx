import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface RadioButtonProps {
  selected: boolean;
  onSelect: () => void;
  label?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary';
}

export const RadioButton: React.FC<RadioButtonProps> = ({
  selected,
  onSelect,
  label,
  disabled = false,
  size = 'medium',
  color = 'primary',
}) => {
  const { colors, spacing, typography } = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          radioSize: 18,
          innerSize: 8,
          fontSize: typography.sizes.sm,
        };
      case 'large':
        return {
          radioSize: 26,
          innerSize: 12,
          fontSize: typography.sizes.md,
        };
      default:
        return {
          radioSize: 22,
          innerSize: 10,
          fontSize: typography.sizes.base,
        };
    }
  };

  const { radioSize, innerSize, fontSize } = getSizeStyles();

  const getColorStyles = () => {
    const baseColor = color === 'primary' ? colors.primary.main : colors.secondary.blue;

    return {
      borderColor: selected ? baseColor : colors.border.medium,
      innerColor: baseColor,
    };
  };

  const colorStyles = getColorStyles();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      opacity: disabled ? 0.6 : 1,
    },
    radio: {
      width: radioSize,
      height: radioSize,
      borderRadius: radioSize / 2,
      borderWidth: 2,
      borderColor: colorStyles.borderColor,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: label ? spacing.sm : 0,
      backgroundColor: colors.background.card,
    },
    radioInner: {
      width: innerSize,
      height: innerSize,
      borderRadius: innerSize / 2,
      backgroundColor: colorStyles.innerColor,
      opacity: selected ? 1 : 0,
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
      onPress={() => !disabled && onSelect()}
      activeOpacity={0.7}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      <View style={styles.radio}>
        <View style={styles.radioInner} />
      </View>

      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
};

interface RadioGroupProps {
  options: Array<{ label: string; value: string }>;
  selectedValue: string | null;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary';
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  options,
  selectedValue,
  onValueChange,
  disabled = false,
  size = 'medium',
  color = 'primary',
}) => {
  const { spacing } = useTheme();

  return (
    <View style={{ gap: spacing.sm }}>
      {options.map((option) => (
        <RadioButton
          key={option.value}
          selected={selectedValue === option.value}
          onSelect={() => onValueChange(option.value)}
          label={option.label}
          disabled={disabled}
          size={size}
          color={color}
        />
      ))}
    </View>
  );
};

export default RadioButton;