import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import apiService from '../../services/api';

const BadgeEditor = ({ item, onClose, onSave, user }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [badge, setBadge] = useState({
    name: '',
    description: '',
    type: 'achievement',
    category: 'learning',
    icon: '🏆',
    color: '#FFD700',
    rarity: 'common',
    requirements: '',
    xp_bonus: 0,
    is_active: true,
    unlock_conditions: [],
    tags: [],
    animation: 'none',
    glow_effect: false,
    special_effects: []
  });

  const badgeTypes = [
    { value: 'achievement', label: 'Achievement' },
    { value: 'milestone', label: 'Milestone' },
    { value: 'special', label: 'Special Event' },
    { value: 'seasonal', label: 'Seasonal' },
    { value: 'exclusive', label: 'Exclusive' },
  ];

  const badgeCategories = [
    { value: 'learning', label: 'Learning' },
    { value: 'engagement', label: 'Engagement' },
    { value: 'social', label: 'Social' },
    { value: 'challenge', label: 'Challenge' },
    { value: 'mastery', label: 'Mastery' },
  ];

  const badgeRarities = [
    { value: 'common', label: 'Common', color: '#6c757d' },
    { value: 'uncommon', label: 'Uncommon', color: '#28a745' },
    { value: 'rare', label: 'Rare', color: '#007bff' },
    { value: 'epic', label: 'Epic', color: '#6f42c1' },
    { value: 'legendary', label: 'Legendary', color: '#fd7e14' },
  ];

  const badgeAnimations = [
    { value: 'none', label: 'None' },
    { value: 'pulse', label: 'Pulse' },
    { value: 'bounce', label: 'Bounce' },
    { value: 'rotate', label: 'Rotate' },
    { value: 'sparkle', label: 'Sparkle' },
  ];
  const [currentTag, setCurrentTag] = useState('');
  const [currentCondition, setCurrentCondition] = useState({
    type: 'modules_completed',
    value: 1,
    operator: '>='
  });

  useEffect(() => {
    if (item) {
      setBadge({
        ...item,
        tags: item.tags || [],
        unlock_conditions: item.unlock_conditions || []
      });
    }
  }, [item]);

  const addTag = () => {
    if (currentTag.trim() && !badge.tags.includes(currentTag.trim())) {
      setBadge(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setBadge(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addUnlockCondition = () => {
    if (!currentCondition.type || !currentCondition.value) {
      Alert.alert('Error', 'Please fill all condition fields');
      return;
    }

    setBadge(prev => ({
      ...prev,
      unlock_conditions: [...prev.unlock_conditions, { ...currentCondition, id: Date.now() }]
    }));

    setCurrentCondition({
      type: 'modules_completed',
      value: 1,
      operator: '>='
    });
  };

  const removeUnlockCondition = (index) => {
    setBadge(prev => ({
      ...prev,
      unlock_conditions: prev.unlock_conditions.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!badge.name.trim()) {
      Alert.alert('Error', 'Please enter a badge name');
      return;
    }

    if (!badge.description.trim()) {
      Alert.alert('Error', 'Please enter a badge description');
      return;
    }

    if (!badge.requirements.trim()) {
      Alert.alert('Error', 'Please enter badge requirements');
      return;
    }

    setIsLoading(true);
    try {
      const headers = {
        'x-user-uuid': user.uuid,
        'x-user-role': user.role
      };

      if (item) {
        await apiService.put(`/api/admin/content/badges/${item.id}`, badge, { headers });
      } else {
        await apiService.post('/api/admin/content/badges', badge, { headers });
      }

      Alert.alert('Success', `Badge ${item ? 'updated' : 'created'} successfully!`);
      onSave();
    } catch (error) {
      console.error('Error saving badge:', error);
      Alert.alert('Error', `Failed to ${item ? 'update' : 'create'} badge`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderUnlockCondition = (condition, index) => (
    <View key={condition.id || index} style={styles.conditionCard}>
      <View style={styles.conditionHeader}>
        <Text style={styles.conditionNumber}>Condition {index + 1}</Text>
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => removeUnlockCondition(index)}
        >
          <Text style={styles.removeButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.conditionContent}>
        <Text style={styles.conditionText}>
          {condition.operator} {condition.value} {condition.type.replace('_', ' ')}
        </Text>
      </View>
    </View>
  );

  const getIconOptions = () => [
    '🏆', '🥇', '🥈', '🥉', '⭐', '🌟', '💎', '🔥', '💪', '🧠', '📚', '🎯',
    '🚀', '⚡', '🎉', '🏅', '👑', '💯', '🎊', '🏆', '🎖️', '🏅', '🥇', '🥈'
  ];

  const getColorOptions = () => [
    { name: 'Gold', value: '#FFD700' },
    { name: 'Silver', value: '#C0C0C0' },
    { name: 'Bronze', value: '#CD7F32' },
    { name: 'Blue', value: '#007BFF' },
    { name: 'Green', value: '#28A745' },
    { name: 'Red', value: '#DC3545' },
    { name: 'Purple', value: '#6F42C1' },
    { name: 'Orange', value: '#FD7E14' },
    { name: 'Pink', value: '#E83E8C' },
    { name: 'Teal', value: '#20C997' }
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FF6B6B', '#4ECDC4']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {item ? 'Edit Badge' : 'Create New Badge'}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Basic Badge Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Badge Information</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Badge Name"
            value={badge.name}
            onChangeText={(text) => setBadge(prev => ({ ...prev, name: text }))}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            value={badge.description}
            onChangeText={(text) => setBadge(prev => ({ ...prev, description: text }))}
            multiline
            numberOfLines={3}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Requirements (what users need to do to earn this badge)"
            value={badge.requirements}
            onChangeText={(text) => setBadge(prev => ({ ...prev, requirements: text }))}
            multiline
            numberOfLines={3}
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Badge Type:</Text>
              <Picker
                selectedValue={badge.type}
                onValueChange={(value) => setBadge(prev => ({ ...prev, type: value }))}
                style={styles.picker}
              >
                {badgeTypes.map((type) => (
                  <Picker.Item key={type.value} label={type.label} value={type.value} />
                ))}
              </Picker>
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Category:</Text>
              <Picker
                selectedValue={badge.category}
                onValueChange={(value) => setBadge(prev => ({ ...prev, category: value }))}
                style={styles.picker}
              >
                {badgeCategories.map((category) => (
                  <Picker.Item key={category.value} label={category.label} value={category.value} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Rarity:</Text>
              <Picker
                selectedValue={badge.rarity}
                onValueChange={(value) => setBadge(prev => ({ ...prev, rarity: value }))}
                style={styles.picker}
              >
                {badgeRarities.map((rarity) => (
                  <Picker.Item key={rarity.value} label={rarity.label} value={rarity.value} />
                ))}
              </Picker>
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>XP Bonus:</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={badge.xp_bonus.toString()}
                onChangeText={(text) => setBadge(prev => ({ ...prev, xp_bonus: parseInt(text) || 0 }))}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Visual Customization */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visual Customization</Text>
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Icon:</Text>
              <View style={styles.iconSelector}>
                <Text style={styles.currentIcon}>{badge.icon}</Text>
                <Picker
                  selectedValue={badge.icon}
                  onValueChange={(value) => setBadge(prev => ({ ...prev, icon: value }))}
                  style={styles.iconPicker}
                >
                  {getIconOptions().map(icon => (
                    <Picker.Item key={icon} label={icon} value={icon} />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Color:</Text>
              <View style={styles.colorSelector}>
                <View style={[styles.colorPreview, { backgroundColor: badge.color }]} />
                <Picker
                  selectedValue={badge.color}
                  onValueChange={(value) => setBadge(prev => ({ ...prev, color: value }))}
                  style={styles.colorPicker}
                >
                  {getColorOptions().map(color => (
                    <Picker.Item key={color.value} label={color.name} value={color.value} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.badgePreview}>
            <Text style={styles.previewLabel}>Preview:</Text>
            <View style={[styles.badgeDisplay, { backgroundColor: badge.color }]}>
              <Text style={styles.badgeIcon}>{badge.icon}</Text>
              <Text style={styles.badgeName}>{badge.name || 'Badge Name'}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Animation:</Text>
              <Picker
                selectedValue={badge.animation}
                onValueChange={(value) => setBadge(prev => ({ ...prev, animation: value }))}
                style={styles.picker}
              >
                {badgeAnimations.map((animation) => (
                  <Picker.Item key={animation.value} label={animation.label} value={animation.value} />
                ))}
              </Picker>
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Glow Effect:</Text>
              <View style={styles.switchContainer}>
                <Switch
                  value={badge.glow_effect}
                  onValueChange={(value) => setBadge(prev => ({ ...prev, glow_effect: value }))}
                  trackColor={{ false: '#767577', true: '#4ECDC4' }}
                  thumbColor={badge.glow_effect ? '#fff' : '#f4f3f4'}
                />
                <Text style={styles.switchLabel}>
                  {badge.glow_effect ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Unlock Conditions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Unlock Conditions</Text>
          
          {badge.unlock_conditions.map(renderUnlockCondition)}

          <View style={styles.addConditionSection}>
            <Text style={styles.subsectionTitle}>Add New Condition</Text>
            
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Condition Type:</Text>
                <Picker
                  selectedValue={currentCondition.type}
                  onValueChange={(value) => setCurrentCondition(prev => ({ ...prev, type: value }))}
                  style={styles.picker}
                >
                  <Picker.Item label="Modules Completed" value="modules_completed" />
                  <Picker.Item label="Lessons Completed" value="lessons_completed" />
                  <Picker.Item label="Quizzes Passed" value="quizzes_passed" />
                  <Picker.Item label="Challenges Completed" value="challenges_completed" />
                  <Picker.Item label="XP Earned" value="xp_earned" />
                  <Picker.Item label="Learning Streak" value="learning_streak" />
                  <Picker.Item label="Community Posts" value="community_posts" />
                </Picker>
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Operator:</Text>
                <Picker
                  selectedValue={currentCondition.operator}
                  onValueChange={(value) => setCurrentCondition(prev => ({ ...prev, operator: value }))}
                  style={styles.picker}
                >
                  <Picker.Item label=">=" value=">=" />
                  <Picker.Item label=">" value=">" />
                  <Picker.Item label="=" value="=" />
                  <Picker.Item label="<" value="<" />
                  <Picker.Item label="<=" value="<=" />
                </Picker>
              </View>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Value"
              value={currentCondition.value.toString()}
              onChangeText={(text) => setCurrentCondition(prev => ({ ...prev, value: parseInt(text) || 0 }))}
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.addConditionButton} onPress={addUnlockCondition}>
              <Text style={styles.addConditionButtonText}>+ Add Condition</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tags Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags</Text>
          
          <View style={styles.tagInputRow}>
            <TextInput
              style={[styles.input, styles.tagInput]}
              placeholder="Add a tag"
              value={currentTag}
              onChangeText={setCurrentTag}
              onSubmitEditing={addTag}
            />
            <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
              <Text style={styles.addTagButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          {badge.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {badge.tags.map((tag, index) => (
                <View key={index} style={styles.tagChip}>
                  <Text style={styles.tagText}>{tag}</Text>
                  <TouchableOpacity
                    style={styles.removeTagButton}
                    onPress={() => removeTag(tag)}
                  >
                    <Text style={styles.removeTagButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.switchRow}>
            <Text style={styles.label}>Active Badge:</Text>
            <Switch
              value={badge.is_active}
              onValueChange={(value) => setBadge(prev => ({ ...prev, is_active: value }))}
              trackColor={{ false: '#767577', true: '#4ECDC4' }}
              thumbColor={badge.is_active ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.saveButtonText}>
              {item ? 'Update Badge' : 'Create Badge'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  backButton: { padding: 5 },
  backButtonText: { fontSize: 24, color: 'white', fontWeight: 'bold' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: 'white', marginLeft: 15 },
  content: { flex: 1, padding: 20 },
  section: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 15 },
  subsectionTitle: { fontSize: 16, fontWeight: '600', color: '#555', marginBottom: 12 },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 8 },
  picker: { backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', borderRadius: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfWidth: { width: '48%' },
  iconSelector: { flexDirection: 'row', alignItems: 'center' },
  currentIcon: { fontSize: 32, marginRight: 10 },
  iconPicker: { flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', borderRadius: 8 },
  colorSelector: { flexDirection: 'row', alignItems: 'center' },
  colorPreview: { width: 40, height: 40, borderRadius: 20, marginRight: 10, borderWidth: 2, borderColor: '#ddd' },
  colorPicker: { flex: 1, backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', borderRadius: 8 },
  badgePreview: { marginTop: 15 },
  previewLabel: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 10 },
  badgeDisplay: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  badgeIcon: { fontSize: 48, marginBottom: 10 },
  badgeName: { fontSize: 16, fontWeight: '600', color: 'white', textAlign: 'center' },
  conditionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  conditionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  conditionNumber: { fontSize: 16, fontWeight: '600', color: '#333' },
  removeButton: { padding: 5 },
  removeButtonText: { fontSize: 16 },
  conditionContent: { marginTop: 10 },
  conditionText: { fontSize: 14, color: '#666', fontStyle: 'italic' },
  addConditionSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  addConditionButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  addConditionButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  tagInput: { flex: 1, marginBottom: 0, marginRight: 10 },
  addTagButton: {
    backgroundColor: '#4ECDC4',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagButtonText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  tagChip: {
    backgroundColor: '#e8f5f5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: { color: '#4ECDC4', fontSize: 14, fontWeight: '500', marginRight: 6 },
  removeTagButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeTagButtonText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  saveButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: 'white', fontSize: 18, fontWeight: '700' },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
});

export default BadgeEditor;
