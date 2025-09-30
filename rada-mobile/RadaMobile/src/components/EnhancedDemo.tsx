import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import {
  Card,
  Button,
  AnimatedButton,
  StatusBadge,
  TabNavigation,
  TextInput,
  Checkbox,
  RadioGroup,
  Switch,
  LoadingSpinner,
  Skeleton,
  SkeletonCard,
  SkeletonList,
} from './ui';

const EnhancedDemo: React.FC = () => {
  const {
    colors,
    spacing,
    createCard,
    createText,
    toggleColorMode,
    isDark,
    colorMode
  } = useTheme();

  // Demo state
  const [activeTab, setActiveTab] = useState('components');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
    notifications: true,
    accountType: 'personal',
    terms: false,
  });

  const tabs = [
    {
      id: 'components',
      label: 'Components',
      icon: <Ionicons name="apps" size={16} color={activeTab === 'components' ? colors.primary.text : colors.text.tertiary} />
    },
    {
      id: 'forms',
      label: 'Forms',
      icon: <Ionicons name="create" size={16} color={activeTab === 'forms' ? colors.primary.text : colors.text.tertiary} />
    },
    {
      id: 'loading',
      label: 'Loading',
      icon: <Ionicons name="refresh" size={16} color={activeTab === 'loading' ? colors.primary.text : colors.text.tertiary} />
    },
  ];

  const accountTypeOptions = [
    { label: 'Personal Account', value: 'personal' },
    { label: 'Business Account', value: 'business' },
    { label: 'Organization', value: 'organization' },
  ];

  const toggleLoading = () => {
    setIsLoading(!isLoading);
    if (!isLoading) {
      setTimeout(() => setIsLoading(false), 3000);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    header: {
      paddingTop: 50,
      paddingBottom: spacing.lg,
      paddingHorizontal: spacing.lg,
      backgroundColor: colors.primary.main,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      ...createText('h1'),
      color: colors.primary.text,
    },
    themeToggle: {
      padding: spacing.sm,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
    },
    section: {
      marginBottom: spacing['2xl'],
    },
    sectionTitle: {
      ...createText('h2'),
      marginBottom: spacing.md,
    },
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    formSection: {
      gap: spacing.md,
    },
    loadingContainer: {
      alignItems: 'center',
      gap: spacing.lg,
    },
    loadingRow: {
      flexDirection: 'row',
      gap: spacing.lg,
      alignItems: 'center',
    },
  });

  const renderComponents = () => (
    <>
      {/* Status Badges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status Badges</Text>
        <View style={styles.row}>
          <StatusBadge status="completed" />
          <StatusBadge status="in_progress" text="ACTIVE" />
          <StatusBadge status="pending" />
          <StatusBadge status="broken" text="FAILED" />
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Buttons & Animations</Text>
        <Card style={createCard()}>
          <View style={styles.row}>
            <Button title="Primary" variant="primary" onPress={() => {}} />
            <Button title="Secondary" variant="secondary" onPress={() => {}} />
          </View>
          <View style={styles.row}>
            <Button title="Outline" variant="outline" onPress={() => {}} />
            <Button title="Small" variant="small" onPress={() => {}} />
          </View>

          <Text style={[createText('h3'), { marginTop: spacing.lg, marginBottom: spacing.md }]}>
            Animated Buttons
          </Text>
          <View style={styles.row}>
            <AnimatedButton
              title="Scale"
              animationType="scale"
              onPress={() => {}}
              leftIcon={<Ionicons name="heart" size={16} color={colors.primary.text} />}
            />
            <AnimatedButton
              title="Bounce"
              variant="secondary"
              animationType="bounce"
              onPress={() => {}}
            />
          </View>
          <View style={styles.row}>
            <AnimatedButton
              title="Gradient"
              variant="outline"
              animationType="gradient"
              onPress={() => {}}
            />
            <AnimatedButton
              title="Ripple"
              variant="ghost"
              animationType="ripple"
              onPress={() => {}}
            />
          </View>
        </Card>
      </View>

      {/* Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cards & Content</Text>
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <Text style={createText('h3')}>Government Promise Tracker</Text>
            <StatusBadge status="completed" />
          </View>
          <Text style={createText('body2')}>
            Track government promises with evidence submission and community verification.
            Join thousands of citizens holding leaders accountable.
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md }}>
            <Text style={createText('caption')}>Last updated: Today</Text>
            <Button title="View Details" variant="small" onPress={() => {}} />
          </View>
        </Card>

        <Card style={createCard('light', 'compact')}>
          <Text style={createText('body1')}>This is a compact card variant with less padding.</Text>
        </Card>
      </View>
    </>
  );

  const renderForms = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Form Components</Text>
      <Card>
        <View style={styles.formSection}>
          <TextInput
            label="Email Address"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            leftIcon="mail"
            keyboardType="email-address"
            autoCapitalize="none"
            required
          />

          <TextInput
            label="Password"
            placeholder="Enter your password"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            leftIcon="lock-closed"
            rightIcon="eye"
            secureTextEntry
            required
          />

          <Text style={[createText('h3'), { marginTop: spacing.md }]}>Account Type</Text>
          <RadioGroup
            options={accountTypeOptions}
            selectedValue={formData.accountType}
            onValueChange={(value) => setFormData({ ...formData, accountType: value })}
          />

          <Checkbox
            checked={formData.rememberMe}
            onChange={(checked) => setFormData({ ...formData, rememberMe: checked })}
            label="Remember me for 30 days"
          />

          <Switch
            value={formData.notifications}
            onValueChange={(value) => setFormData({ ...formData, notifications: value })}
            label="Push notifications"
          />

          <Checkbox
            checked={formData.terms}
            onChange={(checked) => setFormData({ ...formData, terms: checked })}
            label="I agree to the Terms of Service and Privacy Policy"
            required
          />

          <AnimatedButton
            title="Create Account"
            onPress={() => {}}
            animationType="scale"
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </Card>
    </View>
  );

  const renderLoading = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Loading States</Text>

      <Card>
        <Text style={[createText('h3'), { marginBottom: spacing.md }]}>Loading Spinners</Text>
        <View style={styles.loadingRow}>
          <LoadingSpinner size="small" variant="circular" />
          <LoadingSpinner size="medium" variant="dots" />
          <LoadingSpinner size="large" variant="pulse" />
        </View>

        <AnimatedButton
          title={isLoading ? "Stop Loading" : "Start Loading"}
          onPress={toggleLoading}
          style={{ marginTop: spacing.lg }}
        />
      </Card>

      <Text style={[createText('h3'), { marginVertical: spacing.md }]}>Skeleton Screens</Text>

      {isLoading ? (
        <>
          <SkeletonCard showAvatar lines={3} />
          <SkeletonList items={3} showAvatar={false} />
        </>
      ) : (
        <>
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.primary.main,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: spacing.md,
              }}>
                <Text style={{ color: colors.primary.text, fontWeight: 'bold' }}>JD</Text>
              </View>
              <View>
                <Text style={createText('body1')}>John Doe</Text>
                <Text style={createText('caption')}>Software Engineer</Text>
              </View>
            </View>
            <Text style={createText('body2')}>
              Real content loaded! This shows what the skeleton was representing.
            </Text>
          </Card>

          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} style={createCard('light', 'compact')}>
              <Text style={createText('body1')}>Content item #{index + 1}</Text>
              <Text style={createText('body2')}>This is real loaded content.</Text>
            </Card>
          ))}
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary.main, colors.primary.light]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Enhanced UI System</Text>
          <TouchableOpacity
            style={styles.themeToggle}
            onPress={toggleColorMode}
          >
            <Ionicons
              name={isDark ? "sunny" : "moon"}
              size={24}
              color={colors.primary.text}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tab Navigation */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabPress={setActiveTab}
      />

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'components' && renderComponents()}
        {activeTab === 'forms' && renderForms()}
        {activeTab === 'loading' && renderLoading()}

        <View style={{ paddingBottom: spacing['3xl'] }}>
          <Text style={[createText('caption'), { textAlign: 'center', marginTop: spacing['2xl'] }]}>
            🎨 Enhanced Design System - {colorMode} mode
          </Text>
          <Text style={[createText('caption'), { textAlign: 'center', marginTop: spacing.xs }]}>
            Based on politician screen aesthetic with dark mode, animations, and accessibility
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default EnhancedDemo;