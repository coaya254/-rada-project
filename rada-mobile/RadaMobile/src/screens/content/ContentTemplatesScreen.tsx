import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import apiService from '../../services/api';

const ContentTemplatesScreen = ({ onClose, onUseTemplate, user }) => {
  const [templates, setTemplates] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    type: 'module',
    content: {},
    tags: []
  });
  const [currentTag, setCurrentTag] = useState('');

  const contentTypes = [
    { value: 'module', label: 'Module Template' },
    { value: 'lesson', label: 'Lesson Template' },
    { value: 'quiz', label: 'Quiz Template' },
    { value: 'challenge', label: 'Challenge Template' },
    { value: 'badge', label: 'Badge Template' },
  ];

  const predefinedTemplates = [
    {
      id: 'gov-intro',
      name: 'Government Introduction',
      description: 'Basic government concepts template',
      type: 'module',
      content: {
        title: 'Introduction to Government',
        description: 'Learn the fundamental concepts of government and governance.',
        category: 'government',
        difficulty: 'Beginner',
        xp_reward: 50,
        estimated_duration: 20,
        image: '🏛️'
      },
      tags: ['government', 'beginner', 'introduction']
    },
    {
      id: 'voting-basics',
      name: 'Voting Basics',
      description: 'Essential voting information template',
      type: 'lesson',
      content: {
        title: 'Understanding Voting',
        description: 'Learn about the voting process and your rights as a voter.',
        content: 'Voting is a fundamental right and responsibility in a democracy...',
        duration: 15,
        difficulty: 'Beginner'
      },
      tags: ['voting', 'rights', 'democracy']
    },
    {
      id: 'civic-quiz',
      name: 'Civic Knowledge Quiz',
      description: 'Standard civic education quiz template',
      type: 'quiz',
      content: {
        title: 'Civic Knowledge Assessment',
        description: 'Test your understanding of civic concepts.',
        questions: [
          {
            question: 'What is the main purpose of government?',
            type: 'multiple_choice',
            options: ['To collect taxes', 'To serve the people', 'To make laws', 'All of the above'],
            correct_answer: 3,
            points: 10
          }
        ],
        time_limit: 10,
        passing_score: 70
      },
      tags: ['quiz', 'assessment', 'civic']
    }
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      // For now, use predefined templates
      setTemplates(predefinedTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !newTemplate.tags.includes(currentTag.trim())) {
      setNewTemplate(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setNewTemplate(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const createTemplate = async () => {
    if (!newTemplate.name || !newTemplate.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const templateData = {
        ...newTemplate,
        created_by: user.uuid,
        created_at: new Date().toISOString()
      };

      // For now, just add to local state
      setTemplates(prev => [...prev, { ...templateData, id: Date.now().toString() }]);
      setShowCreateModal(false);
      setNewTemplate({
        name: '',
        description: '',
        type: 'module',
        content: {},
        tags: []
      });
      Alert.alert('Success', 'Template created successfully');
    } catch (error) {
      console.error('Error creating template:', error);
      Alert.alert('Error', 'Failed to create template');
    }
  };

  const useTemplate = (template) => {
    Alert.alert(
      'Use Template',
      `Use "${template.name}" template?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Use Template', onPress: () => onUseTemplate(template) }
      ]
    );
  };

  const renderTemplate = ({ item }) => (
    <View style={styles.templateCard}>
      <View style={styles.templateHeader}>
        <View style={styles.templateInfo}>
          <Text style={styles.templateName}>{item.name}</Text>
          <Text style={styles.templateType}>{item.type.toUpperCase()}</Text>
        </View>
        <TouchableOpacity
          style={styles.useButton}
          onPress={() => useTemplate(item)}
        >
          <Text style={styles.useButtonText}>Use</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.templateDescription}>{item.description}</Text>
      
      {item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View key={index} style={styles.tagChip}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FF6B6B', '#4ECDC4']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Content Templates</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.createButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Templates</Text>
          <Text style={styles.sectionDescription}>
            Use pre-built templates to quickly create content with consistent structure and formatting.
          </Text>
        </View>

        <FlatList
          data={templates}
          renderItem={renderTemplate}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </ScrollView>

      {/* Create Template Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient colors={['#FF6B6B', '#4ECDC4']} style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <TouchableOpacity onPress={() => setShowCreateModal(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Create Template</Text>
              <TouchableOpacity onPress={createTemplate} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView style={styles.modalContent}>
            <View style={styles.section}>
              <Text style={styles.label}>Template Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter template name"
                value={newTemplate.name}
                onChangeText={(text) => setNewTemplate(prev => ({ ...prev, name: text }))}
              />

              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe what this template is for"
                value={newTemplate.description}
                onChangeText={(text) => setNewTemplate(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Content Type</Text>
              <Picker
                selectedValue={newTemplate.type}
                onValueChange={(value) => setNewTemplate(prev => ({ ...prev, type: value }))}
                style={styles.picker}
              >
                {contentTypes.map((type) => (
                  <Picker.Item key={type.value} label={type.label} value={type.value} />
                ))}
              </Picker>

              <Text style={styles.label}>Tags</Text>
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

              {newTemplate.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {newTemplate.tags.map((tag, index) => (
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
          </ScrollView>
        </View>
      </Modal>
    </View>
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
  createButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
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
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  templateCard: {
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
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  templateType: {
    fontSize: 12,
    color: '#4ECDC4',
    backgroundColor: '#e8f5f5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  useButton: {
    backgroundColor: '#4ECDC4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  useButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  templateDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
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
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
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
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  picker: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 16,
  },
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tagInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 10,
  },
  addTagButton: {
    backgroundColor: '#4ECDC4',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addTagButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  removeTagButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  removeTagButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default ContentTemplatesScreen;
