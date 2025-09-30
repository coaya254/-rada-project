import React, { useRef, useEffect } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  View,
  StyleSheet,
} from 'react-native';
import { modernAnimations } from './modernTheme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export type TransitionType =
  | 'slide'
  | 'fade'
  | 'scale'
  | 'flip'
  | 'morph'
  | 'swirl'
  | 'liquid'
  | 'elastic';

interface PageTransitionProps {
  children: React.ReactNode;
  transitionType?: TransitionType;
  duration?: number;
  delay?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  onTransitionComplete?: () => void;
}

export const usePageTransition = (
  transitionType: TransitionType = 'slide',
  duration: number = modernAnimations.duration.normal
) => {
  const translateX = useRef(new Animated.Value(screenWidth)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  const animateIn = (onComplete?: () => void) => {
    const animations = createEnterAnimations(transitionType, {
      translateX,
      translateY,
      scale,
      opacity,
      rotation,
      duration,
    });

    Animated.parallel(animations).start(onComplete);
  };

  const animateOut = (direction: 'left' | 'right' | 'up' | 'down' = 'right', onComplete?: () => void) => {
    const animations = createExitAnimations(transitionType, direction, {
      translateX,
      translateY,
      scale,
      opacity,
      rotation,
      duration,
    });

    Animated.parallel(animations).start(onComplete);
  };

  const reset = () => {
    translateX.setValue(screenWidth);
    translateY.setValue(0);
    scale.setValue(0.8);
    opacity.setValue(0);
    rotation.setValue(0);
  };

  return {
    translateX,
    translateY,
    scale,
    opacity,
    rotation,
    animateIn,
    animateOut,
    reset,
  };
};

const createEnterAnimations = (
  type: TransitionType,
  values: {
    translateX: Animated.Value;
    translateY: Animated.Value;
    scale: Animated.Value;
    opacity: Animated.Value;
    rotation: Animated.Value;
    duration: number;
  }
) => {
  const { translateX, translateY, scale, opacity, rotation, duration } = values;

  switch (type) {
    case 'slide':
      return [
        Animated.timing(translateX, {
          toValue: 0,
          duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: duration * 0.8,
          useNativeDriver: true,
        }),
      ];

    case 'fade':
      return [
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ];

    case 'scale':
      return [
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: duration * 0.5,
          useNativeDriver: true,
        }),
      ];

    case 'flip':
      return [
        Animated.timing(rotation, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.back(1.7)),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: duration * 0.6,
          useNativeDriver: true,
        }),
      ];

    case 'morph':
      return [
        Animated.timing(scale, {
          toValue: 1,
          duration,
          easing: Easing.bezier(0.68, -0.55, 0.265, 1.55),
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: 1,
          duration: duration * 1.2,
          easing: Easing.inOut(Easing.elastic(1)),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: duration * 0.4,
          useNativeDriver: true,
        }),
      ];

    case 'swirl':
      return [
        Animated.timing(rotation, {
          toValue: 1,
          duration: duration * 1.5,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: duration * 0.3,
          useNativeDriver: true,
        }),
      ];

    case 'liquid':
      return [
        Animated.timing(translateY, {
          toValue: 0,
          duration,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: duration * 1.2,
          easing: Easing.elastic(2),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: duration * 0.5,
          useNativeDriver: true,
        }),
      ];

    case 'elastic':
      return [
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 6,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: duration * 0.4,
          useNativeDriver: true,
        }),
      ];

    default:
      return [
        Animated.timing(opacity, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ];
  }
};

const createExitAnimations = (
  type: TransitionType,
  direction: 'left' | 'right' | 'up' | 'down',
  values: {
    translateX: Animated.Value;
    translateY: Animated.Value;
    scale: Animated.Value;
    opacity: Animated.Value;
    rotation: Animated.Value;
    duration: number;
  }
) => {
  const { translateX, translateY, scale, opacity, rotation, duration } = values;

  const getExitValue = () => {
    switch (direction) {
      case 'left':
        return { x: -screenWidth, y: 0 };
      case 'right':
        return { x: screenWidth, y: 0 };
      case 'up':
        return { x: 0, y: -screenHeight };
      case 'down':
        return { x: 0, y: screenHeight };
      default:
        return { x: screenWidth, y: 0 };
    }
  };

  const exitValue = getExitValue();

  switch (type) {
    case 'slide':
      return [
        Animated.timing(translateX, {
          toValue: exitValue.x,
          duration,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: exitValue.y,
          duration,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: duration * 0.8,
          useNativeDriver: true,
        }),
      ];

    case 'fade':
      return [
        Animated.timing(opacity, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ];

    case 'scale':
      return [
        Animated.timing(scale, {
          toValue: 0.8,
          duration,
          easing: Easing.in(Easing.back(1.7)),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: duration * 0.8,
          useNativeDriver: true,
        }),
      ];

    default:
      return [
        Animated.timing(opacity, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ];
  }
};

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  transitionType = 'slide',
  duration = modernAnimations.duration.normal,
  delay = 0,
  direction = 'right',
  onTransitionComplete,
}) => {
  const {
    translateX,
    translateY,
    scale,
    opacity,
    rotation,
    animateIn,
  } = usePageTransition(transitionType, duration);

  useEffect(() => {
    const timer = setTimeout(() => {
      animateIn(onTransitionComplete);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const getTransformStyle = () => {
    const transforms: any[] = [];

    if (transitionType === 'slide' || transitionType === 'liquid' || transitionType === 'elastic') {
      transforms.push({ translateX });
      transforms.push({ translateY });
    }

    if (transitionType === 'scale' || transitionType === 'morph' || transitionType === 'swirl' || transitionType === 'liquid') {
      transforms.push({ scale });
    }

    if (transitionType === 'flip' || transitionType === 'morph' || transitionType === 'swirl') {
      transforms.push({
        rotateY: rotation.interpolate({
          inputRange: [0, 1],
          outputRange: ['90deg', '0deg'],
        }),
      });
    }

    return { transform: transforms };
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          ...getTransformStyle(),
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

export const MorphingContainer: React.FC<{
  children: React.ReactNode;
  morphKey: string;
  style?: any;
}> = ({ children, morphKey, style }) => {
  const morphAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    morphAnim.setValue(0);
    Animated.timing(morphAnim, {
      toValue: 1,
      duration: modernAnimations.duration.slow,
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      useNativeDriver: true,
    }).start();
  }, [morphKey]);

  const morphScale = morphAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.9, 1.05, 1],
  });

  const morphOpacity = morphAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.8, 1],
  });

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: morphScale }],
          opacity: morphOpacity,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default PageTransition;