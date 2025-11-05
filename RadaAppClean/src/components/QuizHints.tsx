// components/QuizHints.tsx

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface QuizHintProps {
  hint: string;
  hintsRemaining: number;
  onUseHint: () => void;
}

export const QuizHint: React.FC<QuizHintProps> = ({ hint, hintsRemaining, onUseHint }) => {
  const [revealed, setRevealed] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const handleReveal = () => {
    setRevealed(true);
    onUseHint();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  if (revealed) {
    return (
      <Animated.View style={[styles.hintCard, { opacity: fadeAnim }]}>
        <View style={styles.hintHeader}>
          <MaterialIcons name="lightbulb" size={20} color="#F59E0B" />
          <Text style={styles.hintTitle}>Hint</Text>
        </View>
        <Text style={styles.hintText}>{hint}</Text>
      </Animated.View>
    );
  }

  return (
    <TouchableOpacity 
      style={styles.hintButton} 
      onPress={handleReveal}
      disabled={hintsRemaining === 0}
    >
      <LinearGradient
        colors={hintsRemaining > 0 ? ['#FEF3C7', '#FDE68A'] : ['#E5E7EB', '#D1D5DB']}
        style={styles.hintButtonGradient}
      >
        <MaterialIcons 
          name="lightbulb-outline" 
          size={20} 
          color={hintsRemaining > 0 ? '#F59E0B' : '#9CA3AF'} 
        />
        <Text style={[
          styles.hintButtonText,
          hintsRemaining === 0 && styles.hintButtonTextDisabled
        ]}>
          Use Hint ({hintsRemaining} remaining)
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// 50/50 Lifeline Component
export const FiftyFifty: React.FC<{
  options: string[];
  correctIndex: number;
  onUse: (eliminatedIndices: number[]) => void;
  used: boolean;
}> = ({ options, correctIndex, onUse, used }) => {
  const handleUse = () => {
    // Eliminate 2 wrong answers randomly
    const wrongIndices = options
      .map((_, i) => i)
      .filter(i => i !== correctIndex);
    
    const toEliminate = wrongIndices
      .sort(() => 0.5 - Math.random())
      .slice(0, 2);
    
    onUse(toEliminate);
  };

  return (
    <TouchableOpacity 
      style={styles.lifelineButton} 
      onPress={handleUse}
      disabled={used}
    >
      <View style={[styles.lifelineContent, used && styles.lifelineUsed]}>
        <Text style={styles.lifelineText}>50/50</Text>
        {used && <MaterialIcons name="check" size={16} color="#10B981" />}
      </View>
    </TouchableOpacity>
  );
};

// Ask the Audience Lifeline
export const AskAudience: React.FC<{
  options: string[];
  correctIndex: number;
  onUse: (audienceResults: number[]) => void;
  used: boolean;
}> = ({ options, correctIndex, onUse, used }) => {
  const handleUse = () => {
    // Generate weighted random percentages favoring correct answer
    const results = options.map((_, index) => {
      if (index === correctIndex) {
        return Math.floor(Math.random() * 30) + 50; // 50-80%
      }
      return Math.floor(Math.random() * 20); // 0-20%
    });
    
    // Normalize to 100%
    const total = results.reduce((sum, val) => sum + val, 0);
    const normalized = results.map(val => Math.round((val / total) * 100));
    
    onUse(normalized);
  };

  return (
    <TouchableOpacity 
      style={styles.lifelineButton} 
      onPress={handleUse}
      disabled={used}
    >
      <View style={[styles.lifelineContent, used && styles.lifelineUsed]}>
        <MaterialIcons name="people" size={18} color="#1E40AF" />
        <Text style={styles.lifelineText}>Ask</Text>
        {used && <MaterialIcons name="check" size={16} color="#10B981" />}
      </View>
    </TouchableOpacity>
  );
};

// Skip Question Lifeline
export const SkipQuestion: React.FC<{
  onUse: () => void;
  used: boolean;
}> = ({ onUse, used }) => {
  return (
    <TouchableOpacity 
      style={styles.lifelineButton} 
      onPress={onUse}
      disabled={used}
    >
      <View style={[styles.lifelineContent, used && styles.lifelineUsed]}>
        <MaterialIcons name="skip-next" size={18} color="#8B5CF6" />
        <Text style={styles.lifelineText}>Skip</Text>
        {used && <MaterialIcons name="check" size={16} color="#10B981" />}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  hintCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  hintHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  hintTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400E',
  },
  hintText: {
    fontSize: 14,
    color: '#B45309',
    lineHeight: 20,
  },
  hintButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 12,
  },
  hintButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  hintButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  hintButtonTextDisabled: {
    color: '#9CA3AF',
  },
  lifelineButton: {
    marginRight: 8,
  },
  lifelineContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
    gap: 4,
  },
  lifelineUsed: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
    opacity: 0.6,
  },
  lifelineText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
});