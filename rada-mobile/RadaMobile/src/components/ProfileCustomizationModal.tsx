import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ProfilePicturePicker from './ProfilePicturePicker';

const { width } = Dimensions.get('window');

interface ProfileCustomizationModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (profileData: ProfileData) => void;
  currentProfile?: ProfileData;
}

interface ProfileData {
  nickname: string;
  profilePicture: string | null;
  county: string;
  bio: string;
}

const ProfileCustomizationModal: React.FC<ProfileCustomizationModalProps> = ({
  visible,
  onClose,
  onSave,
  currentProfile
}) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    nickname: '',
    profilePicture: null,
    county: '',
    bio: ''
  });
  const [profilePicturePickerVisible, setProfilePicturePickerVisible] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);

  // Kenyan counties (no duplicates)
  const counties = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Malindi',
    'Kitale', 'Garissa', 'Kakamega', 'Nyeri', 'Meru', 'Machakos', 'Kisii',
    'Kericho', 'Bungoma', 'Busia', 'Vihiga', 'Siaya', 'Migori', 'Homa Bay',
    'Nyamira', 'Trans Nzoia', 'Uasin Gishu', 'Elgeyo Marakwet', 'Nandi',
    'Baringo', 'Laikipia', 'Narok', 'Kajiado', 'Bomet', 'West Pokot', 'Samburu',
    'Turkana', 'Marsabit', 'Isiolo', 'Tharaka Nithi', 'Embu', 'Kitui', 'Makueni',
    'Tana River', 'Lamu', 'Taita Taveta', 'Kwale', 'Kilifi', 'Wajir', 'Mandera'
  ];


  useEffect(() => {
    if (currentProfile) {
      setProfileData(currentProfile);
    }
  }, [currentProfile]);

  const handleSave = () => {
    if (!profileData.nickname.trim()) {
      Alert.alert('Nickname Required', 'Please enter a nickname or choose to remain anonymous.');
      return;
    }

    if (profileData.nickname.length > 50) {
      Alert.alert('Nickname Too Long', 'Nickname must be 50 characters or less.');
      return;
    }

    onSave(profileData);
    onClose();
  };

  const handleProfilePictureSelect = (imageUri: string | null) => {
    setProfileData(prev => ({ ...prev, profilePicture: imageUri }));
    setProfilePicturePickerVisible(false);
  };

  const handleFieldChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const renderCountySelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>County (Optional)</Text>
      <ScrollView 
        style={styles.countyList}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.countyGrid}>
          {counties.map((county) => (
            <TouchableOpacity
              key={county}
              style={[
                styles.countyItem,
                profileData.county === county && styles.selectedCountyItem
              ]}
              onPress={() => handleFieldChange('county', county)}
            >
              <Text style={[
                styles.countyText,
                profileData.county === county && styles.selectedCountyText
              ]}>
                {county}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );


  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={['#FF6B6B', '#4ECDC4']}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Customize Profile</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Profile Picture Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📸 Profile Picture</Text>
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={() => setProfilePicturePickerVisible(true)}
              >
                {profileData.profilePicture ? (
                  profileData.profilePicture.startsWith('data:') || 
                  profileData.profilePicture.startsWith('file:') || 
                  profileData.profilePicture.startsWith('http') ? (
                    <Image source={{ uri: profileData.profilePicture }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarEmoji}>{profileData.profilePicture}</Text>
                  )
                ) : (
                  <View style={styles.noAvatarContainer}>
                    <Text style={styles.noAvatarEmoji}>👤</Text>
                    <Text style={styles.avatarLabel}>Tap to add picture</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Nickname Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👤 Nickname</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your nickname (or leave blank to stay anonymous)"
                placeholderTextColor="#999"
                value={profileData.nickname}
                onChangeText={(text) => handleFieldChange('nickname', text)}
                maxLength={50}
                onFocus={() => setActiveField('nickname')}
                onBlur={() => setActiveField(null)}
              />
              <Text style={styles.characterCount}>
                {profileData.nickname.length}/50 characters
              </Text>
            </View>

            {/* Bio Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📝 Bio (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.bioInput]}
                placeholder="Tell us about yourself..."
                placeholderTextColor="#999"
                value={profileData.bio}
                onChangeText={(text) => handleFieldChange('bio', text)}
                multiline
                numberOfLines={3}
                maxLength={200}
                onFocus={() => setActiveField('bio')}
                onBlur={() => setActiveField(null)}
              />
              <Text style={styles.characterCount}>
                {profileData.bio.length}/200 characters
              </Text>
            </View>


            {/* County Selector */}
            {renderCountySelector()}

            {/* Privacy Notice */}
            <View style={styles.privacyNotice}>
              <Text style={styles.privacyTitle}>🔒 Privacy Notice</Text>
              <Text style={styles.privacyText}>
                • All information is optional - you can remain completely anonymous{'\n'}
                • Your data is stored locally on your device first{'\n'}
                • County helps us show you relevant content{'\n'}
                • You can change these settings anytime
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
            >
              <LinearGradient
                colors={['#FF6B6B', '#4ECDC4']}
                style={styles.saveButtonGradient}
              >
                <Text style={styles.saveButtonText}>Save Profile</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Profile Picture Picker Modal */}
      <ProfilePicturePicker
        visible={profilePicturePickerVisible}
        onClose={() => setProfilePicturePickerVisible(false)}
        onSelect={handleProfilePictureSelect}
        currentImageUri={profileData.profilePicture}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '70%',
  },
  header: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  avatarContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarEmoji: {
    fontSize: 60,
    marginBottom: 8,
  },
  noAvatarContainer: {
    alignItems: 'center',
  },
  noAvatarEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  avatarLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 5,
  },
  selectorContainer: {
    marginBottom: 25,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  countyList: {
    maxHeight: 200,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 10,
  },
  countyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  countyItem: {
    width: '48%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: 'white',
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedCountyItem: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  countyText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  selectedCountyText: {
    color: 'white',
    fontWeight: '600',
  },
  privacyNotice: {
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 12,
    color: '#1976d2',
    lineHeight: 16,
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    marginRight: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});

export default ProfileCustomizationModal;
