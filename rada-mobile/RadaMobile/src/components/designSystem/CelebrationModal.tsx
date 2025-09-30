import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from './theme';
import { hapticFeedback } from './utils';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CelebrationModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  xpGained?: number;
  type?: 'lesson' | 'module' | 'quiz' | 'badge' | 'level';
  showConfetti?: boolean;
}

const CelebrationModal: React.FC<CelebrationModalProps> = ({
  visible,
  onClose,
  title,
  message,
  xpGained = 0,
  type = 'lesson',
  showConfetti = true,
}) => {
  const scaleAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const confettiAnimations = useRef(
    Array.from({ length: 20 }, () => ({
      translateY: new Animated.Value(-100),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    if (visible) {
      hapticFeedback.success();

      // Scale in animation
      Animated.spring(scaleAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Confetti animation
      if (showConfetti) {
        confettiAnimations.forEach((anim, index) => {
          Animated.parallel([
            Animated.timing(anim.translateY, {
              toValue: screenHeight + 100,
              duration: 3000 + Math.random() * 2000,
              useNativeDriver: true,
            }),
            Animated.timing(anim.rotate, {
              toValue: 360 * (2 + Math.random() * 3),
              duration: 3000 + Math.random() * 2000,
              useNativeDriver: true,
            }),
            Animated.timing(anim.opacity, {
              toValue: 0,
              duration: 3000 + Math.random() * 2000,
              useNativeDriver: true,
            }),
          ]).start();
        });
      }
    } else {
      scaleAnimation.setValue(0);
      pulseAnimation.setValue(1);
      confettiAnimations.forEach(anim => {
        anim.translateY.setValue(-100);
        anim.rotate.setValue(0);
        anim.opacity.setValue(1);
      });
    }
  }, [visible]);

  const getIconForType = () => {
    switch (type) {
      case 'lesson':
        return 'book';
      case 'module':
        return 'school';
      case 'quiz':
        return 'checkmark-circle';
      case 'badge':
        return 'medal';
      case 'level':
        return 'trophy';
      default:
        return 'checkmark-circle';
    }
  };

  const getGradientColors = () => {
    switch (type) {
      case 'lesson':
        return [colors.success[400], colors.success[600]];
      case 'module':
        return [colors.primary[400], colors.primary[600]];
      case 'quiz':
        return [colors.warning[400], colors.warning[600]];
      case 'badge':
        return [colors.achievement, '#7c3aed'];
      case 'level':
        return [colors.xp, colors.warning[600]];
      default:
        return [colors.success[400], colors.success[600]];
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
        {/* Confetti */}
        {showConfetti && confettiAnimations.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.confetti,
              {
                left: Math.random() * screenWidth,
                transform: [
                  { translateY: anim.translateY },
                  { rotate: anim.rotate.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  })},
                ],
                opacity: anim.opacity,
              },
            ]}
          />
        ))}

        {/* Modal Content */}
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnimation }],
            },
          ]}
        >
          <LinearGradient
            colors={getGradientColors()}
            style={styles.modalContent}
          >
            {/* Icon */}
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{ scale: pulseAnimation }],
                },
              ]}
            >
              <Ionicons
                name={getIconForType() as any}
                size={60}
                color="white"
              />
            </Animated.View>

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Message */}
            <Text style={styles.message}>{message}</Text>

            {/* XP Gained */}
            {xpGained > 0 && (
              <View style={styles.xpContainer}>
                <Ionicons name="star" size={20} color={colors.xp} />
                <Text style={styles.xpText}>+{xpGained} XP</Text>
              </View>
            )}

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.closeButtonText}>Continue</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confetti: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: colors.xp,
    borderRadius: 4,
  },
  modalContainer: {
    width: screenWidth * 0.85,
    maxWidth: 400,
  },
  modalContent: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: 'white',
    textAlign: 'center',
    marginBottom: spacing.md,
    fontWeight: '700',
  },
  message: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing.lg,
  },
  xpText: {
    ...typography.button,
    color: 'white',
    marginLeft: spacing.xs,
    fontWeight: '700',
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  closeButtonText: {
    ...typography.button,
    color: 'white',
    fontWeight: '600',
  },
});

export default CelebrationModal;