import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanGestureHandler,
  TapGestureHandler,
  LongPressGestureHandler,
  State,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { modernColors, modernShadows, modernBorderRadius } from './modernTheme';
import { useSwipeGesture } from './ModernAnimations';

interface SwipeAction {
  icon: string;
  color: string;
  action: () => void;
  threshold?: number;
}

interface ModernGestureCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  leftSwipeAction?: SwipeAction;
  rightSwipeAction?: SwipeAction;
  upSwipeAction?: SwipeAction;
  downSwipeAction?: SwipeAction;
  style?: any;
  variant?: 'glass' | 'gradient' | 'neon';
  enableHaptics?: boolean;
  doubleTapAction?: () => void;
}

const ModernGestureCard: React.FC<ModernGestureCardProps> = ({
  children,
  onPress,
  onLongPress,
  leftSwipeAction,
  rightSwipeAction,
  upSwipeAction,
  downSwipeAction,
  style,
  variant = 'glass',
  enableHaptics = true,
  doubleTapAction,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const [isPressed, setIsPressed] = useState(false);
  const [activeSwipeAction, setActiveSwipeAction] = useState<SwipeAction | null>(null);

  const {
    pan,
    rotation,
    opacity,
    handleGestureEnd,
    resetCard,
  } = useSwipeGesture({
    onSwipeLeft: leftSwipeAction?.action,
    onSwipeRight: rightSwipeAction?.action,
    onSwipeUp: upSwipeAction?.action,
    onSwipeDown: downSwipeAction?.action,
    swipeThreshold: 100,
  });

  const handleTapStateChange = (event: any) => {
    if (event.nativeEvent.state === State.BEGAN) {
      setIsPressed(true);
      if (enableHaptics) {
        Vibration.vibrate(50);
      }

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.98,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    } else if (event.nativeEvent.state === State.END) {
      setIsPressed(false);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();

      onPress?.();
    } else if (event.nativeEvent.state === State.CANCELLED || event.nativeEvent.state === State.FAILED) {
      setIsPressed(false);
      resetAnimations();
    }
  };

  const handleLongPressStateChange = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      if (enableHaptics) {
        Vibration.vibrate([100, 50, 100]);
      }

      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1.02,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();

      onLongPress?.();
    }
  };

  const handleDoubleTap = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      if (enableHaptics) {
        Vibration.vibrate([50, 30, 50]);
      }

      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 200,
          friction: 8,
        }),
      ]).start();

      doubleTapAction?.();
    }
  };

  const resetAnimations = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const getCardStyles = () => {
    const baseStyle = {
      borderRadius: modernBorderRadius.xl,
      padding: 16,
      marginVertical: 8,
    };

    switch (variant) {
      case 'glass':
        return {
          ...baseStyle,
          backgroundColor: modernColors.glass.light,
          borderWidth: 1,
          borderColor: modernColors.glass.border,
          ...modernShadows.glass,
        };
      case 'gradient':
        return {
          ...baseStyle,
          overflow: 'hidden' as const,
          ...modernShadows.lg,
        };
      case 'neon':
        return {
          ...baseStyle,
          backgroundColor: modernColors.neutral[900],
          borderWidth: 2,
          borderColor: modernColors.primary[500],
          ...modernShadows.coloredPrimary,
        };
      default:
        return baseStyle;
    }
  };

  const renderSwipeIndicator = () => {
    if (!activeSwipeAction) return null;

    return (
      <Animated.View style={[styles.swipeIndicator, { opacity: opacity }]}>
        <Ionicons
          name={activeSwipeAction.icon as any}
          size={24}
          color={activeSwipeAction.color}
        />
      </Animated.View>
    );
  };

  const renderCard = () => {
    const cardContent = (
      <Animated.View
        style={[
          getCardStyles(),
          {
            transform: [
              { scale: scaleAnim },
              { translateX: pan.x },
              { translateY: pan.y },
              { rotate: rotation },
            ],
            opacity: opacity,
          },
          variant === 'neon' && {
            shadowColor: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['transparent', modernColors.primary[500]],
            }),
            shadowOpacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.5],
            }),
            shadowRadius: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 20],
            }),
          },
          style,
        ]}
      >
        {children}
        {renderSwipeIndicator()}
      </Animated.View>
    );

    if (variant === 'gradient') {
      return (
        <LinearGradient
          colors={modernColors.primary.gradient}
          style={[getCardStyles(), style]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View
            style={{
              transform: [
                { scale: scaleAnim },
                { translateX: pan.x },
                { translateY: pan.y },
                { rotate: rotation },
              ],
              opacity: opacity,
            }}
          >
            {children}
            {renderSwipeIndicator()}
          </Animated.View>
        </LinearGradient>
      );
    }

    return cardContent;
  };

  return (
    <PanGestureHandler
      onGestureEvent={Animated.event(
        [{ nativeEvent: { translationX: pan.x, translationY: pan.y } }],
        { useNativeDriver: false }
      )}
      onHandlerStateChange={(event) => handleGestureEnd(event.nativeEvent)}
    >
      <Animated.View>
        <LongPressGestureHandler
          onHandlerStateChange={handleLongPressStateChange}
          minDurationMs={500}
        >
          <Animated.View>
            <TapGestureHandler
              onHandlerStateChange={handleDoubleTap}
              numberOfTaps={2}
            >
              <Animated.View>
                <TapGestureHandler onHandlerStateChange={handleTapStateChange}>
                  <Animated.View>
                    {renderCard()}
                  </Animated.View>
                </TapGestureHandler>
              </Animated.View>
            </TapGestureHandler>
          </Animated.View>
        </LongPressGestureHandler>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  swipeIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ModernGestureCard;