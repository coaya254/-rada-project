import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import apiService from '../../services/api';

const ModuleEditor = ({ item, onClose, onSave, user }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showRichEditor, setShowRichEditor] = useState(false);
  const richText = useRef();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'government',
    difficulty: 'Beginner',
    xp_reward: '',
    estimated_duration: '',
    image: '🏛️',
    is_featured: false,
    status: 'draft',
  });

  const categories = [
    { value: 'government', label: 'Government' },
    { value: 'rights', label: 'Rights & Responsibilities' },
    { value: 'voting', label: 'Voting & Elections' },
    { value: 'devolution', label: 'Devolution' },
    { value: 'constitution', label: 'Constitution' },
    { value: 'civic', label: 'Civic Education' },
  ];

  const difficulties = [
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' },
  ];

  const statuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'published', label: 'Published' },
  ];

  const images = [
    '🏛️', '⚖️', '🗳️', '🗳️', '📜', '🎓', '📚', '🎯', '🌟', '💡', '🔍', '📊', '🎨', '🚀', '💎'
  ];

  const handleRichTextChange = (text) => {
    setFormData(prev => ({ ...prev, description: text }));
  };

  const openRichEditor = () => {
    setShowRichEditor(true);
  };

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        description: item.description || '',
        category: item.category || 'government',
        difficulty: item.difficulty || 'Beginner',
        xp_reward: item.xp_reward?.toString() || '',
        estimated_duration: item.estimated_duration?.toString() || '',
        image: item.image || '🏛️',
        is_featured: item.is_featured || false,
        status: item.status || 'draft',
      });
    }
  }, [item]);

  const handleSave = async () => {
    if (!formData.title || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const headers = {
        'x-user-uuid': user.uuid,
        'x-user-role': user.role
      };

      const moduleData = {
        ...formData,
        xp_reward: parseInt(formData.xp_reward) || 0,
        estimated_duration: parseInt(formData.estimated_duration) || 0,
      };

      if (item) {
        // Update existing module
        await apiService.put(`/api/admin/content/modules/${item.id}`, moduleData, { headers });
        Alert.alert('Success', 'Module updated successfully');
      } else {
        // Create new module
        await apiService.post('/api/admin/content/modules', moduleData, { headers });
        Alert.alert('Success', 'Module created successfully');
      }

      onSave();
    } catch (error) {
      console.error('Error saving module:', error);
      Alert.alert('Error', 'Failed to save module');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#FF6B6B', '#4ECDC4']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {item ? 'Edit Module' : 'Create New Module'}
          </Text>
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => updateFormData('title', text)}
              placeholder="Enter module title"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TouchableOpacity
              style={[styles.input, styles.textArea, styles.richTextButton]}
              onPress={openRichEditor}
            >
              <Text style={styles.richTextButtonText}>
                {formData.description ? '📝 Edit Rich Description' : '📝 Add Rich Description'}
              </Text>
              {formData.description && (
                <Text style={styles.richTextPreview} numberOfLines={2}>
                  {formData.description.replace(/<[^>]*>/g, '')}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                style={styles.picker}
              >
                {statuses.map((status) => (
                  <Picker.Item 
                    key={status.value} 
                    label={status.label} 
                    value={status.value} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                style={styles.picker}
              >
                {categories.map((category) => (
                  <Picker.Item 
                    key={category.value} 
                    label={category.label} 
                    value={category.value} 
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Module Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Module Settings</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Difficulty Level</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.difficulty}
                onValueChange={(value) => updateFormData('difficulty', value)}
                style={styles.picker}
              >
                {difficulties.map((difficulty) => (
                  <Picker.Item 
                    key={difficulty.value} 
                    label={difficulty.label} 
                    value={difficulty.value} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>XP Reward</Text>
              <TextInput
                style={styles.input}
                value={formData.xp_reward}
                onChangeText={(text) => updateFormData('xp_reward', text)}
                placeholder="50"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Duration (mins)</Text>
              <TextInput
                style={styles.input}
                value={formData.estimated_duration}
                onChangeText={(text) => updateFormData('estimated_duration', text)}
                placeholder="15"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Visual Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Visual Settings</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Module Icon</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.iconSelector}
            >
              {images.map((icon, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.iconOption,
                    formData.image === icon && styles.selectedIcon
                  ]}
                  onPress={() => updateFormData('image', icon)}
                >
                  <Text style={styles.iconText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                formData.is_featured && styles.toggleButtonActive
              ]}
              onPress={() => updateFormData('is_featured', !formData.is_featured)}
            >
              <Text style={[
                styles.toggleButtonText,
                formData.is_featured && styles.toggleButtonTextActive
              ]}>
                {formData.is_featured ? '✓' : '○'} Featured Module
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👁️ Preview</Text>
          <View style={styles.previewCard}>
            <Text style={styles.previewIcon}>{formData.image}</Text>
            <Text style={styles.previewTitle}>{formData.title || 'Module Title'}</Text>
            <Text style={styles.previewDescription}>
              {formData.description || 'Module description will appear here...'}
            </Text>
            <View style={styles.previewMeta}>
              <Text style={styles.previewMetaText}>{formData.difficulty}</Text>
              <Text style={styles.previewMetaText}>{formData.xp_reward || 0} XP</Text>
              <Text style={styles.previewMetaText}>{formData.estimated_duration || 0} mins</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Rich Text Editor Modal */}
      <Modal
        visible={showRichEditor}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowRichEditor(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient colors={['#FF6B6B', '#4ECDC4']} style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <TouchableOpacity onPress={() => setShowRichEditor(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Rich Text Editor</Text>
              <TouchableOpacity onPress={() => setShowRichEditor(false)} style={styles.doneButton}>
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <RichToolbar
            editor={richText}
            actions={[
              actions.setBold,
              actions.setItalic,
              actions.setUnderline,
              actions.heading1,
              actions.heading2,
              actions.insertBulletsList,
              actions.insertOrderedList,
              actions.insertLink,
              actions.setStrikethrough,
              actions.code,
              actions.blockquote,
            ]}
            style={styles.richToolbar}
          />

          <RichEditor
            ref={richText}
            onChange={handleRichTextChange}
            placeholder="Start typing your description..."
            style={styles.richEditor}
            initialContentHTML={formData.description}
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  picker: {
    height: 50,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  iconSelector: {
    flexDirection: 'row',
    marginTop: 8,
  },
  iconOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedIcon: {
    borderColor: '#4ECDC4',
    backgroundColor: '#e8f5f5',
  },
  iconText: {
    fontSize: 24,
  },
  toggleButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#4ECDC4',
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  toggleButtonTextActive: {
    color: 'white',
  },
  previewCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  previewIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  previewDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  previewMeta: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  previewMetaText: {
    fontSize: 12,
    color: '#4ECDC4',
    backgroundColor: '#e8f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  richTextButton: {
    backgroundColor: '#f8f9fa',
    borderColor: '#4ECDC4',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  richTextButtonText: {
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: '600',
    textAlign: 'center',
  },
  richTextPreview: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  doneButton: {
    padding: 8,
  },
  doneButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  richToolbar: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  richEditor: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
});

export default ModuleEditor;
