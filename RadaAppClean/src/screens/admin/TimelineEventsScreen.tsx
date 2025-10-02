import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  Modal,
  Alert,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TimelineEvent } from '../../types';

interface TimelineEventsScreenProps {
  navigation: NativeStackNavigationProp<any, 'TimelineEvents'>;
  route: {
    params?: {
      politicianId?: number;
    };
  };
}

interface FormData extends Omit<TimelineEvent, 'id' | 'politician_id'> {
  id?: number;
  politician_id?: number;
}

export const TimelineEventsScreen: React.FC<TimelineEventsScreenProps> = ({ navigation, route }) => {
  const { politicianId } = route.params || {};
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<TimelineEvent[]>([]);
  const [selectedPolitician, setSelectedPolitician] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    date: '',
    type: 'event',
    source_links: [],
    verification_links: [],
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Mock politicians data
  const politicians = [
    { id: 1, name: 'William Ruto' },
    { id: 2, name: 'Raila Odinga' },
    { id: 3, name: 'Martha Karua' },
    { id: 4, name: 'Kalonzo Musyoka' },
  ];

  // Event type configurations
  const eventTypes = [
    { value: 'position', label: 'Position/Role', icon: 'work', color: '#3B82F6' },
    { value: 'achievement', label: 'Achievement', icon: 'emoji-events', color: '#10B981' },
    { value: 'controversy', label: 'Controversy', icon: 'warning', color: '#EF4444' },
    { value: 'legislation', label: 'Legislation', icon: 'description', color: '#F59E0B' },
    { value: 'event', label: 'General Event', icon: 'event', color: '#6B7280' },
  ];

  const sourceTypes = [
    'news', 'government_doc', 'parliamentary_record', 'official_statement',
    'press_release', 'video', 'gazette'
  ];

  // Mock timeline events data
  useEffect(() => {
    const mockEvents: TimelineEvent[] = [
      {
        id: 1,
        politician_id: 1,
        title: 'Elected President of Kenya',
        description: 'Won the 2022 presidential election with 50.49% of the vote',
        date: '2022-08-15',
        type: 'position',
        source_links: [
          {
            type: 'news',
            url: 'https://example.com/ruto-wins',
            title: 'Ruto Declared Winner of Kenya Presidential Election',
            source: 'Daily Nation',
            date: '2022-08-15'
          }
        ]
      },
      {
        id: 2,
        politician_id: 1,
        title: 'Deputy President Appointment',
        description: 'Appointed as Deputy President under Uhuru Kenyatta',
        date: '2013-04-09',
        type: 'position',
        source_links: [
          {
            type: 'gazette',
            url: 'https://example.com/gazette-dp',
            title: 'Kenya Gazette Notice - Deputy President',
            source: 'Kenya Gazette',
            date: '2013-04-09'
          }
        ]
      },
      {
        id: 3,
        politician_id: 2,
        title: 'Prime Minister of Kenya',
        description: 'Served as Prime Minister under the coalition government',
        date: '2008-04-17',
        type: 'position',
        source_links: [
          {
            type: 'official_statement',
            url: 'https://example.com/pm-appointment',
            title: 'Raila Odinga Sworn in as Prime Minister',
            source: 'State House',
            date: '2008-04-17'
          }
        ]
      },
      {
        id: 4,
        politician_id: 3,
        title: 'Minister of Justice and Constitutional Affairs',
        description: 'Served as Minister of Justice and Constitutional Affairs',
        date: '2003-01-03',
        type: 'position'
      }
    ];

    // Filter by politician if specified
    const filtered = politicianId
      ? mockEvents.filter(event => event.politician_id === politicianId)
      : mockEvents;

    setEvents(filtered);
    setFilteredEvents(filtered);
  }, [politicianId]);

  // Filter events based on search and filters
  useEffect(() => {
    let filtered = events;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Politician filter
    if (selectedPolitician !== 'all') {
      const politicianId = parseInt(selectedPolitician);
      filtered = filtered.filter(event => event.politician_id === politicianId);
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(event => event.type === selectedType);
    }

    // Sort by date (newest first)
    filtered = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredEvents(filtered);
  }, [events, searchQuery, selectedPolitician, selectedType]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      type: 'event',
      source_links: [],
      verification_links: [],
    });
    setValidationErrors({});
    setEditingEvent(null);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.date.trim()) errors.date = 'Date is required';
    if (!politicianId && !formData.politician_id) errors.politician = 'Politician must be selected';

    // Validate date format (YYYY-MM-DD)
    if (formData.date && !/^\d{4}-\d{2}-\d{2}$/.test(formData.date)) {
      errors.date = 'Date must be in YYYY-MM-DD format';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveEvent = () => {
    if (!validateForm()) return;

    if (editingEvent) {
      // Update existing event
      setEvents(prev => prev.map(event =>
        event.id === editingEvent.id
          ? { ...event, ...formData, politician_id: politicianId || formData.politician_id! }
          : event
      ));
      Alert.alert('Success', 'Timeline event updated successfully');
    } else {
      // Add new event
      const newEvent: TimelineEvent = {
        ...formData,
        id: Date.now(),
        politician_id: politicianId || formData.politician_id!,
      };
      setEvents(prev => [...prev, newEvent]);
      Alert.alert('Success', 'Timeline event added successfully');
    }

    setShowAddModal(false);
    resetForm();
  };

  const handleEditEvent = (event: TimelineEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      type: event.type,
      source_links: event.source_links || [],
      verification_links: event.verification_links || [],
    });
    setShowAddModal(true);
  };

  const handleDeleteEvent = (eventId: number) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this timeline event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setEvents(prev => prev.filter(event => event.id !== eventId));
            Alert.alert('Success', 'Timeline event deleted successfully');
          }
        }
      ]
    );
  };

  const addSourceLink = () => {
    const newLink = {
      type: 'news' as const,
      url: '',
      title: '',
      source: '',
      date: new Date().toISOString().split('T')[0],
    };
    setFormData(prev => ({
      ...prev,
      source_links: [...(prev.source_links || []), newLink]
    }));
  };

  const updateSourceLink = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      source_links: (prev.source_links || []).map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeSourceLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      source_links: (prev.source_links || []).filter((_, i) => i !== index)
    }));
  };

  const getEventTypeConfig = (type: string) => {
    return eventTypes.find(t => t.value === type) || eventTypes[eventTypes.length - 1];
  };

  const getPoliticianName = (politicianId: number) => {
    return politicians.find(p => p.id === politicianId)?.name || 'Unknown';
  };

  const renderEventCard = ({ item }: { item: TimelineEvent }) => {
    const typeConfig = getEventTypeConfig(item.type);
    const politicianName = getPoliticianName(item.politician_id);

    return (
      <View style={styles.eventCard}>
        <View style={styles.eventHeader}>
          <View style={styles.eventTypeIndicator}>
            <View style={[styles.eventTypeIcon, { backgroundColor: typeConfig.color + '20' }]}>
              <MaterialIcons
                name={typeConfig.icon as keyof typeof MaterialIcons.glyphMap}
                size={20}
                color={typeConfig.color}
              />
            </View>
            <View style={styles.eventHeaderText}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text style={styles.eventMeta}>
                {politicianName} • {item.date} • {typeConfig.label}
              </Text>
            </View>
          </View>
          <View style={styles.eventActions}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEditEvent(item)}
            >
              <MaterialIcons name="edit" size={16} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteEvent(item.id)}
            >
              <MaterialIcons name="delete" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.eventDescription}>{item.description}</Text>

        {item.source_links && item.source_links.length > 0 && (
          <View style={styles.sourcesSection}>
            <Text style={styles.sourcesTitle}>Sources:</Text>
            {item.source_links.map((link, index) => (
              <View key={index} style={styles.sourceItem}>
                <MaterialIcons name="link" size={14} color="#3B82F6" />
                <Text style={styles.sourceText} numberOfLines={1}>
                  {link.title} - {link.source}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderAddEventModal = () => (
    <Modal
      visible={showAddModal}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => {
              setShowAddModal(false);
              resetForm();
            }}
          >
            <MaterialIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {editingEvent ? 'Edit Event' : 'Add Timeline Event'}
          </Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveEvent}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {/* Event Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Event Title *</Text>
            <TextInput
              style={[styles.textInput, validationErrors.title && styles.inputError]}
              value={formData.title}
              onChangeText={(value) => setFormData(prev => ({ ...prev, title: value }))}
              placeholder="e.g., Elected Governor of Nairobi"
            />
            {validationErrors.title && <Text style={styles.errorText}>{validationErrors.title}</Text>}
          </View>

          {/* Event Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea, validationErrors.description && styles.inputError]}
              value={formData.description}
              onChangeText={(value) => setFormData(prev => ({ ...prev, description: value }))}
              placeholder="Detailed description of the event..."
              multiline
              numberOfLines={4}
            />
            {validationErrors.description && <Text style={styles.errorText}>{validationErrors.description}</Text>}
          </View>

          {/* Event Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date (YYYY-MM-DD) *</Text>
            <TextInput
              style={[styles.textInput, validationErrors.date && styles.inputError]}
              value={formData.date}
              onChangeText={(value) => setFormData(prev => ({ ...prev, date: value }))}
              placeholder="2023-12-01"
            />
            {validationErrors.date && <Text style={styles.errorText}>{validationErrors.date}</Text>}
          </View>

          {/* Event Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Event Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
              {eventTypes.map(type => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeOption,
                    formData.type === type.value && styles.typeOptionSelected,
                    { borderColor: type.color }
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, type: type.value as any }))}
                >
                  <MaterialIcons
                    name={type.icon as keyof typeof MaterialIcons.glyphMap}
                    size={20}
                    color={formData.type === type.value ? '#FFFFFF' : type.color}
                  />
                  <Text style={[
                    styles.typeOptionText,
                    formData.type === type.value && styles.typeOptionTextSelected
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Politician Selection (only if not specific politician) */}
          {!politicianId && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Politician *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.politicianSelector}>
                {politicians.map(politician => (
                  <TouchableOpacity
                    key={politician.id}
                    style={[
                      styles.politicianOption,
                      formData.politician_id === politician.id && styles.politicianOptionSelected
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, politician_id: politician.id }))}
                  >
                    <Text style={[
                      styles.politicianOptionText,
                      formData.politician_id === politician.id && styles.politicianOptionTextSelected
                    ]}>
                      {politician.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {validationErrors.politician && <Text style={styles.errorText}>{validationErrors.politician}</Text>}
            </View>
          )}

          {/* Source Links */}
          <View style={styles.inputGroup}>
            <View style={styles.sourceLinkHeader}>
              <Text style={styles.inputLabel}>Source Links</Text>
              <TouchableOpacity style={styles.addSourceButton} onPress={addSourceLink}>
                <MaterialIcons name="add" size={16} color="#3B82F6" />
                <Text style={styles.addSourceText}>Add Source</Text>
              </TouchableOpacity>
            </View>

            {formData.source_links?.map((link, index) => (
              <View key={index} style={styles.sourceLinkItem}>
                <View style={styles.sourceLinkInputs}>
                  <TextInput
                    style={[styles.textInput, styles.sourceLinkInput]}
                    value={link.title}
                    onChangeText={(value) => updateSourceLink(index, 'title', value)}
                    placeholder="Link title"
                  />
                  <TextInput
                    style={[styles.textInput, styles.sourceLinkInput]}
                    value={link.url}
                    onChangeText={(value) => updateSourceLink(index, 'url', value)}
                    placeholder="URL"
                  />
                  <TextInput
                    style={[styles.textInput, styles.sourceLinkInput]}
                    value={link.source}
                    onChangeText={(value) => updateSourceLink(index, 'source', value)}
                    placeholder="Source name"
                  />
                </View>
                <TouchableOpacity
                  style={styles.removeSourceButton}
                  onPress={() => removeSourceLink(index)}
                >
                  <MaterialIcons name="close" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {politicianId ? `Timeline - ${getPoliticianName(politicianId)}` : 'Timeline Events'}
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <MaterialIcons name="add" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.filtersSection}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {!politicianId && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <TouchableOpacity
              style={[styles.filterChip, selectedPolitician === 'all' && styles.filterChipActive]}
              onPress={() => setSelectedPolitician('all')}
            >
              <Text style={[styles.filterChipText, selectedPolitician === 'all' && styles.filterChipTextActive]}>
                All Politicians
              </Text>
            </TouchableOpacity>
            {politicians.map(politician => (
              <TouchableOpacity
                key={politician.id}
                style={[styles.filterChip, selectedPolitician === politician.id.toString() && styles.filterChipActive]}
                onPress={() => setSelectedPolitician(politician.id.toString())}
              >
                <Text style={[styles.filterChipText, selectedPolitician === politician.id.toString() && styles.filterChipTextActive]}>
                  {politician.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, selectedType === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedType('all')}
          >
            <Text style={[styles.filterChipText, selectedType === 'all' && styles.filterChipTextActive]}>
              All Types
            </Text>
          </TouchableOpacity>
          {eventTypes.map(type => (
            <TouchableOpacity
              key={type.value}
              style={[styles.filterChip, selectedType === type.value && styles.filterChipActive]}
              onPress={() => setSelectedType(type.value)}
            >
              <MaterialIcons
                name={type.icon as keyof typeof MaterialIcons.glyphMap}
                size={16}
                color={selectedType === type.value ? '#FFFFFF' : type.color}
              />
              <Text style={[styles.filterChipText, selectedType === type.value && styles.filterChipTextActive]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Events List */}
      <FlatList
        data={filteredEvents}
        renderItem={renderEventCard}
        keyExtractor={(item) => item.id.toString()}
        style={styles.eventsList}
        contentContainerStyle={styles.eventsListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="timeline" size={64} color="#e9ecef" />
            <Text style={styles.emptyStateTitle}>No timeline events found</Text>
            <Text style={styles.emptyStateDescription}>
              {searchQuery || selectedType !== 'all' || selectedPolitician !== 'all'
                ? 'Try adjusting your filters'
                : 'Add the first timeline event to get started'
              }
            </Text>
          </View>
        }
      />

      {renderAddEventModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersSection: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  eventsList: {
    flex: 1,
  },
  eventsListContent: {
    padding: 24,
    gap: 16,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  eventTypeIndicator: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  eventTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventHeaderText: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  eventMeta: {
    fontSize: 12,
    color: '#666',
  },
  eventActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  sourcesSection: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  sourcesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sourceText: {
    fontSize: 12,
    color: '#3B82F6',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 4,
  },
  typeSelector: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 2,
    gap: 8,
  },
  typeOptionSelected: {
    backgroundColor: '#3B82F6',
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  typeOptionTextSelected: {
    color: '#FFFFFF',
  },
  politicianSelector: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  politicianOption: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  politicianOptionSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  politicianOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  politicianOptionTextSelected: {
    color: '#FFFFFF',
  },
  sourceLinkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addSourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addSourceText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  sourceLinkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  sourceLinkInputs: {
    flex: 1,
    gap: 8,
  },
  sourceLinkInput: {
    fontSize: 14,
    padding: 12,
  },
  removeSourceButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
});