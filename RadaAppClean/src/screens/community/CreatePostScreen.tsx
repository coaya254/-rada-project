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
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { CommunityStackParamList } from '../../navigation/CommunityStackNavigator';

interface CreatePostScreenProps {
  navigation: NativeStackNavigationProp<CommunityStackParamList, 'CreatePost'>;
  route: RouteProp<CommunityStackParamList, 'CreatePost'>;
}

const categories = [
  { id: 'politics', name: 'Politics', icon: 'gavel', color: '#3B82F6' },
  { id: 'education', name: 'Education', icon: 'school', color: '#10B981' },
  { id: 'healthcare', name: 'Healthcare', icon: 'local-hospital', color: '#EF4444' },
  { id: 'economy', name: 'Economy', icon: 'trending-up', color: '#F59E0B' },
  { id: 'environment', name: 'Environment', icon: 'eco', color: '#059669' },
  { id: 'general', name: 'General Discussion', icon: 'forum', color: '#8B5CF6' },
];

export const CreatePostScreen: React.FC<CreatePostScreenProps> = ({ navigation, route }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category || 'general');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title for your post');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content for your post');
      return;
    }

    Alert.alert(
      'Post Created',
      'Your post has been submitted and will appear in the community feed shortly.',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.discardButton} onPress={handleDiscard}>
          <MaterialIcons name="close" size={24} color="#EF4444" />
          <Text style={styles.discardText}>Discard</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Create Post</Text>

        <TouchableOpacity
          style={[styles.submitHeaderButton, (!title.trim() || !content.trim()) && styles.submitHeaderButtonDisabled]}
          onPress={handleSubmit}
          disabled={!title.trim() || !content.trim()}
        >
          <Text style={[styles.submitHeaderText, (!title.trim() || !content.trim()) && styles.submitHeaderTextDisabled]}>
            Post
          </Text>
        </TouchableOpacity>
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
            </ScrollView>
          </View>

          {/* Title Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Title</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="What's your topic about?"
              value={title}
              onChangeText={setTitle}
              maxLength={120}
              multiline
            />
            <Text style={styles.characterCount}>{title.length}/120</Text>
          </View>

          {/* Content Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Content</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="Share your thoughts, ask questions, or start a discussion..."
              value={content}
              onChangeText={setContent}
              maxLength={2000}
              multiline
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>{content.length}/2000</Text>
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
            style={[styles.submitButton, (!title.trim() || !content.trim()) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!title.trim() || !content.trim()}
          >
            <MaterialIcons
              name="send"
              size={20}
              color={(!title.trim() || !content.trim()) ? '#9CA3AF' : '#FFFFFF'}
            />
            <Text style={[styles.submitButtonText, (!title.trim() || !content.trim()) && styles.submitButtonTextDisabled]}>
              Create Post
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  submitHeaderButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  submitHeaderButtonDisabled: {
    backgroundColor: '#e9ecef',
  },
  submitHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  submitHeaderTextDisabled: {
    color: '#9CA3AF',
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
});