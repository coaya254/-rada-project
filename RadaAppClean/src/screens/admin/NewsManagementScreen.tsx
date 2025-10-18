import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NewsItem } from '../../types/news';
import adminAPI from '../../services/AdminAPIService';

interface NewsManagementScreenProps {
  navigation: NativeStackNavigationProp<any, 'NewsManagement'>;
}

export const NewsManagementScreen: React.FC<NewsManagementScreenProps> = ({ navigation }) => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    source: '',
    url: '',
    published_date: '',
    image_url: '',
    category: 'General',
  });

  useEffect(() => {
    loadNews();
  }, []);

  useEffect(() => {
    filterNews();
  }, [newsItems, searchQuery, selectedCategory, selectedSource]);

  const loadNews = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getNews();

      if (response.success && response.data) {
        setNewsItems(response.data);
      }
    } catch (error) {
      console.error('Error loading news:', error);
      Alert.alert('Error', 'Failed to load news items');
    } finally {
      setLoading(false);
    }
  };

  const filterNews = () => {
    let filtered = newsItems;

    if (searchQuery) {
      filtered = filtered.filter(news =>
        news.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        news.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        news.source?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(news => news.category === selectedCategory);
    }

    if (selectedSource !== 'all') {
      filtered = filtered.filter(news => news.source === selectedSource);
    }

    setFilteredNews(filtered);
  };

  const handleCreateNews = async () => {
    if (!formData.title || !formData.description || !formData.source || !formData.published_date) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await adminAPI.createNews(formData);

      if (response.success) {
        Alert.alert('Success', 'News item created successfully');
        setShowCreateModal(false);
        resetForm();
        loadNews();
      } else {
        Alert.alert('Error', response.error || 'Failed to create news item');
      }
    } catch (error) {
      console.error('Error creating news:', error);
      Alert.alert('Error', 'Failed to create news item');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNews = async () => {
    if (!selectedNews) return;

    try {
      setLoading(true);
      const response = await adminAPI.updateNews(selectedNews.id, formData);

      if (response.success) {
        Alert.alert('Success', 'News item updated successfully');
        setShowEditModal(false);
        setSelectedNews(null);
        resetForm();
        loadNews();
      } else {
        Alert.alert('Error', response.error || 'Failed to update news item');
      }
    } catch (error) {
      console.error('Error updating news:', error);
      Alert.alert('Error', 'Failed to update news item');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNews = async (newsId: number) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this news item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await adminAPI.deleteNews(newsId);
              if (response.success) {
                Alert.alert('Success', 'News item deleted successfully');
                loadNews();
              } else {
                Alert.alert('Error', response.error || 'Failed to delete news item');
              }
            } catch (error) {
              console.error('Error deleting news:', error);
              Alert.alert('Error', 'Failed to delete news item');
            }
          },
        },
      ]
    );
  };

  const openEditModal = (news: NewsItem) => {
    setSelectedNews(news);
    setFormData({
      title: news.title || news.headline || '',
      description: news.description || news.summary || '',
      source: news.source || '',
      url: news.url || news.link || '',
      published_date: news.source_publication_date || '',
      image_url: news.imageUrl || '',
      category: news.category || 'General',
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      source: '',
      url: '',
      published_date: '',
      image_url: '',
      category: 'General',
    });
  };

  const categories = ['General', 'Politics', 'Economy', 'Health', 'Education', 'Infrastructure', 'Other'];

  const renderNewsItem = ({ item }: { item: NewsItem }) => (
    <View style={styles.newsCard}>
      <View style={styles.newsHeader}>
        <View style={styles.newsInfo}>
          <Text style={styles.newsTitle} numberOfLines={2}>
            {item.title || item.headline}
          </Text>
          <Text style={styles.newsSource}>{item.source}</Text>
          <Text style={styles.newsDate}>{item.source_publication_date}</Text>
        </View>
        <View style={styles.credibilityBadge}>
          <Text style={styles.credibilityText}>{item.credibility}</Text>
        </View>
      </View>

      <Text style={styles.newsDescription} numberOfLines={3}>
        {item.description || item.summary}
      </Text>

      <View style={styles.newsActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditModal(item)}
        >
          <MaterialIcons name="edit" size={20} color="#3B82F6" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteNews(item.id)}
        >
          <MaterialIcons name="delete" size={20} color="#EF4444" />
          <Text style={[styles.actionButtonText, styles.deleteText]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderForm = () => (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.formLabel}>Title *</Text>
      <TextInput
        style={styles.input}
        value={formData.title}
        onChangeText={(text) => setFormData({ ...formData, title: text })}
        placeholder="News headline"
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.formLabel}>Description *</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={formData.description}
        onChangeText={(text) => setFormData({ ...formData, description: text })}
        placeholder="News summary"
        placeholderTextColor="#9CA3AF"
        multiline
        numberOfLines={4}
      />

      <Text style={styles.formLabel}>Source *</Text>
      <TextInput
        style={styles.input}
        value={formData.source}
        onChangeText={(text) => setFormData({ ...formData, source: text })}
        placeholder="e.g., Daily Nation, The Standard"
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.formLabel}>URL</Text>
      <TextInput
        style={styles.input}
        value={formData.url}
        onChangeText={(text) => setFormData({ ...formData, url: text })}
        placeholder="https://..."
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.formLabel}>Published Date *</Text>
      <TextInput
        style={styles.input}
        value={formData.published_date}
        onChangeText={(text) => setFormData({ ...formData, published_date: text })}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.formLabel}>Image URL</Text>
      <TextInput
        style={styles.input}
        value={formData.image_url}
        onChangeText={(text) => setFormData({ ...formData, image_url: text })}
        placeholder="https://..."
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.formLabel}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryChip,
              formData.category === cat && styles.categoryChipSelected
            ]}
            onPress={() => setFormData({ ...formData, category: cat })}
          >
            <Text style={[
              styles.categoryChipText,
              formData.category === cat && styles.categoryChipTextSelected
            ]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.infoBox}>
        <MaterialIcons name="info" size={20} color="#3B82F6" />
        <Text style={styles.infoText}>
          All news articles are from external sources with HIGH credibility rating
        </Text>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#1E40AF', '#3B82F6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>News Management</Text>
          <TouchableOpacity
            onPress={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            style={styles.addButton}
          >
            <MaterialIcons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search news..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{newsItems.length}</Text>
          <Text style={styles.statLabel}>Total News</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {newsItems.filter(n => n.isExternal).length}
          </Text>
          <Text style={styles.statLabel}>External</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {newsItems.filter(n => !n.isExternal).length}
          </Text>
          <Text style={styles.statLabel}>Internal</Text>
        </View>
      </View>

      <FlatList
        data={filteredNews}
        renderItem={renderNewsItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshing={loading}
        onRefresh={loadNews}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="article" size={64} color="#9CA3AF" />
            <Text style={styles.emptyText}>No news items found</Text>
          </View>
        }
      />

      {/* Create Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <MaterialIcons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create News Item</Text>
            <TouchableOpacity
              onPress={handleCreateNews}
              disabled={loading}
            >
              <Text style={styles.saveButton}>{loading ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
          {renderForm()}
        </SafeAreaView>
      </Modal>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <MaterialIcons name="close" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit News Item</Text>
            <TouchableOpacity
              onPress={handleUpdateNews}
              disabled={loading}
            >
              <Text style={styles.saveButton}>{loading ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
          {renderForm()}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  newsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  newsInfo: {
    flex: 1,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  newsSource: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  newsDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  credibilityBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    height: 24,
  },
  credibilityText: {
    fontSize: 11,
    color: '#1E40AF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  newsDescription: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  newsActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  deleteText: {
    color: '#EF4444',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    marginVertical: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: '#3B82F6',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#6B7280',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
});
