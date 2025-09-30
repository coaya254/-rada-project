import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  Animated,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, ThemeMode, AccentColor } from './DynamicTheme';
import { modernColors, modernBorderRadius, modernShadows, modernSpacing } from './modernTheme';
import { ModernText, HeadlineText, BodyText } from './ModernTypography';
import { ModernContainer, ModernRow, ModernColumn } from './ModernLayout';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ThemeSelectorProps {
  visible: boolean;
  onClose: () => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ visible, onClose }) => {
  const { themeMode, accentColor, isDarkMode, setThemeMode, setAccentColor } = useTheme();
  const [selectedSection, setSelectedSection] = useState<'mode' | 'accent'>('mode');

  const themeOptions: { mode: ThemeMode; icon: string; label: string; description: string }[] = [
    {
      mode: 'light',
      icon: 'sunny',
      label: 'Light Mode',
      description: 'Clean and bright interface',
    },
    {
      mode: 'dark',
      icon: 'moon',
      label: 'Dark Mode',
      description: 'Easy on the eyes',
    },
    {
      mode: 'auto',
      icon: 'phone-portrait',
      label: 'Auto',
      description: 'Follows system setting',
    },
  ];

  const accentOptions: { color: AccentColor; label: string; colors: string[]; description: string }[] = [
    {
      color: 'primary',
      label: 'Classic',
      colors: modernColors.primary.gradient,
      description: 'Timeless and professional',
    },
    {
      color: 'neon',
      label: 'Neon',
      colors: [modernColors.neon.cyan, modernColors.neon.purple],
      description: 'Bold and vibrant',
    },
    {
      color: 'sunset',
      label: 'Sunset',
      colors: ['#ff6b6b', '#ffa726', '#ffcc02'],
      description: 'Warm and energetic',
    },
    {
      color: 'ocean',
      label: 'Ocean',
      colors: ['#667eea', '#764ba2'],
      description: 'Cool and calming',
    },
    {
      color: 'forest',
      label: 'Forest',
      colors: ['#134e5e', '#71b280'],
      description: 'Natural and grounding',
    },
    {
      color: 'cosmic',
      label: 'Cosmic',
      colors: ['#243b55', '#141e30'],
      description: 'Mysterious and deep',
    },
  ];

  const handleThemeModeSelect = (mode: ThemeMode) => {
    setThemeMode(mode);
    Vibration.vibrate(50);
  };

  const handleAccentColorSelect = (color: AccentColor) => {
    setAccentColor(color);
    Vibration.vibrate(50);
  };

  const renderThemeModeOption = (option: typeof themeOptions[0]) => (
    <TouchableOpacity
      key={option.mode}
      style={[
        styles.optionCard,
        themeMode === option.mode && styles.selectedOption,
        { backgroundColor: isDarkMode ? modernColors.neutral[800] : modernColors.neutral[50] },
      ]}
      onPress={() => handleThemeModeSelect(option.mode)}
      activeOpacity={0.8}
    >
      <View style={styles.optionIcon}>
        <Ionicons
          name={option.icon as any}
          size={24}
          color={themeMode === option.mode ? modernColors.primary[500] : modernColors.neutral[500]}
        />
      </View>
      <ModernText
        variant="title"
        size="medium"
        weight="600"
        color={themeMode === option.mode ? 'accent' : 'primary'}
      >
        {option.label}
      </ModernText>
      <ModernText
        variant="body"
        size="small"
        color="secondary"
        align="center"
        style={{ marginTop: 4 }}
      >
        {option.description}
      </ModernText>
    </TouchableOpacity>
  );

  const renderAccentColorOption = (option: typeof accentOptions[0]) => (
    <TouchableOpacity
      key={option.color}
      style={[
        styles.colorCard,
        accentColor === option.color && styles.selectedColorCard,
      ]}
      onPress={() => handleAccentColorSelect(option.color)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={option.colors}
        style={styles.colorPreview}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {accentColor === option.color && (
          <Ionicons name="checkmark" size={20} color="white" />
        )}
      </LinearGradient>
      <ModernText
        variant="label"
        size="medium"
        weight="600"
        color={accentColor === option.color ? 'accent' : 'primary'}
        style={{ marginTop: 8 }}
      >
        {option.label}
      </ModernText>
      <ModernText
        variant="body"
        size="small"
        color="secondary"
        align="center"
        style={{ marginTop: 2 }}
      >
        {option.description}
      </ModernText>
    </TouchableOpacity>
  );

  const renderSectionSelector = () => (
    <ModernRow gap={2} style={{ marginBottom: 24 }}>
      <TouchableOpacity
        style={[
          styles.sectionTab,
          selectedSection === 'mode' && styles.activeSectionTab,
          { backgroundColor: isDarkMode ? modernColors.neutral[700] : modernColors.neutral[100] },
        ]}
        onPress={() => setSelectedSection('mode')}
        activeOpacity={0.8}
      >
        <ModernText
          variant="label"
          size="medium"
          weight="600"
          color={selectedSection === 'mode' ? 'accent' : 'secondary'}
        >
          Theme Mode
        </ModernText>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.sectionTab,
          selectedSection === 'accent' && styles.activeSectionTab,
          { backgroundColor: isDarkMode ? modernColors.neutral[700] : modernColors.neutral[100] },
        ]}
        onPress={() => setSelectedSection('accent')}
        activeOpacity={0.8}
      >
        <ModernText
          variant="label"
          size="medium"
          weight="600"
          color={selectedSection === 'accent' ? 'accent' : 'secondary'}
        >
          Accent Color
        </ModernText>
      </TouchableOpacity>
    </ModernRow>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <BlurView intensity={20} style={styles.overlay}>
        <ModernContainer
          style={[
            styles.modalContainer,
            { backgroundColor: isDarkMode ? modernColors.neutral[900] : modernColors.neutral[0] },
          ]}
        >
          {/* Header */}
          <ModernRow justify="space-between" align="center" style={{ marginBottom: 24 }}>
            <HeadlineText size="medium" weight="700">
              Customize Theme
            </HeadlineText>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.8}
            >
              <Ionicons
                name="close"
                size={24}
                color={isDarkMode ? modernColors.neutral[300] : modernColors.neutral[600]}
              />
            </TouchableOpacity>
          </ModernRow>

          {/* Section Selector */}
          {renderSectionSelector()}

          {/* Content */}
          {selectedSection === 'mode' ? (
            <ModernColumn gap={3}>
              <BodyText color="secondary" style={{ marginBottom: 16 }}>
                Choose how the app appears to you
              </BodyText>
              <ModernRow gap={3} wrap="wrap">
                {themeOptions.map(renderThemeModeOption)}
              </ModernRow>
            </ModernColumn>
          ) : (
            <ModernColumn gap={3}>
              <BodyText color="secondary" style={{ marginBottom: 16 }}>
                Pick your favorite color scheme
              </BodyText>
              <View style={styles.colorGrid}>
                {accentOptions.map(renderAccentColorOption)}
              </View>
            </ModernColumn>
          )}

          {/* Preview Section */}
          <View style={styles.previewSection}>
            <ModernText variant="label" size="medium" weight="600" color="secondary">
              Preview
            </ModernText>
            <View
              style={[
                styles.previewCard,
                { backgroundColor: isDarkMode ? modernColors.neutral[800] : modernColors.neutral[50] },
              ]}
            >
              <LinearGradient
                colors={accentOptions.find(opt => opt.color === accentColor)?.colors || modernColors.primary.gradient}
                style={styles.previewGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <ModernText variant="body" size="medium" style={{ color: 'white' }}>
                  Sample content with your theme
                </ModernText>
              </LinearGradient>
            </View>
          </View>
        </ModernContainer>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: screenWidth * 0.9,
    maxWidth: 500,
    maxHeight: screenHeight * 0.8,
    borderRadius: modernBorderRadius['2xl'],
    padding: modernSpacing[6],
    ...modernShadows['2xl'],
  },
  closeButton: {
    padding: modernSpacing[2],
    borderRadius: modernBorderRadius.full,
  },
  sectionTab: {
    flex: 1,
    padding: modernSpacing[3],
    borderRadius: modernBorderRadius.lg,
    alignItems: 'center',
  },
  activeSectionTab: {
    backgroundColor: modernColors.primary[100],
  },
  optionCard: {
    flex: 1,
    minWidth: 100,
    padding: modernSpacing[4],
    borderRadius: modernBorderRadius.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...modernShadows.sm,
  },
  selectedOption: {
    borderColor: modernColors.primary[500],
    backgroundColor: `${modernColors.primary[500]}10`,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: modernColors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: modernSpacing[3],
    justifyContent: 'space-between',
  },
  colorCard: {
    width: (screenWidth * 0.9 - modernSpacing[6] * 2 - modernSpacing[3] * 2) / 3,
    alignItems: 'center',
    padding: modernSpacing[3],
    borderRadius: modernBorderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorCard: {
    borderColor: modernColors.primary[500],
  },
  colorPreview: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...modernShadows.md,
  },
  previewSection: {
    marginTop: 32,
    padding: modernSpacing[4],
    borderRadius: modernBorderRadius.lg,
    backgroundColor: modernColors.neutral[50],
  },
  previewCard: {
    marginTop: 12,
    borderRadius: modernBorderRadius.lg,
    overflow: 'hidden',
    ...modernShadows.sm,
  },
  previewGradient: {
    padding: modernSpacing[4],
    alignItems: 'center',
  },
});

export default ThemeSelector;