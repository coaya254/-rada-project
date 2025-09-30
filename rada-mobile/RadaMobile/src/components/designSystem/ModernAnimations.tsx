import React, { useRef, useEffect } from 'react';
import { Animated, Easing, Vibration } from 'react-native';
import { modernAnimations } from './modernTheme';

// Advanced Micro-Interaction Hooks
export const useSpringAnimation = (trigger: boolean, config?: any) => {
  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animation, {
      toValue: trigger ? 1 : 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
      ...config,
    }).start();
  }, [trigger]);

  return animation;
};

export const usePulseAnimation = (duration = 1000) => {
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const startPulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.1,
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: duration / 2,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startPulse();
  }, [duration]);

  return pulseAnimation;
};

export const useFloatingAnimation = (intensity = 10, duration = 2000) => {
  const floatAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startFloat = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnimation, {
            toValue: intensity,
            duration: duration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnimation, {
            toValue: -intensity,
            duration: duration / 2,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startFloat();
  }, [intensity, duration]);

  return floatAnimation;
};

export const useShakeAnimation = () => {
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    Vibration.vibrate(100);

    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return { shakeAnimation, triggerShake };
};

export const useParallaxAnimation = () => {
  const scrollY = useRef(new Animated.Value(0)).current;

  const parallaxTransform = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [0, -150],
    extrapolate: 'clamp',
  });

  const parallaxOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const parallaxScale = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [1, 1.2],
    extrapolate: 'clamp',
  });

  return {
    scrollY,
    parallaxTransform,
    parallaxOpacity,
    parallaxScale,
  };
};

// Advanced Gesture Components
export interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  swipeThreshold?: number;
}

export const useSwipeGesture = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  swipeThreshold = 100,
}: Omit<SwipeableCardProps, 'children'>) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  const resetCard = () => {
    Animated.parallel([
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
      }),
      Animated.spring(opacity, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(rotation, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleGestureEnd = (gestureState: any) => {
    const { dx, dy, vx, vy } = gestureState;

    // Determine swipe direction based on velocity and distance
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal swipe
      if (dx > swipeThreshold || vx > 0.5) {
        // Swipe right
        Animated.timing(pan.x, {
          toValue: 500,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          onSwipeRight?.();
          resetCard();
        });
      } else if (dx < -swipeThreshold || vx < -0.5) {
        // Swipe left
        Animated.timing(pan.x, {
          toValue: -500,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          onSwipeLeft?.();
          resetCard();
        });
      } else {
        resetCard();
      }
    } else {
      // Vertical swipe
      if (dy > swipeThreshold || vy > 0.5) {
        // Swipe down
        Animated.timing(pan.y, {
          toValue: 500,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          onSwipeDown?.();
          resetCard();
        });
      } else if (dy < -swipeThreshold || vy < -0.5) {
        // Swipe up
        Animated.timing(pan.y, {
          toValue: -500,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          onSwipeUp?.();
          resetCard();
        });
      } else {
        resetCard();
      }
    }
  };

  const rotateInterpolation = pan.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ['-15deg', '0deg', '15deg'],
    extrapolate: 'clamp',
  });

  const opacityInterpolation = pan.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: [0.5, 1, 0.5],
    extrapolate: 'clamp',
  });

  return {
    pan,
    rotation: rotateInterpolation,
    opacity: opacityInterpolation,
    handleGestureEnd,
    resetCard,
  };
};

// Modern Loading Animations
export const useMorphingLoader = () => {
  const morphAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startMorph = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(morphAnimation, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(morphAnimation, {
            toValue: 0,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    startMorph();
  }, []);

  const morphScale = morphAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1],
  });

  const morphRotation = morphAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const morphOpacity = morphAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.7, 1, 0.7],
  });

  return {
    morphScale,
    morphRotation,
    morphOpacity,
  };
};

// Particle Animation System
export const useParticleSystem = (particleCount = 20) => {
  const particles = useRef(
    Array.from({ length: particleCount }, () => ({
      x: new Animated.Value(Math.random() * 300),
      y: new Animated.Value(Math.random() * 500),
      opacity: new Animated.Value(Math.random()),
      scale: new Animated.Value(Math.random() * 0.5 + 0.5),
    }))
  ).current;

  const animateParticles = () => {
    const animations = particles.map((particle) => {
      return Animated.loop(
        Animated.parallel([
          Animated.timing(particle.y, {
            toValue: -100,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 0,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
        ])
      );
    });

    Animated.stagger(200, animations).start();
  };

  useEffect(() => {
    animateParticles();
  }, []);

  return particles;
};

// Success/Error Feedback Animations
export const useSuccessAnimation = () => {
  const checkmarkAnimation = useRef(new Animated.Value(0)).current;
  const glowAnimation = useRef(new Animated.Value(0)).current;

  const triggerSuccess = () => {
    Vibration.vibrate([100, 50, 100]);

    Animated.parallel([
      Animated.spring(checkmarkAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 5,
      }),
      Animated.timing(glowAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset after 2 seconds
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(checkmarkAnimation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnimation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, 2000);
    });
  };

  const checkmarkScale = checkmarkAnimation.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [0, 1.2, 1],
  });

  const glowOpacity = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.6],
  });

  return {
    triggerSuccess,
    checkmarkScale,
    glowOpacity,
  };
};

export default {
  useSpringAnimation,
  usePulseAnimation,
  useFloatingAnimation,
  useShakeAnimation,
  useParallaxAnimation,
  useSwipeGesture,
  useMorphingLoader,
  useParticleSystem,
  useSuccessAnimation,
};