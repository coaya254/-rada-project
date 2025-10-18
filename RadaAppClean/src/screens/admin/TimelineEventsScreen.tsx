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
import adminAPI from '../../services/AdminAPIService';

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
  const [selectedPolitician, setSelectedPolitician] = useState<string>(politicianId ? politicianId.toString() : 'all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [politician, setPolitician] = useState<any>(null);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    date: '',
    type: 'event',
    source_links: [],
    verification_links: [],
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [politicians, setPoliticians] = useState<Array<{ id: number; name: string }>>([]);

  // Event type configurations
  const [eventTypes, setEventTypes] = useState([
    { value: 'position', label: 'Position/Role', icon: 'work', color: '#3B82F6' },
    { value: 'achievement', label: 'Achievement', icon: 'emoji-events', color: '#10B981' },
    { value: 'controversy', label: 'Controversy', icon: 'warning', color: '#EF4444' },
    { value: 'legislation', label: 'Legislation', icon: 'description', color: '#F59E0B' },
    { value: 'event', label: 'General Event', icon: 'event', color: '#6B7280' },
  ]);

  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [newEventType, setNewEventType] = useState({
    value: '',
    label: '',
    icon: 'event',
    color: '#6B7280'
  });

  const sourceTypes = [
    'news', 'government_doc', 'parliamentary_record', 'official_statement',
    'press_release', 'video', 'gazette'
  ];

  // Load politician details if politicianId is provided
  useEffect(() => {
    if (politicianId) {
      loadPolitician();
    }
  }, [politicianId]);

  const loadPolitician = async () => {
    if (!politicianId) return;
    try {
      const response = await adminAPI.getPolitician(politicianId);
      if (response.success && response.data) {
        setPolitician(response.data);
      }
    } catch (error) {
      console.error('Error loading politician:', error);
    }
  };

  const loadPoliticians = async () => {
    try {
      const response = await adminAPI.searchPoliticians('', { include_drafts: true });
      if (response.success && response.data) {
        setPoliticians(response.data.map((p: any) => ({ id: p.id, name: p.name })));
      }
    } catch (error) {
      console.error('Error loading politicians:', error);
    }
  };

  // Load timeline events from API
  useEffect(() => {
    loadEvents();
    if (!politicianId) {
      loadPoliticians();
    }
  }, [politicianId]);

  const loadEvents = async () => {
    try {
      const response = await adminAPI.getTimelineEvents(politicianId);

      if (response.success && response.data) {
        setEvents(response.data);
        setFilteredEvents(response.data);
      } else {
        Alert.alert('Error', response.error || 'Failed to load timeline events');
      }
    } catch (error) {
      console.error('Error loading timeline events:', error);
      Alert.alert('Error', 'Failed to load timeline events');
    }
  };

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

  const handleSaveEvent = async () => {
    if (!validateForm()) return;

    try {
      if (editingEvent) {
        // Update existing event
        const response = await adminAPI.updateTimelineEvent(editingEvent.id, formData);
        if (response.success) {
          Alert.alert('Success', 'Timeline event updated successfully');
          await loadEvents();
        } else {
          Alert.alert('Error', response.error || 'Failed to update timeline event');
          return;
        }
      } else {
        // Add new event
        const eventData = {
          ...formData,
          politician_id: politicianId || formData.politician_id!,
        };
        const response = await adminAPI.createTimelineEvent(eventData);
        if (response.success) {
          Alert.alert('Success', 'Timeline event added successfully');
          await loadEvents();
        } else {
          Alert.alert('Error', response.error || 'Failed to create timeline event');
          return;
        }
      }

      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving timeline event:', error);
      Alert.alert('Error', 'An error occurred while saving the timeline event');
    }
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
          onPress: async () => {
            try {
              const response = await adminAPI.deleteTimelineEvent(eventId);
              if (response.success) {
                Alert.alert('Success', 'Timeline event deleted successfully');
                await loadEvents();
              } else {
                Alert.alert('Error', response.error || 'Failed to delete timeline event');
              }
            } catch (error) {
              console.error('Error deleting timeline event:', error);
              Alert.alert('Error', 'An error occurred while deleting the timeline event');
            }
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

  const handleAddCustomType = () => {
    if (!newEventType.label || !newEventType.value) {
      Alert.alert('Error', 'Please provide both a label and value for the custom event type');
      return;
    }

    // Check if type already exists
    if (eventTypes.find(t => t.value === newEventType.value)) {
      Alert.alert('Error', 'An event type with this value already exists');
      return;
    }

    setEventTypes(prev => [...prev, { ...newEventType }]);
    setFormData(prev => ({ ...prev, type: newEventType.value as any }));
    setShowAddTypeModal(false);
    setNewEventType({ value: '', label: '', icon: 'event', color: '#6B7280' });
    Alert.alert('Success', 'Custom event type added successfully');
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
            <View style={styles.sourceLinkHeader}>
              <Text style={styles.inputLabel}>Event Type</Text>
              <TouchableOpacity style={styles.addSourceButton} onPress={() => setShowAddTypeModal(true)}>
                <MaterialIcons name="add" size={16} color="#3B82F6" />
                <Text style={styles.addSourceText}>Add Custom Type</Text>
              </TouchableOpacity>
            </View>
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
        <Text style={styles.headerTitle}>Timeline Events</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <MaterialIcons name="add" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Politician Info Banner */}
      {politician && (
        <View style={styles.politicianBanner}>
          <View style={styles.politicianInfo}>
            <MaterialIcons name="person" size={20} color="#8B5CF6" />
            <View style={{ flex: 1 }}>
              <Text style={styles.politicianName}>{politician.name}</Text>
              <Text style={styles.politicianPosition}>{politician.current_position || 'Politician'}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.changePoliticianButton}
            onPress={() => navigation.navigate('PoliticianSelector', {
              targetScreen: 'TimelineEvents',
              title: 'Timeline Events',
              allowViewAll: true,
            })}
          >
            <Text style={styles.changePoliticianText}>Change</Text>
          </TouchableOpacity>
        </View>
      )}

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

      {/* Add Custom Event Type Modal */}
      <Modal visible={showAddTypeModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.customTypeModal}>
            <View style={styles.customTypeHeader}>
              <Text style={styles.customTypeTitle}>Add Custom Event Type</Text>
              <TouchableOpacity
                style={styles.modalCloseIcon}
                onPress={() => {
                  setShowAddTypeModal(false);
                  setNewEventType({ value: '', label: '', icon: 'event', color: '#6B7280' });
                }}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.customTypeContent} showsVerticalScrollIndicator={false}>
              {/* Preview Card */}
              <View style={styles.previewSection}>
                <Text style={styles.previewLabel}>Preview</Text>
                <View style={styles.previewCard}>
                  <View style={[styles.previewIcon, { backgroundColor: newEventType.color + '20' }]}>
                    <MaterialIcons
                      name={newEventType.icon as keyof typeof MaterialIcons.glyphMap}
                      size={28}
                      color={newEventType.color}
                    />
                  </View>
                  <Text style={styles.previewText}>
                    {newEventType.label || 'Event Type Label'}
                  </Text>
                </View>
              </View>

              {/* Type Label */}
              <View style={styles.customInputGroup}>
                <Text style={styles.customInputLabel}>Display Name *</Text>
                <Text style={styles.customInputHint}>This is what users will see</Text>
                <TextInput
                  style={styles.customTextInput}
                  value={newEventType.label}
                  onChangeText={(value) => {
                    setNewEventType(prev => ({
                      ...prev,
                      label: value,
                      value: prev.value || value.toLowerCase().replace(/\s+/g, '_')
                    }));
                  }}
                  placeholder="e.g., Policy Change, Public Appearance"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Type Value */}
              <View style={styles.customInputGroup}>
                <Text style={styles.customInputLabel}>Internal Value *</Text>
                <Text style={styles.customInputHint}>Auto-generated from display name</Text>
                <TextInput
                  style={[styles.customTextInput, styles.readOnlyInput]}
                  value={newEventType.value}
                  editable={false}
                  placeholder="auto_generated_value"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Icon Selector */}
              <View style={styles.customInputGroup}>
                <Text style={styles.customInputLabel}>Icon</Text>
                <Text style={styles.customInputHint}>Choose an icon that represents this event type</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.iconSelector}
                >
                  {['event', 'work', 'star', 'emoji-events', 'warning', 'description', 'gavel', 'campaign', 'groups', 'handshake', 'ballot', 'account-balance', 'flag', 'verified'].map(iconName => (
                    <TouchableOpacity
                      key={iconName}
                      style={[
                        styles.iconOption,
                        newEventType.icon === iconName && styles.iconOptionSelected
                      ]}
                      onPress={() => setNewEventType(prev => ({ ...prev, icon: iconName }))}
                    >
                      <MaterialIcons
                        name={iconName as keyof typeof MaterialIcons.glyphMap}
                        size={24}
                        color={newEventType.icon === iconName ? '#3B82F6' : '#666'}
                      />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Color Selector */}
              <View style={styles.customInputGroup}>
                <Text style={styles.customInputLabel}>Color</Text>
                <Text style={styles.customInputHint}>Select a color for this event type</Text>
                <View style={styles.colorGrid}>
                  {[
                    { name: 'Blue', value: '#3B82F6' },
                    { name: 'Green', value: '#10B981' },
                    { name: 'Red', value: '#EF4444' },
                    { name: 'Orange', value: '#F59E0B' },
                    { name: 'Purple', value: '#8B5CF6' },
                    { name: 'Pink', value: '#EC4899' },
                    { name: 'Indigo', value: '#6366F1' },
                    { name: 'Teal', value: '#14B8A6' },
                    { name: 'Gray', value: '#6B7280' },
                    { name: 'Yellow', value: '#EAB308' },
                  ].map(color => (
                    <TouchableOpacity
                      key={color.value}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color.value },
                        newEventType.color === color.value && styles.colorOptionSelected
                      ]}
                      onPress={() => setNewEventType(prev => ({ ...prev, color: color.value }))}
                    >
                      {newEventType.color === color.value && (
                        <MaterialIcons name="check" size={20} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.customTypeActions}>
                <TouchableOpacity
                  style={styles.cancelTypeButton}
                  onPress={() => {
                    setShowAddTypeModal(false);
                    setNewEventType({ value: '', label: '', icon: 'event', color: '#6B7280' });
                  }}
                >
                  <Text style={styles.cancelTypeText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.addTypeButton,
                    (!newEventType.label || !newEventType.value) && styles.addTypeButtonDisabled
                  ]}
                  onPress={handleAddCustomType}
                  disabled={!newEventType.label || !newEventType.value}
                >
                  <MaterialIcons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.addTypeText}>Add Event Type</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  // Custom Type Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  customTypeModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  customTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  customTypeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  modalCloseIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customTypeContent: {
    padding: 24,
  },
  previewSection: {
    marginBottom: 32,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  previewIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  previewText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  customInputGroup: {
    marginBottom: 28,
  },
  customInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  customInputHint: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  customTextInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a1a1a',
  },
  readOnlyInput: {
    backgroundColor: '#f0f0f0',
    color: '#666',
  },
  iconSelector: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
    marginTop: 4,
  },
  iconOption: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  iconOptionSelected: {
    backgroundColor: '#e7f1ff',
    borderColor: '#3B82F6',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  colorOption: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  customTypeActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginBottom: 24,
  },
  cancelTypeButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  addTypeButton: {
    flex: 2,
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addTypeButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  addTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  politicianBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  politicianInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  politicianName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  politicianPosition: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  changePoliticianButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  changePoliticianText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
});