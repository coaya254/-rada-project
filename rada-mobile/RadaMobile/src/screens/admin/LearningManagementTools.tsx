import React, { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';

interface Module {
  id: number;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  estimated_duration: number;
  difficulty: string;
  is_featured: boolean;
  progress: number;
  image_url?: string;
  illustration?: string;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  xp_reward: number;
  duration: string;
  participants: number;
  category: string;
  active: boolean;
  end_date?: string;
  image_url?: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  duration: number;
  modules: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  students: number;
  price: number;
  is_featured: boolean;
  image_url?: string;
}

const LearningManagementTools: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'modules' | 'challenges' | 'courses'>('modules');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Sample data matching user interface
  const [modules, setModules] = useState<Module[]>([
    {
      id: 1,
      title: 'Civic Engagement Basics',
      description: 'Learn the fundamentals of civic participation and democratic processes',
      icon: '🏛️',
      xp_reward: 150,
      estimated_duration: 45,
      difficulty: 'beginner',
      is_featured: true,
      progress: 0,
      image_url: 'https://via.placeholder.com/300x200',
    },
    {
      id: 2,
      title: 'Political Analysis',
      description: 'Advanced techniques for analyzing political systems and policies',
      icon: '📊',
      xp_reward: 300,
      estimated_duration: 90,
      difficulty: 'advanced',
      is_featured: false,
      progress: 0,
      image_url: 'https://via.placeholder.com/300x200',
    },
  ]);

  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: 1,
      title: 'Community Engagement Challenge',
      description: 'Participate in local community meetings and document your experience',
      xp_reward: 200,
      duration: '2 weeks',
      participants: 45,
      category: 'Civic Engagement',
      active: true,
      end_date: '2024-02-15',
      image_url: 'https://via.placeholder.com/300x200',
    },
    {
      id: 2,
      title: 'Policy Research Challenge',
      description: 'Research and analyze a current government policy',
      xp_reward: 350,
      duration: '1 month',
      participants: 23,
      category: 'Research',
      active: true,
      end_date: '2024-03-01',
      image_url: 'https://via.placeholder.com/300x200',
    },
  ]);

  const [courses, setCourses] = useState<Course[]>([
    {
      id: 1,
      title: 'Complete Civic Education Program',
      description: 'Comprehensive course covering all aspects of civic engagement',
      instructor: 'Dr. Jane Smith',
      duration: 120,
      modules: 8,
      difficulty: 'intermediate',
      rating: 4.8,
      students: 1250,
      price: 0,
      is_featured: true,
      image_url: 'https://via.placeholder.com/300x200',
    },
    {
      id: 2,
      title: 'Advanced Political Science',
      description: 'Deep dive into political theory and practice',
      instructor: 'Prof. John Doe',
      duration: 180,
      modules: 12,
      difficulty: 'advanced',
      rating: 4.9,
      students: 890,
      price: 99,
      is_featured: false,
      image_url: 'https://via.placeholder.com/300x200',
    },
  ]);

  const handleCreate = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (activeTab === 'modules') {
              setModules(prev => prev.filter(m => m.id !== id));
            } else if (activeTab === 'challenges') {
              setChallenges(prev => prev.filter(c => c.id !== id));
            } else if (activeTab === 'courses') {
              setCourses(prev => prev.filter(c => c.id !== id));
            }
            Alert.alert('Success', 'Item deleted successfully');
          },
        },
      ]
    );
  };

  const handleTogglePublish = (id: number) => {
    if (activeTab === 'modules') {
      setModules(prev => prev.map(m => 
        m.id === id ? { ...m, is_featured: !m.is_featured } : m
      ));
    } else if (activeTab === 'challenges') {
      setChallenges(prev => prev.map(c => 
        c.id === id ? { ...c, active: !c.active } : c
      ));
    } else if (activeTab === 'courses') {
      setCourses(prev => prev.map(c => 
        c.id === id ? { ...c, is_featured: !c.is_featured } : c
      ));
    }
  };

  const renderModuleItem = ({ item }: { item: Module }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <View style={styles.itemActions}>
          <TouchableOpacity
            style={[styles.statusButton, { backgroundColor: item.is_featured ? '#10b981' : '#6b7280' }]}
            onPress={() => handleTogglePublish(item.id)}
          >
            <Text style={styles.statusText}>{item.is_featured ? 'Featured' : 'Regular'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.itemDescription}>{item.description}</Text>
      <View style={styles.itemMeta}>
        <Text style={styles.metaText}>XP Reward: {item.xp_reward}</Text>
        <Text style={styles.metaText}>Duration: {item.estimated_duration} min</Text>
        <Text style={styles.metaText}>Difficulty: {item.difficulty}</Text>
        <Text style={styles.metaText}>Icon: {item.icon}</Text>
      </View>
      <View style={styles.itemFooter}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(item)}>
          <Ionicons name="create" size={16} color="#3b82f6" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash" size={16} color="#ef4444" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderChallengeItem = ({ item }: { item: Challenge }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <View style={styles.itemActions}>
          <TouchableOpacity
            style={[styles.statusButton, { backgroundColor: item.active ? '#10b981' : '#6b7280' }]}
            onPress={() => handleTogglePublish(item.id)}
          >
            <Text style={styles.statusText}>{item.active ? 'Active' : 'Inactive'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.itemDescription}>{item.description}</Text>
      <View style={styles.itemMeta}>
        <Text style={styles.metaText}>XP Reward: {item.xp_reward}</Text>
        <Text style={styles.metaText}>Duration: {item.duration}</Text>
        <Text style={styles.metaText}>Participants: {item.participants}</Text>
        <Text style={styles.metaText}>Category: {item.category}</Text>
        <Text style={styles.metaText}>End Date: {item.end_date}</Text>
      </View>
      <View style={styles.itemFooter}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(item)}>
          <Ionicons name="create" size={16} color="#3b82f6" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash" size={16} color="#ef4444" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCourseItem = ({ item }: { item: Course }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <View style={styles.itemActions}>
          <TouchableOpacity
            style={[styles.statusButton, { backgroundColor: item.is_featured ? '#10b981' : '#6b7280' }]}
            onPress={() => handleTogglePublish(item.id)}
          >
            <Text style={styles.statusText}>{item.is_featured ? 'Featured' : 'Regular'}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.itemDescription}>{item.description}</Text>
      <View style={styles.itemMeta}>
        <Text style={styles.metaText}>Instructor: {item.instructor}</Text>
        <Text style={styles.metaText}>Duration: {item.duration} min</Text>
        <Text style={styles.metaText}>Modules: {item.modules}</Text>
        <Text style={styles.metaText}>Difficulty: {item.difficulty}</Text>
        <Text style={styles.metaText}>Rating: {item.rating}/5</Text>
        <Text style={styles.metaText}>Students: {item.students}</Text>
        <Text style={styles.metaText}>Price: ${item.price}</Text>
      </View>
      <View style={styles.itemFooter}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(item)}>
          <Ionicons name="create" size={16} color="#3b82f6" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash" size={16} color="#ef4444" />
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );


  const getCurrentData = () => {
    switch (activeTab) {
      case 'modules': return modules;
      case 'challenges': return challenges;
      case 'courses': return courses;
      default: return [];
    }
  };

  const getCurrentRenderer = () => {
    switch (activeTab) {
      case 'modules': return renderModuleItem;
      case 'challenges': return renderChallengeItem;
      case 'courses': return renderCourseItem;
      default: return renderModuleItem;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Learning Management</Text>
            <Text style={styles.headerSubtitle}>Manage courses, lessons, and quizzes</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'modules' && styles.activeTab]}
          onPress={() => setActiveTab('modules')}
        >
          <Text style={[styles.tabText, activeTab === 'modules' && styles.activeTabText]}>
            Modules ({modules.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'challenges' && styles.activeTab]}
          onPress={() => setActiveTab('challenges')}
        >
          <Text style={[styles.tabText, activeTab === 'challenges' && styles.activeTabText]}>
            Challenges ({challenges.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'courses' && styles.activeTab]}
          onPress={() => setActiveTab('courses')}
        >
          <Text style={[styles.tabText, activeTab === 'courses' && styles.activeTabText]}>
            Courses ({courses.length})
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.createButton} onPress={handleCreate}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.createButtonText}>Create {activeTab.slice(0, -1)}</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={getCurrentData()}
          renderItem={getCurrentRenderer()}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>

      {/* Form Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        onRequestClose={() => setShowForm(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingItem ? 'Edit' : 'Create'} {activeTab.slice(0, -1)}
            </Text>
            <TouchableOpacity onPress={() => setShowForm(false)}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.formContainer}>
            <Text style={styles.formLabel}>Title</Text>
            <TextInput style={styles.formInput} placeholder="Enter title" />
            
            <Text style={styles.formLabel}>Description</Text>
            <TextInput 
              style={[styles.formInput, styles.textArea]} 
              placeholder="Enter description"
              multiline
              numberOfLines={3}
            />
            
            {activeTab === 'courses' && (
              <>
                <Text style={styles.formLabel}>Category</Text>
                <TextInput style={styles.formInput} placeholder="Enter category" />
                
                <Text style={styles.formLabel}>Difficulty</Text>
                <TextInput style={styles.formInput} placeholder="beginner/intermediate/advanced" />
                
                <Text style={styles.formLabel}>Duration (minutes)</Text>
                <TextInput style={styles.formInput} placeholder="120" keyboardType="numeric" />
              </>
            )}
            
            {activeTab === 'lessons' && (
              <>
                <Text style={styles.formLabel}>Course ID</Text>
                <TextInput style={styles.formInput} placeholder="Enter course ID" />
                
                <Text style={styles.formLabel}>Order</Text>
                <TextInput style={styles.formInput} placeholder="1" keyboardType="numeric" />
                
                <Text style={styles.formLabel}>Duration (minutes)</Text>
                <TextInput style={styles.formInput} placeholder="15" keyboardType="numeric" />
              </>
            )}
            
            {activeTab === 'quizzes' && (
              <>
                <Text style={styles.formLabel}>Course ID</Text>
                <TextInput style={styles.formInput} placeholder="Enter course ID" />
                
                <Text style={styles.formLabel}>Questions Count</Text>
                <TextInput style={styles.formInput} placeholder="10" keyboardType="numeric" />
                
                <Text style={styles.formLabel}>Passing Score (%)</Text>
                <TextInput style={styles.formInput} placeholder="70" keyboardType="numeric" />
                
                <Text style={styles.formLabel}>Time Limit (minutes)</Text>
                <TextInput style={styles.formInput} placeholder="30" keyboardType="numeric" />
              </>
            )}
            
            <TouchableOpacity style={styles.saveButton}>
              <Text style={styles.saveButtonText}>
                {editingItem ? 'Update' : 'Create'} {activeTab.slice(0, -1)}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  closeButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#667eea',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#667eea',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  actionBar: {
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 2,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  itemActions: {
    marginLeft: 12,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  itemMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#9ca3af',
    marginRight: 16,
    marginBottom: 4,
  },
  itemFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  actionText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  formContainer: {
    flex: 1,
    padding: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LearningManagementTools;
