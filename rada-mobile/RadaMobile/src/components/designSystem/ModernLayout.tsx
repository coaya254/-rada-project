import React from 'react';
import { View, ScrollView, SafeAreaView, StyleSheet, ViewStyle } from 'react-native';
import { modernSpacing, modernColors } from './modernTheme';
import { useTheme } from './DynamicTheme';

interface ModernContainerProps {
  children: React.ReactNode;
  padding?: keyof typeof modernSpacing;
  margin?: keyof typeof modernSpacing;
  paddingHorizontal?: keyof typeof modernSpacing;
  paddingVertical?: keyof typeof modernSpacing;
  marginHorizontal?: keyof typeof modernSpacing;
  marginVertical?: keyof typeof modernSpacing;
  flex?: number;
  direction?: 'row' | 'column';
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch';
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: keyof typeof modernSpacing;
  style?: ViewStyle;
  safe?: boolean;
  scroll?: boolean;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
}

export const ModernContainer: React.FC<ModernContainerProps> = ({
  children,
  padding,
  margin,
  paddingHorizontal,
  paddingVertical,
  marginHorizontal,
  marginVertical,
  flex,
  direction = 'column',
  align,
  justify,
  wrap,
  gap,
  style,
  safe = false,
  scroll = false,
  showsVerticalScrollIndicator = true,
  showsHorizontalScrollIndicator = true,
}) => {
  const { colors } = useTheme();

  const containerStyle: ViewStyle = {
    ...(flex !== undefined && { flex }),
    flexDirection: direction,
    ...(align && { alignItems: align }),
    ...(justify && { justifyContent: justify }),
    ...(wrap && { flexWrap: wrap }),
    ...(padding && { padding: modernSpacing[padding] }),
    ...(margin && { margin: modernSpacing[margin] }),
    ...(paddingHorizontal && { paddingHorizontal: modernSpacing[paddingHorizontal] }),
    ...(paddingVertical && { paddingVertical: modernSpacing[paddingVertical] }),
    ...(marginHorizontal && { marginHorizontal: modernSpacing[marginHorizontal] }),
    ...(marginVertical && { marginVertical: modernSpacing[marginVertical] }),
    ...(gap && { gap: modernSpacing[gap] }),
    backgroundColor: colors.surface.primary,
    ...style,
  };

  const renderContent = () => {
    if (scroll) {
      return (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={containerStyle}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          showsHorizontalScrollIndicator={showsHorizontalScrollIndicator}
        >
          {children}
        </ScrollView>
      );
    }

    return <View style={containerStyle}>{children}</View>;
  };

  if (safe) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.primary }}>
        {renderContent()}
      </SafeAreaView>
    );
  }

  return renderContent();
};

// Specialized layout components
export const ModernRow: React.FC<Omit<ModernContainerProps, 'direction'>> = (props) => (
  <ModernContainer direction="row" {...props} />
);

export const ModernColumn: React.FC<Omit<ModernContainerProps, 'direction'>> = (props) => (
  <ModernContainer direction="column" {...props} />
);

export const ModernCenter: React.FC<ModernContainerProps> = (props) => (
  <ModernContainer align="center" justify="center" {...props} />
);

export const ModernSpaceBetween: React.FC<ModernContainerProps> = (props) => (
  <ModernContainer justify="space-between" {...props} />
);

export const ModernSpaceAround: React.FC<ModernContainerProps> = (props) => (
  <ModernContainer justify="space-around" {...props} />
);

export const ModernSpaceEvenly: React.FC<ModernContainerProps> = (props) => (
  <ModernContainer justify="space-evenly" {...props} />
);

// Grid system
interface ModernGridProps {
  children: React.ReactNode;
  columns: number;
  gap?: keyof typeof modernSpacing;
  style?: ViewStyle;
}

export const ModernGrid: React.FC<ModernGridProps> = ({
  children,
  columns,
  gap = 4,
  style,
}) => {
  const childrenArray = React.Children.toArray(children);
  const rows: React.ReactNode[][] = [];

  for (let i = 0; i < childrenArray.length; i += columns) {
    rows.push(childrenArray.slice(i, i + columns));
  }

  return (
    <ModernColumn gap={gap} style={style}>
      {rows.map((row, rowIndex) => (
        <ModernRow key={rowIndex} gap={gap}>
          {row.map((child, colIndex) => (
            <View key={colIndex} style={{ flex: 1 }}>
              {child}
            </View>
          ))}
          {/* Fill empty columns */}
          {Array.from({ length: columns - row.length }, (_, index) => (
            <View key={`empty-${index}`} style={{ flex: 1 }} />
          ))}
        </ModernRow>
      ))}
    </ModernColumn>
  );
};

