import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ShareService from '../services/ShareService';

const { width } = Dimensions.get('window');

interface ShareButtonProps {
  data: any;
  type: 'politician' | 'news' | 'analytics' | 'comparison' | 'app';
  title?: string;
  style?: any;
  iconSize?: number;
  showText?: boolean;
  variant?: 'primary' | 'secondary' | 'minimal';
}

const ShareButton: React.FC<ShareButtonProps> = ({
  data,
  type,
  title,
  style,
  iconSize = 20,
  showText = true,
  variant = 'primary',
}) => {
  const [showShareModal, setShowShareModal] = useState(false);

  const handleShare = async () => {
    try {
      switch (type) {
        case 'politician':
          await ShareService.sharePolitician(data);
          break;
        case 'news':
          await ShareService.shareNews(data);
          break;
        case 'analytics':
          await ShareService.shareAnalytics(data);
          break;
        case 'comparison':
          await ShareService.shareComparison(data.politicians, data.metrics);
          break;
        case 'app':
          await ShareService.shareApp();
          break;
        default:
          Alert.alert('Error', 'Invalid share type');
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleSocialShare = async (platform: 'twitter' | 'facebook' | 'whatsapp') => {
    try {
      const shareData = {
        message: getShareMessage(),
        url: getShareUrl(),
      };
      
      await ShareService.shareToSocial(platform, shareData);
      setShowShareModal(false);
    } catch (error) {
      console.error('Social share error:', error);
    }
  };

  const handleExport = async () => {
    try {
      const filename = `${type}_export_${new Date().toISOString().split('T')[0]}.txt`;
      await ShareService.exportAsText(data, filename);
      setShowShareModal(false);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const getShareMessage = (): string => {
    switch (type) {
      case 'politician':
        return `Check out ${data.name} - ${data.position} from ${data.party}`;
      case 'news':
        return data.title;
      case 'analytics':
        return data.title;
      case 'comparison':
        return `Politician Comparison: ${data.politicians?.map((p: any) => p.name).join(' vs ')}`;
      case 'app':
        return 'Check out Rada Mobile - Kenya\'s Political Information App!';
      default:
        return 'Check this out!';
    }
  };

  const getShareUrl = (): string => {
    switch (type) {
      case 'politician':
        return `https://radamobile.com/politician/${data.name?.toLowerCase().replace(/\s+/g, '-')}`;
      case 'news':
        return data.url || 'https://radamobile.com';
      case 'analytics':
        return 'https://radamobile.com/analytics';
      case 'comparison':
        return 'https://radamobile.com/compare';
      case 'app':
        return 'https://radamobile.com';
      default:
        return 'https://radamobile.com';
    }
  };

  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'minimal':
        return styles.minimalButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'minimal':
        return styles.minimalText;
      default:
        return styles.primaryText;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'primary':
        return '#667eea';
      case 'secondary':
        return '#6b7280';
      case 'minimal':
        return '#9ca3af';
      default:
        return '#667eea';
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[getButtonStyle(), style]}
        onPress={() => setShowShareModal(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="share-outline" size={iconSize} color={getIconColor()} />
        {showText && (
          <Text style={[getTextStyle(), { marginLeft: 6 }]}>
            {title || 'Share'}
          </Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={showShareModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share</Text>
              <TouchableOpacity
                onPress={() => setShowShareModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.shareOptions}>
              <TouchableOpacity
                style={styles.shareOption}
                onPress={handleShare}
              >
                <View style={styles.shareOptionIcon}>
                  <Ionicons name="share-outline" size={24} color="#667eea" />
                </View>
                <Text style={styles.shareOptionText}>Share via...</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareOption}
                onPress={() => handleSocialShare('whatsapp')}
              >
                <View style={styles.shareOptionIcon}>
                  <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                </View>
                <Text style={styles.shareOptionText}>WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareOption}
                onPress={() => handleSocialShare('twitter')}
              >
                <View style={styles.shareOptionIcon}>
                  <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
                </View>
                <Text style={styles.shareOptionText}>Twitter</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareOption}
                onPress={() => handleSocialShare('facebook')}
              >
                <View style={styles.shareOptionIcon}>
                  <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                </View>
                <Text style={styles.shareOptionText}>Facebook</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.shareOption}
                onPress={handleExport}
              >
                <View style={styles.shareOptionIcon}>
                  <Ionicons name="download-outline" size={24} color="#059669" />
                </View>
                <Text style={styles.shareOptionText}>Export as Text</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  minimalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  primaryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '500',
  },
  minimalText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  shareOptions: {
    padding: 20,
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  shareOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  shareOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
});

export default ShareButton;
