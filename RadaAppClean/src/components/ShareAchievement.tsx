// components/ShareAchievement.tsx

import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share, Platform, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';

interface Achievement {
  title: string;
  description: string;
  icon: string;
  xp: number;
  color?: string;
}

interface ShareAchievementProps {
  achievement: Achievement;
  visible: boolean;
  onClose: () => void;
}

export const ShareAchievement: React.FC<ShareAchievementProps> = ({ 
  achievement, 
  visible,
  onClose 
}) => {
  const viewShotRef = useRef<ViewShot>(null);

  const handleShare = async () => {
    try {
      const message = `🎉 I just earned "${achievement.title}" on Civic Learning Platform!\n\n${achievement.description}\n\n+${achievement.xp} XP earned! 🏆\n\nJoin me and start learning today!`;
      
      if (Platform.OS === 'web') {
        // Web sharing
        await Share.share({
          message,
          url: 'https://your-app-url.com',
          title: 'Achievement Unlocked!',
        });
      } else {
        // Mobile - capture screenshot and share
        const uri = await viewShotRef.current?.capture?.();
        
        if (uri && await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: 'Share Your Achievement',
            UTI: 'public.png',
          });
        } else {
          // Fallback to text sharing
          await Share.share({
            message,
            title: 'Achievement Unlocked!',
          });
        }
      }
    } catch (error: any) {
      if (error.message !== 'User did not share') {
        console.error('Error sharing:', error);
      }
    }
  };

  const handleShareToSocial = async (platform: 'twitter' | 'facebook' | 'linkedin') => {
    const baseMessage = `I just earned "${achievement.title}" on Civic Learning Platform! +${achievement.xp} XP 🎉`;
    const appUrl = 'https://your-app-url.com';
    
    let url = '';
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(baseMessage)}&url=${encodeURIComponent(appUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}&quote=${encodeURIComponent(baseMessage)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appUrl)}`;
        break;
    }
    
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      // On mobile, you'd need to use Linking or a library like expo-web-browser
      console.log('Open URL:', url);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <ViewShot ref={viewShotRef} style={styles.container}>
          <LinearGradient
            colors={[achievement.color || '#3B82F6', '#1E40AF']}
            style={styles.gradient}
          >
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.content}>
              {/* Achievement Icon */}
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                  style={styles.iconGradient}
                >
                  <Text style={styles.icon}>{achievement.icon}</Text>
                </LinearGradient>
              </View>
              
              {/* Achievement Badge */}
              <View style={styles.badge}>
                <MaterialIcons name="verified" size={20} color="#FFD700" />
                <Text style={styles.badgeText}>Achievement Unlocked!</Text>
              </View>

              {/* Title */}
              <Text style={styles.title}>{achievement.title}</Text>
              
              {/* Description */}
              <Text style={styles.description}>{achievement.description}</Text>
              
              {/* XP Badge */}
              <View style={styles.xpContainer}>
                <LinearGradient
                  colors={['rgba(255,215,0,0.3)', 'rgba(255,215,0,0.1)']}
                  style={styles.xpBadge}
                >
                  <MaterialIcons name="stars" size={24} color="#FFD700" />
                  <Text style={styles.xpText}>+{achievement.xp} XP</Text>
                </LinearGradient>
              </View>

              {/* Decorative elements */}
              <View style={styles.sparkles}>
                <Text style={styles.sparkle}>✨</Text>
                <Text style={[styles.sparkle, styles.sparkle2]}>⭐</Text>
                <Text style={[styles.sparkle, styles.sparkle3]}>✨</Text>
              </View>
            </View>
          </LinearGradient>
        </ViewShot>

        {/* Share Buttons */}
        <View style={styles.shareButtonsContainer}>
          {/* Main Share Button */}
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <LinearGradient
              colors={['#FFF', '#F3F4F6']}
              style={styles.shareButtonGradient}
            >
              <MaterialIcons name="share" size={20} color="#3B82F6" />
              <Text style={styles.shareButtonText}>Share Achievement</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Social Media Buttons */}
          <View style={styles.socialButtons}>
            <TouchableOpacity 
              style={[styles.socialButton, styles.twitterButton]}
              onPress={() => handleShareToSocial('twitter')}
            >
              <MaterialIcons name="chat-bubble" size={20} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.socialButton, styles.facebookButton]}
              onPress={() => handleShareToSocial('facebook')}
            >
              <MaterialIcons name="facebook" size={20} color="#FFF" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.socialButton, styles.linkedinButton]}
              onPress={() => handleShareToSocial('linkedin')}
            >
              <MaterialIcons name="business" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeTextButton} onPress={onClose}>
            <Text style={styles.closeTextButtonText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
  },
  gradient: {
    padding: 32,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  icon: {
    fontSize: 64,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  xpContainer: {
    marginBottom: 16,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,215,0,0.5)',
  },
  xpText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  sparkles: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  sparkle: {
    position: 'absolute',
    fontSize: 24,
    top: 20,
    left: 20,
  },
  sparkle2: {
    top: 40,
    right: 30,
    left: 'auto' as any,
  },
  sparkle3: {
    bottom: 60,
    right: 20,
    top: 'auto' as any,
    left: 'auto' as any,
  },
  shareButtonsContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  shareButton: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  shareButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  twitterButton: {
    backgroundColor: '#1DA1F2',
  },
  facebookButton: {
    backgroundColor: '#4267B2',
  },
  linkedinButton: {
    backgroundColor: '#0077B5',
  },
  closeTextButton: {
    paddingVertical: 12,
  },
  closeTextButtonText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
});

// Install packages:
// expo install expo-sharing
// npm install react-native-view-shot