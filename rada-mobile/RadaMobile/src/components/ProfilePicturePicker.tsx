import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import apiService from '../services/api';

const { width } = Dimensions.get('window');

interface ProfilePicturePickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (imageUri: string | null) => void;
  currentImageUri?: string | null;
}

const ProfilePicturePicker: React.FC<ProfilePicturePickerProps> = ({
  visible,
  onClose,
  onSelect,
  currentImageUri = null
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(currentImageUri);
  const [isLoading, setIsLoading] = useState(false);

  // Default emoji options as fallback
  const defaultEmojis = [
    '😊', '😄', '😃', '😀', '😁', '😆', '😅', '😂', '🤣',
    '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗',
    '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓',
    '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕',
    '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭',
    '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱',
    '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥',
    '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮',
    '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢',
    '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '👤', '👥'
  ];

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'We need access to your photo library to upload profile pictures.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const uploadImageToBackend = async (imageUri: string): Promise<string | null> => {
    try {
      console.log('📤 Uploading image to backend:', imageUri);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile-picture.jpg',
      } as any);

      // Upload to backend
      const response = await fetch('http://10.19.23.19:5001/api/upload-image', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type manually - let the browser set it with boundary
          'x-user-uuid': 'bdcc72dc-d14a-461b-bbe8-c1407a06f14d', // This should come from user context
          'x-user-role': 'user',
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('📤 Image uploaded successfully:', result);
      
      // Return the server URL
      return `http://10.19.23.19:5001${result.imageUrl}`;
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      Alert.alert('Upload Error', 'Failed to upload image. Please try again.');
      return null;
    }
  };

  const handleImagePicker = async (source: 'camera' | 'library') => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsLoading(true);

    try {
      let result;
      
      if (source === 'camera') {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraPermission.status !== 'granted') {
          Alert.alert('Camera permission required');
          setIsLoading(false);
          return;
        }
        
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        // Upload to backend and get server URL
        const serverUrl = await uploadImageToBackend(imageUri);
        if (serverUrl) {
          setSelectedImage(serverUrl);
        } else {
          // Fallback to local URI if upload fails
        setSelectedImage(imageUri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setSelectedImage(emoji);
  };

  const handleSave = () => {
    onSelect(selectedImage);
    onClose();
  };

  const handleRemove = () => {
    setSelectedImage(null);
  };

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
              <Text style={styles.headerTitle}>Choose Profile Picture</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Current Selection Preview */}
            <View style={styles.previewSection}>
              <Text style={styles.sectionTitle}>Preview</Text>
              <View style={styles.previewContainer}>
                {selectedImage ? (
                  selectedImage.startsWith('data:') || selectedImage.startsWith('file:') || selectedImage.startsWith('http') ? (
                    <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                  ) : (
                    <Text style={styles.previewEmoji}>{selectedImage}</Text>
                  )
                ) : (
                  <View style={styles.noImageContainer}>
                    <Text style={styles.noImageText}>👤</Text>
                    <Text style={styles.noImageLabel}>No picture selected</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Upload Options */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📸 Upload Photo</Text>
              <View style={styles.uploadOptions}>
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => handleImagePicker('camera')}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={['#4ECDC4', '#44A08D']}
                    style={styles.uploadButtonGradient}
                  >
                    <Text style={styles.uploadButtonIcon}>📷</Text>
                    <Text style={styles.uploadButtonText}>Take Photo</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={() => handleImagePicker('library')}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={['#FF6B6B', '#E74C3C']}
                    style={styles.uploadButtonGradient}
                  >
                    <Text style={styles.uploadButtonIcon}>🖼️</Text>
                    <Text style={styles.uploadButtonText}>Choose from Gallery</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {isLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#FF6B6B" />
                  <Text style={styles.loadingText}>Processing image...</Text>
                </View>
              )}
            </View>

            {/* Emoji Fallback */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>😊 Or Choose an Emoji</Text>
              <View style={styles.emojiGrid}>
                {defaultEmojis.map((emoji, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.emojiItem,
                      selectedImage === emoji && styles.selectedEmojiItem
                    ]}
                    onPress={() => handleEmojiSelect(emoji)}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Remove Option */}
            {selectedImage && (
              <View style={styles.section}>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={handleRemove}
                >
                  <Text style={styles.removeButtonText}>🗑️ Remove Picture</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Privacy Notice */}
            <View style={styles.privacyNotice}>
              <Text style={styles.privacyTitle}>🔒 Privacy Notice</Text>
              <Text style={styles.privacyText}>
                • Your profile picture is uploaded to our secure server{'\n'}
                • You can change it anytime and it will sync across devices{'\n'}
                • Choose an emoji if you prefer to stay anonymous{'\n'}
                • Images are compressed for better performance
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
                <Text style={styles.saveButtonText}>Save Picture</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
  previewSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  previewContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  previewImage: {
    width: 114,
    height: 114,
    borderRadius: 57,
  },
  previewEmoji: {
    fontSize: 60,
  },
  noImageContainer: {
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 40,
    marginBottom: 5,
  },
  noImageLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  uploadButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  uploadButtonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  uploadButtonIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  uploadButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emojiItem: {
    width: (width - 80) / 8,
    height: (width - 80) / 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedEmojiItem: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
    transform: [{ scale: 1.1 }],
  },
  emojiText: {
    fontSize: 18,
  },
  removeButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  removeButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
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

export default ProfilePicturePicker;


