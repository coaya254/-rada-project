import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary';
  indeterminate?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'medium',
  color = 'primary',
  indeterminate = false,
}) => {
  const { colors, spacing, borderRadius, typography } = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { checkboxSize: 18, iconSize: 14, fontSize: typography.sizes.sm };
      case 'large':
        return { checkboxSize: 26, iconSize: 20, fontSize: typography.sizes.md };
      default:
        return { checkboxSize: 22, iconSize: 16, fontSize: typography.sizes.base };
    }
  };

  const { checkboxSize, iconSize, fontSize } = getSizeStyles();

  const getColorStyles = () => {
    const baseColor = color === 'primary' ? colors.primary.main : colors.secondary.blue;

    return {
      backgroundColor: (checked || indeterminate) ? baseColor : 'transparent',
      borderColor: (checked || indeterminate) ? baseColor : colors.border.medium,
    };
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      opacity: disabled ? 0.6 : 1,
    },
    checkbox: {
      width: checkboxSize,
      height: checkboxSize,
      borderRadius: borderRadius.xs,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: label ? spacing.sm : 0,
      ...getColorStyles(),
    },
    label: {
      fontSize,
      color: colors.text.primary,
      fontWeight: typography.weights.normal,
      flex: 1,
    },
  });

  const getIconName = () => {
    if (indeterminate) return 'remove';
    return checked ? 'checkmark' : undefined;
  };

  const iconName = getIconName();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => !disabled && onChange(!checked)}
      activeOpacity={0.7}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: indeterminate ? 'mixed' : checked }}
      accessibilityLabel={label}
    >
      <View style={styles.checkbox}>
        {iconName && (
          <Ionicons
            name={iconName}
            size={iconSize}
            color={colors.primary.text}
          />
        )}
      </View>

      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
};

export default Checkbox;