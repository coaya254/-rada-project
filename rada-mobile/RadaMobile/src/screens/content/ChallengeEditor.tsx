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

const ChallengeEditor = ({ item, onClose, onSave, user }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [challenge, setChallenge] = useState({
    title: '',
    description: '',
    type: 'daily',
    difficulty: 'beginner',
    requirements: '',
    xp_reward: 100,
    badge_reward: '',
    start_date: '',
    end_date: '',
    is_active: true,
    max_participants: 0,
    min_completion_time: 0,
    tags: [],
    theme: 'default',
    special_rules: '',
    leaderboard_enabled: true,
    auto_complete: false,
    prerequisites: []
  });

  const challengeTypes = [
    { value: 'daily', label: 'Daily Challenge' },
    { value: 'weekly', label: 'Weekly Challenge' },
    { value: 'monthly', label: 'Monthly Challenge' },
    { value: 'special', label: 'Special Event' },
    { value: 'seasonal', label: 'Seasonal Challenge' },
    { value: 'community', label: 'Community Challenge' },
  ];

  const challengeThemes = [
    { value: 'default', label: 'Default' },
    { value: 'government', label: 'Government' },
    { value: 'civic', label: 'Civic Engagement' },
    { value: 'voting', label: 'Voting & Elections' },
    { value: 'rights', label: 'Rights & Responsibilities' },
    { value: 'constitution', label: 'Constitution' },
  ];
  const [badges, setBadges] = useState([]);
  const [currentTag, setCurrentTag] = useState('');

  useEffect(() => {
    loadBadges();
    if (item) {
      setChallenge({
        ...item,
        tags: item.tags || []
      });
    }
  }, [item]);

  const loadBadges = async () => {
    try {
      const response = await apiService.get('/api/admin/content/badges');
      setBadges(response.data?.badges || []);
    } catch (error) {
      console.error('Error loading badges:', error);
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !challenge.tags.includes(currentTag.trim())) {
      setChallenge(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setChallenge(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = async () => {
    if (!challenge.title.trim()) {
      Alert.alert('Error', 'Please enter a challenge title');
      return;
    }

    if (!challenge.description.trim()) {
      Alert.alert('Error', 'Please enter a challenge description');
      return;
    }

    if (!challenge.requirements.trim()) {
      Alert.alert('Error', 'Please enter challenge requirements');
      return;
    }

    setIsLoading(true);
    try {
      const headers = {
        'x-user-uuid': user.uuid,
        'x-user-role': user.role
      };

      if (item) {
        await apiService.put(`/api/admin/content/challenges/${item.id}`, challenge, { headers });
      } else {
        await apiService.post('/api/admin/content/challenges', challenge, { headers });
      }

      Alert.alert('Success', `Challenge ${item ? 'updated' : 'created'} successfully!`);
      onSave();
    } catch (error) {
      console.error('Error saving challenge:', error);
      Alert.alert('Error', `Failed to ${item ? 'update' : 'create'} challenge`);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  };

  const getFutureDate = (days = 7) => {
    const future = new Date();
    future.setDate(future.getDate() + days);
    return future.toISOString().split('T')[0];
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FF6B6B', '#4ECDC4']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {item ? 'Edit Challenge' : 'Create New Challenge'}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Basic Challenge Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Challenge Information</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Challenge Title"
            value={challenge.title}
            onChangeText={(text) => setChallenge(prev => ({ ...prev, title: text }))}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description"
            value={challenge.description}
            onChangeText={(text) => setChallenge(prev => ({ ...prev, description: text }))}
            multiline
            numberOfLines={3}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Requirements (what users need to do to complete this challenge)"
            value={challenge.requirements}
            onChangeText={(text) => setChallenge(prev => ({ ...prev, requirements: text }))}
            multiline
            numberOfLines={3}
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Challenge Type:</Text>
              <Picker
                selectedValue={challenge.type}
                onValueChange={(value) => setChallenge(prev => ({ ...prev, type: value }))}
                style={styles.picker}
              >
                {challengeTypes.map((type) => (
                  <Picker.Item key={type.value} label={type.label} value={type.value} />
                ))}
              </Picker>
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Difficulty:</Text>
              <Picker
                selectedValue={challenge.difficulty}
                onValueChange={(value) => setChallenge(prev => ({ ...prev, difficulty: value }))}
                style={styles.picker}
              >
                <Picker.Item label="Beginner" value="beginner" />
                <Picker.Item label="Intermediate" value="intermediate" />
                <Picker.Item label="Advanced" value="advanced" />
                <Picker.Item label="Expert" value="expert" />
              </Picker>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Start Date:</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={challenge.start_date}
                onChangeText={(text) => setChallenge(prev => ({ ...prev, start_date: text }))}
              />
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setChallenge(prev => ({ ...prev, start_date: getCurrentDate() }))}
              >
                <Text style={styles.dateButtonText}>Set to Today</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>End Date:</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={challenge.end_date}
                onChangeText={(text) => setChallenge(prev => ({ ...prev, end_date: text }))}
              />
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setChallenge(prev => ({ ...prev, end_date: getFutureDate() }))}
              >
                <Text style={styles.dateButtonText}>Set to Next Week</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Challenge Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Challenge Settings</Text>
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>XP Reward:</Text>
              <TextInput
                style={styles.input}
                placeholder="100"
                value={challenge.xp_reward.toString()}
                onChangeText={(text) => setChallenge(prev => ({ ...prev, xp_reward: parseInt(text) || 0 }))}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Badge Reward:</Text>
              <Picker
                selectedValue={challenge.badge_reward}
                onValueChange={(value) => setChallenge(prev => ({ ...prev, badge_reward: value }))}
                style={styles.picker}
              >
                <Picker.Item label="No Badge" value="" />
                {badges.map(badge => (
                  <Picker.Item key={badge.id} label={badge.name} value={badge.id} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Max Participants:</Text>
              <TextInput
                style={styles.input}
                placeholder="0 = Unlimited"
                value={challenge.max_participants.toString()}
                onChangeText={(text) => setChallenge(prev => ({ ...prev, max_participants: parseInt(text) || 0 }))}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Min Completion Time (min):</Text>
              <TextInput
                style={styles.input}
                placeholder="0 = No minimum"
                value={challenge.min_completion_time.toString()}
                onChangeText={(text) => setChallenge(prev => ({ ...prev, min_completion_time: parseInt(text) || 0 }))}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Active Challenge:</Text>
            <Switch
              value={challenge.is_active}
              onValueChange={(value) => setChallenge(prev => ({ ...prev, is_active: value }))}
              trackColor={{ false: '#767577', true: '#4ECDC4' }}
              thumbColor={challenge.is_active ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Advanced Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Advanced Features</Text>
          
          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Theme:</Text>
              <Picker
                selectedValue={challenge.theme}
                onValueChange={(value) => setChallenge(prev => ({ ...prev, theme: value }))}
                style={styles.picker}
              >
                {challengeThemes.map((theme) => (
                  <Picker.Item key={theme.value} label={theme.label} value={theme.value} />
                ))}
              </Picker>
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Leaderboard:</Text>
              <View style={styles.switchContainer}>
                <Switch
                  value={challenge.leaderboard_enabled}
                  onValueChange={(value) => setChallenge(prev => ({ ...prev, leaderboard_enabled: value }))}
                  trackColor={{ false: '#767577', true: '#4ECDC4' }}
                  thumbColor={challenge.leaderboard_enabled ? '#fff' : '#f4f3f4'}
                />
                <Text style={styles.switchLabel}>
                  {challenge.leaderboard_enabled ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Auto Complete:</Text>
            <Switch
              value={challenge.auto_complete}
              onValueChange={(value) => setChallenge(prev => ({ ...prev, auto_complete: value }))}
              trackColor={{ false: '#767577', true: '#4ECDC4' }}
              thumbColor={challenge.auto_complete ? '#fff' : '#f4f3f4'}
            />
          </View>

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Special Rules (optional)"
            value={challenge.special_rules}
            onChangeText={(text) => setChallenge(prev => ({ ...prev, special_rules: text }))}
            multiline
            numberOfLines={3}
          />
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

          {challenge.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {challenge.tags.map((tag, index) => (
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
              {item ? 'Update Challenge' : 'Create Challenge'}
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: -10,
  },
  dateButtonText: { color: 'white', fontSize: 12, fontWeight: '600' },
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

export default ChallengeEditor;
