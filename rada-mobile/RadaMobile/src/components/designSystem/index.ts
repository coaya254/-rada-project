// Design System Components Export
export { default as Card } from './Card';
export { default as Button } from './Button';
export { default as ProgressBar } from './ProgressBar';
export { default as Badge } from './Badge';
export { default as LoadingState } from './LoadingState';
export { default as Breadcrumbs } from './Breadcrumbs';
export { default as CelebrationModal } from './CelebrationModal';
export { default as XPIndicator } from './XPIndicator';
export { default as StatusBadge } from './StatusBadge';

// Modern 2025 Design System Components
export { default as ModernCard } from './ModernCard';
export { default as ModernGestureCard } from './ModernGestureCard';
export { default as ThemeSelector } from './ThemeSelector';
export { ThemeProvider, useTheme } from './DynamicTheme';
export { PageTransition, MorphingContainer, usePageTransition } from './PageTransitions';

// Modern Typography Components
export {
  ModernText,
  ModernHeading,
  DisplayText,
  HeadlineText,
  TitleText,
  BodyText,
  LabelText,
  CaptionText,
  textPresets,
} from './ModernTypography';

// Modern Layout Components
export {
  ModernContainer,
  ModernRow,
  ModernColumn,
  ModernCenter,
  ModernSpaceBetween,
  ModernSpaceAround,
  ModernSpaceEvenly,
  ModernGrid,
  ModernStack,
  ModernMasonry,
  ModernSpacer,
  ModernDivider,
} from './ModernLayout';

// Modern Animation Hooks
export {
  useSpringAnimation,
  usePulseAnimation,
  useFloatingAnimation,
  useShakeAnimation,
  useParallaxAnimation,
  useSwipeGesture,
  useMorphingLoader,
  useParticleSystem,
  useSuccessAnimation,
} from './ModernAnimations';

// Modern Theme System
export {
  modernColors,
  modernTypography,
  modernSpacing,
  modernShadows,
  modernBorderRadius,
  modernGradients,
  modernAnimations,
  modernVariants,
} from './modernTheme';

// Legacy Theme and utilities
export { colors, spacing, typography, shadows } from './theme';
export {
  hapticFeedback,
  showSuccessToast,
  formatXP,
  calculateLevel,
  calculateXPForNextLevel,
  calculateCurrentLevelProgress
} from './utils';