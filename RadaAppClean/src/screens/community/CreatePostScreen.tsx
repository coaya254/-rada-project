import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { CommunityStackParamList } from '../../navigation/CommunityStackNavigator';
import { communityApi } from '../../services/communityApi';

interface CreatePostScreenProps {
  navigation: NativeStackNavigationProp<CommunityStackParamList, 'CreatePost'>;
  route: RouteProp<CommunityStackParamList, 'CreatePost'>;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const defaultCategories: Category[] = [
  { id: 'Politics', name: 'Politics', icon: 'gavel', color: '#3B82F6' },
  { id: 'Education', name: 'Education', icon: 'school', color: '#10B981' },
  { id: 'Healthcare', name: 'Healthcare', icon: 'local-hospital', color: '#EF4444' },
  { id: 'Infrastructure', name: 'Infrastructure', icon: 'business', color: '#F59E0B' },
  { id: 'Environment', name: 'Environment', icon: 'eco', color: '#059669' },
  { id: 'general', name: 'General Discussion', icon: 'forum', color: '#8B5CF6' },
];

export const CreatePostScreen: React.FC<CreatePostScreenProps> = ({ navigation, route }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category || 'general');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('label');
  const [selectedColor, setSelectedColor] = useState('#6B7280');

  const MIN_TITLE_LENGTH = 10;
  const MIN_CONTENT_LENGTH = 20;
  const MAX_TITLE_LENGTH = 120;
  const MAX_CONTENT_LENGTH = 2000;

