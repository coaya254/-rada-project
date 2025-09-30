import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  compact?: boolean;
  noPadding?: boolean;
  noMargin?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  compact = false,
  noPadding = false,
  noMargin = false
}) => {
  const { createCard } = useTheme();

  const baseStyle = createCard(compact ? 'compact' : 'default');
  const paddingStyle = noPadding ? { padding: 0 } : {};
  const marginStyle = noMargin ? { marginHorizontal: 0, marginBottom: 0 } : {};

  return (
    <View style={[baseStyle, paddingStyle, marginStyle, style]}>
      {children}
    </View>
  );
};

export default Card;