// Responsive breakpoints
export interface BreakpointProps {
  xs?: ViewStyle;
  sm?: ViewStyle;
  md?: ViewStyle;
  lg?: ViewStyle;
  xl?: ViewStyle;
}

export const ModernResponsive: React.FC<{
  children: React.ReactNode;
  breakpoints: BreakpointProps;
  style?: ViewStyle;
}> = ({ children, breakpoints, style }) => {
  // This would require dimension tracking for full responsiveness
  // For now, apply base styles
  return (
    <View style={[breakpoints.md || breakpoints.sm || {}, style]}>
      {children}
    </View>
  );
};

// Stack with automatic spacing
export const ModernStack: React.FC<{
  children: React.ReactNode;
  space?: keyof typeof modernSpacing;
  direction?: 'horizontal' | 'vertical';
  align?: 'start' | 'center' | 'end' | 'stretch';
  style?: ViewStyle;
}> = ({
  children,
  space = 4,
  direction = 'vertical',
  align = 'stretch',
  style,
}) => {
  const getAlignItems = () => {
    switch (align) {
      case 'start':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'end':
        return 'flex-end';
      case 'stretch':
        return 'stretch';
      default:
        return 'stretch';
    }
  };

  return (
    <View
      style={[
        {
          flexDirection: direction === 'horizontal' ? 'row' : 'column',
          alignItems: getAlignItems(),
          gap: modernSpacing[space],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

// Masonry layout (simplified)
export const ModernMasonry: React.FC<{
  children: React.ReactNode;
  columns: number;
  gap?: keyof typeof modernSpacing;
  style?: ViewStyle;
}> = ({ children, columns, gap = 4, style }) => {
  const childrenArray = React.Children.toArray(children);
  const columnArrays: React.ReactNode[][] = Array.from({ length: columns }, () => []);

  childrenArray.forEach((child, index) => {
    const columnIndex = index % columns;
    columnArrays[columnIndex].push(child);
  });

  return (
    <ModernRow gap={gap} style={style}>
      {columnArrays.map((column, columnIndex) => (
        <ModernColumn key={columnIndex} gap={gap} flex={1}>
          {column}
        </ModernColumn>
      ))}
    </ModernRow>
  );
};

// Utility spacing components
export const ModernSpacer: React.FC<{
  size?: keyof typeof modernSpacing;
  horizontal?: boolean;
}> = ({ size = 4, horizontal = false }) => (
  <View
    style={{
      [horizontal ? 'width' : 'height']: modernSpacing[size],
    }}
  />
);

export const ModernDivider: React.FC<{
  color?: string;
  thickness?: number;
  margin?: keyof typeof modernSpacing;
  orientation?: 'horizontal' | 'vertical';
}> = ({
  color,
  thickness = 1,
  margin = 4,
  orientation = 'horizontal',
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: color || colors.neutral[200],
        [orientation === 'horizontal' ? 'height' : 'width']: thickness,
        [orientation === 'horizontal' ? 'marginVertical' : 'marginHorizontal']: modernSpacing[margin],
        alignSelf: 'stretch',
      }}
    />
  );
};

// Layout debugging (development only)
export const ModernDebugBox: React.FC<{
  children: React.ReactNode;
  color?: string;
  style?: ViewStyle;
}> = ({ children, color = 'red', style }) => (
  <View
    style={[
      {
        borderWidth: 1,
        borderColor: color,
        backgroundColor: `${color}10`,
      },
      style,
    ]}
  >
    {children}
  </View>
);

export default {
  ModernContainer,
  ModernRow,
  ModernColumn,
  ModernCenter,
  ModernSpaceBetween,
  ModernSpaceAround,
  ModernSpaceEvenly,
  ModernGrid,
  ModernResponsive,
  ModernStack,
  ModernMasonry,
  ModernSpacer,
  ModernDivider,
  ModernDebugBox,
};