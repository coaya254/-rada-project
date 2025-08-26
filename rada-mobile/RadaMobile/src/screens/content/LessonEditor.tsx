import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import apiService from '../../services/api';

const LessonEditor = ({ item, onClose, onSave, user }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [modules, setModules] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    module_id: '',
    order_index: '',
    xp_reward: '',
  });

  useEffect(() => {
    loadModules();
    if (item) {
      setFormData({
        title: item.title || '',
        content: item.content || '',
        module_id: item.module_id?.toString() || '',
        order_index: item.order_index?.toString() || '',
        xp_reward: item.xp_reward?.toString() || '',
      });
    }
  }, [item]);

  const loadModules = async () => {
    try {
      const headers = {
        'x-user-uuid': user.uuid,
        'x-user-role': user.role
      };
      const response = await apiService.get('/api/admin/content/modules', { headers });
      setModules(response.modules || []);
    } catch (error) {
      console.error('Error loading modules:', error);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content || !formData.module_id) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const headers = {
        'x-user-uuid': user.uuid,
        'x-user-role': user.role
      };

      const lessonData = {
        ...formData,
        order_index: parseInt(formData.order_index) || 1,
        xp_reward: parseInt(formData.xp_reward) || 0,
        module_id: parseInt(formData.module_id),
      };

      if (item) {
        await apiService.put(`/api/admin/content/lessons/${item.id}`, lessonData, { headers });
        Alert.alert('Success', 'Lesson updated successfully');
      } else {
        await apiService.post('/api/admin/content/lessons', lessonData, { headers });
        Alert.alert('Success', 'Lesson created successfully');
      }

      onSave();
    } catch (error) {
      console.error('Error saving lesson:', error);
      Alert.alert('Error', 'Failed to save lesson');
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
            {item ? 'Edit Lesson' : 'Create New Lesson'}
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📖 Lesson Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => updateFormData('title', text)}
              placeholder="Enter lesson title"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Content *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.content}
              onChangeText={(text) => updateFormData('content', text)}
              placeholder="Enter lesson content..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Module *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.module_id}
                onValueChange={(value) => updateFormData('module_id', value)}
                style={styles.picker}
              >
                <Picker.Item label="Select a module" value="" />
                {modules.map((module) => (
                  <Picker.Item 
                    key={module.id} 
                    label={module.title} 
                    value={module.id.toString()} 
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Order Index</Text>
              <TextInput
                style={styles.input}
                value={formData.order_index}
                onChangeText={(text) => updateFormData('order_index', text)}
                placeholder="1"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>XP Reward</Text>
              <TextInput
                style={styles.input}
                value={formData.xp_reward}
                onChangeText={(text) => updateFormData('xp_reward', text)}
                placeholder="25"
                placeholderTextColor="#999"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👁️ Preview</Text>
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>{formData.title || 'Lesson Title'}</Text>
            <Text style={styles.previewContent}>
              {formData.content || 'Lesson content will appear here...'}
            </Text>
            <View style={styles.previewMeta}>
              <Text style={styles.previewMetaText}>
                Module: {modules.find(m => m.id.toString() === formData.module_id)?.title || 'Not selected'}
              </Text>
              <Text style={styles.previewMetaText}>
                Order: {formData.order_index || 1}
              </Text>
              <Text style={styles.previewMetaText}>
                XP: {formData.xp_reward || 0}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
    height: 150,
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
  previewCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  previewContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  previewMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  previewMetaText: {
    fontSize: 12,
    color: '#4ECDC4',
    backgroundColor: '#e8f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
});

export default LessonEditor;
