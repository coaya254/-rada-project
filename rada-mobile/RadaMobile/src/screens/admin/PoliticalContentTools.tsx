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
import EnhancedPoliticianForm from './EnhancedPoliticianForm';

interface Politician {
  id: number;
  name: string;
  current_position: string;
  party_history: string[];
  constituency: string;
  wikipedia_summary: string;
  key_achievements: string[];
  education: string;
  image_url?: string;
  party_color?: string;
  slug: string;
}

interface VotingRecord {
  id: string;
  politicianId: number;
  politicianName: string;
  billTitle: string;
  billNumber: string;
  billDescription: string;
  category: 'constitutional' | 'economic' | 'social' | 'environmental' | 'security' | 'governance' | 'health' | 'education';
  vote: 'yes' | 'no' | 'abstain' | 'absent';
  date: string;
  session: string;
  house: 'national_assembly' | 'senate' | 'county_assembly';
  partyPosition: 'majority' | 'minority' | 'mixed' | 'unanimous';
  billStatus: 'passed' | 'failed' | 'pending' | 'withdrawn';
  billOutcome: string;
  keyIssues: string[];
  publicImpact: 'high' | 'medium' | 'low';
  controversyLevel: 'high' | 'medium' | 'low';
  mediaCoverage: number;
  constituencyReaction: 'supportive' | 'opposed' | 'mixed' | 'neutral';
  explanation?: string;
  relatedBills: string[];
}

interface NewsItem {
  id: number;
  headline: string;
  source_publication_date: string;
  system_addition_date: string;
  source: string;
  credibility: 'maximum' | 'high' | 'medium' | 'single';
  link: string;
  summary: string;
}