  const handleSubmit = async () => {
    // Validate inputs
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your post');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }

    if (title.trim().length < MIN_TITLE_LENGTH) {
      const remaining = MIN_TITLE_LENGTH - title.trim().length;
      Alert.alert('Title Too Short', `Your title needs ${remaining} more character${remaining !== 1 ? 's' : ''} (minimum ${MIN_TITLE_LENGTH} characters)`);
      return;
    }

    if (content.trim().length < MIN_CONTENT_LENGTH) {
      const remaining = MIN_CONTENT_LENGTH - content.trim().length;
      Alert.alert('Content Too Short', `Your content needs ${remaining} more character${remaining !== 1 ? 's' : ''} (minimum ${MIN_CONTENT_LENGTH} characters)`);
      return;
    }

    try {
      const userUuid = 'bdcc72dc-d14a-461b-bbe8-c1407a06f14d';

      const result = await communityApi.createDiscussion({
        uuid: userUuid,
        title: title.trim(),
        content: content.trim(),
        category: selectedCategory,
        is_anonymous: isAnonymous,
      });

      console.log('✅ Discussion created:', result);

      // Navigate to the newly created discussion
      if (result.discussionId) {
        navigation.replace('DiscussionDetail', { discussionId: result.discussionId });
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error('❌ Error creating post:', error);

      Alert.alert(
        'Error',
        `Failed to create post: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const handleDiscard = () => {
    if (title.trim() || content.trim()) {
      Alert.alert(
        'Discard Post',
        'Are you sure you want to discard your post? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    if (newCategoryName.trim().length < 3) {
      Alert.alert('Error', 'Category name must be at least 3 characters');
      return;
    }

    // Check if category already exists
    if (categories.some(cat => cat.id.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      Alert.alert('Error', 'This category already exists');
      return;
    }

    const newCategory: Category = {
      id: newCategoryName.trim(),
      name: newCategoryName.trim(),
      icon: selectedIcon,
      color: selectedColor,
    };

    setCategories([...categories, newCategory]);
    setSelectedCategory(newCategory.id);
    setShowCategoryModal(false);
    setNewCategoryName('');
    setSelectedIcon('label');
    setSelectedColor('#6B7280');
  };

  const availableIcons = [
    'label', 'star', 'favorite', 'lightbulb', 'security', 'trending-up',
    'chat', 'work', 'people', 'public', 'sports', 'music-note'
  ];

  const availableColors = [
    '#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#06B6D4',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16', '#6B7280'
  ];

  const getTitleStatus = () => {
    const length = title.trim().length;
    if (length === 0) return { color: '#666', text: '' };
    if (length < MIN_TITLE_LENGTH) return { color: '#EF4444', text: `${MIN_TITLE_LENGTH - length} more needed` };
    return { color: '#10B981', text: '✓' };
  };

  const getContentStatus = () => {
    const length = content.trim().length;
    if (length === 0) return { color: '#666', text: '' };
    if (length < MIN_CONTENT_LENGTH) return { color: '#EF4444', text: `${MIN_CONTENT_LENGTH - length} more needed` };
    return { color: '#10B981', text: '✓' };
  };

  const isValid = title.trim().length >= MIN_TITLE_LENGTH && content.trim().length >= MIN_CONTENT_LENGTH;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.discardButton} onPress={handleDiscard}>
          <MaterialIcons name="close" size={24} color="#EF4444" />
          <Text style={styles.discardText}>Cancel</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Create Post</Text>

        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryContainer}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.id && styles.categoryButtonSelected,
                    { borderColor: category.color }
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <MaterialIcons
                    name={category.icon as any}
                    size={20}
                    color={selectedCategory === category.id ? '#FFFFFF' : category.color}
                  />
                  <Text style={[
                    styles.categoryButtonText,
                    selectedCategory === category.id && styles.categoryButtonTextSelected,
                    { color: selectedCategory === category.id ? '#FFFFFF' : category.color }
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Create New Category Button */}
              <TouchableOpacity
                style={styles.createCategoryButton}
                onPress={() => setShowCategoryModal(true)}
              >
                <MaterialIcons name="add" size={20} color="#3B82F6" />
                <Text style={styles.createCategoryText}>Create Category</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Title Input */}
          <View style={styles.section}>
            <View style={styles.inputHeader}>
              <Text style={styles.sectionTitle}>Title</Text>
              {title.length > 0 && (
                <Text style={[styles.validationStatus, { color: getTitleStatus().color }]}>
                  {getTitleStatus().text}
                </Text>
              )}
            </View>
            <TextInput
              style={styles.titleInput}
              placeholder="What's your topic about?"
              value={title}
              onChangeText={setTitle}
              maxLength={MAX_TITLE_LENGTH}
              multiline
            />
            <View style={styles.inputFooter}>
              <Text style={styles.requirementText}>Minimum {MIN_TITLE_LENGTH} characters</Text>
              <Text style={styles.characterCount}>{title.length}/{MAX_TITLE_LENGTH}</Text>
            </View>
          </View>

          {/* Content Input */}
          <View style={styles.section}>
            <View style={styles.inputHeader}>
              <Text style={styles.sectionTitle}>Content</Text>
              {content.length > 0 && (
                <Text style={[styles.validationStatus, { color: getContentStatus().color }]}>
                  {getContentStatus().text}
                </Text>
              )}
            </View>
            <TextInput
              style={styles.contentInput}
              placeholder="Share your thoughts, ask questions, or start a discussion..."
              value={content}
              onChangeText={setContent}
              maxLength={MAX_CONTENT_LENGTH}
              multiline
              textAlignVertical="top"
            />
            <View style={styles.inputFooter}>
              <Text style={styles.requirementText}>Minimum {MIN_CONTENT_LENGTH} characters</Text>
              <Text style={styles.characterCount}>{content.length}/{MAX_CONTENT_LENGTH}</Text>
            </View>
          </View>

          {/* Post Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Options</Text>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setIsAnonymous(!isAnonymous)}
            >
              <View style={styles.optionLeft}>
                <MaterialIcons
                  name="visibility-off"
                  size={24}
                  color="#666"
                />
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>Post Anonymously</Text>
                  <Text style={styles.optionDescription}>Your username will be hidden</Text>
                </View>
              </View>
              <View style={[styles.toggle, isAnonymous && styles.toggleActive]}>
                <View style={[styles.toggleDot, isAnonymous && styles.toggleDotActive]} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Guidelines */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Community Guidelines</Text>
            <View style={styles.guidelinesCard}>
              <View style={styles.guidelineItem}>
                <MaterialIcons name="check-circle" size={16} color="#10B981" />
                <Text style={styles.guidelineText}>Be respectful and civil</Text>
              </View>
              <View style={styles.guidelineItem}>
                <MaterialIcons name="check-circle" size={16} color="#10B981" />
                <Text style={styles.guidelineText}>Stay on topic</Text>
              </View>
              <View style={styles.guidelineItem}>
                <MaterialIcons name="check-circle" size={16} color="#10B981" />
                <Text style={styles.guidelineText}>No spam or self-promotion</Text>
              </View>
              <View style={styles.guidelineItem}>
                <MaterialIcons name="check-circle" size={16} color="#10B981" />
                <Text style={styles.guidelineText}>Fact-check your information</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[styles.submitButton, !isValid && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!isValid}
          >
            <MaterialIcons
              name="send"
              size={20}
              color={!isValid ? '#9CA3AF' : '#FFFFFF'}
            />
            <Text style={[styles.submitButtonText, !isValid && styles.submitButtonTextDisabled]}>
              Create Post
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Create Category Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCategoryModal}
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Category Name Input */}
              <Text style={styles.modalLabel}>Category Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter category name"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                maxLength={30}
              />

              {/* Icon Selection */}
              <Text style={styles.modalLabel}>Select Icon</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconSelector}>
                {availableIcons.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconOption,
                      selectedIcon === icon && { backgroundColor: '#3B82F6' }
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <MaterialIcons
                      name={icon as any}
                      size={24}
                      color={selectedIcon === icon ? '#FFFFFF' : '#666'}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Color Selection */}
              <Text style={styles.modalLabel}>Select Color</Text>
              <View style={styles.colorSelector}>
                {availableColors.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorOptionSelected
                    ]}
                    onPress={() => setSelectedColor(color)}
                  >
                    {selectedColor === color && (
                      <MaterialIcons name="check" size={20} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* Preview */}
              <Text style={styles.modalLabel}>Preview</Text>
              <View style={styles.previewContainer}>
                <View style={[styles.categoryButton, { borderColor: selectedColor }]}>
                  <MaterialIcons name={selectedIcon as any} size={20} color={selectedColor} />
                  <Text style={[styles.categoryButtonText, { color: selectedColor }]}>
                    {newCategoryName.trim() || 'Category Name'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowCategoryModal(false);
                  setNewCategoryName('');
                  setSelectedIcon('label');
                  setSelectedColor('#6B7280');
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalCreateButton, !newCategoryName.trim() && styles.modalCreateButtonDisabled]}
                onPress={handleCreateCategory}
                disabled={!newCategoryName.trim()}
              >
                <Text style={[styles.modalCreateText, !newCategoryName.trim() && styles.modalCreateTextDisabled]}>
                  Create
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  discardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  discardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpacer: {
    width: 70,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
    gap: 6,
  },
  categoryButtonSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryButtonTextSelected: {
    color: '#FFFFFF',
  },
  createCategoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    marginRight: 12,
    gap: 6,
  },
  createCategoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  validationStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  requirementText: {
    fontSize: 12,
    color: '#666',
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    backgroundColor: '#f8f9fa',
    minHeight: 50,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f8f9fa',
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 6,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#3B82F6',
  },
  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  toggleDotActive: {
    alignSelf: 'flex-end',
  },
  guidelinesCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    gap: 12,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  guidelineText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  submitContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#e9ecef',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  submitButtonTextDisabled: {
    color: '#9CA3AF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 24,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f8f9fa',
  },
  iconSelector: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  colorSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  previewContainer: {
    alignItems: 'flex-start',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modalCreateButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  modalCreateButtonDisabled: {
    backgroundColor: '#e9ecef',
  },
  modalCreateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalCreateTextDisabled: {
    color: '#9CA3AF',
  },
});