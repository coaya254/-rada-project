import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface EmojiPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
  currentEmoji?: string;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({
  visible,
  onClose,
  onSelect,
  currentEmoji = '😊'
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('faces');

  // Comprehensive emoji categories for Kenyan youth
  const emojiCategories = {
    faces: {
      title: '😊 Faces & People',
      emojis: [
        '😊', '😄', '😃', '😀', '😁', '😆', '😅', '😂', '🤣', '😊',
        '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙',
        '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎',
        '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️',
        '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡',
        '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓',
        '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄',
        '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵',
        '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠'
      ]
    },
    hands: {
      title: '👋 Gestures & Hands',
      emojis: [
        '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟',
        '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎',
        '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏',
        '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻',
        '👃', '🧠', '🦷', '🦴', '👀', '👁', '👅', '👄', '💋', '🩸'
      ]
    },
    nature: {
      title: '🌍 Nature & Kenya',
      emojis: [
        '🌍', '🌎', '🌏', '🌋', '🗻', '🏔', '⛰', '🌄', '🌅', '🌆',
        '🌇', '🌉', '🌊', '🌌', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖',
        '🌗', '🌘', '🌙', '🌚', '🌛', '🌜', '🌝', '🌞', '⭐', '🌟',
        '💫', '✨', '☄️', '☀️', '🌤', '⛅', '🌥', '☁️', '🌦', '🌧',
        '⛈', '🌩', '🌨', '❄️', '☃️', '⛄', '🌬', '💨', '💧', '💦',
        '☔', '☂️', '🌊', '🌫', '🌪', '🔥', '💥', '💢', '💫', '💨',
        '🌱', '🌿', '🍀', '🌾', '🌵', '🌲', '🌳', '🌴', '🌰', '🌰',
        '🦋', '🐛', '🐝', '🐞', '🦗', '🕷', '🕸', '🦂', '🐢', '🐍',
        '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠',
        '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍',
        '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂',
        '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩',
        '🦮', '🐕‍🦺', '🐈', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🕊',
        '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀', '🐿', '🦔'
      ]
    },
    food: {
      title: '🍽️ Food & Culture',
      emojis: [
        '🍽️', '🍴', '🥄', '🍯', '🥛', '🍼', '☕', '🍵', '🧃', '🥤',
        '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾',
        '🧊', '🥢', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠',
        '🍢', '🍣', '🍤', '🍥', '🥮', '🍡', '🥟', '🥠', '🥡', '🦀',
        '🦞', '🦐', '🦑', '🦪', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂',
        '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '🥛',
        '☕', '🍵', '🧃', '🥤', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃',
        '🍸', '🍹', '🧉', '🍾', '🧊', '🥢', '🍱', '🍘', '🍙', '🍚',
        '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🥮', '🍡',
        '🥟', '🥠', '🥡', '🦀', '🦞', '🦐', '🦑', '🦪', '🍦', '🍧'
      ]
    },
    activities: {
      title: '⚽ Sports & Activities',
      emojis: [
        '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🪀',
        '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁',
        '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸', '🥌',
        '🎿', '⛷', '🏂', '🪂', '🏋️‍♀️', '🏋️', '🏋️‍♂️', '🤼‍♀️', '🤼', '🤼‍♂️',
        '🤸‍♀️', '🤸', '🤸‍♂️', '⛹️‍♀️', '⛹️', '⛹️‍♂️', '🤺', '🤾‍♀️', '🤾', '🤾‍♂️',
        '🏌️‍♀️', '🏌️', '🏌️‍♂️', '🏇', '🧘‍♀️', '🧘', '🧘‍♂️', '🏄‍♀️', '🏄', '🏄‍♂️',
        '🏊‍♀️', '🏊', '🏊‍♂️', '🤽‍♀️', '🤽', '🤽‍♂️', '🚣‍♀️', '🚣', '🚣‍♂️', '🧗‍♀️',
        '🧗', '🧗‍♂️', '🚵‍♀️', '🚵', '🚵‍♂️', '🚴‍♀️', '🚴', '🚴‍♂️', '🏆', '🥇',
        '🥈', '🥉', '🏅', '🎖', '🏵', '🎗', '🎫', '🎟', '🎪', '🤹',
        '🤹‍♀️', '🤹‍♂️', '🎭', '🩰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎵',
        '🎶', '🪘', '🥁', '🪗', '🎸', '🪕', '🎺', '🎷', '🪗', '🎻',
        '🪕', '🎹', '🥁', '🪘', '🎤', '🎧', '🎼', '🎵', '🎶', '🎭'
      ]
    },
    symbols: {
      title: '💫 Symbols & Objects',
      emojis: [
        '💫', '✨', '⭐', '🌟', '💥', '💢', '💨', '💦', '💧', '🔥',
        '🌊', '☔', '☂️', '🌫', '🌪', '🌬', '💨', '💧', '💦', '☔',
        '☂️', '🌊', '🌫', '🌪', '🌬', '💨', '💧', '💦', '☔', '☂️',
        '🌊', '🌫', '🌪', '🌬', '💨', '💧', '💦', '☔', '☂️', '🌊',
        '🌫', '🌪', '🌬', '💨', '💧', '💦', '☔', '☂️', '🌊', '🌫',
        '🌪', '🌬', '💨', '💧', '💦', '☔', '☂️', '🌊', '🌫', '🌪',
        '🌬', '💨', '💧', '💦', '☔', '☂️', '🌊', '🌫', '🌪', '🌬',
        '💨', '💧', '💦', '☔', '☂️', '🌊', '🌫', '🌪', '🌬', '💨',
        '💧', '💦', '☔', '☂️', '🌊', '🌫', '🌪', '🌬', '💨', '💧',
        '💦', '☔', '☂️', '🌊', '🌫', '🌪', '🌬', '💨', '💧', '💦'
      ]
    }
  };

  const filteredEmojis = emojiCategories[selectedCategory].emojis.filter(emoji =>
    emoji.includes(searchText) || searchText === ''
  );

  const handleEmojiSelect = (emoji: string) => {
    onSelect(emoji);
    onClose();
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
              <Text style={styles.headerTitle}>Choose Your Avatar</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search emojis..."
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          {/* Category Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryContainer}
          >
            {Object.entries(emojiCategories).map(([key, category]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.categoryTab,
                  selectedCategory === key && styles.activeCategoryTab
                ]}
                onPress={() => setSelectedCategory(key)}
              >
                <Text style={[
                  styles.categoryTabText,
                  selectedCategory === key && styles.activeCategoryTabText
                ]}>
                  {category.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Current Selection */}
          <View style={styles.currentSelection}>
            <Text style={styles.currentSelectionLabel}>Current:</Text>
            <Text style={styles.currentEmoji}>{currentEmoji}</Text>
          </View>

          {/* Emoji Grid */}
          <ScrollView style={styles.emojiContainer}>
            <View style={styles.emojiGrid}>
              {filteredEmojis.map((emoji, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.emojiItem,
                    currentEmoji === emoji && styles.selectedEmojiItem
                  ]}
                  onPress={() => handleEmojiSelect(emoji)}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Choose an emoji that represents you! You can change this anytime.
            </Text>
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
    maxHeight: '80%',
    minHeight: '60%',
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
  searchContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  categoryContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryTab: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 15,
    backgroundColor: '#f8f9fa',
  },
  activeCategoryTab: {
    backgroundColor: '#FF6B6B',
  },
  categoryTabText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  activeCategoryTabText: {
    color: 'white',
    fontWeight: '600',
  },
  currentSelection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  currentSelectionLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  currentEmoji: {
    fontSize: 24,
  },
  emojiContainer: {
    flex: 1,
    padding: 15,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emojiItem: {
    width: (width - 60) / 8,
    height: (width - 60) / 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  selectedEmojiItem: {
    backgroundColor: '#FF6B6B',
    transform: [{ scale: 1.1 }],
  },
  emojiText: {
    fontSize: 20,
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#f8f9fa',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default EmojiPicker;