const PoliticalContentTools: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'politicians' | 'voting' | 'news'>('politicians');
  const [showForm, setShowForm] = useState(false);
  const [showEnhancedForm, setShowEnhancedForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Sample data matching user interface
  const [politicians, setPoliticians] = useState<Politician[]>([
    {
      id: 1,
      name: 'John Doe',
      current_position: 'Member of Parliament',
      party_history: ['Jubilee Party', 'KANU'],
      constituency: 'Nairobi West',
      wikipedia_summary: 'Experienced legislator with focus on education and youth development...',
      key_achievements: ['Sponsored Education Bill 2023', 'Youth Employment Initiative'],
      education: 'Bachelor of Arts in Political Science, University of Nairobi',
      image_url: 'https://via.placeholder.com/150',
      party_color: '#1E40AF',
      slug: 'john-doe-nairobi-west',
    },
    {
      id: 2,
      name: 'Jane Smith',
      current_position: 'Senator',
      party_history: ['ODM', 'NARC'],
      constituency: 'Central Kenya',
      wikipedia_summary: 'Dedicated public servant with expertise in healthcare policy...',
      key_achievements: ['Healthcare Access Act 2022', 'Women Empowerment Program'],
      education: 'Master of Public Health, Kenyatta University',
      image_url: 'https://via.placeholder.com/150',
      party_color: '#DC2626',
      slug: 'jane-smith-central-kenya',
    },
  ]);

  const [votingRecords, setVotingRecords] = useState<VotingRecord[]>([
    {
      id: '1',
      politicianId: 1,
      politicianName: 'John Doe',
      billTitle: 'Education Reform Bill 2024',
      billNumber: 'SB/2024/001',
      billDescription: 'Comprehensive reform of the education system to improve quality and access',
      category: 'education',
      vote: 'yes',
      date: '2024-01-15',
      session: '2024-2025',
      house: 'national_assembly',
      partyPosition: 'majority',
      billStatus: 'passed',
      billOutcome: 'Bill passed with 85% majority vote',
      keyIssues: ['teacher training', 'curriculum reform', 'infrastructure'],
      publicImpact: 'high',
      controversyLevel: 'medium',
      mediaCoverage: 8,
      constituencyReaction: 'supportive',
      explanation: 'Voted in favor to improve education quality in the constituency',
      relatedBills: ['SB/2024/002', 'SB/2024/003'],
    },
    {
      id: '2',
      politicianId: 2,
      politicianName: 'Jane Smith',
      billTitle: 'Healthcare Access Bill',
      billNumber: 'SB/2024/002',
      billDescription: 'Expanding healthcare access to underserved communities',
      category: 'health',
      vote: 'no',
      date: '2024-01-20',
      session: '2024-2025',
      house: 'senate',
      partyPosition: 'minority',
      billStatus: 'pending',
      billOutcome: 'Under review in committee',
      keyIssues: ['funding', 'rural access', 'medication costs'],
      publicImpact: 'high',
      controversyLevel: 'high',
      mediaCoverage: 9,
      constituencyReaction: 'mixed',
      explanation: 'Concerns about funding mechanism and implementation timeline',
      relatedBills: ['SB/2024/001', 'SB/2024/004'],
    },
  ]);

  const [newsItems, setNewsItems] = useState<NewsItem[]>([
    {
      id: 1,
      headline: 'Parliament Passes New Education Bill',
      source_publication_date: '2024-01-16',
      system_addition_date: '2024-01-16T10:30:00Z',
      source: 'Daily Nation',
      credibility: 'high',
      link: 'https://www.nation.co.ke/news/education-bill-passes',
      summary: 'The National Assembly has passed a landmark education reform bill that will improve access to quality education across the country.',
    },
    {
      id: 2,
      headline: 'Healthcare Debate Continues in Senate',
      source_publication_date: '2024-01-21',
      system_addition_date: '2024-01-21T14:15:00Z',
      source: 'Standard Digital',
      credibility: 'medium',
      link: 'https://www.standardmedia.co.ke/healthcare-debate',
      summary: 'Senators continue to debate the proposed healthcare access bill with concerns raised about funding mechanisms.',
    },
  ]);

  const handleCreate = () => {
    setEditingItem(null);
    if (activeTab === 'politicians') {
      setShowEnhancedForm(true);
    } else {
      setShowForm(true);
    }
  };

  const handleEnhancedFormSave = (formData: any) => {
    // Convert form data to politician format
    const politicianData = {
      id: editingItem?.id || Date.now(),
      name: formData.fullName,
      current_position: formData.currentPosition,
      party_history: formData.partyHistory.split(',').map((p: string) => p.trim()),
      constituency: formData.constituency,
      wikipedia_summary: formData.keyAchievements,
      key_achievements: formData.keyAchievements.split('\n').filter((a: string) => a.trim()),
      education: formData.education,
      image_url: formData.profileImage,
      party_color: '#3b82f6', // Default color
      slug: formData.fullName.toLowerCase().replace(/\s+/g, '-'),
    };

    if (editingItem) {
      setPoliticians(prev => prev.map(p => p.id === editingItem.id ? politicianData : p));
    } else {
      setPoliticians(prev => [...prev, politicianData]);
    }

    setShowEnhancedForm(false);
    setEditingItem(null);
    Alert.alert('Success', 'Politician saved successfully');
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    if (activeTab === 'politicians') {
      setShowEnhancedForm(true);
    } else {
      setShowForm(true);
    }
  };

  const handleDelete = (id: number | string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (activeTab === 'politicians') {
              setPoliticians(prev => prev.filter(p => p.id !== id));
            } else if (activeTab === 'voting') {
              setVotingRecords(prev => prev.filter(v => v.id !== id));
            } else if (activeTab === 'news') {
              setNewsItems(prev => prev.filter(n => n.id !== id));
            }
            Alert.alert('Success', 'Item deleted successfully');
          },
        },
      ]
    );
  };


  const renderPoliticianItem = ({ item }: { item: Politician }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <View style={styles.politicianInfo}>
          <View style={[styles.avatar, { backgroundColor: item.party_color || '#6b7280' }]}>
            <Text style={styles.avatarText}>{item.name?.charAt(0) || '?'}</Text>
          </View>
          <View style={styles.politicianDetails}>
            <Text style={styles.itemTitle}>{item.name || 'Unknown'}</Text>
            <Text style={styles.itemSubtitle}>{item.current_position || 'No position'}</Text>
            <Text style={styles.itemSubtitle}>{item.constituency || 'No constituency'}</Text>
            <Text style={styles.itemSubtitle}>Parties: {item.party_history?.join(', ') || 'None'}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.itemDescription}>{item.wikipedia_summary?.substring(0, 150) || 'No summary available'}...</Text>
      <View style={styles.itemMeta}>
        <Text style={styles.metaText}>Education: {item.education || 'Not specified'}</Text>
        <Text style={styles.metaText}>Achievements: {item.key_achievements?.length || 0} listed</Text>
        <Text style={styles.metaText}>Slug: {item.slug || 'No slug'}</Text>
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

  const renderVotingItem = ({ item }: { item: VotingRecord }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.billTitle || 'No title'}</Text>
        <View style={styles.itemActions}>
          <View style={[styles.voteBadge, { backgroundColor: getVoteColor(item.vote || 'absent') }]}>
            <Text style={styles.voteText}>{(item.vote || 'absent').toUpperCase()}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.itemDescription}>{item.billDescription || 'No description'}</Text>
      <Text style={styles.itemDescription}>Bill: {item.billNumber || 'N/A'} • Politician: {item.politicianName || 'Unknown'}</Text>
      <View style={styles.itemMeta}>
        <Text style={styles.metaText}>Date: {item.date || 'N/A'}</Text>
        <Text style={styles.metaText}>Category: {item.category || 'N/A'}</Text>
        <Text style={styles.metaText}>House: {item.house || 'N/A'}</Text>
        <Text style={styles.metaText}>Session: {item.session || 'N/A'}</Text>
        <Text style={styles.metaText}>Status: {item.billStatus || 'N/A'}</Text>
        <Text style={styles.metaText}>Impact: {item.publicImpact || 'N/A'}</Text>
        <Text style={styles.metaText}>Controversy: {item.controversyLevel || 'N/A'}</Text>
        <Text style={styles.metaText}>Media Coverage: {item.mediaCoverage || 0}/10</Text>
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

  const renderNewsItem = ({ item }: { item: NewsItem }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.headline || 'No headline'}</Text>
        <View style={styles.itemActions}>
          <View style={[styles.credibilityBadge, { backgroundColor: getCredibilityColor(item.credibility || 'medium') }]}>
            <Text style={styles.credibilityText}>{(item.credibility || 'medium').toUpperCase()}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.itemDescription}>{item.summary || 'No summary available'}</Text>
      <View style={styles.itemMeta}>
        <Text style={styles.metaText}>Source: {item.source || 'Unknown'}</Text>
        <Text style={styles.metaText}>Published: {item.source_publication_date || 'N/A'}</Text>
        <Text style={styles.metaText}>Added: {item.system_addition_date?.split('T')[0] || 'N/A'}</Text>
        <Text style={styles.metaText}>Link: {item.link || 'No link'}</Text>
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

  const getVoteColor = (vote: string) => {
    switch (vote) {
      case 'yes': return '#10b981';
      case 'no': return '#ef4444';
      case 'abstain': return '#f59e0b';
      case 'absent': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getCredibilityColor = (credibility: string) => {
    switch (credibility) {
      case 'maximum': return '#10b981';
      case 'high': return '#3b82f6';
      case 'medium': return '#f59e0b';
      case 'single': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'politicians': return politicians || [];
      case 'voting': return votingRecords || [];
      case 'news': return newsItems || [];
      default: return [];
    }
  };

  const getCurrentRenderer = () => {
    switch (activeTab) {
      case 'politicians': return renderPoliticianItem;
      case 'voting': return renderVotingItem;
      case 'news': return renderNewsItem;
      default: return renderPoliticianItem;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f093fb', '#f5576c']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Political Content Management</Text>
            <Text style={styles.headerSubtitle}>Manage politicians, voting records, and news</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'politicians' && styles.activeTab]}
          onPress={() => setActiveTab('politicians')}
        >
          <Text style={[styles.tabText, activeTab === 'politicians' && styles.activeTabText]}>
            Politicians ({politicians.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'voting' && styles.activeTab]}
          onPress={() => setActiveTab('voting')}
        >
          <Text style={[styles.tabText, activeTab === 'voting' && styles.activeTabText]}>
            Voting Records ({votingRecords.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'news' && styles.activeTab]}
          onPress={() => setActiveTab('news')}
        >
          <Text style={[styles.tabText, activeTab === 'news' && styles.activeTabText]}>
            News ({newsItems.length})
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
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>

      {/* Enhanced Politician Form Modal */}
      {showEnhancedForm && (
        <EnhancedPoliticianForm
          politician={editingItem}
          onClose={() => {
            setShowEnhancedForm(false);
            setEditingItem(null);
          }}
          onSave={handleEnhancedFormSave}
        />
      )}

      {/* Simple Form Modal */}
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
            <Text style={styles.formLabel}>Title/Name</Text>
            <TextInput style={styles.formInput} placeholder="Enter title or name" />
            
            <Text style={styles.formLabel}>Description/Content</Text>
            <TextInput 
              style={[styles.formInput, styles.textArea]} 
              placeholder="Enter description or content"
              multiline
              numberOfLines={3}
            />
            
            {activeTab === 'politicians' && (
              <>
                <Text style={styles.formLabel}>Position</Text>
                <TextInput style={styles.formInput} placeholder="Member of Parliament" />
                
                <Text style={styles.formLabel}>Constituency</Text>
                <TextInput style={styles.formInput} placeholder="Nairobi West" />
                
                <Text style={styles.formLabel}>Party</Text>
                <TextInput style={styles.formInput} placeholder="Jubilee Party" />
              </>
            )}
            
            {activeTab === 'voting' && (
              <>
                <Text style={styles.formLabel}>Bill Number</Text>
                <TextInput style={styles.formInput} placeholder="SB/2024/001" />
                
                <Text style={styles.formLabel}>Politician Name</Text>
                <TextInput style={styles.formInput} placeholder="John Doe" />
                
                <Text style={styles.formLabel}>Vote</Text>
                <TextInput style={styles.formInput} placeholder="yes/no/abstain/absent" />
                
                <Text style={styles.formLabel}>Date</Text>
                <TextInput style={styles.formInput} placeholder="2024-01-15" />
                
                <Text style={styles.formLabel}>Category</Text>
                <TextInput style={styles.formInput} placeholder="Education" />
              </>
            )}
            
            {activeTab === 'news' && (
              <>
                <Text style={styles.formLabel}>Source</Text>
                <TextInput style={styles.formInput} placeholder="Daily Nation" />
                
                <Text style={styles.formLabel}>Category</Text>
                <TextInput style={styles.formInput} placeholder="Education" />
                
                <Text style={styles.formLabel}>Published Date</Text>
                <TextInput style={styles.formInput} placeholder="2024-01-16" />
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
    borderBottomColor: '#f093fb',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#f093fb',
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
    backgroundColor: '#f093fb',
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
  politicianInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f093fb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  politicianDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
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
  voteBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  voteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  credibilityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  credibilityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
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
    backgroundColor: '#f093fb',
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

export default PoliticalContentTools;
