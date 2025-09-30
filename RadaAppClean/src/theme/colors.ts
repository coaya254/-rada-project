export const colors = {
  // Primary colors from your design
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Semantic colors
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
  },

  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },

  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B',
    600: '#D97706',
  },

  purple: {
    50: '#F8FAFC',
    100: '#F3E8FF',
    500: '#8B5CF6',
    600: '#7C3AED',
  },

  // Neutral colors
  neutral: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Background
  background: '#F9FAFB',
  surface: '#FFFFFF',

  // Gradients (as arrays for LinearGradient)
  gradients: {
    primary: ['#2563EB', '#1D4ED8', '#1E40AF'],
    success: ['#10B981', '#059669'],
    error: ['#EF4444', '#DC2626'],
    warning: ['#F59E0B', '#D97706'],
    purple: ['#8B5CF6', '#7C3AED'],
    dark: ['#111827', '#1F2937'],
  }
} as const;